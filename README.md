# Discord Bot

## Getting Started

Copy the example env file and add your settings:

```
cp .env.local.example .env.local
```

To use production settings in your local env you can find them in Vydia 1Password Vault titled `discord-bot watch-party .env.local PRODUCTION`

Start

```
nvm install 15.6.0
yarn
yarn dev
```

## TODO:

During an active Party:
 - Allow replace the video in the current Party to a new video at any time.
 - As a host I want to be able to see how many people are in my party.

After party has expired after some amount of time:
 - Allow another party to reuse the same party 4-character id code again
