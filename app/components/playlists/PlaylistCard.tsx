import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { SpotifyPlaylist } from '@/app/types/spotify';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
  onViewTracks: () => void;
}

export function PlaylistCard({ playlist, onViewTracks }: PlaylistCardProps) {
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
          <div className="flex items-center gap-2 !mt-4">
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
          </div>
        </div>
      </CardHeader>
    </Card>
  );
} 