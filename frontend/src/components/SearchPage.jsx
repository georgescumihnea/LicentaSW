// components/SearchPage.jsx
import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import SubredditSearch from "./SubredditSearch";

function SearchPage() {
  return (
    <div>
      <Hero />
      <SubredditSearch />
    </div>
  );
}

export default SearchPage;
