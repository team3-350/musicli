import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, ScrollView } from 'react-native';
import { Song } from '../models/song'; // Song type definition
import { Image } from 'react-native'; // For album art

// function to build URLs for each music platform based on the ID type
const buildPlatformLink = (platform: keyof Song['platformIds'], id: string): string => {
  switch (platform) {
    case "spotifyId":
      return `https://open.spotify.com/track/${id}`;
    case "appleMusicId":
      return `https://music.apple.com/us/album/${id}`;
    case "youtubeMusicId":
      return `https://music.youtube.com/watch?v=${id}`;
    case "soundcloudId":
      return `https://soundcloud.com/${id}`;
    default:
      return '';
  }
};

// Main component that displays the song detail page
const SongPage: React.FC<{ song: Song }> = ({ song }) => {
  const formatRuntime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
        {song.imageUrl && (
          <Image
            source={{ uri: song.imageUrl }}
            style={{ width: 300, height: 300, borderRadius: 12, alignSelf: 'center', marginBottom: 16 }}
          />
        )}
      <Text style={styles.title}>{song.title}</Text>
      <Text style={styles.detail}>Artist: {song.artist.name}</Text>
      <Text style={styles.detail}>Album: {song.album?.name || 'Unknown'}</Text>
      <Text style={styles.detail}>Released: {song.releaseYear}</Text>
      <Text style={styles.detail}>Runtime: {formatRuntime(song.runtimeSeconds)}</Text>
      <Text style={styles.detail}>Publisher: {song.publisher}</Text>

      <Text style={styles.sectionHeader}>Listen on:</Text>
      {Object.entries(song.platformIds).map(([platform, id]) =>
        id ? (
          <Pressable
            key={platform}
            style={styles.linkButton}
            onPress={() => Linking.openURL(buildPlatformLink(platform as any, id))}
          >
            <Text style={styles.linkText}>{platform.replace("Id", "")}</Text>
          </Pressable>
        ) : null
      )}
    </ScrollView>
  );
};

export default SongPage;

// Style page (very likely will change)
const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 12,
  },
  detail: {
    fontSize: 16,
    color: '#444',
    marginVertical: 3,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  linkButton: {
    marginVertical: 6,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#1DB954',
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  albumArt: {
    width: 250,
    height: 250,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
