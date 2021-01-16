import naclFactory from "js-nacl"

const PUBLIC_KEY = '<your public key here>'
const PING_PONG = {"type": 1}
const RESPONSE_TYPES =  {
  "PONG": 1,
  "ACK_NO_SOURCE": 2,
  "MESSAGE_NO_SOURCE": 3,
  "MESSAGE_WITH_SOURCE": 4,
  "ACK_WITH_SOURCE": 5
}

const verifySignature = (event) => {
  const rawBody = event["rawBody"]
  const authSig = event['params']['header']['x-signature-ed25519']
  const authTs  = event['params']['header']['x-signature-timestamp']

  naclFactory.instantiate((nacl) => {
    return nacl.crypto_sign_verify_detached(
      nacl.from_hex(authSig),
      `${encodeURI(authTs)}${encodeURI(rawBody)}`,
      nacl.from_hex(PUBLIC_KEY)
    )
  })
}

const lambdaHandler = (event, context) => {
  console.log(`event ${event}`)

  try {
    verifySignature(event)
  } catch {
    console.error("[UNAUTHORIZED] Invalid request signature: {e}")
  }

  const body = event['body-json']

  if (body["type"] == 1) {
    return PING_PONG
  }

  return {
    "type": RESPONSE_TYPES['MESSAGE_NO_SOURCE'],
    "data": {
      "tts": false,
      "content": "BEEP BOOP",
      "embeds": [],
      "allowed_mentions": []
    }
  }
}
