"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import useUserStore from '@/lib/store/useUserStore';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

export default function Dashboard() {
  const [playlists, setPlaylists] = useState<any[]>([]);
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
          .filter((playlist: any) => playlist !== null) // Filter out null items
          .map((playlist: any) => ({
            id: playlist.id,
            name: playlist.name,
            description: playlist.description,
            external_urls: playlist.external_urls,
            href: playlist.href,
            images: playlist.images,
            owner: playlist.owner,
            public: playlist.public,
            snapshot_id: playlist.snapshot_id,
            tracks: playlist.tracks,
            type: playlist.type,
            uri: playlist.uri,
          }));
        console.log(fetchedPlaylists);
        setPlaylists(fetchedPlaylists);
      });
    }
  }, [accessToken]);

  return (
    <div className="container w-full">
      {user ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Playlists by {user?.display_name}</h1>
          {/* Render playlists as cards */}
          {playlists.length > 0 ? (
            <div className="grid grid-cols-4 gap-4 w-full">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className='bg-red h-fit'>
                  <CardHeader className='items-center'>
                    <img src={playlist.images[0]?.url} alt={playlist.name} width={150} height={150}/>
                  </CardHeader>
                  <CardContent>
                    <div className='truncate font-semibold text-lg text-white'>{playlist.name}</div>
                    <div className='truncate text-sm text-white'>Total songs: {playlist.tracks.total}</div>
                  </CardContent>
                  <CardFooter>
                    <Button className='w-full' href={playlist.external_urls.spotify} target="_blank">
                      Open in Spotify
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p>No playlists found.</p>
          )}
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}