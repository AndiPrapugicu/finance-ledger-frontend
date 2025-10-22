import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { chartTheme } from './chartTheme';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
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
  centerText?: string;
  options?: Partial<ChartOptions<'doughnut'>>;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ 
  data, 
  title = "Doughnut Chart", 
  height = 400,
  centerText,
  options = {} 
}) => {
  const defaultOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartTheme.colors.text.primary,
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
            weight: 'normal' as const,
          },
          usePointStyle: true,
          padding: 12,
          boxWidth: 10,
          boxHeight: 10,
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
    <div className="w-full h-full relative">
      <div style={{ height: `${height}px` }}>
        <Doughnut data={data} options={defaultOptions} />
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{centerText}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoughnutChart;