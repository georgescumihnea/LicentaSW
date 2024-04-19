import React from "react";

const Hero = () => {
  return (
    <div className="text-black">
      <div className="mx-auto flex max-w-7xl flex-col justify-center text-center">
        <h1 className="text-4xl font-bold capitalize sm:text-6xl md:py-6 md:text-7xl">
          Monitor and Analyze
        </h1>
        <div className="flex items-center justify-center">
          <p className="py-4 text-xl font-bold sm:text-4xl md:text-4xl">
            The evolution of sentiment on Reddit regarding specific topics.
          </p>
        </div>
        <p className="text-lg font-bold text-gray-500 md:text-xl">
          The application will automatically search Reddit for selected topics,
          retrieving relevant posts. It will then use natural language
          processing to parse these posts, extracting key entities and topics.
          The core functionality involves analyzing the sentiment of these posts
          (positive, negative, neutral) and tracking their evolution over time
        </p>
        <p className="text-md mt-4 font-medium text-black md:text-lg">
          Input any subject you like to analyze the sentiment.
        </p>
      </div>
    </div>
  );
};

export default Hero;
