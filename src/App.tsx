import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/layout/PageTransition'
import { SplashCursor } from '@/components/ui/SplashCursor'
import { HomePage } from '@/pages/HomePage'
import { GalleryPage } from '@/pages/GalleryPage'
import { TarotPage } from '@/pages/TarotPage'
import { TarotCardsPage } from '@/pages/TarotCardsPage'
import { DiyPage } from '@/pages/DiyPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'

export const App = () => {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text antialiased relative">
      <SplashCursor />
      <Navbar />
      <main className="relative z-10">
        <Routes>
          {/* 全屏沉浸式页面 */}
          <Route path="tarot" element={<TarotPage />} />
          <Route path="tarot-cards" element={<TarotCardsPage />} />

          {/* 常规页面使用 PageTransition 包裹 */}
          <Route element={<PageTransition />}>
            <Route index element={<HomePage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="diy" element={<DiyPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
