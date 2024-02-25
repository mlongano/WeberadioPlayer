import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, useTheme, Card} from 'react-native-paper';
import {postsFetchAll, queryPosts} from '../api/fetch';
import Config from 'react-native-config';
import Markdown from 'react-native-marked';
import LoadingSpinner from '../components/LoadingSpinner';

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

  const renderItem = ({item}: {item: any}) => {
    const post = item.attributes;
    const hash = post?.image?.data?.attributes?.hash;
    const ext = post?.image?.data?.attributes?.ext;
    const image = `${Config.STRAPI_URL_BASE}/uploads/small_${hash}${ext}`;
    const date = new Intl.DateTimeFormat('it-IT', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(new Date(post.date));

    const isValid = !/<(.|\n)*?>/gm.test(post.article);
    //console.log("isValid:", isValid);
    return (
      <Card key={item.id}>
        <Card.Cover source={{uri: image}} />
        <Card.Content>
          <Text variant="headlineSmall">{post.title}</Text>
          {isValid ? (
            <Markdown
              value={post.article}
              flatListProps={{
                initialNumToRender: 8,
                contentContainerStyle: {
                  padding: 10,
                  marginRight: 0,
                  backgroundColor: theme.colors.background,
                },
              }}
            />
          ) : (
            <Text>{post.article}</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      {posts.map(item => (
        <React.Fragment key={item.id}>
          <View style={styles.separator} />
          {renderItem({item})}
        </React.Fragment>
      ))}
    </ScrollView>
  );
};

export default NewsScreen;
