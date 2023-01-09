import { useObjectVal } from 'react-firebase-hooks/database'
import { app } from '../../lib/firebase'

export default function useParticipantsCount({ partyId }: { partyId: string }) {
  const [heartbeats, loading, error] = useObjectVal(app.database().ref(`party/${partyId}/heartbeats`))

  if (loading || error || !heartbeats) {
    return 1 // 1 while loading
  }

  const now = Date.now()
  let count = 0
  Object.values(heartbeats).forEach(timestamp => {
    if (now - timestamp < 5 * 60 * 1000) { // 5 minutes
      count += 1
    }
  })

  return count
}
