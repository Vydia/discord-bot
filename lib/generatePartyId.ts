const ID_SIZE = 4
const UNAMBIGUOUS_CHARS = 'ABCDEFGHJKMNPQRTUVWXYZ2346789'.split('')
const UNAMBIGUOUS_CHARS_LENGTH = UNAMBIGUOUS_CHARS.length

export function generatePartyId (): string {
  let id = ''
  for (let i = 0; i < ID_SIZE; i ++) {
    // TODO: secure-random
    id += UNAMBIGUOUS_CHARS[Math.floor(Math.random() * UNAMBIGUOUS_CHARS_LENGTH)]
  }
  return id
}

export function coercePartyId (maybePartyId: string | void): string | void {
  maybePartyId = maybePartyId && maybePartyId.toUpperCase()
  const idMatch = maybePartyId && maybePartyId.match(new RegExp(`^[0-9A-Z]{${ID_SIZE}}$`))

  if (idMatch) return idMatch[0]
}
