"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

const Callback: React.FC = () => {
  const router = useRouter(); // Correct usage in app directory
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.substring(1).split('&').reduce((initial: any, item) => {
      const parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});

    const accessToken = hash.access_token;

    if (accessToken) {
      spotifyApi.setAccessToken(accessToken);

      spotifyApi.getMe().then((userData: any) => {
        localStorage.setItem('spotifyUser', userData);
        localStorage.setItem('spotifyToken', accessToken);
        console.log(userData)
        setUsername(userData.display_name);
      });

      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div>
      <h1>Logging in...</h1>
    </div>
  );
};

export default Callback;
