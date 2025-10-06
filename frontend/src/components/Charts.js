import React, { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const chartBaseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 6,
      padding: 8,
    },
  },
};

export const RoleDistributionChart = ({ data }) => {
  const chartData = useMemo(() => {
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#06B6D4',
            '#F97316',
            '#84CC16'
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [data]);

  const options = {
    ...chartBaseOptions,
    cutout: '50%',
    plugins: {
      ...chartBaseOptions.plugins,
      legend: {
        ...chartBaseOptions.plugins.legend,
        display: true,
      },
      tooltip: {
        ...chartBaseOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export const PaymentStatusChart = ({ data }) => {
  const chartData = useMemo(() => ({
    labels: ['Successful', 'Pending', 'Failed'],
    datasets: [
      {
        label: 'Payments',
        data: [data.success, data.pending, data.failed],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#059669', '#D97706', '#DC2626'],
        borderWidth: 1,
      },
    ],
  }), [data]);

  const options = {
    ...chartBaseOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const RegistrationTrendChart = ({ data }) => {
  const chartData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      labels: sortedData.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Registrations',
          data: sortedData.map(item => item.count),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    };
  }, [data]);

  const options = {
    ...chartBaseOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const RevenueChart = ({ data }) => {
  const chartData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      labels: sortedData.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Daily Revenue (₹)',
          data: sortedData.map(item => item.revenue || 0),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    };
  }, [data]);

  const options = {
    ...chartBaseOptions,
    plugins: {
      ...chartBaseOptions.plugins,
      tooltip: {
        ...chartBaseOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return `Revenue: ₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const SourceAnalysisChart = ({ data }) => {
  const chartData = useMemo(() => {
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    return {
      labels,
      datasets: [
        {
          label: 'Leads by Source',
          data: values,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#06B6D4'
          ],
          borderColor: [
            '#2563EB',
            '#059669',
            '#D97706',
            '#DC2626',
            '#7C3AED',
            '#0891B2'
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const options = {
    ...chartBaseOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};