export type Episode = {
  title: string;
  description: string;
  imageUrl: string;
  audioUrl: string;
};

export type EpisodeCardProps = Episode & {
  cardTitle?: string;
  cardSubtitle?: string;
};
