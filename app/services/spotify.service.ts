import SpotifyWebApi from 'spotify-web-api-js';
import useUserStore from '@/lib/store/useUserStore';

class SpotifyService {
  private static instance: SpotifyService;
  private spotifyApi: SpotifyWebApi.SpotifyWebApiJs;

  private constructor() {
    this.spotifyApi = new SpotifyWebApi();
  }

  public static getInstance(): SpotifyService {
    if (!SpotifyService.instance) {
      SpotifyService.instance = new SpotifyService();
    }
    return SpotifyService.instance;
  }

  private handleError(error: any) {
    if (error.status === 401) {
      useUserStore.getState().setUser(null);
      useUserStore.getState().setAccessToken("");
      localStorage.removeItem('spotify-user-store');
      window.location.href = '/';
    }

    throw error;
  }

  setAccessToken(token: string) {
    this.spotifyApi.setAccessToken(token);
  }

  async getCurrentUser() {
    try {
      return await this.spotifyApi.getMe();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserPlaylists() {
    try {
      let allPlaylists: SpotifyApi.PlaylistObjectSimplified[] = [];
      let offset = 0;
      const limit = 50;
      let total = 0;

      // Make first request to get total count
      const initialResponse = await this.spotifyApi.getUserPlaylists("", { limit, offset });
      total = initialResponse.total;
      allPlaylists = [...initialResponse.items];

      // Calculate how many additional requests we need
      const remainingRequests = Math.ceil((total - limit) / limit);

      // Make additional requests if needed
      for (let i = 0; i < remainingRequests; i++) {
        offset += limit;
        const response = await this.spotifyApi.getUserPlaylists("", { limit, offset });
        allPlaylists = [...allPlaylists, ...response.items];
      }

      return {
        items: allPlaylists,
        total,
        limit,
        offset: 0
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPlaylist(playlistId: string) {
    try {
      return await this.spotifyApi.getPlaylist(playlistId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPlaylistTracks(playlistId: string, offset: number = 0, limit: number = 50) {
    try {
      const response = await this.spotifyApi.getPlaylistTracks(playlistId, {
        offset,
        limit,
        // fields: 'items(track(id,name,duration_ms,artists(name),album(name))),total'
      });
      return response;
    } catch (error: any) {
      if (error.status === 429) {
        error.headers = error.response?.headers;
      }
      throw error;
    }
  }

  async createPlaylist(userId: string, options: { 
    name: string; 
    description?: string; 
    public?: boolean;
  }) {
    try {
      return await this.spotifyApi.createPlaylist(userId, options);
    } catch (error) {
      this.handleError(error);
    }
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
    try {
      return await this.spotifyApi.addTracksToPlaylist(playlistId, trackUris);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deletePlaylist(playlistId: string) {
    try {
      // The Spotify API method is called "unfollowPlaylist" rather than "deletePlaylist"
      return await this.spotifyApi.unfollowPlaylist(playlistId);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export default SpotifyService.getInstance();