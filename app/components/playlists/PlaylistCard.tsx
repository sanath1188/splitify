import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { SpotifyPlaylist, SpotifyTrack } from '@/app/types/spotify';
import { Download, LineChart, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import spotifyService from '@/app/services/spotify.service';
import { addDays } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { Sparkles, Clock, Music2, Calendar } from "lucide-react";
import { addMonths, subMonths } from 'date-fns';
import { DateTimePicker } from '../ui/datetime-picker';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import lodash from "lodash";

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
  onViewTracks: () => void;
  onAnalysisComplete: (tracks: SpotifyTrack[]) => void;
  onPlaylistDeleted?: (playlistId: string) => void;
}

export function PlaylistCard({ playlist, onViewTracks, onAnalysisComplete, onPlaylistDeleted }: PlaylistCardProps) {
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzedTracks, setAnalyzedTracks] = useState<SpotifyTrack[]>([]);
  const [fromDate, setFromDate] = useState<Date | undefined>(addDays(new Date(), -365));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [showAnalyzeHint, setShowAnalyzeHint] = useState(true);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // New state to manage active filter pills – extensible to add more filters later
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Define your available filter options – more options can be added here
  const filterOptions = [
    { key: 'releaseDate', label: 'Release Date' }
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(item => item !== filter)
        : [...prev, filter]
    );
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAllTrackFeatures = async (trackIds: Array<string>) => {
    setIsFetchingAll(true);
    setProgress(0);

    const chunkedTrackIds = lodash.chunk(trackIds, 50);
    let allTracks: SpotifyTrack[] = [];

    for(const chunkedTrackId of chunkedTrackIds) {
      const trackFeatures = await spotifyService.getSeveralTracksAudioFeatures(chunkedTrackId);
      allTracks = [...allTracks, ...trackFeatures]
    };

    setIsFetchingAll(false);
    setProgress(100);
    
    return allTracks;
  }

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
    const trackIds = tracks.map((track: any) => track.track.id);
    // console.log(trackIds)
    // const trackFeatures = await fetchAllTrackFeatures(trackIds);

    if (tracks) {
      setAnalyzedTracks(tracks);
      // Remove the old showDateRange call to let the user select the filter pill
      setShowAnalyzeHint(false);
    }
  };

  const createPlaylistFromFiltered = async (filteredTracks: SpotifyTrack[]) => {
    if (!filteredTracks.length || !fromDate || !toDate) return;
    
    setIsCreatingPlaylist(true);
    
    try {
      // Format dates for the playlist name
      const fromDateStr = format(fromDate, 'MMM d, yyyy');
      const toDateStr = format(toDate, 'MMM d, yyyy');
      const playlistName = `${playlist.name} (${fromDateStr} - ${toDateStr})`;
      
      // Create a new playlist
      const user = await spotifyService.getCurrentUser();
      const newPlaylist = await spotifyService.createPlaylist(
        user?.id || '',
        {
          name: playlistName,
          description: `Filtered tracks from "${playlist.name}" released between ${fromDateStr} and ${toDateStr}`,
          public: false
        }
      );
      
      if (!newPlaylist) {
        throw new Error("Failed to create playlist");
      }
      
      // Add tracks to the playlist in batches
      const trackUris = filteredTracks.map(item => item.track.uri);
      const BATCH_SIZE = 100;
      
      for (let i = 0; i < trackUris.length; i += BATCH_SIZE) {
        const batch = trackUris.slice(i, i + BATCH_SIZE);
        await spotifyService.addTracksToPlaylist(newPlaylist.id, batch);
      }
      
      toast(`Created playlist "${playlistName}" with ${filteredTracks.length} tracks`);
      
      // Also log to console for debugging
      console.log(`Created playlist "${playlistName}" with ${filteredTracks.length} tracks`);
      
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      
      // Simple error toast
      toast.error(`Error: ${error.message || 'Failed to create playlist'}`);
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const handleBranchPlaylist = () => {
    if (analyzedTracks.length && fromDate && toDate) {
      const filteredTracks = analyzedTracks.filter(item => {
        const releaseDate = new Date(item.track.album.release_date);
        return releaseDate >= fromDate && releaseDate <= toDate;
      });
      
      if (filteredTracks.length === 0) {
        toast.error("No tracks found", {
          description: "No tracks match the selected date range.",
        });
        return;
      }
      
      // Create a new playlist with the filtered tracks
      createPlaylistFromFiltered(filteredTracks);
      
      // Also pass the filtered tracks to the parent component
      onAnalysisComplete(filteredTracks);
    }
  };

  const handleDeletePlaylist = async () => {
    setIsDeleting(true);
    try {
      await spotifyService.deletePlaylist(playlist.id);
      toast.success("Playlist deleted", {
        description: `"${playlist.name}" has been deleted.`,
      });
      
      // Call the callback if it exists
      if (onPlaylistDeleted) {
        onPlaylistDeleted(playlist.id);
      }
      
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting playlist:', error);
      toast.error("Failed to delete playlist", {
        description: error.message || "An error occurred while deleting the playlist.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 w-full">
      {/* Main Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-background to-muted w-full">
        <div className="flex flex-col lg:flex-row lg:items-stretch w-full">
          {/* Left Section - Cover Art */}
          <div className="relative w-[300px] aspect-square">
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
            <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-background/90 via-background/50 to-transparent z-20 opacity-90">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">{playlist.name}</h2>
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
          <div className="flex-1 p-8 flex flex-col w-full">
            <div className="space-y-8 w-full">
              {/* Description */}
              {playlist.description && (
                <div className="prose prose-sm dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: playlist.description }} />
                </div>
              )}

              {/* Analysis Hint */}
              {showAnalyzeHint && (
                <Alert className="bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 w-full justify-center">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <AlertDescription className="text-sm text-primary my-auto">
                      Analyze your playlist to discover insights and create filtered views
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Actions */}
              <div className="space-y-4">
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
                  
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="lg"
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                      >
                        <span className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete Playlist
                        </span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Delete Playlist
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeletePlaylist}
                          disabled={isDeleting}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          {isDeleting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Deleting...
                            </span>
                          ) : (
                            "Delete Playlist"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Fetching tracks... {progress}% complete
                    </p>
                  </div>
                )}
              </div>

              {/* Filter Pills & Filter UI – only visible after analysis */}
              {analyzedTracks.length > 0 && !isFetchingAll && (
                <>
                  <div className='!mt-4 text-sm font-semibold'>Split your playlists by:</div>
                  <div className="!mt-2 cursor-pointer flex flex-wrap gap-2">
                    {filterOptions.map(filter => (
                      <Button
                        key={filter.key}
                        variant={selectedFilters.includes(filter.key) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleFilter(filter.key)}
                        className="rounded-full"
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>

                  {selectedFilters.includes('releaseDate') && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="!mt-3 w-full"
                    >
                      <div className="space-y-4 w-full">
                        
                        {/* Date pickers side by side */}
                        <div className="flex gap-4 w-full">
                          <div className="flex-1 space-y-2">
                            <label className="text-sm text-muted-foreground">From</label>
                            <DateTimePicker
                              value={fromDate}
                              onChange={setFromDate}
                              hideTime
                              max={toDate}
                              clearable
                              classNames={{
                                trigger: "w-full bg-background/50 border-primary/10"
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <label className="text-sm text-muted-foreground">To</label>
                            <DateTimePicker
                              value={toDate}
                              onChange={setToDate}
                              hideTime
                              min={fromDate}
                              max={new Date()}
                              clearable
                              classNames={{
                                trigger: "w-full bg-background/50 border-primary/10"
                              }}
                            />
                          </div>
                        </div>

                        {/* Branch Playlist Button */}
                        <Button
                          size="lg"
                          onClick={handleBranchPlaylist}
                          className="w-full"
                          variant="secondary"
                          disabled={!fromDate || !toDate || isCreatingPlaylist}
                        >
                          {isCreatingPlaylist ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Creating Playlist...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <LineChart className="h-4 w-4" />
                              Create Filtered Playlist
                            </span>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
