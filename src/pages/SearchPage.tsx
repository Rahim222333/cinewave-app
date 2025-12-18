import { useState } from 'react'
import { Film } from '../types'
import { FilmCard } from '../components/FilmCard'
import { api } from '../services/api'

interface SearchPageProps {
  onFilmClick: (filmId: number) => void
}

export function SearchPage({ onFilmClick }: SearchPageProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Film[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setSearched(true)
    try {
      const data = await api.search(query)
      setResults(data.films || [])
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="p-4 pb-20">
      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Название фильма..."
          className="flex-1 bg-dark-100 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
          autoFocus
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-primary hover:bg-primary/80 text-white px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {loading ? '...' : '🔍'}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin text-4xl">🎬</div>
          <p className="text-gray-500 mt-2">Ищем...</p>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">😕</div>
          <p className="text-gray-500">Ничего не найдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {results.map((film) => (
            <FilmCard
              key={film.filmId || film.kinopoiskId}
              film={film}
              onClick={() => onFilmClick(film.filmId || film.kinopoiskId)}
              compact
            />
          ))}
        </div>
      )}

      {/* Hint */}
      {!searched && (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-gray-500">Введите название фильма</p>
        </div>
      )}
    </div>
  )
}
