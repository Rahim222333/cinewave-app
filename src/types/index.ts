export interface Film {
  kinopoiskId: number
  filmId?: number
  imdbId?: string
  nameRu?: string
  nameEn?: string
  nameOriginal?: string
  posterUrl?: string
  posterUrlPreview?: string
  year?: number
  filmLength?: string
  ratingKinopoisk?: number
  ratingImdb?: number
  genres?: { genre: string }[]
  countries?: { country: string }[]
  description?: string
  shortDescription?: string
  type?: string
}

export interface FilmDetails extends Film {
  slogan?: string
  webUrl?: string
  ratingAgeLimits?: string
}

export interface SearchResponse {
  keyword: string
  pagesCount: number
  searchFilmsCountResult: number
  films: Film[]
}

export interface CollectionResponse {
  total: number
  totalPages: number
  items: Film[]
}

