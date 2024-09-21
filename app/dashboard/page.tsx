"use client";

import useUserStore from '@/lib/store/useUserStore';
import React, { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

      // Set access token for Spotify API
      spotifyApi.setAccessToken(accessToken);

      // Fetch user's playlists
      spotifyApi.getUserPlaylists().then((data) => {
        const fetchedPlaylists = data.items.map((playlist: any) => ({
          id: playlist.id,
          name: playlist.name,
          tracks: playlist.tracks.total,
        }));
        console.log(fetchedPlaylists);
        setPlaylists(fetchedPlaylists); // Update state with playlists
      });
    }
  }, [accessToken]); // Re-run when accessToken changes

  return (
    <div className="container">
      {user ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Playlists by {user?.display_name}</h1>
          {/* Render playlists */}
          {playlists.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Playlist Name</TableHead>
                  <TableHead>Tracks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playlists.map((playlist) => (
                  <TableRow key={playlist.id}>
                    <TableCell>{playlist.name}</TableCell>
                    <TableCell>{playlist.tracks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
