import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingScreenProps {
  message?: string;
  light?: boolean;
}

export function LoadingScreen({ message, light = false }: LoadingScreenProps) {
  return (
    <View style={[styles.container, light && styles.containerLight]}>
      <ActivityIndicator size="large" color={light ? '#0f172a' : '#fff'} />
      {message ? (
        <Text style={[styles.message, light && styles.messageLight]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
    gap: 12,
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  message: {
    color: '#9ca3af',
  },
  messageLight: {
    color: '#475569',
  },
});
