import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import TitleCard from "./TitleCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function BarChart() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "white", // Set legend labels to white
        },
      },
      title: {
        display: true,
        text: "Monthly Active Users (in K)",
        color: "white", // Set title text to white
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white", // Set x-axis labels to white
        },
      },
      y: {
        ticks: {
          color: "white", // Set y-axis labels to white
        },
      },
    },
  };

  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Store 1",
        data: labels.map(() => {
          return Math.random() * 1000 + 500;
        }),
        backgroundColor: "rgba(255, 99, 132, 1)",
      },
      {
        label: "Store 2",
        data: labels.map(() => {
          return Math.random() * 1000 + 500;
        }),
        backgroundColor: "rgba(53, 162, 235, 1)",
      },
    ],
  };

  return (
    <TitleCard title={"Revenue"}>
      <Bar options={options} data={data} />
    </TitleCard>
  );
}

export default BarChart;
