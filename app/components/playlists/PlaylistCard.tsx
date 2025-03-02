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
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="relative w-[150px] h-[150px]">
          <Image
            className="object-cover rounded-md"
            src={playlist.images[0]?.url}
            alt={playlist.name}
            fill
            unoptimized
          />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">{playlist.name}</CardTitle>
          <CardDescription 
            className="text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: playlist.description || 'No description' }}
          />
          <div className="flex flex-col gap-4 !mt-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {playlist.tracks.total} tracks
              </Badge>
              <Badge variant="outline">
                {playlist.public ? 'Public' : 'Private'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onViewTracks}
              >
                View Tracks
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={isFetchingAll}
                className="gap-2"
              >
                <LineChart className="h-4 w-4" />
                {isFetchingAll ? `Analyzing ${progress}%` : 'Analyze'}
              </Button>
            </div>
            
            {showAnalyzeHint && (
              <Alert variant="default" className="bg-muted">
                <InfoCircledIcon className="h-4 w-4" />
                <AlertDescription>
                  Analyze the playlist to unlock filtering and insights
                </AlertDescription>
              </Alert>
            )}

            <DatePickerWithRange 
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
} 