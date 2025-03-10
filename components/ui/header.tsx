"use client"
import React from "react";
import { Button } from "./button";
import useUserStore from "@/lib/store/useUserStore";
import { LogOut, Music2Icon, User2Icon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header: React.FC = () => {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_KEY;
  const redirectUri = 'http://localhost:3000/callback';
  const scopes = [
    'user-read-private', 
    'playlist-read-private', 
    'playlist-modify-public',
    'playlist-modify-private',
    'user-top-read',
    'user-library-modify',
    'user-library-read',
  ];
  
  // Only get the user from the store, don't get setUser
  const user = useUserStore((state) => state.user);

  const loginToSpotify = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes.join('%20')}&response_type=token`;
    window.location.href = authUrl;
  };

  const handleLogout = () => {useUserStore.getState().setUser(null);
    useUserStore.getState().setUser(null);
    useUserStore.getState().setAccessToken("");
    localStorage.removeItem('spotify-user-store');
    window.location.href = '/';
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 py-3 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Music2Icon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">
            Splitify
          </h1>
        </div>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage 
                    src={user.images?.[0]?.url} 
                    alt={user.display_name} 
                  />
                  <AvatarFallback>
                    {user.display_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex items-center">
                <User2Icon className="mr-2 h-4 w-4" />
                <span>{user.display_name}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={loginToSpotify}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Log in with Spotify
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
