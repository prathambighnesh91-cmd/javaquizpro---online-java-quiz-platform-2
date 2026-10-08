import React, { useEffect, useRef } from 'react';
import {
  Chart,
  registerables,
  ChartData,
  ChartOptions
} from 'chart.js';

Chart.register(...registerables);

interface DoughnutChartProps {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
  height?: number;
}

export const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, options, height = 240 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart<'doughnut'> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const defaultOptions: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            padding: 14
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: 'bold' },
          bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
          padding: 10,
          cornerRadius: 6
        }
      },
      cutout: '70%',
      ...options
    };

    chartInstanceRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data,
      options: defaultOptions
    });

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [data, options]);

  return (
    <div style={{ height }} className="w-full relative flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
};
