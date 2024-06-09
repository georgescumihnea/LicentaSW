// components/SearchPage.jsx
import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import SubredditSearch from "./SubredditSearch";
import SentimentCharts from "./SentimentCharts";
import SentimentChartsBar from "./SentimentChartsBar";

function SearchPage() {
  return (
    <div>
      <Hero />
      <SubredditSearch />
      <div className="-z-10 mx-auto max-w-7xl p-4">
        <div className="card bg-base-200 px-4 py-4 shadow">
          <SentimentCharts />
        </div>
        <div className="card mt-16 bg-base-200 px-4 py-4 shadow">
          <SentimentChartsBar />
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
