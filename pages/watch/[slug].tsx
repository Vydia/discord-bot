import { useRouter } from 'next/router'
import React, { FC, useState, useEffect } from 'react'
import firebase from 'firebase/app'
import 'firebase/database'
import { config } from '../../firebaseConfig'
import { useObjectVal } from 'react-firebase-hooks/database'

if (!firebase.apps.length) {
  firebase.initializeApp(config)
}else {
  firebase.app()
}
type Props = {
}

const Watch: FC<Props> = () => {
  const { query } = useRouter()
  const [value, loading, error] = useObjectVal(firebase.database().ref(`player/${query?.slug}`));
  const isPlaying = value && !Boolean(value["playing"])

  if (!query?.slug) return <div />

  return (
    <div>
      <p>
        {error && <strong>Error: {error}</strong>}
        {loading && <span>Loading...</span>}
        {!loading && (
          <>
            <button onClick={() => {
              firebase.database().ref(`player/${query?.slug}`).set({
                "playing": !!isPlaying
              })
            }}>
              { isPlaying ? "Pause" : "Play" }
            </button>
            <p>{`Playing: ${!!isPlaying}`}</p>
          </>
        )}
      </p>
    </div>
  );
}

export default Watch
