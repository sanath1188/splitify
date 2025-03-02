"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import useUserStore from '@/lib/store/useUserStore';
import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState } from 'react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import spotifyService from '../services/spotify.service';
import { Loader2 } from "lucide-react";
import Image from 'next/image';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const user = useUserStore((state) => state.user);
  const accessToken = useUserStore((state) => state.accessToken);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [currentTracks, setCurrentTracks] = useState<any[]>([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const LIMIT = 50; // Spotify's default limit

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
                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    {playlists.map((playlist) => (
                      <Tooltip key={playlist.id}>
                        <TooltipTrigger>
                          <Badge 
                            variant={selectedPlaylist?.id === playlist.id ? "default" : "secondary"}
                            className={cn(
                              "cursor-pointer transition-colors",
                              selectedPlaylist?.id === playlist.id 
                                ? "hover:bg-primary/90" 
                                : "hover:bg-secondary/60"
                            )}
                            onClick={() => handlePlaylistClick(playlist.id)}
                          >
                            <div className="text-sm px-1">
                              {playlist.name}
                            </div>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{playlist.tracks.total} tracks</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
            )}

            {isPlaylistLoading ? (
              <div className="mt-8 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading playlist...</span>
              </div>
            ) : selectedPlaylist && (
              <div className="mt-8 grid gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="relative w-[150px] h-[150px]">
                      <Image
                        className="object-cover rounded-md"
                        src={selectedPlaylist.images[0]?.url}
                        alt={selectedPlaylist.name}
                        fill
                        unoptimized
                      />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-2xl">{selectedPlaylist.name}</CardTitle>
                      <CardDescription 
                        className="text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: selectedPlaylist.description || 'No description' }}
                      />
                      <div className="flex items-center gap-2 !mt-4">
                        <Badge variant="secondary">
                          {selectedPlaylist.tracks.total} tracks
                        </Badge>
                        <Badge variant="outline">
                          {selectedPlaylist.public ? 'Public' : 'Private'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleViewTracks}
                        >
                          View Tracks
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {showTracks && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tracks</CardTitle>
                      <CardDescription>
                        Showing {currentOffset + 1}-{Math.min(currentOffset + LIMIT, selectedPlaylist.tracks.total)} of {selectedPlaylist.tracks.total} tracks
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Artist</TableHead>
                            <TableHead>Album</TableHead>
                            <TableHead>Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentTracks.map((track) => (
                            <TableRow key={track.track.id}>
                              <TableCell>{track.track.name}</TableCell>
                              <TableCell>{track.track.artists.map((a: any) => a.name).join(', ')}</TableCell>
                              <TableCell>{track.track.album.name}</TableCell>
                              <TableCell>
                                {Math.floor(track.track.duration_ms / 60000)}:
                                {String(Math.floor((track.track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentOffset === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentOffset + LIMIT >= selectedPlaylist.tracks.total}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading user data...</span>
          </div>
        </div>
      )}
    </div>
  );
}