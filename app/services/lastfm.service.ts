import axios from 'axios';

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';

interface TrackInfo {
  name: string;
  url: string;
  duration: string;
  listeners: string;
  playcount: string;
  artist: {
    name: string;
    url: string;
  };
  album: {
    artist: string;
    title: string;
    url: string;
    image: Array<{ '#text': string; size: string }>;
  };
  toptags: {
    tag: Array<{ name: string; url: string }>;
  };
}

export async function getTrackInfo(artist: string, track: string): Promise<TrackInfo | null> {
  try {
    const response = await axios.get(LASTFM_API_URL, {
      params: {
        method: 'track.getInfo',
        api_key: process.env.NEXT_PUBLIC_LASTFM_KEY,
        artist: artist,
        track: track,
        format: 'json',
      },
    });

    if (response.data && response.data.track) {
      return response.data.track as TrackInfo;
    }

    return null;
  } catch (error) {
    console.error('Error fetching track info:', error);
    return null;
  }
}