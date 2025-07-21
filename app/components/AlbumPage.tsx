// app/components/AlbumPage.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, ScrollView, Image } from 'react-native';
import { Album } from '../models/album';

const formatRuntime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const buildPlatformLink = (platform: keyof Album['platformIds'], id: string): string => {
  switch (platform) {
    case "spotifyId":
      return `https://open.spotify.com/album/${id}`;
    case "appleMusicId":
      return `https://music.apple.com/album/${id}`;
    case "youtubeMusicId":
      return `https://music.youtube.com/playlist?list=${id}`;
    case "soundcloudId":
      return `https://soundcloud.com/${id}`;
    default:
      return '';
  }
};

const AlbumPage: React.FC<{ album: Album }> = ({ album }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {album.imageUrl && (
        <Image
          source={{ uri: album.imageUrl }}
          style={styles.albumArt}
        />
      )}
      <Text style={styles.title}>{album.title}</Text>
      <Text style={styles.detail}>Artist: {album.artist}</Text>
      <Text style={styles.detail}>Release Year: {album.releaseYear}</Text>
      <Text style={styles.detail}>Publisher: {album.publisher}</Text>
      <Text style={styles.detail}>Runtime: {formatRuntime(album.runtimeSeconds)}</Text>

      <Text style={styles.sectionHeader}>Listen on:</Text>
      {Object.entries(album.platformIds).map(([platform, id]) =>
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

      <Text style={styles.sectionHeader}>Songs</Text>
      {album.songs.length === 0 ? (
        <Text style={styles.detail}>No songs found for this album.</Text>
      ) : (
        album.songs.map((song, idx) => (
          <View key={idx} style={styles.songItem}>
            <Text style={styles.songTitle}>{song.title}</Text>
            <Text style={styles.songArtist}>by {song.artist}</Text>
            <Text style={styles.songDuration}>{formatRuntime(song.runtimeSeconds)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default AlbumPage;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  linkButton: {
    backgroundColor: '#1DB954',
    padding: 12,
    marginVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  linkText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  albumArt: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    borderRadius: 16,
    marginBottom: 20,
  },
  songItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  songTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  songArtist: {
    color: '#555',
    fontSize: 14,
  },
  songDuration: {
    color: '#999',
    fontSize: 12,
  },
});
