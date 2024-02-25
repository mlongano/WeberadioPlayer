import React from 'react';
import {StyleSheet} from 'react-native';
import {Text, useTheme, Card} from 'react-native-paper';
import Markdown from 'react-native-marked';
import {Config} from '../utils/config';

const ArticleCard: React.FC<ArticleCardProps> = ({post}) => {
  const hash = post.image?.data?.attributes?.hash;
  const ext = post.image?.data?.attributes?.ext;
  const image = `${Config.STRAPI_URL_BASE}/uploads/small_${hash}${ext}`;
  const date = new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(new Date(post.date));

  const isValid = !/<(.|\n)*?>/gm.test(post.article);

  const theme = useTheme(); // Assuming you use useTheme() in your main component

  return (
    <Card key={post.slug}>
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

// Define the props for your ArticleCard component
interface ArticleCardProps {
  post: {
    title: string;
    article: string;
    slug: string;
    subtitle: string;
    date: string;
    image: {
      data: {
        attributes: {
          hash: string;
          ext: string;
        };
      };
    };
  };
}

export default ArticleCard;
