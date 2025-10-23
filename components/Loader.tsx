
import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="space-y-12 animate-pulse" role="status" aria-label="Loading news content">
            {/* Skeleton for Overview */}
            <section className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="h-8 w-1/3 bg-slate-300 dark:bg-slate-600 rounded mb-6"></div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <div className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></div>
                            <div className="h-5 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Skeleton for Themes */}
            {[...Array(2)].map((_, index) => (
                <section key={index}>
                    <div className={`h-10 w-2/5 bg-slate-300 dark:bg-slate-600 rounded-md mb-6`}></div>
                    <div className="space-y-8">
                        {/* Skeleton Story Item */}
                        {[...Array(2)].map((_, storyIndex) => (
                            <div key={storyIndex} className="flex justify-between items-start space-x-4">
                                <div className="space-y-3 flex-grow">
                                    <div className="h-6 w-3/4 bg-slate-300 dark:bg-slate-600 rounded"></div>
                                    <div className="h-5 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
                                    <div className="h-5 w-1/2 bg-slate-300 dark:bg-slate-600 rounded"></div>
                                </div>
                                <div className="flex-shrink-0 flex items-center space-x-1">
                                    <div className="h-9 w-9 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                    <div className="h-9 w-9 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default Loader;
