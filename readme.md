<img src="readme/pixel-place.png" alt="Pixel Place Logo" width="250" />

# Pixel Place

A realtime collaborative pixel art platform where users can place pixels on a shared canvas and earn cryptocurrency rewards for each pixel they place.

## Features

- **Collaborative Canvas**: Real-time pixel placement on a shared grid
- **Blockchain Integration**: Earn tokens for participating in the community
- **Real-time Updates**: See other users' pixels appear instantly
- **User Authentication**: Login with Twitter

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: login with Twitter using thirdweb API

## Getting Started

### Prerequisites

- pnpm
- Supabase account
- thirdweb account

### Installation

```bash
pnpm install
```

#### Set up environment variables:

Create a `.env.local` file and fill in your environment variables:

- supabase
  - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- thirdweb
  - `THIRDWEB_SECRET_KEY` - Your thirdweb secret key
  - `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - your thirdweb client ID.
  - `THIRDWEB_SERVER_WALLET_ADDRESS` - Your server wallet address. Get this from your thirdweb dashboard > your team > your project > transactions > server wallets page.
- contract
  - `NEXT_PUBLIC_TOKEN_CHAIN_ID` - chain ID where the token is deployed. For example, if the token is deployed on base, the chain ID is 8453.
  - `NEXT_PUBLIC_TOKEN_ADDRESS` - the contract address of the token

#### Set up the database

Run the `supabase-schema.sql` schema in your Supabase SQL editor.

### Start the development server

```bash
pnpm dev
```

## Create Token and transfer funds to thirdweb server wallet

- Deploy a token contract using thirdweb dashboard > your team > your project > tokens > create coin page.
  - Set enough supply to keep distributing to your users for a long time.
  - Make sure to keep the token sale % to a minimum and mint most of the supply to your wallet.
- After deployment, Transfer minted tokens from your personal wallet to the server wallet with address `THIRDWEB_SERVER_WALLET_ADDRESS`
- IF you don't have a thirdweb server wallet, you can create one using thirdweb dashboard > your team > your project > transactions > server wallets page.

Open [http://localhost:3000](http://localhost:3000) to view the application.

## License

MIT
