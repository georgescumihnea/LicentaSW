import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";
import { toCanvas } from "html-to-image"; // Corrected import
import { useAuth } from "./AuthContext";
import Subtitle from "./Subtitle";

const SentimentCharts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [chartData, setChartData] = useState({
    csvData: [["Date", "Sentiment", "Title"]],
    chartOptions: {
      title: { text: "Sentiment Analysis" },
    },
  });
  // Define state for date and sentiment range filters
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(1, "year").format("YYYY-MM-DD"), // Default to last year
    endDate: moment().format("YYYY-MM-DD"), // Default to today
  });
  const [sentimentRange, setSentimentRange] = useState({ min: -1, max: 1 });

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        minSentiment: sentimentRange.min,
        maxSentiment: sentimentRange.max,
      }).toString();

      try {
        const response = await fetch(
          `http://localhost:5000/chart-data/${searchTerm}?${queryParams}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        const csvData = [["Date", "Sentiment", "Title"]]; // Initial headers
        const chartSeriesData = []; // Array for Highcharts data

        data.forEach((entry) => {
          // Format the date and include it in CSV data
          const formattedDate = moment(entry.created_date).format(
            "YYYY-MM-DD HH:mm:ss",
          );
          csvData.push([formattedDate, entry.sentiment_compound, entry.title]);

          // Format the data for the chart
          chartSeriesData.push({
            x: moment(entry.created_date).valueOf(),
            y: entry.sentiment_compound,
            name: entry.title,
          });
        });

        setChartData({
          csvData: csvData,
          chartOptions: {
            title: { text: `Sentiment Analysis - Search Term: ${searchTerm}` },
            xAxis: {
              type: "datetime",
              dateTimeLabelFormats: {
                day: "%e. %b",
                week: "%e. %b",
                month: "%b '%y",
                year: "%Y",
              },
              labels: {
                format: "{value:%e. %b %Y}", // Example: 1. Jan 2024
              },
            },
            yAxis: { title: { text: "Sentiment Value" } },
            series: [
              { name: "Sentiment", data: chartSeriesData, color: "blue" },
            ],
          },
        });
      } catch (err) {
        console.error(err.message);
      }
    };

    if (searchTerm) {
      fetchData();
    }
  }, [searchTerm, dateRange, sentimentRange]);

  const exportToPDF = async () => {
    const doc = new jsPDF("p", "px");
    const chartContainer = document.querySelector(".highcharts-figure");
    const currentDate = moment().format("YYYY-MM-DD");
    if (chartContainer) {
      const canvas = await toCanvas(chartContainer); // Correct usage of imported function
      const imgData = canvas.toDataURL("image/png");
      doc.text(`Username: ${user ? user.username : "Anonymous"}`, 10, 330);
      doc.text(`Date: ${currentDate}`, 10, 300);
      doc.text(`Search Term: ${searchTerm}`, 10, 350);
      doc.addImage(imgData, "PNG", 0, 0, 450, 220); // Adjust positioning/sizing as needed
      doc.save(
        `sentiment-analysis-${user ? user.username : "Anonymous"}-Date: ${currentDate}-Search Term: ${searchTerm}.pdf`,
      );
    }
  };

  return (
    <div>
      <Subtitle styleClass="text-center">
        Sentiment Analysis for keywords included in Topics
      </Subtitle>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search term..."
        className="input input-bordered input-info mx-auto my-5 flex w-full max-w-xs flex-auto items-center"
      />
      <i> Date Range: </i>
      <input
        type="date"
        value={dateRange.startDate}
        onChange={(e) =>
          setDateRange({ ...dateRange, startDate: e.target.value })
        }
        className="input input-bordered mx-auto my-2"
      />
      <i> -> </i>
      <input
        type="date"
        value={dateRange.endDate}
        onChange={(e) =>
          setDateRange({ ...dateRange, endDate: e.target.value })
        }
        className="input input-bordered mx-auto my-2"
      />
      <i> Sentiment Range: </i>
      <input
        type="number"
        value={sentimentRange.min}
        min={-1}
        max={1}
        step={0.1}
        onChange={(e) =>
          setSentimentRange({
            ...sentimentRange,
            min: parseFloat(e.target.value),
          })
        }
        placeholder="Min Sentiment"
        className="input input-bordered mx-auto my-2"
      />
      <i> -> </i>
      <input
        type="number"
        value={sentimentRange.max}
        min={-1}
        max={1}
        step={0.1}
        onChange={(e) =>
          setSentimentRange({
            ...sentimentRange,
            max: parseFloat(e.target.value),
          })
        }
        placeholder="Max Sentiment"
        className="input input-bordered mx-auto my-2"
      />

      <div className="highcharts-figure">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartData.chartOptions}
        />
      </div>
      <div className="mt-8 flex justify-center">
        <button className="btn mr-2 bg-blue-400" onClick={exportToPDF}>
          Export to PDF
        </button>
        <CSVLink
          data={chartData.csvData}
          filename={`sentiment-analysis-${user ? user.username : "Anonymous"}-Search Term: ${searchTerm}.csv`}
          className="btn bg-blue-400"
        >
          Download CSV
        </CSVLink>
      </div>
    </div>
  );
};

export default SentimentCharts;
