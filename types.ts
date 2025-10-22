export interface NewsStory {
  title: string;
  summary: string;
  context: string;
}

export interface NewsTheme {
  themeTitle: string;
  stories: NewsStory[];
}

export interface NewsData {
  overview: string[];
  themes: NewsTheme[];
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface FetchResult {
  newsData: NewsData | null;
  sources: GroundingChunk[];
}