import React from 'react';
import { assets } from '../../assets/assets';
import SearchBar from './SearchBar';

const Hero = () => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full md:pt-40 pt-28 pb-16 px-7 md:px-0 text-center overflow-hidden">

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-100/50 rounded-full blur-3xl -z-10 opacity-70"></div>
      <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-secondary-500/10 rounded-full blur-3xl -z-10 animate-pulse-soft"></div>

      {/* Badge / Pill */}
      <div className="animate-fade-in-up [animation-delay:100ms] opacity-0 mb-6 px-4 py-1.5 rounded-full border border-primary-100 bg-white shadow-sm text-xs md:text-sm font-medium text-primary-600 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
        Learnify is here
      </div>

      {/* Heading */}
      <h1 className="animate-fade-in-up [animation-delay:200ms] opacity-0 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 max-w-4xl mx-auto leading-tight">
        Empower your future with courses designed to {' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500 relative inline-block">
          fit your choice.
          <img
            src={assets.sketch}
            alt="sketch"
            className="md:block hidden absolute -bottom-6 right-0 w-[90%] opacity-80 animate-float"
          />
        </span>
      </h1>

      {/* Paragraph for Desktop */}
      <p className="animate-fade-in-up [animation-delay:300ms] opacity-0 md:block hidden text-lg text-gray-500 max-w-2xl mx-auto mt-8 font-medium">
        We bring together world-class instructors, interactive content, and a supportive community to help you achieve your personal and professional goals.
      </p>

      {/* Paragraph for Mobile */}
      <p className="animate-fade-in-up [animation-delay:300ms] opacity-0 md:hidden text-gray-500 max-w-sm mx-auto mt-6 text-base">
        We bring together world-class instructors to help you achieve your professional goals.
      </p>

      <div className="mt-10 animate-fade-in-up [animation-delay:400ms] opacity-0 w-full flex justify-center">
        <SearchBar/>
      </div>
    </div>
  );
};

export default Hero;