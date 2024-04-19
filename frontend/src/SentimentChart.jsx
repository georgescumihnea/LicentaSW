import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

function SentimentChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/reddit_sentiment")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const titles = data.map((post) => post.title);
          const positiveScores = data.map((post) => post.positive);
          const negativeScores = data.map((post) => post.negative);
          const neutralScores = data.map((post) => post.neutral);
          const compoundScores = data.map((post) => post.compound);
          const postScores = data.map((post) => post.content_sentiment2);

          setChartData({
            labels: titles,
            datasets: [
              {
                label: "Positive Title Scores",
                data: positiveScores,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
              },
              {
                label: "Negative Title Scores",
                data: negativeScores,
                backgroundColor: "rgba(255, 99, 132, 0.6)",
              },
              {
                label: "Neutral Title Scores",
                data: neutralScores,
                backgroundColor: "rgba(153, 102, 255, 0.6)",
              },
              {
                label: "Compound Title Scores",
                data: compoundScores,
                backgroundColor: "rgba(33, 112, 255, 0.6)",
              },
              {
                label: "Post Scores",
                data: postScores,
                backgroundColor: "red",
              },
            ],
          });
        }
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  if (!chartData) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Bar
        data={chartData}
        options={{
          scales: {
            y: { beginAtZero: true },
          },
          responsive: true,
          title: {
            display: true,
            text: "Sentiment Analysis of Reddit Posts (r/dogs)",
          },
        }}
      />
    </div>
  );
}

export default SentimentChart;
