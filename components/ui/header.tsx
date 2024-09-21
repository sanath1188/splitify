"use client"
import React from "react";
import { Button } from "./button";
import useUserStore from "@/lib/store/useUserStore";

const Header: React.FC = () => {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_KEY;
  const redirectUri = 'http://localhost:3000/callback';
  const scopes = ['user-read-private', 'playlist-read-private', 'playlist-modify-public'];
  const user = useUserStore((state) => state.user);

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
        
        {user ? (
          <div className="text-white text-lg">Hi, {user.display_name}</div>
        ) : (
          <Button
            onClick={loginToSpotify}
          >
            Log in with Spotify
          </Button>
        )}
      </div>
      <style jsx>{`
        .retro-title {
          letter-spacing: 2px;
          // color: #E5D0CC;
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
