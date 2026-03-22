import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { postsFetchAll, queryPosts } from '../../src/api/fetch';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import ArticleCard from '@/src/components/ArticleCard';

const NewsScreen: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = {
          sort: 'date:desc',
          ...queryPosts,
        };
        const posts = await postsFetchAll(query);

        setPosts(posts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
