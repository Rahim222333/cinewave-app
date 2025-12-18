import type { Film, FilmDetails, SearchResponse, CollectionResponse } from '../types'

// Kinopoisk API напрямую
const KINO_API = 'https://kinopoiskapiunofficial.tech/api'
const API_KEY = '546b9e4e-cefb-45b5-9861-6e4238b554f1'

async function kinoFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${KINO_API}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }
  
  const response = await fetch(url.toString(), {
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  
  return response.json()
}

export const api = {
  // Поиск фильмов
  search: async (keyword: string, page = 1): Promise<SearchResponse> => {
    return kinoFetch('/v2.1/films/search-by-keyword', {
      keyword,
      page: String(page),
    })
  },

  // Популярные фильмы
  getPopular: async (page = 1): Promise<CollectionResponse> => {
    return kinoFetch('/v2.2/films/collections', {
      type: 'TOP_POPULAR_ALL',
      page: String(page),
    })
  },

  // Топ-250
  getTop: async (page = 1): Promise<CollectionResponse> => {
    return kinoFetch('/v2.2/films/collections', {
      type: 'TOP_250_MOVIES',
      page: String(page),
    })
  },

  // Премьеры
  getPremieres: async (): Promise<{ total: number; items: Film[] }> => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.toLocaleString('en-US', { month: 'long' }).toUpperCase()
    
    return kinoFetch('/v2.2/films/premieres', {
      year: String(year),
      month,
    })
  },

  // Детали фильма
  getFilm: async (filmId: number): Promise<FilmDetails> => {
    return kinoFetch(`/v2.2/films/${filmId}`)
  },

  // Похожие фильмы
  getSimilar: async (filmId: number): Promise<{ total: number; items: Film[] }> => {
    return kinoFetch(`/v2.2/films/${filmId}/similars`)
  },
}

