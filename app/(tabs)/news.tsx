import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { postsFetchAll, queryPosts } from '../../src/api/fetch';
import LoadingSpinner from '../components/LoadingSpinner';
import ArticleCard from '../components/ArticleCard';

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
      }
    };

    fetchPosts();
    setLoading(false);
  }, []);

  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    loading: {
      fontSize: 18,
      alignSelf: 'center',
    },
    item: {
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 10,
    },
    avatar: {
      marginRight: 10,
      width: 100,
      height: 100,
      borderRadius: 10,
    },
    separator: {
      height: 1,
      marginVertical: 10,
    },
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      style={styles.container}
      data={posts}
      renderItem={({ item }) => <ArticleCard post={item.attributes} />}
      ListHeaderComponent={() => (
        <>
          {posts.map(item => (
            <React.Fragment key={item.id}>
              <View style={styles.separator} />
              <ArticleCard post={item.attributes} />
            </React.Fragment>
          ))}
        </>
      )}
    />
  );
};

export default NewsScreen;
