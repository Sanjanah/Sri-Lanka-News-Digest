import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-16">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-500"></div>
      <p className="text-slate-600 dark:text-slate-300 text-lg">Analysing the latest news...</p>
    </div>
  );
};

export default Loader;