export interface NewsStory {
  title: string;
  summary: string;
  context: string;
  url: string;
}

export interface NewsTheme {
  themeTitle: string;
  stories: NewsStory[];
}

export interface NewsData {
  overview: string[];
  themes: NewsTheme[];
}
