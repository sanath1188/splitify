"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

const Callback: React.FC = () => {
  const router = useRouter(); // Correct usage in app directory

  useEffect(() => {
    // Extract the token from the URL hash
    const hash = window.location.hash.substring(1).split('&').reduce((initial: any, item) => {
      const parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});

    const accessToken = hash.access_token;

    if (accessToken) {
      // Set the access token in the Spotify API instance
      spotifyApi.setAccessToken(accessToken);

      // Fetch user's playlists
      spotifyApi.getUserPlaylists()
        .then((playlists) => {
          console.log(playlists);
          // Do something with the playlists, like saving them to state
        })
        .catch((err) => {
          console.error('Error fetching playlists: ', err);
        });

      // Optionally navigate back to home after setting the token and fetching playlists
      router.push('/dashboard'); // Use the correct navigation method
    }
  }, [router]);

  return (
    <div>
      <h1>Logging in...</h1>
    </div>
  );
};

export default Callback;
