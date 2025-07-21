// app/album/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import AlbumPage from '../../components/AlbumPage';
import { Album } from '../../models/album';
import { getAlbumById } from '../../api/spotifyAlbum'; // adjust path if needed

export default function AlbumDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadAlbum = async () => {
      try {
        const albumData = await getAlbumById(id);
        setAlbum(albumData);
      } catch (e) {
        console.error("Error loading album:", e);
        setError("Failed to load album.");
      }
    };

    loadAlbum();
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!album) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AlbumPage album={album} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
