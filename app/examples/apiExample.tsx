import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { apiClient } from '../../utils/apiClient';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export default function ApiExample() {
  const [data, setData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const post = await apiClient.get<Post>('https://jsonplaceholder.typicode.com/posts/1');
      setData(post);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const createPost = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newPost = {
        title: 'New Post',
        body: 'This is a new post',
        userId: 1
      };
      
      const response = await apiClient.post<Post>(
        'https://jsonplaceholder.typicode.com/posts', 
        newPost
      );
      
      setData(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Example</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Fetch Post" onPress={fetchPost} disabled={loading} />
        <Button title="Create Post" onPress={createPost} disabled={loading} />
      </View>
      
      {loading && <ActivityIndicator size="large" style={styles.loader} />}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
      
      {data && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Title: {data.title}</Text>
          <Text>Body: {data.body}</Text>
          {data.id && <Text>Post ID: {data.id}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  errorText: {
    color: '#d32f2f',
  },
  dataContainer: {
    backgroundColor: '#e0f7fa',
    padding: 15,
    borderRadius: 5,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
