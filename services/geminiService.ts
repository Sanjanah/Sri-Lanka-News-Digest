import { GoogleGenAI } from "@google/genai";
import { NewsData, FetchResult, GroundingChunk } from '../types';

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

export const fetchNewsBreakdown = async (): Promise<FetchResult> => {
  const prompt = `
    Generate a thematic breakdown of all major news stories related to Sri Lanka in the past 24 hours.
    All generated text, including titles, summaries, and contexts, must be written in UK English (e.g., use 'summarise' instead of 'summarize', 'colour' instead of 'color', 'normalisation' instead of 'normalization').
    Exclude any sports-related news or updates. The articles can be from both foreign and domestic media outlets.
    When searching for information, you MUST first check and give priority to news articles and related content published on https://www.newswire.lk, https://www.ft.lk, and https://www.dailymirror.lk.

    First, provide a top-level "overview" as a short, bulleted list (3-5 points) summarising the most critical developments.
    
    Then, provide a "themes" section. For each story within a theme, provide a title, a concise one-sentence summary, and if it's a significant development, a brief context of what it follows up on. To establish this context, actively look for related articles from previous days or weeks (e.g., from archives) to create a clear timeline. The context must be grounded in verifiable prior events; do not speculate or create weak connections.
    Do not repeat stories across different themes. Group related stories under a clear, overarching theme title.

    IMPORTANT: Format your entire response as a single JSON object inside a markdown code block (\`\`\`json ... \`\`\`).
    The JSON object must have two top-level keys:
    1. "overview": an array of strings, where each string is a bullet point for the summary.
    2. "themes": an array of theme objects.
    Each theme object must have "themeTitle" (string) and "stories" (an array of story objects).
    Each story object must have "title" (string), "summary" (string), and "context" (string, can be an empty string if not applicable).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const newsData = parseJsonResponse(response.text);
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: GroundingChunk[] = groundingMetadata?.groundingChunks?.filter(
        (chunk: any): chunk is GroundingChunk => chunk.web && chunk.web.uri && chunk.web.title
    ) || [];

    return { newsData, sources };
  } catch (error) {
    console.error("Error fetching news from Gemini API:", error);
    throw new Error("Failed to fetch news breakdown.");
  }
};