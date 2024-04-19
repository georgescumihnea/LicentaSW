import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";
import { toCanvas } from "html-to-image"; // Corrected import
import { useAuth } from "./AuthContext";

const SentimentCharts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [chartData, setChartData] = useState({
    csvData: [["Date", "Sentiment", "Title"]],
    chartOptions: {
      title: { text: "Sentiment Analysis" },
    },
  });
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [sentimentRange, setSentimentRange] = useState({ min: -1, max: 1 });
  const [keywordFilter, setKeywordFilter] = useState("");
  const { user } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Adjust parameters as necessary
        const response = await fetch(
          `http://localhost:5000/chart-data/${searchTerm}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&sentimentMin=${sentimentRange.min}&sentimentMax=${sentimentRange.max}&keyword=${keywordFilter}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        const formattedData = data.map((entry) => ({
          x: moment(entry[0], "YYYY-MM-DD HH:mm:ss").valueOf(),
          y: entry[1],
          name: entry[2],
        }));

        setChartData({
          csvData: [["Date", "Sentiment", "Title"], ...data],
          chartOptions: {
            title: { text: `Sentiment Analysis - Search Term: ${searchTerm}` },
            xAxis: { type: "datetime" },
            yAxis: { title: { text: "Sentiment Value" } },
            series: [{ name: "Sentiment", data: formattedData, color: "blue" }],
            responsive: {
              rules: [
                {
                  condition: {
                    maxWidth: 500,
                  },
                  chartOptions: {
                    legend: {
                      layout: "horizontal",
                      align: "center",
                      verticalAlign: "bottom",
                    },
                  },
                },
              ],
            },
          },
        });
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchData();
  }, [searchTerm, dateRange, sentimentRange, keywordFilter]);

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
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search term..."
        className="input input-bordered input-warning mx-auto my-5 flex w-full max-w-xs flex-auto items-center"
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
