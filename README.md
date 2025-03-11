# Splitify

Splitify is a powerful Spotify playlist management tool that helps you organize and handle large playlists efficiently. Built with Next.js and the Spotify Web API, it provides a modern interface for viewing and managing your Spotify playlists.
View demo here:
https://github.com/user-attachments/assets/e9fb3566-ffac-426e-9519-284cb1bf546d


## Features

- 🎵 View all your Spotify playlists in one place
- 📊 See detailed playlist information including track count and visibility
- 📱 Modern, responsive interface with a clean design
- 🔄 Paginated track viewing with efficient data loading
- ⬇️ Bulk download capability for entire playlists
- 🎨 Clean UI with dark/light mode support
- 🔒 Secure authentication with Spotify

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Spotify OAuth
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **API Integration**: spotify-web-api-js
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Spotify Developer Account
- Spotify Client ID

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/splitify.git
cd splitify
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SPOTIFY_CLIENT_KEY=your_spotify_client_id
PORT=your_desired_port
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

- `NEXT_PUBLIC_SPOTIFY_CLIENT_KEY`: Your Spotify Application Client ID
- `PORT`: Your desired port to run the app on

## Project Structure

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
