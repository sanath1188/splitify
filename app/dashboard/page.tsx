"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import useUserStore from '@/lib/store/useUserStore';
import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { Tooltip } from '@/components/ui/tooltip'; // Assuming you have a Tooltip component

const spotifyApi = new SpotifyWebApi();

export default function Dashboard() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null); // New state for selected playlist
  const user = useUserStore((state) => state.user);
  const accessToken = useUserStore((state) => state.accessToken);

  // UseEffect to run when accessToken becomes available
  useEffect(() => {
    // Wait for accessToken to be available before proceeding
    if (accessToken) {
      console.log("accessToken", accessToken);
      console.log("user", user);

      spotifyApi.setAccessToken(accessToken);

      // Fetch user's playlists
      spotifyApi.getUserPlaylists().then((data) => {
        const fetchedPlaylists = data.items
          .filter((playlist: any) => playlist !== null)
          .map((playlist: any) => playlist.id);

        // Fetch full details for each playlist
        Promise.all(
          fetchedPlaylists.map((playlistId: string) =>
            spotifyApi.getPlaylist(playlistId)
          )
        ).then((detailedPlaylists) => {
          setPlaylists(detailedPlaylists);
        });
      });
    }
  }, [accessToken]);

  const handlePlaylistClick = (playlistId: string) => {
    // Fetch details of the selected playlist
    spotifyApi.getPlaylist(playlistId).then((data) => {
      console.log(data)
      setSelectedPlaylist(data);
    });
  };

  return (
    <div className="container w-full bg-neutral">
      {user ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Playlists by {user?.display_name}</h1>
          {/* Render playlists as badges */}
          {playlists.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {playlists.map((playlist) => (
                <Badge key={playlist.id} className="text-white cursor-pointer">
                  <div className='text-sm' onClick={() => handlePlaylistClick(playlist.id)}>
                    {playlist.name}
                  </div>
                </Badge>
              ))}
            </div>
          ) : (
            <p>No playlists found.</p>
          )}
          {/* Display selected playlist details */}
          {selectedPlaylist && (
            <div className="mt-4 p-4 border rounded">
              <h2 className="text-xl font-bold">{selectedPlaylist.name}</h2>
              <img src={selectedPlaylist.images[0]?.url} alt={selectedPlaylist.name} width={150} height={150}/>
              <p dangerouslySetInnerHTML={{ __html: selectedPlaylist.description }}></p>
              <p>Tracks: {selectedPlaylist.tracks.total}</p>
              {/* Add more details as needed */}
            </div>
          )}
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}