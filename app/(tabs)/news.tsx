import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { postsFetchAll, queryPosts } from '../../src/api/fetch';
import { PostQuery } from '../../src/api/types';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import ErrorMessage from '@/src/components/ErrorMessage';
import ArticleCard from '@/src/components/ArticleCard';

const NewsScreen: React.FC = () => {
  const [posts, setPosts] = useState<PostQuery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        sort: 'date:desc',
        ...queryPosts,
      };
      const posts = await postsFetchAll(query);
      setPosts(posts);
    } catch (err) {
      console.error(err);
      setError('Impossibile caricare le notizie.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const theme = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    separator: {
      height: 1,
      marginVertical: 10,
    },
  }), [theme.colors.background]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchPosts} />;
  }

  return (
    <FlatList
      style={styles.container}
      data={posts}
      renderItem={({ item }) => <ArticleCard post={item.attributes} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

export default NewsScreen;
