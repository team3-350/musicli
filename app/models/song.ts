export type Song = {
  id: string;
  title: string;
  imageUrl?: string;
  artist: {
    name: string;
    id?: string;
  };
  releaseYear: number;
  runtimeSeconds: number;
  publisher: string;
  album?: {
    name: string;
    id?: string;
  };
  platformIds: {
    spotifyId?: string;
    appleMusicId?: string;
    youtubeMusicId?: string;
    soundcloudId?: string;
  };
};