import { useState, useEffect } from 'react'
import { FilmDetails } from '../types'
import { api } from '../services/api'

interface FilmPageProps {
  filmId: number
  onBack?: () => void
}

interface PlayerSource {
  source: string
  iframeUrl: string
  quality?: string
}

export function FilmPage({ filmId }: FilmPageProps) {
  const [film, setFilm] = useState<FilmDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [players, setPlayers] = useState<PlayerSource[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [loadingPlayers, setLoadingPlayers] = useState(false)

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

  // Загрузить плееры через Kinobox API
  const loadPlayers = async () => {
    setLoadingPlayers(true)
    try {
      const response = await fetch(
        `https://kinobox.tv/api/players?kinopoisk=${filmId}`
      )
      const data = await response.json()
      
      if (Array.isArray(data) && data.length > 0) {
        const availablePlayers = data
          .filter((p: PlayerSource) => p.iframeUrl)
          .map((p: PlayerSource) => ({
            source: p.source,
            iframeUrl: p.iframeUrl,
            quality: p.quality
          }))
        
        setPlayers(availablePlayers)
        if (availablePlayers.length > 0) {
          setIsPlaying(true)
        }
      }
    } catch (error) {
      console.error('Failed to load players:', error)
    } finally {
      setLoadingPlayers(false)
    }
  }

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

  // Полноэкранный плеер
  if (isPlaying && players.length > 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Шапка плеера */}
        <div className="flex items-center justify-between p-2 bg-dark-200/90">
          <button 
            onClick={() => setIsPlaying(false)}
            className="text-white text-xl px-2"
          >
            ✕
          </button>
          <span className="text-white text-sm truncate mx-2 flex-1">{title}</span>
          <div className="flex gap-1 overflow-x-auto">
            {players.map((p, i) => (
              <button
                key={i}
                onClick={() => setCurrentPlayer(i)}
                className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                  i === currentPlayer 
                    ? 'bg-primary text-white' 
                    : 'bg-dark-100 text-gray-400'
                }`}
              >
                {p.source}
              </button>
            ))}
          </div>
        </div>
        
        {/* Плеер */}
        <div className="flex-1 bg-black">
          <iframe
            src={players[currentPlayer].iframeUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Poster с кнопкой Play */}
      <div className="relative">
        <img
          src={film.posterUrl || film.posterUrlPreview}
          alt={title}
          className="w-full h-[50vh] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-transparent to-transparent" />
        
        {/* Кнопка Play */}
        <button
          onClick={loadPlayers}
          disabled={loadingPlayers}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            {loadingPlayers ? (
              <div className="animate-spin text-2xl">⏳</div>
            ) : (
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </div>
        </button>
      </div>

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
            {film.filmLength && <span className="bg-dark-200 px-2 py-1 rounded">{film.filmLength} мин</span>}
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
            onClick={loadPlayers}
            disabled={loadingPlayers}
            className="w-full bg-primary hover:bg-primary/80 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingPlayers ? (
              <>⏳ Загрузка плеера...</>
            ) : (
              <>▶ Смотреть онлайн</>
            )}
          </button>

          {/* No players message */}
          {players.length === 0 && !loadingPlayers && isPlaying && (
            <p className="text-red-400 text-center mt-2 text-sm">
              Плееры не найдены для этого фильма
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
