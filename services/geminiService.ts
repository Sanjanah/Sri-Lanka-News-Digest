// FIX: Import GenerateContentResponse to correctly type the API response.
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
// FIX: Import new types to support grounding chunks.
import { NewsData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const parseJsonResponse = (text: string): NewsData | null => {
  const match = text.match(/```json\s*([\s\S]+?)\s*```/);
  if (match && match[1]) {
    try {
      const jsonObj = JSON.parse(match[1]);
      // Validation for the new structure with overview
      if (jsonObj && Array.isArray(jsonObj.themes) && Array.isArray(jsonObj.overview)) {
        return jsonObj as NewsData;
      }
    } catch (error) {
      console.error("Failed to parse JSON from Gemini response:", error);
      return null;
    }
  }
  console.error("No valid JSON block found in Gemini response.");
  return null;
};

// FIX: Update function to return news data and grounding sources.
export const fetchNewsBreakdown = async (): Promise<NewsData | null> => {
  const prompt = `
    Generate a thematic breakdown of all major news stories related to Sri Lanka in the past 24 hours.
    Each theme must contain at least two stories. Generate as many distinct themes as possible, provided there is enough relevant news content to support them.
    All generated text, including titles, summaries, and contexts, must be written in UK English (e.g., use 'summarise' instead of 'summarize', 'colour' instead of 'color', 'normalisation' instead of 'normalization').
    Exclude any sports-related news or updates. The articles can be from both foreign and domestic media outlets.
    When searching for information, you MUST first check and give priority to news articles and related content published on the following websites:
    - https://www.newswire.lk
    - https://www.ft.lk
    - https://www.dailymirror.lk
    - http://www.tamilnet.com/
    - http://www.colombopage.com
    - http://newsfirst.lk/
    - http://groundviews.org/
    - http://island.lk/
    - http://vikalpa.org/
    - http://lankatruth.com/
    - http://srilankawatch.com/
    - http://www.asiantribune.com/
    - http://sundaytimes.lk/
    - http://dailynews.lk/
    - http://news.lk/
    - http://thesundayleader.lk/
    - http://sundayobserver.lk/
    - http://lankaweb.com/
    - http://rivira.lk/
    - http://adaderana.lk/
    - http://digathanews.com/
    - http://onlanka.com/
    - http://sirasa.com/
    - http://www.elankanews.com/
    - http://www.itn.lk/
    - http://www.rupavahini.lk/
    - http://www.slbc.lk/
    - http://www.sriexpress.com/
    - http://tamilguardian.com/
    - http://roar.media/
    - http://www.divaina.com/
    - http://www.lakbima.lk/
    - http://www.lankadeepa.lk/
    - http://onlineuthayan.com/
    - http://www.virakesari.lk/
    - http://www.theacademic.org/
    - http://lankanewspapers.com/
    - http://www.lankapage.com/
    - http://www.srilankanewslive.com/
    - http://www.srilankannews.net/
    - http://maatram.org/

    First, provide a top-level "overview" as a short, bulleted list (3-5 points) summarising the most critical developments.
    
    Then, provide a "themes" section. For each story within a theme, provide a title, a concise one-sentence summary, a direct URL to the source article, and if it's a significant development, a brief context of what it follows up on. To establish this context, actively look for related articles from previous days or weeks (e.g., from archives) to create a clear timeline. The context must be grounded in verifiable prior events; do not speculate or create weak connections.
    Do not repeat stories across different themes. Group related stories under a clear, overarching theme title.
    Crucially, every story within a theme must be directly and strongly relevant to the theme's title. For example, a news story about government visa policies for foreign nationals does not belong under a theme titled "Maritime and Environmental Accountability".

    IMPORTANT: Format your entire response as a single JSON object inside a markdown code block (\`\`\`json ... \`\`\`).
    The JSON object must have two top-level keys:
    1. "overview": an array of strings, where each string is a bullet point for the summary.
    2. "themes": an array of theme objects.
    Each theme object must have "themeTitle" (string) and "stories" (an array of story objects).
    Each story object must have "title" (string), "summary" (string), "url" (string, a direct link to the source news article), and "context" (string, can be an empty string if not applicable).
  `;

  try {
    // FIX: Type the response to easily access grounding metadata.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const newsData = parseJsonResponse(response.text);

    if (newsData) {
      return newsData;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching news from Gemini API:", error);
    throw new Error("Failed to fetch news breakdown.");
  }
};
