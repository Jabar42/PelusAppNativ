import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function FavScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FAV</Text>
      <Text style={styles.subtitle}>Favoritos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
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

