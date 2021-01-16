import { useRouter } from 'next/router'
import React, { FC } from 'react'
import firebase from "firebase/app"
import "firebase/database"
import {
  FirebaseDatabaseProvider,
  FirebaseDatabaseNode
} from "@react-firebase/database"
import { config } from "../../firebaseConfig"

type Props = {
}

const Watch: FC<Props> = () => {
  const { query } = useRouter()
  if (!query?.slug) return <div />

  return (
    <FirebaseDatabaseProvider firebase={firebase} {...config}>
      <FirebaseDatabaseNode
        path="player/"
        limitToFirst={1}
        orderByKey
      >
        {d => {
          return (<>
            <p>{JSON.stringify(d.value)}</p>
            <p>Watch party Page for &quot;{query.slug}&quot;!</p>
          </>)
        } }
      </FirebaseDatabaseNode>
    </FirebaseDatabaseProvider>
  )
}

export default Watch
