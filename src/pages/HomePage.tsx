import { useState, useEffect } from 'react'
import { Film } from '../types'
import { FilmCard } from '../components/FilmCard'
import { api } from '../services/api'

interface HomePageProps {
  user: { first_name: string } | null
  onSearch: () => void
  onFilmClick: (filmId: number) => void
}

export function HomePage({ user, onSearch, onFilmClick }: HomePageProps) {
  const [popularFilms, setPopularFilms] = useState<Film[]>([])
  const [topFilms, setTopFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFilms()
  }, [])

  const loadFilms = async () => {
    try {
      const [popular, top] = await Promise.all([
        api.getPopular(),
        api.getTop()
      ])
      setPopularFilms(popular.items?.slice(0, 10) || [])
      setTopFilms(top.items?.slice(0, 10) || [])
    } catch (error) {
      console.error('Failed to load films:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          🎬 CineWave
        </h1>
        {user && (
          <p className="text-gray-400 text-sm mt-1">
            Привет, {user.first_name}! 👋
          </p>
        )}
      </header>

      {/* Search Button */}
      <button
        onClick={onSearch}
        className="w-full bg-dark-100/80 backdrop-blur rounded-xl p-4 mb-6 flex items-center gap-3 border border-white/10 active:scale-[0.98] transition-transform"
      >
        <span className="text-xl">🔍</span>
        <span className="text-gray-400">Найти фильм или сериал...</span>
      </button>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin text-4xl">🎬</div>
          <p className="text-gray-500 mt-2">Загрузка...</p>
        </div>
      ) : (
        <>
          {/* Popular Films */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              🔥 Популярное
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {popularFilms.map((film) => (
                <FilmCard 
                  key={film.kinopoiskId} 
                  film={film} 
                  onClick={() => onFilmClick(film.kinopoiskId)}
                />
              ))}
            </div>
          </section>

          {/* Top Films */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              ⭐ Топ-250
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {topFilms.map((film) => (
                <FilmCard 
                  key={film.kinopoiskId} 
                  film={film} 
                  onClick={() => onFilmClick(film.kinopoiskId)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
