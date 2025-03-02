export interface SpotifyTrack {
  track: {
    id: string;
    name: string;
    duration_ms: number;
    artists: Array<{ name: string }>;
    album: { name: string };
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  public: boolean;
  tracks: {
    total: number;
    items: SpotifyTrack[];
  };
  owner: {
    id: string;
  };
} 