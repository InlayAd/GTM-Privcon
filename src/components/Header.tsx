import React from 'react';

export const Header = () => {
  return (
    <header className="mb-12 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
        <span className="block xl:inline">AEO</span>{' '}
        <span className="block text-indigo-600 xl:inline">Outreach Generator</span>
      </h1>
      <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
        Empower your GTM strategy with AI-driven visibility insights and high-conversion outreach for Indian mid-market brands.
      </p>
    </header>
  );
};
