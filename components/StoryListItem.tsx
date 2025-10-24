
import React, { useState } from 'react';
import { NewsStory } from '../types';

interface StoryListItemProps {
  story: NewsStory;
  isSaved: boolean;
  onSaveToggle: (story: NewsStory) => void;
}

// Helper to get a display-friendly source from a URL
const getSourceFromUrl = (url: string): string => {
  if (!url) return '';
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch (e) {
    console.warn(`Could not parse URL for source: ${url}`);
    // Fallback for invalid URLs, try to extract domain with a simple regex
    const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
    const domain = matches && matches[1];
    return domain ? domain.replace(/^www\./, '') : '';
  }
};


const StoryListItem: React.FC<StoryListItemProps> = ({ story, isSaved, onSaveToggle }) => {
  const [shareFeedback, setShareFeedback] = useState<string>('');

  const handleShare = async () => {
    const shareData: { title: string; text: string; url?: string } = {
      title: story.title,
      text: story.summary,
      url: story.url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Error sharing:', error);
        }
      }
    } else {
      try {
        let clipboardText = `${story.title}\n\n${story.summary}\n\nSource: ${story.url}`;
        await navigator.clipboard.writeText(clipboardText);
        setShareFeedback('Copied!');
        setTimeout(() => setShareFeedback(''), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
        setShareFeedback('Failed to copy');
        setTimeout(() => setShareFeedback(''), 2000);
      }
    }
  };
  
  const buttonClass = "p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors duration-200";

  return (
    <article>
      <div className="flex justify-between items-start space-x-4">
        <div className="flex-grow">
          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{story.title}</h4>
          <p className="text-slate-600 dark:text-slate-300 mt-1 text-base">
            {story.summary}
          </p>
          {story.context && (
            <div className="mt-2 text-base text-slate-600 dark:text-slate-400">
              <p>
                <span className="font-semibold">Context:</span>{' '}
                {story.context}
              </p>
            </div>
          )}
          {story.url && (
            <div className="mt-3">
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                Source: {getSourceFromUrl(story.url)}
              </p>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 relative flex items-center space-x-1">
           {shareFeedback && (
            <span 
              className="absolute -top-8 right-0 text-xs bg-slate-600 text-white px-2 py-1 rounded-md transition-opacity duration-300 w-max"
              role="status"
            >
              {shareFeedback}
            </span>
          )}
          <button
            onClick={() => onSaveToggle(story)}
            title={isSaved ? "Unsave story" : "Save for later"}
            className={buttonClass}
            aria-label={isSaved ? "Unsave story" : "Save for later"}
          >
            {isSaved ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleShare}
            title="Share story"
            className={buttonClass}
            aria-label="Share story"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

export default StoryListItem;
