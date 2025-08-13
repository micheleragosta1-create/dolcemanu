"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/AuthContext"
import { getSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/components/Toast"

type Review = {
  id: string
  product_id: string
  user_id: string
  user_email: string
  rating: number
  title?: string | null
  body?: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = getSupabaseClient()

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [ownReview, setOwnReview] = useState<Review | null>(null)
  const [rating, setRating] = useState<number>(5)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  const avg = useMemo(() => {
    if (!reviews.length) return 0
    const s = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
    return Math.round((s / reviews.length) * 10) / 10
  }, [reviews])

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("product_reviews")
          .select("id, product_id, user_id, user_email, rating, title, body, status, created_at")
          .eq("product_id", productId)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(20)
        if (error) throw error
        setReviews(Array.isArray(data) ? data : [])
      } catch (e: any) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [productId, supabase])

  useEffect(() => {
    const run = async () => {
      if (!user?.id) { setOwnReview(null); return }
      try {
        const { data, error } = await supabase
          .from("product_reviews")
          .select("id, product_id, user_id, user_email, rating, title, body, status, created_at")
          .eq("product_id", productId)
          .eq("user_id", user.id)
          .maybeSingle()
        if (error && error.code !== 'PGRST116') throw error
        setOwnReview((data as Review) || null)
      } catch (e) {
        setOwnReview(null)
      }
    }
    run()
  }, [productId, supabase, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      addToast("Devi essere autenticato per inviare una recensione", "warning", 3000)
      return
    }
    if (ownReview && ownReview.status !== "rejected") {
      addToast("Hai già inviato una recensione per questo prodotto", "info", 3000)
      return
    }
    try {
      setSubmitting(true)
      const insertPayload = {
        product_id: productId,
        user_id: user.id,
        user_email: user.email,
        rating,
        title: title.trim() || null,
        body: body.trim() || null,
        status: "pending" as const
      }
      const { error } = await supabase.from("product_reviews").insert([insertPayload])
      if (error) throw error
      setTitle("")
      setBody("")
      setRating(5)
      setOwnReview({ ...insertPayload, id: "temp", created_at: new Date().toISOString() })
      addToast("Recensione inviata. Sarà visibile dopo approvazione.", "success", 3500)
    } catch (e: any) {
      console.error(e)
      addToast(e?.message || "Errore durante l'invio della recensione", "error", 3500)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <h2 className="poppins">Recensioni</h2>
        <div className="meta">
          <span className="stars" aria-label={`Valutazione media ${avg}`}>{renderStars(avg)}</span>
          <span className="count">{reviews.length} recensioni</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Caricamento recensioni…</div>
      ) : (
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p>Nessuna recensione approvata al momento.</p>
          ) : (
            reviews.map(r => (
              <article key={r.id} className="review">
                <div className="review-head">
                  <span className="stars" aria-label={`Valutazione ${r.rating}`}>{renderStars(r.rating)}</span>
                  <span className="email">{maskEmail(r.user_email)}</span>
                  <span className="date">{new Date(r.created_at).toLocaleDateString("it-IT")}</span>
                </div>
                {r.title && <h4 className="title">{r.title}</h4>}
                {r.body && <p className="body">{r.body}</p>}
              </article>
            ))
          )}
        </div>
      )}

      <div className="divider" />

      <div className="write">
        <h3 className="poppins">Lascia una recensione</h3>
        {!user ? (
          <p>Per scrivere una recensione, <a className="link" href="/auth">accedi</a>.</p>
        ) : ownReview && ownReview.status !== "rejected" ? (
          <p>Hai già inviato una recensione per questo prodotto{ownReview.status === "pending" ? ": in moderazione." : "."}</p>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <div className="stars-input" role="radiogroup" aria-label="Valutazione">
              {[1,2,3,4,5].map(v => (
                <button type="button" key={v} className={`star-btn ${v <= rating ? 'on' : ''}`} onClick={() => setRating(v)} aria-label={`${v} stelle`}>
                  ★
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Titolo (opzionale)"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              className="input"
              maxLength={100}
            />
            <textarea
              placeholder="Scrivi la tua esperienza (opzionale)"
              value={body}
              onChange={(e)=>setBody(e.target.value)}
              className="textarea"
              rows={4}
              maxLength={1000}
            />
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? "Invio…" : "Invia recensione"}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .reviews-section { margin-top: 2rem; background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 12px; padding: 1rem; }
        .reviews-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: .5rem; }
        .reviews-header .meta { display: flex; gap: .75rem; align-items: center; color: #555; }
        .stars { color: #f5a524; font-size: 1rem; letter-spacing: 1px; }
        .count { font-size: .9rem; }
        .reviews-list { display: grid; gap: .75rem; }
        .review { border-top: 1px solid #f0f0f0; padding-top: .75rem; }
        .review:first-child { border-top: none; padding-top: 0; }
        .review-head { display: flex; gap: .5rem; align-items: center; color: #666; font-size: .9rem; }
        .review .title { margin: .25rem 0; font-weight: 600; color: var(--color-navy); }
        .review .body { color: #444; line-height: 1.6; white-space: pre-wrap; }
        .divider { height: 1px; background: #eee; margin: 1rem 0; }
        .write { display: grid; gap: .5rem; }
        .form { display: grid; gap: .5rem; }
        .stars-input { display: inline-flex; gap: .25rem; margin-bottom: .25rem; }
        .star-btn { font-size: 1.4rem; line-height: 1; background: transparent; border: none; cursor: pointer; color: #ddd; }
        .star-btn.on { color: #f5a524; }
        .input, .textarea { width: 100%; padding: .6rem .7rem; border: 2px solid #e9ecef; border-radius: 8px; font-family: inherit; }
        .link { color: var(--color-brown); text-decoration: underline; }
      `}</style>
    </section>
  )
}

function renderStars(value: number) {
  const full = Math.round(value)
  return "★★★★★".split("").map((s, i) => (
    <span key={i} style={{ opacity: i < full ? 1 : 0.2 }}>{s}</span>
  ))
}

function maskEmail(email?: string) {
  if (!email) return "utente"
  const [name, domain] = email.split("@")
  if (!domain) return email
  const masked = name.length <= 2 ? name[0] + "*" : name[0] + "*".repeat(name.length - 2) + name[name.length - 1]
  return `${masked}@${domain}`
}


