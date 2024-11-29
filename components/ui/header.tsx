"use client"
import React from "react";
import { Button } from "./button";
import useUserStore from "@/lib/store/useUserStore";
import { User2Icon } from "lucide-react";

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
    <header className="bg-accent py-4 fixed top-0 left-0 w-full z-50 shadow-sm">
      <div className="ml-5 mr-5 w-100 flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-wide">
          Retrofy
        </h1>
        
        {user ? (
          <div className="text-black text-lg flex items-center">
            <User2Icon className="mr-2" size={18}></User2Icon>
              Hi, {user.display_name}
          </div>
        ) : (
          <Button
            onClick={loginToSpotify}
          >
            Log in with Spotify
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
