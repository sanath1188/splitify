"use client";

import React, { useEffect, useState } from 'react';
import useUserStore from '@/lib/store/useUserStore';
import { Loader2 } from "lucide-react";
import spotifyService from '../services/spotify.service';
import { PlaylistBadges } from '../components/playlists/PlaylistBadges';
import { PlaylistCard } from '../components/playlists/PlaylistCard';
import { TracksTable } from '../components/playlists/TracksTable';
import { SpotifyPlaylist, SpotifyTrack } from '../types/spotify';

export default function Dashboard() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const user = useUserStore((state) => state.user);
  const accessToken = useUserStore((state) => state.accessToken);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [currentTracks, setCurrentTracks] = useState<SpotifyTrack[]>([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const LIMIT = 50;

  useEffect(() => {
    if (accessToken) {
      console.log("accessToken", accessToken);
      console.log("user", user);

      spotifyService.setAccessToken(accessToken);

      setIsLoading(true);
      spotifyService.getUserPlaylists().then((data) => {
        const myPlaylists = data.items.filter((playlist: any) => playlist?.owner.id === user.id);

        console.log(myPlaylists)
        const fetchedPlaylists = myPlaylists
          .filter((playlist: any) => playlist !== null)
          .map((playlist: any) => playlist.id);
          console.log(fetchedPlaylists)

        Promise.all(
          fetchedPlaylists.map((playlistId: string) =>
            spotifyService.getPlaylist(playlistId)
          )
        ).then((detailedPlaylists) => {
          console.log(detailedPlaylists)
          const sortedPlaylists = detailedPlaylists.sort((a,b) =>  b?.tracks.total - a?.tracks.total)
          setPlaylists(sortedPlaylists);
          setIsLoading(false);
          
          if (sortedPlaylists.length > 0) {
            handlePlaylistClick(sortedPlaylists[0].id);
          }
        });
      });
    }
  }, [accessToken]);

  const handlePlaylistClick = (playlistId: string) => {
    setIsPlaylistLoading(true);
    spotifyService.getPlaylist(playlistId).then((data) => {
      console.log(data)
      console.log(data)
      setSelectedPlaylist(data);
      setIsPlaylistLoading(false);
    });
  };

  const fetchTracks = async (playlistId: string, offset: number) => {
    try {
      const response = await spotifyService.getPlaylistTracks(playlistId, offset, LIMIT);
      setCurrentTracks(response.items);
      return response;
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handleViewTracks = async () => {
    setShowTracks(true);
    if (selectedPlaylist) {
      await fetchTracks(selectedPlaylist.id, 0);
    }
  };

  const handlePrevPage = async () => {
    if (currentOffset >= LIMIT && selectedPlaylist) {
      const newOffset = currentOffset - LIMIT;
      setCurrentOffset(newOffset);
      await fetchTracks(selectedPlaylist.id, newOffset);
    }
  };

  const handleNextPage = async () => {
    if (selectedPlaylist && currentOffset + LIMIT < selectedPlaylist.tracks.total) {
      const newOffset = currentOffset + LIMIT;
      setCurrentOffset(newOffset);
      await fetchTracks(selectedPlaylist.id, newOffset);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-6">
      {user ? (
        <>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Your Playlists</h1>
              <p className="text-muted-foreground">
                Manage and organize your Spotify playlists
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading playlists...</span>
              </div>
            ) : (
              <PlaylistBadges 
                playlists={playlists}
                selectedPlaylist={selectedPlaylist}
                onPlaylistClick={handlePlaylistClick}
              />
            )}

            {isPlaylistLoading ? (
              <div className="mt-8 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading playlist...</span>
              </div>
            ) : selectedPlaylist && (
              <div className="mt-8 grid gap-6">
                <PlaylistCard 
                  playlist={selectedPlaylist}
                  onViewTracks={handleViewTracks}
                />

                {showTracks && (
                  <TracksTable 
                    tracks={currentTracks}
                    currentOffset={currentOffset}
                    limit={LIMIT}
                    total={selectedPlaylist.tracks.total}
                    onPrevPage={handlePrevPage}
                    onNextPage={handleNextPage}
                  />
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Login to see your playlists...</span>
          </div>
        </div>
      )}
    </div>
  );
}