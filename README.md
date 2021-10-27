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
 - As a host I want to be able to see how many people are in my party.
 - Allow joining a party VIA party 4-character id code.

After party has expired:
 - Allow another party to reuse the same party 4-character id code again

New schema:

 - `[A-Z0-9]{4}` indicates the party's 4-character id code.

```
party/[A-Z0-9]{4}/video: string containing youtube video id
party/[A-Z0-9]{4}/playing: boolean whether party video is playing or not
party/[A-Z0-9]{4}/seek: number indicating current playback position of the video

<!-- TODO: How to track auth / owner? signInAnonymously? https://firebase.google.com/docs/auth/web/anonymous-auth -->
<!-- https://firebase.google.com/docs/rules/basics#mixed_public_and_private_access -->

<!-- TODO: Track some expiration time or created time so we can clean up old parties? -->
```
