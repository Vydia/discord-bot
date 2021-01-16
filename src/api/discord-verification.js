const naclFactory = require("js-nacl")
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
  rawBody = event["rawBody"]
  authSig = event['params']['header']['x-signature-ed25519']
  authTs  = event['params']['header']['x-signature-timestamp']

  message = encodeURI(authTs) + encodeURI(rawBody)
  naclFactory.instantiate((nacl) => {
    return nacl.crypto_sign_verify_detached(
      nacl.from_hex(authSig),
      message,
      nacl.from_hex(PUBLIC_KEY)
    )
  })
}

const pingPong = (body) => {
  body["type"] == 1
}

const lambdaHandler = (event, context) => {
  console.log(`event ${event}`)

  try {
    verifySignature(event)
  } catch {
    console.error(f"[UNAUTHORIZED] Invalid request signature: {e}")
  }

  const body = event['body-json']

  if (pingPong(body)) {
    return PING_PONG
  }

  return {
    "type": RESPONSE_TYPES['MESSAGE_NO_SOURCE'],
    "data": {
      "tts": False,
      "content": "BEEP BOOP",
      "embeds": [],
      "allowed_mentions": []
    }
  }
}
