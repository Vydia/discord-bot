import { useRouter } from 'next/router'
import React, { FC, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/database'
import {
  FirebaseDatabaseProvider,
  FirebaseDatabaseNode,
  FirebaseDatabaseMutation
} from '@react-firebase/database'
import { config } from '../../firebaseConfig'

type Props = {
}

const Watch: FC<Props> = () => {
  const { query } = useRouter()
  if (!query?.slug) return <div />

  return (
    <FirebaseDatabaseProvider firebase={firebase} {...config}>
      <FirebaseDatabaseNode
        path={`player/${query?.slug}`}
        limitToFirst={1}
        orderByKey
      >
        {d => {
          return (<>
            <FirebaseDatabaseMutation type="set" path={`player/${query?.slug}`}>
              {({ runMutation }) => {
                return (
                  <div>
                    <button
                      onClick={async () => {
                        const { key } = await runMutation({ playing: "test" });
                      }}
                    >
                      Play
                    </button>
                  </div>
                );
              }}
            </FirebaseDatabaseMutation>
            <p>{JSON.stringify(d.value)}</p>
            <p>Watch party Page for &quot;{query.slug}&quot;!</p>
          </>)
        } }
      </FirebaseDatabaseNode>
    </FirebaseDatabaseProvider>
  )
}

export default Watch
