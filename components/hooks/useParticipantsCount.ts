import { useEffect } from 'react'
import { useObjectVal } from 'react-firebase-hooks/database'
import { app } from '../../lib/firebase'
import { useAuthUser } from '../providers/FirebaseAuthProvider'

export default function useParticipantsCount({ partyId, partyUserUid }: { partyId: string, partyUserUid: string }) {
  const [heartbeats, loading, error] = useObjectVal(app.database().ref(`party/${partyUserUid}/${partyId}/heartbeats`))
  const user = useAuthUser()

  useEffect(() => {
    const interval = setInterval(() => {
      if (!user) return
      const heartbeatsRef = app.database().ref(`party/${ partyUserUid }/${ partyId }/heartbeats`)

      heartbeatsRef.push({
        uid: user.uid,
        timestamp: Date.now()
      })

      // Remove old heartbeats for this user
      heartbeatsRef.orderByChild('uid').equalTo(user.uid).once('value', snapshot => {
        snapshot.forEach(child => {
          if (Date.now() - child.val().timestamp > 10 * 1000) {
            child.ref.remove()
          }
        })
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [partyId, partyUserUid, user])

  if (loading || error || !heartbeats) {
    return 1 // 1 while loading
  }

  const now = Date.now()
  const currentUserIds = new Set<string>()
  Object.values(heartbeats).forEach(heartbeat => {
    if (now - heartbeat.timestamp < 5 * 1000) { // 5 seconds
      currentUserIds.add(heartbeat.uid)
    }
  })

  return currentUserIds.size
}
