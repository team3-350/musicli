import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import SongPage from '../components/SongPage';
import { Song } from '../models/song';
import { getTrackById } from '../api/spotify';

export default function SongDetail() {
  // Pull the song ID from the route parameter
  const { id } = useLocalSearchParams<{ id: string }>();

  // Holds loaded song data
  const [song, setSong] = useState<Song | null>(null);

  // Holds any errors while fetching song data
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // if no ID exit

    const loadSong = async () => {
      try {
        // fetch song data from Spotify API
        const track = await getTrackById(id);
        // map to our song format
        const mapped: Song = {
          id: track.id,
          title: track.name,
          artist: { name: track.artists[0]?.name ?? "Unknown" },
          releaseYear: parseInt(track.album.release_date?.slice(0, 4) ?? "0"),
          runtimeSeconds: Math.floor(track.duration_ms / 1000),
          publisher: track.album.label ?? "Unknown",
          album: { name: track.album.name },
          imageUrl: track.album.images?.[0]?.url,
          platformIds: {
            spotifyId: track.id,
          },
        };

        // save mapped song
        setSong(mapped);


      } catch (e) {
        console.error("Error loading track:", e);
        setError("Failed to load song.");
      }
    };

    loadSong();
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  // While waiting for the song show a loading spinner
  if (!song) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

   // song is loaded, render the song page
  return <SongPage song={song} />;
}

// centers content on screen
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
