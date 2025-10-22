import React, { useState, useEffect, useCallback } from 'react';
import { fetchNewsBreakdown } from './services/geminiService';
import { NewsTheme, GroundingChunk } from './types';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import StoryListItem from './components/StoryListItem';
import SourceList from './components/SourceList';
import ThemeToggle from './components/ThemeToggle';

const App: React.FC = () => {
  const [overview, setOverview] = useState<string[]>([]);
  const [themes, setThemes] = useState<NewsTheme[]>([]);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const loadNews = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const { newsData, sources: fetchedSources } = await fetchNewsBreakdown();
      if (newsData && newsData.themes.length > 0) {
        setOverview(newsData.overview);
        setThemes(newsData.themes);
        setSources(fetchedSources);
      } else {
        setError("Could not retrieve a valid news breakdown. The AI might be busy or the response format was incorrect.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <main className="max-w-4xl mx-auto">
        <header className="relative text-center mb-8 md:mb-12">
           <div className="absolute top-0 right-0">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-600">
            Sri Lanka: Past 24hrs
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            A 24-hour thematic news summary powered by Gemini
          </p>
          <div className="mt-6">
            <button
              onClick={loadNews}
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              aria-live="polite"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m11 11v-5h-5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh News'}
            </button>
          </div>
        </header>

        {loading && <Loader />}
        {error && <ErrorDisplay message={error} />}
        
        {!loading && !error && (
          <div className="space-y-8">
            {overview.length > 0 && (
              <section className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                 <h2 className="text-2xl sm:text-3xl font-semibold text-sky-600 dark:text-sky-300 pb-2 mb-4">
                    Overview
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                    {overview.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
              </section>
            )}

            {themes.map((theme, index) => (
              <section key={index} aria-labelledby={`theme-title-${index}`} className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <h2 id={`theme-title-${index}`} className="text-2xl sm:text-3xl font-semibold text-sky-600 dark:text-sky-300 pb-2 mb-4">
                  {theme.themeTitle}
                </h2>
                <ul className="space-y-4">
                  {theme.stories.map((story, storyIndex) => (
                    <StoryListItem key={storyIndex} story={story} />
                  ))}
                </ul>
              </section>
            ))}
            
            <SourceList sources={sources} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;