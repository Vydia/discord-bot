import { useRouter } from 'next/router'
import React, { FC } from 'react'

type Props = {
}

const Watch: FC<Props> = () => {
  const { query } = useRouter()
  if (!query?.slug) return <div />
  console.warn('dan idiot')
  return (
    <>Watch party Page for &quot;{query.slug}&quot;!</>
  )
}

export default Watch
