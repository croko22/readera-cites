import { describe, it, expect } from 'vitest'
import {
  getBookTitle,
  getBookAuthor,
  getBookProgress,
  getBookLastReadTime,
  getBookFavoriteTime,
  isFavoriteBook,
  getBookCitationCount,
  getCitationTimestamp,
  getCitationColorKey,
  getCitationColorName,
  formatRelativeTime,
  formatDate,
  CITATION_COLORS,
} from './readeraVocab.js'

describe('getBookTitle', () => {
  it('returns doc_file_name_title when available', () => {
    const b = { data: { doc_file_name_title: 'My Book', doc_title: 'Alt' } }
    expect(getBookTitle(b)).toBe('My Book')
  })

  it('falls back to doc_title', () => {
    const b = { data: { doc_title: 'Fallback' } }
    expect(getBookTitle(b)).toBe('Fallback')
  })

  it('falls back to Untitled book', () => {
    expect(getBookTitle({ data: {} })).toBe('Untitled book')
  })

  it('handles undefined book', () => {
    expect(getBookTitle(undefined)).toBe('Untitled book')
  })
})

describe('getBookAuthor', () => {
  it('returns author when available', () => {
    const b = { data: { doc_authors: 'Jane Doe' } }
    expect(getBookAuthor(b)).toBe('Jane Doe')
  })

  it('trims whitespace', () => {
    const b = { data: { doc_authors: '  Author Name  ' } }
    expect(getBookAuthor(b)).toBe('Author Name')
  })

  it('returns Unknown author for empty string', () => {
    const b = { data: { doc_authors: '' } }
    expect(getBookAuthor(b)).toBe('Unknown author')
  })

  it('returns Unknown author when data is missing', () => {
    expect(getBookAuthor({ data: {} })).toBe('Unknown author')
  })
})

describe('getBookProgress', () => {
  it('parses valid JSON string', () => {
    const b = { data: { doc_position: JSON.stringify({ ratio: 0.5, position: 120 }) } }
    expect(getBookProgress(b)).toEqual({ ratio: 0.5, percent: 50, position: 120 })
  })

  it('returns null when doc_position is null', () => {
    const b = { data: { doc_position: null } }
    expect(getBookProgress(b)).toBeNull()
  })

  it('returns null when data is undefined', () => {
    expect(getBookProgress(undefined)).toBeNull()
  })

  it('handles invalid JSON', () => {
    const b = { data: { doc_position: 'not-json' } }
    expect(getBookProgress(b)).toBeNull()
  })

  it('returns null ratio when position has no ratio', () => {
    const b = { data: { doc_position: JSON.stringify({ position: 50 }) } }
    expect(getBookProgress(b)).toEqual({ ratio: 0, percent: 0, position: 50 })
  })

  it('accepts pre-parsed object', () => {
    const b = { data: { doc_position: { ratio: 0.75, position: 200 } } }
    expect(getBookProgress(b)).toEqual({ ratio: 0.75, percent: 75, position: 200 })
  })
})

describe('getBookLastReadTime', () => {
  it('returns the read time as a number', () => {
    const t = 1700000000000
    expect(getBookLastReadTime({ data: { doc_last_read_time: t } })).toBe(t)
  })

  it('returns 0 when missing', () => {
    expect(getBookLastReadTime({ data: {} })).toBe(0)
  })
})

describe('getBookFavoriteTime', () => {
  it('returns the favorite time as a number', () => {
    expect(getBookFavoriteTime({ data: { doc_favorites_time: '1700000000000' } })).toBe(1700000000000)
  })

  it('returns null when value is 0', () => {
    expect(getBookFavoriteTime({ data: { doc_favorites_time: '0' } })).toBeNull()
  })

  it('returns null when field is null', () => {
    expect(getBookFavoriteTime({ data: { doc_favorites_time: null } })).toBeNull()
  })

  it('returns null when field is missing', () => {
    expect(getBookFavoriteTime({ data: {} })).toBeNull()
  })
})

describe('isFavoriteBook', () => {
  it('returns true when favorites_time is non-zero', () => {
    expect(isFavoriteBook({ data: { doc_favorites_time: 1700000000000 } })).toBe(true)
  })

  it('returns false when favorites_time is 0', () => {
    expect(isFavoriteBook({ data: { doc_favorites_time: 0 } })).toBe(false)
  })

  it('returns false when favorites_time is missing', () => {
    expect(isFavoriteBook({ data: {} })).toBe(false)
  })
})

describe('getBookCitationCount', () => {
  it('returns citation array length', () => {
    const b = { citations: [{ id: 1 }, { id: 2 }] }
    expect(getBookCitationCount(b)).toBe(2)
  })

  it('returns 0 when citations is undefined', () => {
    expect(getBookCitationCount({ data: {} })).toBe(0)
  })

  it('returns 0 when citations is not an array', () => {
    expect(getBookCitationCount({ data: {}, citations: 'invalid' })).toBe(0)
  })
})

describe('getCitationTimestamp', () => {
  it('returns the note_timestamp value', () => {
    expect(getCitationTimestamp({ note_timestamp: 1000 })).toBe(1000)
  })

  it('returns null when note_timestamp is null', () => {
    expect(getCitationTimestamp({ note_timestamp: null })).toBeNull()
  })

  it('returns null when cite is undefined', () => {
    expect(getCitationTimestamp(undefined)).toBeNull()
  })
})

describe('getCitationColorKey', () => {
  it('returns note_mark when present', () => {
    expect(getCitationColorKey({ note_mark: 2 })).toBe(2)
  })

  it('returns 0 for note_mark = 0', () => {
    expect(getCitationColorKey({ note_mark: 0 })).toBe(0)
  })

  it('returns 0 when note_mark is undefined', () => {
    expect(getCitationColorKey({})).toBe(0)
  })

  it('returns note_mark for values 1-4', () => {
    expect(getCitationColorKey({ note_mark: 1 })).toBe(1)
    expect(getCitationColorKey({ note_mark: 2 })).toBe(2)
    expect(getCitationColorKey({ note_mark: 3 })).toBe(3)
    expect(getCitationColorKey({ note_mark: 4 })).toBe(4)
  })
})

describe('getCitationColorName', () => {
  it('maps key 0 to yellow', () => {
    expect(getCitationColorName({ note_mark: 0 })).toBe('yellow')
  })

  it('maps key 1 to red', () => {
    expect(getCitationColorName({ note_mark: 1 })).toBe('red')
  })

  it('maps key 2 to blue', () => {
    expect(getCitationColorName({ note_mark: 2 })).toBe('blue')
  })

  it('maps key 3 to green', () => {
    expect(getCitationColorName({ note_mark: 3 })).toBe('green')
  })

  it('maps key 4 to orange', () => {
    expect(getCitationColorName({ note_mark: 4 })).toBe('orange')
  })

  it('falls back to yellow for undefined key', () => {
    expect(getCitationColorName({})).toBe('yellow')
  })

  it('falls back to yellow for out-of-range key', () => {
    expect(getCitationColorName({ note_mark: 99 })).toBe('yellow')
  })
})

describe('formatRelativeTime', () => {
  it('returns "just now" for < 60 seconds', () => {
    expect(formatRelativeTime(Date.now() - 10000)).toBe('just now')
  })

  it('returns minutes for < 60 minutes', () => {
    expect(formatRelativeTime(Date.now() - 120000)).toBe('2m ago')
  })

  it('returns hours for < 24 hours', () => {
    expect(formatRelativeTime(Date.now() - 7200000)).toBe('2h ago')
  })

  it('returns days for < 30 days', () => {
    expect(formatRelativeTime(Date.now() - 86400000 * 5)).toBe('5d ago')
  })

  it('returns months for < 12 months', () => {
    expect(formatRelativeTime(Date.now() - 86400000 * 60)).toBe('2mo ago')
  })

  it('returns years for >= 12 months', () => {
    expect(formatRelativeTime(Date.now() - 86400000 * 400)).toBe('1y ago')
  })

  it('returns empty string for falsy timestamp', () => {
    expect(formatRelativeTime(null)).toBe('')
    expect(formatRelativeTime(undefined)).toBe('')
    expect(formatRelativeTime(0)).toBe('')
  })
})

describe('formatDate', () => {
  it('formats a valid timestamp', () => {
    const ts = new Date(2024, 0, 15).getTime()
    const result = formatDate(ts)
    expect(result).toContain('2024')
    expect(result).toContain('Jan')
    expect(result).toContain('15')
  })

  it('returns empty string for falsy input', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate(0)).toBe('')
  })
})
