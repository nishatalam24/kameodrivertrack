import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Debug Screen Component
 * For testing and debugging Firebase functionality
 */
const DebugScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Mode</Text>
      <Text style={styles.description}>
        This screen is for testing Firebase functionality and debugging notifications
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
});

export default DebugScreen;
