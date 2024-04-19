// components/GetUserPage.jsx
import React, { useState } from "react";
import axios from "axios";
import SentimentCharts from "./SentimentCharts";
import EntitySentimentChart from "./EntitySentimentChart";
import SentimentChartsBar from "./SentimentChartsBar";

function ChartsPage() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="mx-auto max-w-7xl p-4">
        <div className="card bg-base-200 px-4 py-4 shadow">
          <SentimentCharts />
        </div>
        <div className="card bg-base-200 mt-8 px-4 py-4 shadow">
          <SentimentChartsBar />
        </div>
      </div>
    </>
  );
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export default ChartsPage;
