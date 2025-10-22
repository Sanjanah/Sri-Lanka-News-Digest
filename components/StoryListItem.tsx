import React, { useState } from 'react';
import { NewsStory } from '../types';

interface StoryListItemProps {
  story: NewsStory;
}

const StoryListItem: React.FC<StoryListItemProps> = ({ story }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string>('');

  const hasLongContext = story.context && story.context.length > 200;

  const handleShare = async () => {
    const shareData: { title: string; text: string; url?: string } = {
      title: story.title,
      text: story.summary,
    };

    let sourceUrl = '';
    try {
      const url = new URL(window.location.href);
      if (['http:', 'https:'].includes(url.protocol)) {
        sourceUrl = window.location.href;
        shareData.url = sourceUrl;
      }
    } catch (_) {
      // Proceed without a URL if window.location.href is invalid.
    }

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
        let clipboardText = `${story.title}\n\n${story.summary}`;
        if (sourceUrl) {
          clipboardText += `\n\nSource: ${sourceUrl}`;
        }
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

  return (
    <li className="p-4 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start space-x-4">
        <div className="flex-grow">
          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{story.title}</h4>
          <p className="text-slate-600 dark:text-slate-300 mt-1 text-base">{story.summary}</p>
          {story.context && (
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md border-l-4 border-emerald-500">
              <p>
                <span className="font-semibold">Context:</span>{' '}
                {hasLongContext && !isExpanded ? `${story.context.substring(0, 200)}...` : story.context}
              </p>
              {hasLongContext && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sky-600 dark:text-sky-400 hover:underline mt-2 font-semibold text-sm"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 relative">
          {shareFeedback && (
            <span 
              className="absolute -top-6 right-0 text-xs bg-slate-600 text-white px-2 py-1 rounded-md transition-opacity duration-300"
              role="status"
            >
              {shareFeedback}
            </span>
          )}
          <button
            onClick={handleShare}
            title="Share story"
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors duration-200"
            aria-label="Share story"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
};

export default StoryListItem;
