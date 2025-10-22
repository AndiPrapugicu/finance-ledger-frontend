import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { chartTheme } from './chartTheme';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor?: string[];
      borderWidth?: number;
    }[];
  };
  title?: string;
  height?: number;
  options?: Partial<ChartOptions<'pie'>>;
}

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title = "Pie Chart", 
  height = 400,
  options = {} 
}) => {
  const defaultOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
            const label = context.label || '';
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce((acc, data) => acc + data, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${chartTheme.formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#1F2937', // gray-800 to separate segments
      },
    },
    ...options,
  };

  return (
    <div className="w-full h-full">
      <div style={{ height: `${height}px` }}>
        <Pie data={data} options={defaultOptions} />
      </div>
    </div>
  );
};

export default PieChart;