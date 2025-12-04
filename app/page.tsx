import Header from '@/components/Header'
import HeroVideo from '@/components/HeroVideo'
import ChocoShowcase from '@/components/ChocoShowcase'
import Storia from '@/components/Storia'
import InstagramGallery from '@/components/InstagramGallery'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'
import GoogleAdsConversion from '@/components/GoogleAdsConversion'
import { Suspense } from 'react'


export default function Home() {
  return (
    <main>
      <Suspense fallback={null}>
        <GoogleAdsConversion />
      </Suspense>
      <div className="chocolate-background"></div>
      <Header />
      <HeroVideo />
      <ChocoShowcase />
      <Storia />
      <InstagramGallery />
      <ContactSection />
      <Footer />
    </main>
  )
}
