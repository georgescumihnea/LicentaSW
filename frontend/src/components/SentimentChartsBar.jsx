import React, { useState, useEffect } from "react";
import Highcharts, { correctFloat } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";
import { toCanvas } from "html-to-image";
import { useAuth } from "./AuthContext";
import Subtitle from "./Subtitle";

const SentimentChartsBar = () => {
  const [searchEntity, setSearchEntity] = useState("");

  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(1, "year").format("YYYY-MM-DD"), // Default to last year
    endDate: moment().format("YYYY-MM-DD"), // Default to today
  });

  const [chartData, setChartData] = useState({
    csvData: [["Entity", "Average Sentiment"]], // Initial CSV data
    chartOptions: {
      title: { text: "Entity Sentiment Analysis" }, // Default title
      chart: { type: "bar" },
      xAxis: { categories: [] },
      yAxis: { title: { text: "Average Sentiment" } },
      series: [{ name: "Average Sentiment", data: [] }],
      legend: {
        borderWidth: 2,
      },
    },
  });

  const [sentimentRange, setSentimentRange] = useState({ min: -1, max: 1 });
  const [keywordFilter, setKeywordFilter] = useState("");
  const { user } = useAuth();

  const fetchData = async () => {
    const queryParams = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      sentimentMin: sentimentRange.min,
      sentimentMax: sentimentRange.max,
      sourceType: keywordFilter, // Keep as is or make dynamic as needed
    }).toString();

    try {
      const response = await fetch(
        `http://localhost:5000/chart-data-entity/${searchEntity}?${queryParams}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json(); // Assuming data format: [{ text: '...', avg_sentiment: ... }]
      console.log(data);

      setChartData({
        csvData: [
          ["Entity", "Average Sentiment"],
          ...data.map((item) => [item.text, Number(item.avg_sentiment)]),
          ["Username", user ? user.username : "Anonymous"],
          ["Creation Date", moment().format("YYYY-MM-DD")],
        ],
        chartOptions: {
          title: {
            text: `Entity Sentiment Analysis - Search: ${searchEntity}`,
          },
          xAxis: {
            categories: data.map((item) => item.text + " - "),
          },
          yAxis: {
            title: { text: "Average Sentiment" },
            plotOptions: {
              bar: {
                borderRadius: "50%",
                dataLabels: {
                  enabled: true,
                },
              },
            },
          },
          series: [
            {
              data: data.map((item) => {
                const avgSentiment = Number(item.avg_sentiment);
                return !isNaN(avgSentiment) ? correctFloat(avgSentiment) : null;
              }),
              color: "blue",
            },
          ],
        },
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchEntity, dateRange, sentimentRange, keywordFilter]);

  const exportToPDF = async () => {
    const doc = new jsPDF("p", "px");
    const chartContainer = document.querySelector(".highcharts-figure2");
    const currentDate = moment().format("YYYY-MM-DD");
    if (chartContainer) {
      const canvas = await toCanvas(chartContainer); // Correct usage of imported function
      const imgData = canvas.toDataURL("image/png");
      doc.text(`Username: ${user ? user.username : "Anonymous"}`, 10, 330);
      doc.text(`Date: ${currentDate}`, 10, 300);
      doc.text(`Search Term: ${searchEntity}`, 10, 350);
      doc.addImage(imgData, "PNG", 0, 0, 450, 220); // Adjust positioning/sizing as needed
      doc.save(
        `sentiment-analysis-${user ? user.username : "Anonymous"}-Date: ${currentDate}-Search Term: ${searchEntity}.pdf`,
      );
    }
  };

  return (
    <div>
      <Subtitle styleClass="text-center">Sentiment Analysis By Entity</Subtitle>
      <input
        type="text"
        value={searchEntity}
        onChange={(e) => setSearchEntity(e.target.value)}
        placeholder="Search entity..."
        className="input input-bordered input-info mx-auto my-5 flex w-full max-w-xs"
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
      <i> -&gt; </i>
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
          setSentimentRange({ ...sentimentRange, min: e.target.value })
        }
        placeholder="Min Sentiment"
        className="input input-bordered mx-auto my-2"
      />
      <i> -&gt; </i>
      <input
        type="number"
        value={sentimentRange.max}
        min={-1}
        max={1}
        step={0.1}
        onChange={(e) =>
          setSentimentRange({ ...sentimentRange, max: e.target.value })
        }
        placeholder="Max Sentiment"
        className="input input-bordered mx-auto my-2"
      />

      <select
        value={keywordFilter}
        onChange={(e) => setKeywordFilter(e.target.value)}
        className="icon input input-bordered mx-auto my-5 border-blue-400 hover:border-blue-500"
      >
        <option value="">All</option>
        <option value="COMMENT">COMMENT</option>
        <option value="POST">POST</option>
      </select>

      <div className="highcharts-figure2">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartData.chartOptions}
        />
      </div>

      <div className="mb-4 mt-8 flex justify-center">
        <button className="btn mr-2 bg-blue-400" onClick={exportToPDF}>
          Export to PDF
        </button>
        <CSVLink
          data={chartData.csvData}
          filename={`sentiment-analysis-entity-${searchEntity}.csv`}
          className="btn bg-blue-400"
        >
          Download CSV
        </CSVLink>
      </div>
    </div>
  );
};

export default SentimentChartsBar;
