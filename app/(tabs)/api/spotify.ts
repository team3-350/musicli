// app/api/spotify.ts

// Spotify API Credentials
const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET!;

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// Gets a temporary access token from the Spotify API
export const getSpotifyAccessToken = async (): Promise<string | null> => {
  const now = Date.now();

  if (cachedToken && tokenExpiry && now < tokenExpiry) {
      return cachedToken;
    }

  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();

  // Calculates token expiration and caches to be used later
  tokenExpiry = now + data.expires_in * 1000;
  cachedToken = data.access_token;

  return cachedToken;
};

export const getTrackById = async (id: string): Promise<any> => {
  // Gets a new access token
  const token = await getSpotifyAccessToken();

  // Just an error message if no token is available
  if (!token) {
    console.error("No Spotify access token available.");
    return;
  }

  // Uses token to make a GET request to Spotify's Track endpoint
  const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Returns Track data
  return await res.json();
};

// Fetches a full album by ID from Spotify API
export const getAlbumById = async (id: string): Promise<any> => {
  const token = await getSpotifyAccessToken();
  if (!token) {
    console.error("No Spotify access token available.");
    return;
  }

  const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return data;
};

/**
 * Recursively processes each song in an album object.
 * Useful for cleanup, conversion, or export purposes.
 */
export const clearSongs = (album: { songs: any[] }) => {
  if (!album || !album.songs || album.songs.length === 0) {
    return;
  }

  // Process current song (e.g., log, remove, convert)
  const removed = album.songs.pop();
  console.log("Removed:", removed?.title ?? "[unknown title]");

  // Recursive call on remaining songs
  clearSongs(album);
};
