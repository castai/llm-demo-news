import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ModelScalingStatus = () => {
  const [podCount, setPodCount] = useState(0);
  const [scalingHistory, setScalingHistory] = useState([]);
  const [isLoadTesting, setIsLoadTesting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/model/pods');
        const data = await response.json();
        setPodCount(data.current_pods);
        setScalingHistory(data.history);
      } catch (error) {
        console.error('Error fetching pod data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadTest = async (action) => {
    try {
      const response = await fetch(`/model/load-test/${action}`, {
        method: 'POST',
      });
      if (response.ok) {
        setIsLoadTesting(action === 'start');
      }
    } catch (error) {
      console.error(`Error ${action}ing load test:`, error);
    }
  };

  const chartData = {
    labels: scalingHistory.map(h => new Date(h.timestamp * 1000).toLocaleTimeString()),
    datasets: [
      {
        label: 'Pod Count',
        data: scalingHistory.map(h => h.pod_count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Model Scaling History',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="model-scaling-status">
      <div className="pod-counter">
        <h2>Current Pod Count</h2>
        <div className="counter">
          <span className="number">{podCount}</span>
          <span className="label">pods</span>
        </div>
      </div>

      <div className="load-test-controls">
        <button
          className={`load-test-button ${isLoadTesting ? 'stop' : 'start'}`}
          onClick={() => handleLoadTest(isLoadTesting ? 'stop' : 'start')}
        >
          {isLoadTesting ? 'Stop Load Test' : 'Start Load Test'}
        </button>
      </div>

      <div className="scaling-chart">
        <Line data={chartData} options={chartOptions} />
      </div>

      <style jsx>{`
        .model-scaling-status {
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .pod-counter {
          text-align: center;
          margin-bottom: 20px;
        }

        .counter {
          display: inline-block;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 50%;
          width: 120px;
          height: 120px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: all 0.3s ease;
        }

        .counter:hover {
          transform: scale(1.05);
        }

        .number {
          font-size: 2.5em;
          font-weight: bold;
          color: #2c3e50;
        }

        .label {
          font-size: 1.2em;
          color: #7f8c8d;
        }

        .load-test-controls {
          text-align: center;
          margin: 20px 0;
        }

        .load-test-button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 1.1em;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .load-test-button.start {
          background: #2ecc71;
          color: white;
        }

        .load-test-button.stop {
          background: #e74c3c;
          color: white;
        }

        .load-test-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .scaling-chart {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default ModelScalingStatus; 