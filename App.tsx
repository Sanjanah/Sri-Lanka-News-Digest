
import React, { useState, useEffect, useCallback } from 'react';
import { fetchNewsBreakdown } from './services/geminiService';
import { NewsTheme, NewsStory } from './types';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import StoryListItem from './components/StoryListItem';
import ThemeToggle from './components/ThemeToggle';

const App: React.FC = () => {
  const [overview, setOverview] = useState<string[]>([]);
  const [themes, setThemes] = useState<NewsTheme[]>([]);
  const [savedStories, setSavedStories] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'main' | 'saved'>('main');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
      }
    }
    return 'light';
  });

  const themeColorClasses = [
    'bg-teal-600',
    'bg-indigo-600',
    'bg-fuchsia-600',
    'bg-sky-600',
  ];

  // Load saved stories from localStorage on initial render
  useEffect(() => {
    try {
      const storedStories = localStorage.getItem('savedNewsStories');
      if (storedStories) {
        setSavedStories(JSON.parse(storedStories));
      }
    } catch (e) {
      console.error("Failed to parse saved stories from localStorage", e);
      setSavedStories([]);
    }
  }, []);

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

  const handleSaveToggle = (storyToToggle: NewsStory) => {
    let updatedSavedStories: NewsStory[];
    const isAlreadySaved = savedStories.some(s => s.url === storyToToggle.url);

    if (isAlreadySaved) {
      updatedSavedStories = savedStories.filter(s => s.url !== storyToToggle.url);
    } else {
      updatedSavedStories = [...savedStories, storyToToggle];
    }
    setSavedStories(updatedSavedStories);
    localStorage.setItem('savedNewsStories', JSON.stringify(updatedSavedStories));
  };

  // Helper function to manage prefetch links
  const updatePrefetchLinks = (stories: NewsStory[]) => {
    // Remove old prefetch links added by this app
    document.querySelectorAll('link[data-news-prefetch]').forEach(link => link.remove());

    // Add new prefetch links for unique URLs
    const urls = stories.map(s => s.url).filter(Boolean);
    const uniqueUrls = [...new Set(urls)];

    uniqueUrls.forEach(url => {
      try {
        // Basic validation to ensure it's a valid URL before prefetching
        new URL(url);
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.setAttribute('data-news-prefetch', 'true');
        document.head.appendChild(link);
      } catch (e) {
        // Ignore invalid URLs
        console.warn(`Skipping prefetch for invalid URL: ${url}`);
      }
    });
  };


  const loadNews = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setOverview([]);
      setThemes([]);

      const fetchedData = await fetchNewsBreakdown();
      
      if (fetchedData) {
        setLoading(false);
        setOverview(fetchedData.overview);

        // Prefetch articles for faster navigation
        const allStories = fetchedData.themes.flatMap(theme => theme.stories);
        updatePrefetchLinks(allStories);

        if (fetchedData.themes.length === 0) {
            setError("No major non-sports news stories were found for Sri Lanka in the last 24 hours.");
        } else {
          for (const theme of fetchedData.themes) {
            await new Promise(resolve => setTimeout(resolve, 250));
            setThemes(prevThemes => [...prevThemes, theme]);
          }
        }
        
      } else {
        setLoading(false);
        setError("Could not retrieve a valid news breakdown. The AI might be busy or the response was not in the correct format.");
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  }, []);


  useEffect(() => {
    if (view === 'main') {
        loadNews();
    }
  }, [view, loadNews]);

  const secondaryButtonClass = "inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <main className="max-w-4xl mx-auto">
        <header className="mb-8 md:mb-12">
          <div className="flex items-center">
            <div className="flex-1">
              {/* Intentionally left blank for spacing */}
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-600">
                Sri Lanka: News Digest
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg text-center">
            A 24-hour thematic news summary powered by Gemini
          </p>
          <div className="mt-6 flex justify-center items-center space-x-4">
            <button
              onClick={loadNews}
              disabled={loading || view === 'saved'}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              aria-live="polite"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 mr-2 ${loading && view === 'main' ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m11 11v-5h-5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {loading && view === 'main' ? 'Refreshing...' : 'Refresh News'}
            </button>
            <button
              onClick={() => setView(v => v === 'main' ? 'saved' : 'main')}
              className={secondaryButtonClass}
            >
                {view === 'main' ? 'Saved Stories' : 'Back to News'}
            </button>
          </div>
        </header>

        {view === 'main' && (
          <>
            {loading && <Loader />}
            {!loading && error && <ErrorDisplay message={error} />}
            
            {!loading && !error && (
              <div className="space-y-12">
                {overview.length > 0 && (
                   <section className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h2 className="text-2xl sm:text-3xl font-semibold text-sky-600 dark:text-sky-300 pb-2 mb-4 border-b border-slate-300 dark:border-slate-600">
                         Overview
                       </h2>
                       <div className="space-y-4">
                         {overview.map((item, index) => (
                           <div key={index} className="flex items-start space-x-3">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500 dark:text-emerald-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             <p className="text-slate-700 dark:text-slate-300 flex-1">{item}</p>
                           </div>
                         ))}
                       </div>
                   </section>
                )}

                {themes.map((theme, index) => (
                  <section key={index} aria-labelledby={`theme-title-${index}`}>
                    <h2 
                      id={`theme-title-${index}`} 
                      className={`inline-block text-2xl sm:text-3xl font-semibold text-white px-4 py-2 rounded-md mb-6 ${themeColorClasses[index % themeColorClasses.length]}`}
                    >
                      {theme.themeTitle}
                    </h2>
                    <div className="space-y-8">
                      {theme.stories.map((story, storyIndex) => (
                        <StoryListItem
                          key={storyIndex}
                          story={story}
                          isSaved={savedStories.some(s => s.url === story.url)}
                          onSaveToggle={handleSaveToggle}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'saved' && (
            <section aria-labelledby="saved-stories-title">
                <h2 
                    id="saved-stories-title"
                    className="text-3xl sm:text-4xl font-semibold text-sky-600 dark:text-sky-300 pb-2 mb-6 text-center"
                >
                    Saved Stories
                </h2>
                {savedStories.length > 0 ? (
                    <div className="space-y-8">
                        {savedStories.map((story, storyIndex) => (
                            <StoryListItem
                                key={storyIndex}
                                story={story}
                                isSaved={true}
                                onSaveToggle={handleSaveToggle}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-600 dark:text-slate-400 text-lg">You haven't saved any stories yet.</p>
                )}
            </section>
        )}

      </main>
    </div>
  );
};

export default App;
