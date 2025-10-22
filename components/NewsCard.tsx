import React, { useState } from 'react';
import { NewsStory } from '../types';

interface NewsCardProps {
  story: NewsStory;
}

const NewsCard: React.FC<NewsCardProps> = ({ story }) => {
  const [shareFeedback, setShareFeedback] = useState<string>('');

  const handleShare = async () => {
    const shareData: { title: string; text: string; url?: string } = {
      title: story.title,
      text: story.summary,
    };

    let sourceUrl = '';
    try {
      // Validate that the URL is a shareable HTTP/S link.
      const url = new URL(window.location.href);
      if (['http:', 'https:'].includes(url.protocol)) {
        sourceUrl = window.location.href;
        shareData.url = sourceUrl;
      }
    } catch (_) {
      // If window.location.href is not a valid URL (e.g., in a sandbox),
      // proceed without a URL.
    }


    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // A DOMException with the name "AbortError" is thrown if the user cancels the share dialog.
        // We will silently ignore this error. For all other errors, we'll log them.
        if (error instanceof DOMException && error.name === 'AbortError') {
          // User cancelled the share. Ignore.
        } else {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      try {
        let clipboardText = `${story.title}\n\n${story.summary}`;
        if (sourceUrl) {
          clipboardText += `\n\nSource: ${sourceUrl}`;
        }
        await navigator.clipboard.writeText(clipboardText);
        setShareFeedback('Copied to clipboard!');
        setTimeout(() => setShareFeedback(''), 2000); // Reset feedback after 2 seconds
      } catch (err) {
        console.error('Failed to copy: ', err);
        setShareFeedback('Failed to copy');
         setTimeout(() => setShareFeedback(''), 2000);
      }
    }
  };

  return (
    <article className="bg-white dark:bg-slate-800/50 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-cyan-500/10 border border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="p-5 flex-grow">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{story.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-3">{story.summary}</p>
        {story.context && (
          <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md border-l-4 border-emerald-500">
            <span className="font-semibold">Context:</span> {story.context}
          </p>
        )}
      </div>
       <div className="p-5 pt-2 flex justify-end items-center">
        {shareFeedback && <span className="text-sm text-slate-500 dark:text-slate-400 mr-4 transition-opacity duration-300">{shareFeedback}</span>}
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
    </article>
  );
};

export default NewsCard;