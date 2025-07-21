import { Song } from './song';

export type Album = {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
  runtimeSeconds: number;
  publisher: string;
  imageUrl?: string;
  platformIds: {
    spotifyId?: string;
    youtubeMusicId?: string;
    soundcloudId?: string;
  };
  siteLinks: {
    spotify?: string;
    youtubeMusic?: string;
    soundcloud?: string;
  };
  songs: Song[];
};
