import { useState, useEffect } from 'react'
import { FilmDetails } from '../types'
import { api } from '../services/api'

interface FilmPageProps {
  filmId: number
  onBack?: () => void
}

const PLAYERS = [
  { name: 'KinoMix', getUrl: (id: number) => `https://kinomix.web.app/#!kp=${id}` },
  { name: 'Резерв', getUrl: (id: number) => `https://kinotochka.co/embed/kp/${id}` },
]

export function FilmPage({ filmId }: FilmPageProps) {
  const [film, setFilm] = useState<FilmDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPlayer, setShowPlayer] = useState(false)
  const [playerIndex, setPlayerIndex] = useState(0)

  useEffect(() => {
    loadFilm()
  }, [filmId])

  const loadFilm = async () => {
    try {
      const data = await api.getFilm(filmId)
      setFilm(data)
    } catch (error) {
      console.error('Failed to load film:', error)
    } finally {
      setLoading(false)
    }
  }

  // Получить URL текущего плеера
  const getPlayerUrl = () => PLAYERS[playerIndex].getUrl(filmId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl">🎬</div>
          <p className="text-gray-500 mt-2">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!film) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">😕</div>
          <p className="text-gray-500">Фильм не найден</p>
        </div>
      </div>
    )
  }

  const title = film.nameRu || film.nameOriginal || film.nameEn || 'Без названия'
  const year = film.year
  const rating = film.ratingKinopoisk || film.ratingImdb
  const genres = film.genres?.map(g => g.genre).join(', ')
  const countries = film.countries?.map(c => c.country).join(', ')

  return (
    <div className="min-h-screen pb-20">
      {/* Player or Poster */}
      {showPlayer ? (
        <div className="relative w-full bg-black">
          {/* Player Selection */}
          <div className="flex gap-2 p-2 bg-dark-200">
            {PLAYERS.map((p, i) => (
              <button
                key={i}
                onClick={() => setPlayerIndex(i)}
                className={`px-3 py-1 rounded text-sm ${i === playerIndex ? 'bg-primary text-white' : 'bg-dark-100 text-gray-400'}`}
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={() => setShowPlayer(false)}
              className="ml-auto bg-red-500/80 text-white px-3 py-1 rounded text-sm"
            >
              ✕
            </button>
          </div>
          {/* Player iframe */}
          <div className="aspect-video">
            <iframe
              src={getPlayerUrl()}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen"
            />
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={film.posterUrl || film.posterUrlPreview}
            alt={title}
            className="w-full h-[50vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-transparent to-transparent" />
          
          {/* Play Button */}
          <button
            onClick={() => setShowPlayer(true)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <span className="text-4xl ml-1">▶</span>
            </div>
          </button>
        </div>
      )}

      {/* Info */}
      <div className="p-4 -mt-10 relative z-10">
        <div className="bg-dark-100/90 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
          {/* Title & Rating */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold">{title}</h1>
              {film.nameOriginal && film.nameOriginal !== title && (
                <p className="text-gray-500 text-sm">{film.nameOriginal}</p>
              )}
            </div>
            {rating && (
              <div className="bg-primary/20 text-primary px-3 py-1 rounded-lg font-bold">
                ⭐ {rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-4">
            {year && <span className="bg-dark-200 px-2 py-1 rounded">{year}</span>}
            {film.filmLength && <span className="bg-dark-200 px-2 py-1 rounded">{film.filmLength}</span>}
            {countries && <span className="bg-dark-200 px-2 py-1 rounded">{countries}</span>}
          </div>

          {/* Genres */}
          {genres && (
            <div className="flex flex-wrap gap-2 mb-4">
              {film.genres?.map((g, i) => (
                <span key={i} className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">
                  {g.genre}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {film.description && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {film.description}
              </p>
            </div>
          )}

          {/* Watch Button */}
          <button
            onClick={() => setShowPlayer(true)}
            className="w-full bg-primary hover:bg-primary/80 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
          >
            ▶ Смотреть онлайн
          </button>
        </div>
      </div>
    </div>
  )
}
