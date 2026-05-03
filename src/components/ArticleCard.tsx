import React from 'react';
import { Text, useTheme, Card } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { Config } from '@/src/utils/config';

const ArticleCard: React.FC<ArticleCardProps> = ({ post }) => {
  const hash = post.image?.hash;
  const ext = post.image?.ext;
  const image = `${Config.STRAPI_URL_BASE}/uploads/small_${hash}${ext}`;
  const date = new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(new Date(post.date));

  const theme = useTheme();

  return (
    <Card key={post.slug} accessible={true} accessibilityLabel={`Articolo: ${post.title}`}>
      <Card.Cover source={{ uri: image }} accessibilityLabel={`Immagine per ${post.title}`} />
      <Card.Content>
        <Text variant="headlineSmall">{post.title}</Text>
        <Markdown
          style={{
            body: {
              backgroundColor: theme.colors.background,
              color: theme.colors.onBackground,
              fontSize: 14,
            },
          }}>
          {post.article}
        </Markdown>
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
