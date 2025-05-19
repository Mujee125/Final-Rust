import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

interface DailyStat {
  date: string;
  sale: number;
  purchase: number;
}

interface ChartCardProps {
  dailyStats: DailyStat[];
}

const ChartCard: React.FC<ChartCardProps> = ({ dailyStats }) => {

  const chartData = {
    labels: dailyStats.map((stat) => stat.date),
    datasets: [
      {
        label: "Daily Sales",
        data: dailyStats.map((stat) => stat.sale),
        borderColor: "#38b2ac",
        backgroundColor: "rgba(56, 178, 172, 0.2)",
        tension: 0.4,
      },
      {
        label: "Daily Purchase",
        data: dailyStats.map((stat) => stat.purchase),
        borderColor: "#9f7aea",
        backgroundColor: "rgba(159, 122, 234, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Amount (Rs.)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <div className="pl-4 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ChartCard;
