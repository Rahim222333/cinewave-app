import { useState, useEffect, useRef } from 'react'
import { FilmDetails } from '../types'
import { api } from '../services/api'

interface FilmPageProps {
  filmId: number
  onBack?: () => void
}

export function FilmPage({ filmId }: FilmPageProps) {
  const [film, setFilm] = useState<FilmDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadFilm()
  }, [filmId])

  // Загружаем скрипт плеера когда начинаем воспроизведение
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      // Очищаем предыдущий плеер
      playerRef.current.innerHTML = ''
      
      // Создаем контейнер для плеера
      const playerDiv = document.createElement('div')
      playerDiv.id = 'kinoplayertop'
      playerDiv.setAttribute('data-kinopoisk', String(filmId))
      playerDiv.setAttribute('data-player', 'alloha,kodik,collaps,hdvb')
      playerRef.current.appendChild(playerDiv)
      
      // Загружаем скрипт плеера
      const script = document.createElement('script')
      script.src = '//kinoplayer.top/top.js'
      script.async = true
      document.body.appendChild(script)
      
      return () => {
        // Удаляем скрипт при размонтировании
        document.body.removeChild(script)
      }
    }
  }, [isPlaying, filmId])

  const loadFilm = async () => {
    try {
      const data = await api.getFilm(filmId)
      setFilm(data)
    } catch (err) {
      console.error('Failed to load film:', err)
    } finally {
      setLoading(false)
    }
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
  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Шапка */}
        <div className="flex items-center p-3 bg-dark-200/90">
          <button 
            onClick={() => setIsPlaying(false)}
            className="text-white text-xl mr-3"
          >
            ←
          </button>
          <span className="text-white text-sm truncate">{title}</span>
        </div>
        
        {/* Плеер */}
        <div ref={playerRef} className="flex-1 bg-black" />
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
          onClick={() => setIsPlaying(true)}
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
            onClick={() => setIsPlaying(true)}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Смотреть бесплатно
          </button>
        </div>
      </div>
    </div>
  )
}
