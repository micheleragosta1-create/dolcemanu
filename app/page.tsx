import Header from '@/components/Header'
import HeroCarousel from '@/components/HeroCarousel'
import ProdottiConsigliati from '@/components/ProdottiConsigliati'
import Storia from '@/components/Storia'
import InstagramGallery from '@/components/InstagramGallery'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'


export default function Home() {
  return (
    <main>
      <div className="chocolate-background"></div>
      <Header />
      <HeroCarousel />
      <ProdottiConsigliati />
      <section aria-hidden className="bg-choco-section" />
      <Storia />
      <InstagramGallery />
      <ContactSection />
      <Footer />
    </main>
  )
}
