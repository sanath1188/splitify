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
      // Clear the store
      useUserStore.getState().setUser(null);
      useUserStore.getState().setAccessToken(null);
      // Clear localStorage
      localStorage.removeItem('spotify-user-store');
      // Redirect to home page
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
      return await this.spotifyApi.getUserPlaylists();
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
}

export default SpotifyService.getInstance();