import { useEffect, useState } from 'react'
import { SearchPage } from './pages/SearchPage'
import { FilmPage } from './pages/FilmPage'
import { HomePage } from './pages/HomePage'

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
        }
        themeParams: {
          bg_color?: string
          text_color?: string
        }
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
          }
        }
      }
    }
  }
}

type Page = 'home' | 'search' | 'film'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [selectedFilmId, setSelectedFilmId] = useState<number | null>(null)
  const [user, setUser] = useState<{ first_name: string } | null>(null)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user)
      }

      // Back button handler
      const handleBack = () => {
        if (page === 'film') {
          setPage('search')
          setSelectedFilmId(null)
        } else if (page === 'search') {
          setPage('home')
        }
      }

      tg.BackButton.onClick(handleBack)

      return () => {
        tg.BackButton.offClick(handleBack)
      }
    }
  }, [page])

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      if (page === 'home') {
        tg.BackButton.hide()
      } else {
        tg.BackButton.show()
      }
    }
  }, [page])

  const openFilm = (filmId: number) => {
    setSelectedFilmId(filmId)
    setPage('film')
  }

  const goToSearch = () => setPage('search')

  return (
    <div className="min-h-screen">
      {page === 'home' && (
        <HomePage 
          user={user} 
          onSearch={goToSearch} 
          onFilmClick={openFilm}
        />
      )}
      {page === 'search' && (
        <SearchPage onFilmClick={openFilm} />
      )}
      {page === 'film' && selectedFilmId && (
        <FilmPage filmId={selectedFilmId} onBack={() => setPage('search')} />
      )}
    </div>
  )
}

export default App
