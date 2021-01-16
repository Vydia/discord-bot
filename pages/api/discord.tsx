import naclFactory from 'js-nacl'
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  }
}

const PUBLIC_KEY = '516311b92a3f7ef74e8034274aedcad679216d5f19183becf4a627b06b9884d4'
const RESPONSE_TYPES =  {
  'PONG': 1,
  'ACK_NO_SOURCE': 2,
  'MESSAGE_NO_SOURCE': 3,
  'MESSAGE_WITH_SOURCE': 4,
  'ACK_WITH_SOURCE': 5
}

const verifySignature = (rawBody: string, headers: Object) => {
  const authSig = headers['x-signature-ed25519']
  const authTs  = headers['x-signature-timestamp']
  const authT: string = typeof(authTs) === 'string' ? authTs : authTs[0]

  console.log('raw body: ', rawBody)

  naclFactory.instantiate((nacl) => {
    const verified = nacl.crypto_sign_verify_detached(
      nacl.from_hex(authSig),
      `${encodeURI(authT)}${encodeURI(rawBody)}`,
      nacl.from_hex(PUBLIC_KEY)
    )
    console.log(verified)
    return verified
  })
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // console.log(`headers: ${JSON.stringify(req.headers)}`)
  // console.log(`body: ${JSON.stringify(req.body)}`)

  const rawBody: string = await new Promise((resolve) => {
    if (!req.body) {
      let buffer = ''
      req.on('data', (chunk) => {
        console.log(chunk)
        buffer += chunk
      })

      req.on('end', () => {
        resolve(buffer)
      })
    }
  })
  const body = JSON.parse(Buffer.from(rawBody).toString())

  console.log(`raw body: ${rawBody}`)
  console.log(`body: ${JSON.stringify(body)}`)
  try {
    verifySignature(rawBody, req.headers)
  } catch {
    console.error('[UNAUTHORIZED] Invalid request signature: {e}')
  }

  if (body['type'] == 1) {
    return {'type': 1}
  }

  return {
    'type': RESPONSE_TYPES['MESSAGE_NO_SOURCE'],
    'data': {
      'tts': false,
      'content': 'BEEP BOOP',
      'embeds': [],
      'allowed_mentions': []
    }
  }
}
