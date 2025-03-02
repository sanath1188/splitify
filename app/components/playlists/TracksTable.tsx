import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SpotifyTrack } from '@/app/types/spotify';

interface TracksTableProps {
  tracks: SpotifyTrack[];
  currentOffset: number;
  limit: number;
  total: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function TracksTable({ 
  tracks, 
  currentOffset, 
  limit, 
  total, 
  onPrevPage, 
  onNextPage 
}: TracksTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracks</CardTitle>
        <CardDescription>
          Showing {currentOffset + 1}-{Math.min(currentOffset + limit, total)} of {total} tracks
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
            {tracks.map((track) => (
              <TableRow key={track.track.id}>
                <TableCell>{track.track.name}</TableCell>
                <TableCell>{track.track.artists.map(a => a.name).join(', ')}</TableCell>
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
          onClick={onPrevPage}
          disabled={currentOffset === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentOffset + limit >= total}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 