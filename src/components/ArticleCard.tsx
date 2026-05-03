import React, { useMemo } from 'react';
import { Text, useTheme, Card } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { Config } from '@/src/utils/config';
import { PostQuery } from '@/src/api/types';

const ArticleCard: React.FC<{ post: PostQuery }> = ({ post }) => {
  const hash = post.image?.hash;
  const ext = post.image?.ext;
  const image = `${Config.STRAPI_URL_BASE}/uploads/small_${hash}${ext}`;
  const theme = useTheme();

  const markdownStyle = useMemo(() => ({
    body: {
      backgroundColor: theme.colors.background,
      color: theme.colors.onBackground,
      fontSize: 14,
    },
  }), [theme.colors.background, theme.colors.onBackground]);

  return (
    <Card key={post.slug} accessible={true} accessibilityLabel={`Articolo: ${post.title}`}>
      <Card.Cover source={{ uri: image }} accessibilityLabel={`Immagine per ${post.title}`} />
      <Card.Content>
        <Text variant="headlineSmall">{post.title}</Text>
        <Markdown style={markdownStyle}>
          {post.article}
        </Markdown>
      </Card.Content>
    </Card>
  );
};

export default ArticleCard;
