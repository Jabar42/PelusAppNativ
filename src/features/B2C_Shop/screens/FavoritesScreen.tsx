import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function FavoritesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>FAVORITOS</Text>
        <Text style={styles.subtitle}>Tus Productos Favoritos</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});

