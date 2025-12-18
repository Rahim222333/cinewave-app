import { useEffect, useState } from 'react'

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        MainButton: {
          text: string
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
        }
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
        }
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
          }
        }
      }
    }
  }
}

function App() {
  const [user, setUser] = useState<{ first_name: string; username?: string } | null>(null)

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      
      // Get user info
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user)
      }
    }
  }, [])

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          🎬 CineWave
        </h1>
        {user && (
          <p className="text-gray-400 mt-2">
            Привет, {user.first_name}! 👋
          </p>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto">
        {/* Welcome card */}
        <div className="bg-dark-100/80 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">✨ Добро пожаловать!</h2>
          <p className="text-gray-300 mb-4">
            CineWave — твой персональный кино-ассистент с искусственным интеллектом.
          </p>
          <ul className="space-y-2 text-gray-400">
            <li>🔍 Поиск фильмов и сериалов</li>
            <li>🎯 AI-рекомендации</li>
            <li>🍿 Премьеры кинопроката</li>
            <li>⭐ Топ лучших фильмов</li>
          </ul>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <FeatureCard 
            icon="🍿" 
            title="Премьеры" 
            subtitle="Новинки кино"
          />
          <FeatureCard 
            icon="⭐" 
            title="Топ" 
            subtitle="Лучшие фильмы"
          />
          <FeatureCard 
            icon="🔍" 
            title="Поиск" 
            subtitle="Найти фильм"
          />
          <FeatureCard 
            icon="🤖" 
            title="AI" 
            subtitle="Рекомендации"
          />
        </div>

        {/* Status */}
        <div className="text-center text-gray-500 text-sm">
          <p>🚀 Приложение работает!</p>
          <p className="mt-1">Backend и полный функционал скоро...</p>
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="bg-dark-100/60 backdrop-blur rounded-xl p-4 border border-white/5 hover:border-primary/50 transition-all cursor-pointer active:scale-95">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-medium">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  )
}

export default App
