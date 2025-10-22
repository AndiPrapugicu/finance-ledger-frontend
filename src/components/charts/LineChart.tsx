import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { chartTheme } from './chartTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
      tension?: number;
    }[];
  };
  title?: string;
  height?: number;
  options?: Partial<ChartOptions<'line'>>;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  title = "Line Chart", 
  height = 400,
  options = {} 
}) => {
  const defaultOptions: ChartOptions<'line'> = {
    ...chartTheme.defaultOptions,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartTheme.colors.text.primary,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
            weight: 'normal' as const,
          },
          usePointStyle: true,
          padding: 16,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: chartTheme.colors.text.primary,
        font: {
          size: 16,
          weight: 'bold' as const,
          family: 'Inter, system-ui, sans-serif',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
          family: 'Inter, system-ui, sans-serif',
        },
        bodyFont: {
          size: 12,
          family: 'Inter, system-ui, sans-serif',
        },
        padding: 12,
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = chartTheme.formatCurrency(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          lineWidth: 1,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10,
            family: 'Inter, system-ui, sans-serif',
          },
          padding: 8,
        },
      },
      y: {
        border: { display: false },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          lineWidth: 1,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10,
            family: 'Inter, system-ui, sans-serif',
          },
          padding: 8,
          callback: function(value: string | number) {
            return typeof value === 'number' ? chartTheme.formatLargeNumber(value) : value;
          },
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: '#FFFFFF',
      },
      line: {
        borderWidth: 3,
        tension: 0.4,
      },
    },
    ...options,
  };

  return (
    <div className="w-full h-full">
      <div style={{ height: `${height}px` }}>
        <Line data={data} options={defaultOptions} />
      </div>
    </div>
  );
};

export default LineChart;