import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import moment from "moment";

// ... TailwindCSS imports

const EntitySentimentChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [searchEntity, setSearchEntity] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/chart-data-entity/${searchEntity}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        console.log("Received data:", data);

        setChartData(formatChartData(data));
      } catch (error) {
        console.error("Error fetching data:", error);
        // Add a mechanism to display an error message to the user
      }
    };

    fetchData();
  }, [searchEntity]);

  const formatChartData = (data) => {
    const sentimentMap = {};

    for (const { created_date, entity_sentiments } of data) {
      const parsedSentiments = JSON.parse(entity_sentiments);

      for (const [entity, sentiment] of Object.entries(parsedSentiments)) {
        if (!sentimentMap[entity]) {
          sentimentMap[entity] = [];
        }
        sentimentMap[entity].push({
          timestamp: moment(created_date).format("MMM DD"), // Customize as needed
          sentiment,
        });
      }
    }

    const labels = Object.keys(sentimentMap);
    const datasets = labels.map((entity) => ({
      label: entity,
      data: sentimentMap[entity].map((item) => item.sentiment),
      backgroundColor: `rgba(${getRandomInt(50, 255)}, ${getRandomInt(
        50,
        255,
      )}, ${getRandomInt(50, 255)}, 0.5)`, // Different color per entity
    }));

    return { labels, datasets };
  };

  const handleSearchChange = (event) => {
    setSearchEntity(event.target.value);
  };

  const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min) + min);

  return (
    <div className="container mx-auto flex flex-col items-center pt-8">
      <h2 className="mb-4 text-2xl font-bold">Entity Sentiment Analysis</h2>
      <input
        type="text"
        value={searchEntity}
        onChange={handleSearchChange}
        placeholder="Enter entity to search"
        className="mb-4 w-96 rounded-md border border-gray-300 p-2"
      />
      <div className="w-full max-w-lg">
        {/* Debugging: */}
        <pre>{JSON.stringify(chartData, null, 2)}</pre>

        <Bar
          data={chartData}
          options={{
            responsive: true, // Ensure chart scales with its container
            maintainAspectRatio: false, // Allow flexible resizing

            scales: {
              y: {
                suggestedMin: -1,
                suggestedMax: 1, // Ensure sentiment range is visible
              },
              x: {
                grid: {
                  display: false, // Optionally hide the X-axis gridlines
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default EntitySentimentChart;
