import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { SpotifyPlaylist, SpotifyTrack } from '@/app/types/spotify';
import { Download, LineChart } from 'lucide-react';
import { useState } from 'react';
import spotifyService from '@/app/services/spotify.service';
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { DatePickerWithRange } from '../ui/date-range-picker';
import { motion } from "framer-motion";
import { Sparkles, Clock, Music2, Calendar } from "lucide-react";

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
  onViewTracks: () => void;
  onAnalysisComplete: (tracks: SpotifyTrack[]) => void;
}

export function PlaylistCard({ playlist, onViewTracks, onAnalysisComplete }: PlaylistCardProps) {
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -365),
    to: new Date(),
  });
  const [showAnalyzeHint, setShowAnalyzeHint] = useState(true);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAllTracks = async () => {
    setIsFetchingAll(true);
    setProgress(0);
    
    const BATCH_SIZE = 100;
    const totalBatches = Math.ceil(playlist.tracks.total / BATCH_SIZE);
    let allTracks: SpotifyTrack[] = [];
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const INITIAL_BACKOFF = 1000; // 1 second

    for (let offset = 0; offset < playlist.tracks.total; offset += BATCH_SIZE) {
      try {
        // Calculate and update progress
        const currentBatch = Math.floor(offset / BATCH_SIZE) + 1;
        const progressPercent = Math.round((currentBatch / totalBatches) * 100);
        setProgress(progressPercent);

        const response = await spotifyService.getPlaylistTracks(
          playlist.id, 
          offset, 
          BATCH_SIZE
        );

        if (response?.items) {
          for(let item of response.items) {
            delete item.track.available_markets;
            delete item.track.album.available_markets;
            delete item.track.video_thumbnail;
            delete item.track.is_local;
            delete item.track.album.images;
          }
          allTracks = [...allTracks, ...response.items];
          retryCount = 0; // Reset retry count on successful request
        }

        // Add a small delay between requests to avoid rate limiting
        await delay(100);

      } catch (error: any) {
        console.error(`Error fetching tracks at offset ${offset}:`, error);

        if (error?.status === 429) {
          // Get retry-after header or use exponential backoff
          const retryAfter = error.headers?.get('retry-after') || 
            Math.min(INITIAL_BACKOFF * Math.pow(2, retryCount), 60000); // Max 1 minute

          console.log(`Rate limited. Waiting ${retryAfter}ms before retry...`);
          await delay(Number(retryAfter));
          
          retryCount++;
          
          if (retryCount <= MAX_RETRIES) {
            offset -= BATCH_SIZE; // Retry the same batch
            continue;
          }
        }

        // If we've exceeded max retries or it's not a rate limit error
        console.error('Failed to fetch tracks after retries:', error);
        break;
      }
    }

    setIsFetchingAll(false);
    setProgress(100);
    
    // Log the final array
    console.log('All tracks fetched:', allTracks);
    console.log('Total tracks fetched:', allTracks.length);
    
    return allTracks;
  };

  const handleAnalyze = async () => {
    const tracks = await fetchAllTracks();
    if (tracks && dateRange?.from && dateRange?.to) {
      const filteredTracks = tracks.filter(item => {
        const releaseDate = new Date(item.track.album.release_date);
        return releaseDate >= dateRange.from! && releaseDate <= dateRange.to!;
      });
      onAnalysisComplete(filteredTracks);
    }
    setShowAnalyzeHint(false);
  };

  return (
    <div className="grid gap-6">
      {/* Main Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-background to-muted">
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          {/* Left Section - Cover Art */}
          <div className="relative lg:w-[400px] aspect-square">
            {playlist.images[0]?.url && (
              <>
                <Image
                  className="object-cover rounded-md w-full h-full"
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  width={400}
                  height={400}
                  priority
                />
              </>
            )}
            
            {/* Overlay Stats */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background/90 via-background/50 to-transparent z-20 opacity-90">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight">{playlist.name}</h2>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Music2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">{playlist.tracks.total} tracks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {Math.floor(playlist.tracks.total * 3.5)} mins
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex-1 p-8 flex flex-col">
            <div className="space-y-8">
              {/* Description */}
              {playlist.description && (
                <div className="prose prose-sm dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: playlist.description }} />
                </div>
              )}

              {/* Analysis Hint */}
              {showAnalyzeHint && (
                  <Alert className="bg-primary/5 border border-primary/10 !mt-5">
                    <div className="flex items-center gap-2 w-full justify-center">
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <AlertDescription className="text-sm text-primary my-auto">
                        Analyze your playlist to discover insights and create filtered views
                      </AlertDescription>
                    </div>
                  </Alert>
              )}

              {/* Actions */}
              <div className="!mt-5">
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={isFetchingAll}
                    className="relative group"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {isFetchingAll ? `Analyzing ${progress}%` : 'Analyze Playlist'}
                    </span>
                    {!isFetchingAll && (
                      <span className="absolute inset-0 bg-primary/10 rounded-lg transform scale-0 group-hover:scale-100 transition-transform" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onViewTracks}
                  >
                    View Tracks
                  </Button>
                </div>

                {/* Analysis Progress */}
                {isFetchingAll && (
                  <div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Fetching tracks... {progress}% complete
                    </p>
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Filter by Release Date</span>
                </div>
                <DatePickerWithRange 
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
              
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 