import { Film } from '../types'

interface FilmCardProps {
  film: Film
  onClick: () => void
  compact?: boolean
}

export function FilmCard({ film, onClick, compact }: FilmCardProps) {
  const title = film.nameRu || film.nameOriginal || film.nameEn || 'Без названия'
  const rating = film.ratingKinopoisk || film.ratingImdb
  const poster = film.posterUrlPreview || film.posterUrl

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer active:scale-95 transition-transform"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-dark-200">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              🎬
            </div>
          )}
          {rating && (
            <div className="absolute top-1 right-1 bg-black/70 text-yellow-400 text-xs px-1.5 py-0.5 rounded font-bold">
              ⭐{rating.toFixed(1)}
            </div>
          )}
        </div>
        <p className="text-xs mt-1 line-clamp-2 text-gray-300">{title}</p>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-32 cursor-pointer active:scale-95 transition-transform"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-200 shadow-lg">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🎬
          </div>
        )}
        {rating && (
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-2 py-1 rounded-lg font-bold">
            ⭐ {rating.toFixed(1)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <p className="text-sm mt-2 font-medium line-clamp-2">{title}</p>
      {film.year && <p className="text-xs text-gray-500">{film.year}</p>}
    </div>
  )
}
