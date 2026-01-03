import { getLinkAnalytics } from '@/apis/shorten';
import { Subheading } from '@/components/elements/heading';
import { Link, LinkAnalytics, StatsPeriod } from '@/types';
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    ChartOptions,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { useCookies } from 'react-cookie';
import WorldMapComponent from './WorldMapComponent';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
);

interface LinkStatsComponentProps {
  link: Link;
}

// Helper function to format dates for API
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Helper function to get date range based on period
const getDateRange = (period: StatsPeriod): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

// Simple chart components
const ProgressBar: React.FC<{ 
  value: number; 
  maxValue: number; 
  label: string; 
  count: number;
  countColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}> = ({ 
  value, 
  maxValue, 
  label, 
  count,
  countColor = 'text-emerald-600',
  gradientFrom = 'from-emerald-400',
  gradientTo = 'to-green-500'
}) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className={`text-sm font-semibold ${countColor}`}>{count}</span>
      </div>
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
        <div 
          className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
};

type SimpleChartData = { 
  name: string; 
  value: number;
  details?: string;
};

const SimpleChart: React.FC<{ data: SimpleChartData[]; title: string; beautifyName?: (name: string) => string }> = ({ 
  data, 
  title,
  beautifyName 
}) => {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  
  // Custom colors for different chart types
  const getCustomColors = (name: string, index: number) => {
    // Traffic Sources - distinct colors for each source
    if (title === 'Traffic Sources') {
      if (name === 'QR Scans') {
        return {
          countColor: 'text-blue-600',
          gradientFrom: 'from-blue-400',
          gradientTo: 'to-cyan-500'
        };
      } else if (name === 'Direct Clicks') {
        return {
          countColor: 'text-emerald-600',
          gradientFrom: 'from-emerald-400',
          gradientTo: 'to-green-500'
        };
      }
    }
    
    // Device Types, Top Cities, Operating Systems - natural color palette
    if (title === 'Device Types' || title === 'Top Cities' || title === 'Operating Systems') {
      const naturalColors = [
        { countColor: 'text-sky-600', gradientFrom: 'from-sky-400', gradientTo: 'to-blue-500' },
        { countColor: 'text-teal-600', gradientFrom: 'from-teal-400', gradientTo: 'to-emerald-500' },
        { countColor: 'text-amber-600', gradientFrom: 'from-amber-400', gradientTo: 'to-orange-500' },
        { countColor: 'text-violet-600', gradientFrom: 'from-violet-400', gradientTo: 'to-purple-500' },
        { countColor: 'text-rose-600', gradientFrom: 'from-rose-400', gradientTo: 'to-pink-500' },
        { countColor: 'text-cyan-600', gradientFrom: 'from-cyan-400', gradientTo: 'to-teal-500' },
        { countColor: 'text-lime-600', gradientFrom: 'from-lime-400', gradientTo: 'to-green-500' },
        { countColor: 'text-indigo-600', gradientFrom: 'from-indigo-400', gradientTo: 'to-blue-500' },
      ];
      return naturalColors[index % naturalColors.length];
    }
    
    return {};
  };
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">{title}</h3>
      <div className="space-y-3">
        {data.slice(0, 8).map((item, index) => (
          <ProgressBar
            key={index}
            value={item.value}
            maxValue={maxValue}
            label={beautifyName ? beautifyName(item.name) : (item.details || item.name)}
            count={item.value}
            {...getCustomColors(item.name, index)}
          />
        ))}
      </div>
    </div>
  );
};

type DailyData = {
  date: string;
  clicks: number;
};

const ViewsChart: React.FC<{ data: DailyData[]; period: StatsPeriod }> = ({ data, period }) => {
  // Detect dark mode
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    // Format date labels based on period
    const formatLabel = (dateStr: string) => {
      const date = new Date(dateStr);
      
      switch (period) {
        case 'day':
          return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        case 'week':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'month':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'year':
          return date.toLocaleDateString('en-US', { month: 'short' });
        default:
          return dateStr;
      }
    };

    return {
    labels: data.map(d => formatLabel(d.date)),
    datasets: [
      {
        label: 'Clicks',
        data: data.map(d => d.clicks),
        fill: true,
        borderColor: 'rgb(139, 92, 246)', // violet-500
        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
          gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.15)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          return gradient;
        },
        tension: 0.4, // Smooth curves
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: isDark ? 'rgb(39, 39, 42)' : '#fff', // zinc-800 : white
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(139, 92, 246)',
        pointHoverBorderColor: isDark ? 'rgb(39, 39, 42)' : '#fff',
        pointHoverBorderWidth: 3,
        borderWidth: 3,
      }
    ]
    };
  }, [data, period, isDark]);
  
  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(39, 39, 42, 0.95)' : 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            return `${context.parsed.y} click${context.parsed.y !== 1 ? 's' : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: isDark ? 'rgb(161, 161, 170)' : 'rgb(113, 113, 122)', // zinc-400 : zinc-500
          maxRotation: 0,
          autoSkipPadding: 20,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(161, 161, 170, 0.1)' : 'rgba(113, 113, 122, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: isDark ? 'rgb(161, 161, 170)' : 'rgb(113, 113, 122)',
          precision: 0,
          font: {
            size: 11
          }
        }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  }), [isDark]);
  
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">Clicks over time</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No data available</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">Clicks over time</h3>
      <div style={{ height: '350px' }}>
        <Line key={isDark ? 'dark' : 'light'} data={chartData} options={options} />
      </div>
    </div>
  );
};

const BrowsersPieChart: React.FC<{ data: SimpleChartData[] }> = ({ data }) => {
  // Detect dark mode
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    const colors = [
      'rgba(96, 165, 250, 0.85)',   // soft blue
      'rgba(134, 239, 172, 0.85)',  // soft green
      'rgba(253, 186, 116, 0.85)',  // soft orange
      'rgba(196, 181, 253, 0.85)',  // soft purple
      'rgba(252, 165, 165, 0.85)',  // soft red
      'rgba(165, 243, 252, 0.85)',  // soft cyan
      'rgba(254, 202, 202, 0.85)',  // soft pink
      'rgba(190, 242, 100, 0.85)',  // soft lime
    ];

    return {
      labels: data.map(d => d.name),
      datasets: [
        {
          label: 'Clicks',
          data: data.map(d => d.value),
          backgroundColor: colors.slice(0, data.length),
          borderColor: isDark ? 'rgb(39, 39, 42)' : '#fff',
          borderWidth: 2,
        }
      ]
    };
  }, [data, isDark]);

  const options: ChartOptions<'pie'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: isDark ? 'rgb(161, 161, 170)' : 'rgb(113, 113, 122)',
          padding: 15,
          font: {
            size: 12
          },
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            const labelColor = isDark ? 'rgb(161, 161, 170)' : 'rgb(113, 113, 122)';
            return chart.data.labels?.map((label, i) => ({
              text: `${label}: ${datasets[0].data[i]}`,
              fillStyle: datasets[0].backgroundColor?.[i] as string,
              fontColor: labelColor,
              hidden: false,
              index: i
            })) || [];
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(39, 39, 42, 0.95)' : 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  }), [isDark]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">Browsers</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">Browsers</h3>
      <div style={{ height: '300px' }}>
        <Pie key={isDark ? 'dark' : 'light'} data={chartData} options={options} />
      </div>
    </div>
  );
};

const LinkStatsComponent: React.FC<LinkStatsComponentProps> = ({ link }) => {
  const [activePeriod, setActivePeriod] = useState<StatsPeriod>('month');
  const [cookies] = useCookies(['token']);
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [hasHistoricalData, setHasHistoricalData] = useState<boolean>(false);

  // Fetch analytics data when period changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const { startDate, endDate } = getDateRange(activePeriod);
        const data = await getLinkAnalytics(cookies.token, link.lookup_code, startDate, endDate);
        setAnalytics(data);
        
        // Track if there's any historical data (check on first load with month period)
        if (activePeriod === 'month' && data.summary.total_clicks > 0) {
          setHasHistoricalData(true);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (cookies.token && link.lookup_code) {
      fetchAnalytics();
    }
  }, [activePeriod, cookies.token, link.lookup_code]);

  // Loading state
  if (loading) {
    return (
      <>
        <Subheading className="mt-4">Statistics</Subheading>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Loading analytics...</p>
        </div>
      </>
    );
  }

  // Error state
  if (error || !analytics) {
    return (
      <>
        <Subheading className="mt-4">Statistics</Subheading>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-8 text-center">
          <p className="text-red-500 dark:text-red-400">{error || 'Failed to load analytics'}</p>
        </div>
      </>
    );
  }

  // Prepare data for charts (even if current period has no data)
  const cityData = analytics.top_cities.map(city => ({
    name: city.city || 'Unknown',
    value: city.clicks,
    details: `${city.city}, ${city.region} (${city.country})`
  }));

  const countryData = analytics.countries.map(country => ({
    name: country.country,
    value: country.clicks
  }));

  const browserData = analytics.browsers.map(browser => ({
    name: browser.browser,
    value: browser.clicks
  }));

  const osData = analytics.operating_systems.map(os => ({
    name: os.os,
    value: os.clicks
  }));

  const deviceData = [
    { name: 'Mobile', value: analytics.devices.mobile },
    { name: 'Desktop', value: analytics.devices.desktop },
    { name: 'Tablet', value: analytics.devices.tablet }
  ].filter(d => d.value > 0);

  const sourceData = [
    { name: 'QR Scans', value: analytics.summary.qr_scans },
    { name: 'Direct Clicks', value: analytics.summary.direct_clicks }
  ].filter(d => d.value > 0);

  // If no historical data at all (first time, no clicks ever), show the empty state
  if (!hasHistoricalData && analytics.summary.total_clicks === 0) {
    return (
      <>
        <Subheading className="mt-4">Statistics</Subheading>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            No click data available yet. Share your link to start collecting statistics!
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Subheading>Statistics</Subheading>
        
        {/* Period Navigation */}
        <div className="flex gap-2">
          {(['day', 'week', 'month', 'year'] as StatsPeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setActivePeriod(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activePeriod === period
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Total Clicks</p>
          <p className="text-2xl font-bold text-violet-600">{analytics.summary.total_clicks}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Human Clicks</p>
          <p className="text-2xl font-bold text-green-600">{analytics.summary.human_clicks}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">QR Scans</p>
          <p className="text-2xl font-bold text-blue-600">{analytics.summary.qr_scans}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Bot Clicks</p>
          <p className="text-2xl font-bold text-orange-600">{analytics.summary.bot_clicks}</p>
        </div>
      </div>

      {/* Clicks Chart */}
      <div className="mb-8">
        <ViewsChart 
          data={analytics.daily_clicks} 
          period={activePeriod}
        />
      </div>

      {/* Device & Source Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SimpleChart 
          data={deviceData} 
          title="Device Types" 
        />
        <SimpleChart 
          data={sourceData} 
          title="Traffic Sources" 
        />
      </div>

      {/* City & Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SimpleChart 
          data={cityData} 
          title="Top Cities" 
        />
        <BrowsersPieChart 
          data={browserData}
        />
      </div>

      {/* Operating Systems - Full Width */}
      <div className="mb-8">
        <SimpleChart 
          data={osData} 
          title="Operating Systems" 
        />
      </div>

      {/* World Map - Full Width with Zoom */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Countries</h3>
        </div>
        <WorldMapComponent data={countryData} />
      </div>
    </>
  );
};

export default LinkStatsComponent;
