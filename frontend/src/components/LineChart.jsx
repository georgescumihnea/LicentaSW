import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import TitleCard from "./TitleCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

function LineChart() {
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
        fill: true,
        label: "MAU",
        data: labels.map(() => {
          return Math.random() * 100 + 500;
        }),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(13, 132, 235, 0.5)",
      },
    ],
  };

  return (
    <TitleCard title={"Montly Active Users (in K)"}>
      <Line data={data} options={options} />
    </TitleCard>
  );
}

export default LineChart;
