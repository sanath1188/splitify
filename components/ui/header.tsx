"use client"
import React from "react";

const Header: React.FC = () => {

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_KEY;
  const redirectUri = 'http://localhost:3000/callback';
  const scopes = ['user-read-private', 'playlist-read-private', 'playlist-modify-public'];

  const loginToSpotify = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes.join('%20')}&response_type=token`;
    window.location.href = authUrl;
  };

  return (
    <header className="header-bg py-4 shadow-md">
      <div className="ml-5 mr-5 w-100 flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-wide retro-title">
          Retrofy
        </h1>
        <button
          className="spotify-btn hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-200 ease-in-out"
          onClick={loginToSpotify}
        >
          Log in with Spotify
        </button>
      </div>
      <style jsx>{`
        .retro-title {
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 2px;
          color: #E5D0CC;
        }
        .header-bg {
          background: #172121;
        }
        .spotify-btn {
          background: #E5D0CC;
        }
      `}</style>
    </header>
  );
};

export default Header;
