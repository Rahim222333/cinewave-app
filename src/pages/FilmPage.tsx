import { useState, useEffect } from 'react'
import { FilmDetails } from '../types'
import { api } from '../services/api'

interface FilmPageProps {
  filmId: number
  onBack?: () => void
}

// Универсальные плееры (пробуем все источники)
const getPlayerUrls = (filmId: number, imdbId?: string) => {
  const players = []
  
  // Если есть IMDB ID - добавляем международные плееры
  if (imdbId) {
    players.push(
      { name: 'VidSrc', url: `https://vidsrc.xyz/embed/movie/${imdbId}` },
      { name: 'VidSrc Pro', url: `https://vidsrc.cc/v2/embed/movie/${imdbId}` },
      { name: '2Embed', url: `https://www.2embed.cc/embed/${imdbId}` }
    )
  }
  
  // Добавляем российские плееры с Kinopoisk ID
  players.push(
    { name: 'Плеер 1', url: `https://kinobox.tv/player/kp/${filmId}` },
    { name: 'Плеер 2', url: `https://voidboost.net/embed/${filmId}` },
    { name: 'Плеер 3', url: `https://hdvb.pw/kp/${filmId}` }
  )
  
  return players
}

export function FilmPage({ filmId }: FilmPageProps) {
  const [film, setFilm] = useState<FilmDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [players, setPlayers] = useState<{name: string, url: string}[]>([])

  useEffect(() => {
    loadFilm()
  }, [filmId])

  const loadFilm = async () => {
    try {
      const data = await api.getFilm(filmId)
      setFilm(data)
      setPlayers(getPlayerUrls(filmId, data.imdbId || undefined))
    } catch (err) {
      console.error('Failed to load film:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleWatch = () => {
    setIsPlaying(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-300">
        <div className="text-center">
          <div className="animate-spin text-4xl">🎬</div>
          <p className="text-gray-500 mt-2">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!film) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-300">
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
      <div className="fixed inset-0 bg-black z-50">
        {/* Плеер на весь экран */}
        <iframe
          key={currentPlayer}
          src={players[currentPlayer].url}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
        />
        
        {/* Панель управления внизу */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 pb-6 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <button 
              onClick={() => setIsPlaying(false)}
              className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium hover:bg-white/20 transition"
            >
              ← Назад
            </button>
            
            <div className="flex gap-2 overflow-x-auto max-w-[60%]">
              {players.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPlayer(i)}
                  className={`px-3 py-2 text-xs rounded-full font-medium transition whitespace-nowrap ${
                    i === currentPlayer 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'bg-white/10 backdrop-blur-md text-white/70 hover:bg-white/20'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-300 pb-20">
      {/* Poster с кнопкой Play */}
      <div className="relative">
        <img
          src={film.posterUrl || film.posterUrlPreview}
          alt={title}
          className="w-full h-[55vh] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-dark-300/20 to-transparent" />
        
        {/* Кнопка Play */}
        <button
          onClick={handleWatch}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-24 h-24 bg-primary/90 backdrop-blur rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-primary transition-all duration-300">
            <svg className="w-12 h-12 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </button>
      </div>

      {/* Info */}
      <div className="p-4 -mt-16 relative z-10">
        <div className="bg-dark-100/95 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl">
          {/* Title & Rating */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-3">
              <h1 className="text-2xl font-bold leading-tight">{title}</h1>
              {film.nameOriginal && film.nameOriginal !== title && (
                <p className="text-gray-500 text-sm mt-1">{film.nameOriginal}</p>
              )}
            </div>
            {rating && (
              <div className="bg-primary/20 text-primary px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-1">
                <span>⭐</span> {rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-4">
            {year && <span className="bg-dark-200 px-3 py-1.5 rounded-lg">{year}</span>}
            {film.filmLength && <span className="bg-dark-200 px-3 py-1.5 rounded-lg">{film.filmLength} мин</span>}
            {countries && <span className="bg-dark-200 px-3 py-1.5 rounded-lg">{countries}</span>}
          </div>

          {/* Genres */}
          {genres && (
            <div className="flex flex-wrap gap-2 mb-5">
              {film.genres?.map((g, i) => (
                <span key={i} className="bg-secondary/20 text-secondary px-3 py-1.5 rounded-full text-sm font-medium">
                  {g.genre}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {film.description && (
            <div className="mb-5">
              <h3 className="font-semibold mb-2 text-lg">Описание</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {film.description}
              </p>
            </div>
          )}

          {/* Watch Button */}
          <button
            onClick={handleWatch}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Смотреть онлайн
          </button>

          <p className="text-gray-500 text-center mt-3 text-xs">
            Доступно {players.length} источников
          </p>
        </div>
      </div>
    </div>
  )
}
