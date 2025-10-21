import { getSupabaseClient } from './supabase'

/**
 * Utility per l'upload e ottimizzazione di immagini prodotti
 * Funzionalità SEO:
 * - Rinomina file con nome prodotto
 * - Comprime e ridimensiona immagini
 * - Genera URL pubblici ottimizzati
 */

// Bucket name per le immagini dei prodotti
const PRODUCTS_BUCKET = 'product-images'

/**
 * Genera un nome file SEO-friendly dal nome del prodotto
 */
export function generateSeoFileName(productName: string, originalFileName: string): string {
  // Estrai estensione file originale
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg'
  
  // Normalizza il nome del prodotto per SEO
  const seoName = productName
    .toLowerCase()
    .replace(/[àáâãä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  // Aggiungi timestamp per unicità
  const timestamp = Date.now()
  
  return `${seoName}-${timestamp}.${extension}`
}

/**
 * Valida il tipo di file immagine
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato file non valido. Usa JPG, PNG, GIF o WEBP.'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File troppo grande. Dimensione massima: 5MB.'
    }
  }
  
  return { valid: true }
}

/**
 * Ottimizza l'immagine prima dell'upload
 * Ridimensiona e comprime l'immagine per migliorare le performance
 */
export async function optimizeImage(file: File, maxWidth: number = 1200, maxHeight: number = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calcola nuove dimensioni mantenendo aspect ratio
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }
        
        // Crea canvas per ridimensionamento
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Impossibile creare contesto canvas'))
          return
        }
        
        // Disegna immagine ridimensionata
        ctx.drawImage(img, 0, 0, width, height)
        
        // Converti a blob con compressione
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Errore nella conversione immagine'))
            }
          },
          'image/jpeg',
          0.85 // Qualità 85% per bilanciare dimensione e qualità
        )
      }
      
      img.onerror = () => reject(new Error('Errore nel caricamento immagine'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Errore nella lettura file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Carica un'immagine su Supabase Storage
 * @param file - File da caricare
 * @param productName - Nome del prodotto per generare nome file SEO
 * @param optimize - Se true, ottimizza l'immagine prima dell'upload
 * @returns URL pubblico dell'immagine caricata
 */
export async function uploadProductImage(
  file: File,
  productName: string,
  optimize: boolean = true
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Valida il file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { url: null, error: validation.error || 'File non valido' }
    }
    
    // Ottimizza l'immagine se richiesto
    let fileToUpload: Blob = file
    let finalContentType = file.type
    
    if (optimize) {
      try {
        fileToUpload = await optimizeImage(file)
        finalContentType = 'image/jpeg' // L'ottimizzazione converte sempre a JPEG
      } catch (optimizeError) {
        console.warn('Impossibile ottimizzare immagine, uso file originale:', optimizeError)
        fileToUpload = file
        finalContentType = file.type // Mantieni tipo originale se non ottimizzato
      }
    }
    
    // Genera nome file SEO-friendly
    const fileName = generateSeoFileName(productName, file.name)
    
    // Ottieni client Supabase
    const supabase = getSupabaseClient()
    
    console.log('🔄 Upload immagine:', { fileName, contentType: finalContentType, size: fileToUpload.size })
    
    // Carica su Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(PRODUCTS_BUCKET)
      .upload(fileName, fileToUpload, {
        contentType: finalContentType, // Usa il content type corretto
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Errore upload Supabase:', error)
      return { url: null, error: `Errore upload: ${error.message}` }
    }
    
    // Ottieni URL pubblico
    const { data: { publicUrl } } = supabase
      .storage
      .from(PRODUCTS_BUCKET)
      .getPublicUrl(fileName)
    
    return { url: publicUrl, error: null }
  } catch (error: any) {
    console.error('Errore upload immagine:', error)
    return { url: null, error: error.message || 'Errore sconosciuto' }
  }
}

/**
 * Elimina un'immagine da Supabase Storage
 * @param imageUrl - URL pubblico dell'immagine da eliminare
 */
export async function deleteProductImage(imageUrl: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // Estrai il nome del file dall'URL
    const urlParts = imageUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]
    
    if (!fileName) {
      return { success: false, error: 'URL immagine non valido' }
    }
    
    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .storage
      .from(PRODUCTS_BUCKET)
      .remove([fileName])
    
    if (error) {
      console.error('Errore eliminazione immagine:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, error: null }
  } catch (error: any) {
    console.error('Errore eliminazione immagine:', error)
    return { success: false, error: error.message || 'Errore sconosciuto' }
  }
}

/**
 * Crea il bucket per le immagini dei prodotti se non esiste
 * NOTA: Esegui questa funzione una volta per setup iniziale
 */
export async function initializeProductImagesBucket(): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    
    // Verifica se il bucket esiste già
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === PRODUCTS_BUCKET)
    
    if (bucketExists) {
      return { success: true, error: null }
    }
    
    // Crea il bucket se non esiste
    const { error } = await supabase.storage.createBucket(PRODUCTS_BUCKET, {
      public: true,
      fileSizeLimit: 5242880 // 5MB
    })
    
    if (error) {
      console.error('Errore creazione bucket:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, error: null }
  } catch (error: any) {
    console.error('Errore inizializzazione bucket:', error)
    return { success: false, error: error.message || 'Errore sconosciuto' }
  }
}

