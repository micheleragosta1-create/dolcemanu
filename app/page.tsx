import Header from '@/components/Header'
import HeroVideo from '@/components/HeroVideo'
import AdventCalendarBanner from '@/components/AdventCalendarBanner'
import ChocoShowcase from '@/components/ChocoShowcase'
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
      <HeroVideo />
      <AdventCalendarBanner />
      <ProdottiConsigliati />
      <ChocoShowcase />
      <Storia />
      <InstagramGallery />
      <ContactSection />
      <Footer />
    </main>
  )
}
