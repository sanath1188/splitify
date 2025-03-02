import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from "@/lib/utils";
import { SpotifyPlaylist } from '@/app/types/spotify';

interface PlaylistBadgesProps {
  playlists: SpotifyPlaylist[];
  selectedPlaylist: SpotifyPlaylist | null;
  onPlaylistClick: (playlistId: string) => void;
}

export function PlaylistBadges({ playlists, selectedPlaylist, onPlaylistClick }: PlaylistBadgesProps) {
  return (
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
                onClick={() => onPlaylistClick(playlist.id)}
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
  );
} 