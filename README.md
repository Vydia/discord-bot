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

When a new Party is created:
 - Instead of using yt video id for the key/id, use some uuid or some firebase id. As a user I don't want my Parties to conflict with other users.
 - Host should have write scope over their Parties. Everyone else has read only. As a streamer I don't want stream viewers to mess with my viewing experience by making firebase writes to my Party info.

During an active Party:
 - Allow replace the video in the current Party to a new video at any time.
