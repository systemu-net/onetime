import { Heading } from '@/components/elements/heading';
import MainLayout from '@/components/layouts/MainLayout';
import { Link, LinkStats, StatsPeriod } from '@/types';
import { ChevronLeftIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

interface StatsPageProps {
  linkData?: Link;
  statsData?: LinkStats;
  error?: string;
}

// Simple chart components
const ProgressBar: React.FC<{ value: number; maxValue: number; label: string; count: number }> = ({ 
  value, 
  maxValue, 
  label, 
  count 
}) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="text-sm font-semibold text-violet-600">{count}</span>
      </div>
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
};

const SimpleChart: React.FC<{ data: { name: string; value: number }[]; title: string; beautifyName?: (name: string) => string }> = ({ 
  data, 
  title,
  beautifyName 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {data.slice(0, 8).map((item, index) => (
          <ProgressBar
            key={index}
            value={item.value}
            maxValue={maxValue}
            label={beautifyName ? beautifyName(item.name) : item.name}
            count={item.value}
          />
        ))}
      </div>
    </div>
  );
};

const ViewsChart: React.FC<{ data: number[]; labels: string[] }> = ({ data, labels }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="grid grid-cols-12 gap-2 h-64">
        {data.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const label = labels[index];
          
          return (
            <div key={index} className="flex flex-col items-center justify-end group">
              <div 
                className="w-full bg-gradient-to-t from-violet-500 to-purple-400 rounded-t-sm transition-all duration-300 hover:from-violet-600 hover:to-purple-500 min-h-[2px] relative"
                style={{ height: `${Math.max(height, 2)}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {value} views
                </div>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center transform -rotate-45 origin-top">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatsPage: React.FC<StatsPageProps> = ({ linkData, statsData, error }) => {
  const { lookup_code } = useParams();
  const [activePeriod, setActivePeriod] = useState<StatsPeriod>('day');
  
  // Mock data for demonstration - replace with actual API calls
  const mockLinkData: Link = {
    lookup_code: lookup_code || 'demo',
    original_url: 'https://example.com/very-long-url',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    clicks: [],
    is_safe: true
  };

  const mockStatsData: LinkStats = {
    lastDay: {
      total: 156,
      views: [12, 19, 3, 5, 8, 12, 15, 22, 18, 25, 13, 16, 21, 14, 17, 19, 23, 20, 16, 11, 8, 5, 3, 1],
      stats: {
        referrer: [
          { name: 'Direct', value: 65 },
          { name: 'Google', value: 45 },
          { name: 'Facebook', value: 28 },
          { name: 'Twitter', value: 18 }
        ],
        browser: [
          { name: 'chrome', value: 89 },
          { name: 'firefox', value: 34 },
          { name: 'safari', value: 21 },
          { name: 'edge', value: 12 }
        ],
        os: [
          { name: 'windows', value: 78 },
          { name: 'macos', value: 45 },
          { name: 'android', value: 23 },
          { name: 'ios', value: 10 }
        ],
        country: [
          { name: 'US', value: 89 },
          { name: 'GB', value: 34 },
          { name: 'DE', value: 21 },
          { name: 'FR', value: 12 }
        ]
      }
    },
    lastWeek: {
      total: 1089,
      views: [156, 134, 178, 198, 145, 167, 111],
      stats: {
        referrer: [
          { name: 'Direct', value: 456 },
          { name: 'Google', value: 323 },
          { name: 'Facebook', value: 198 },
          { name: 'Twitter', value: 112 }
        ],
        browser: [
          { name: 'chrome', value: 623 },
          { name: 'firefox', value: 234 },
          { name: 'safari', value: 145 },
          { name: 'edge', value: 87 }
        ],
        os: [
          { name: 'windows', value: 546 },
          { name: 'macos', value: 312 },
          { name: 'android', value: 156 },
          { name: 'ios', value: 75 }
        ],
        country: [
          { name: 'US', value: 623 },
          { name: 'GB', value: 234 },
          { name: 'DE', value: 145 },
          { name: 'FR', value: 87 }
        ]
      }
    },
    lastMonth: {
      total: 4567,
      views: new Array(30).fill(0).map(() => Math.floor(Math.random() * 200) + 50),
      stats: {
        referrer: [
          { name: 'Direct', value: 1890 },
          { name: 'Google', value: 1345 },
          { name: 'Facebook', value: 834 },
          { name: 'Twitter', value: 498 }
        ],
        browser: [
          { name: 'chrome', value: 2567 },
          { name: 'firefox', value: 934 },
          { name: 'safari', value: 634 },
          { name: 'edge', value: 432 }
        ],
        os: [
          { name: 'windows', value: 2234 },
          { name: 'macos', value: 1345 },
          { name: 'android', value: 634 },
          { name: 'ios', value: 354 }
        ],
        country: [
          { name: 'US', value: 2567 },
          { name: 'GB', value: 934 },
          { name: 'DE', value: 634 },
          { name: 'FR', value: 432 }
        ]
      }
    },
    lastYear: {
      total: 54789,
      views: new Array(12).fill(0).map(() => Math.floor(Math.random() * 6000) + 2000),
      stats: {
        referrer: [
          { name: 'Direct', value: 22678 },
          { name: 'Google', value: 16234 },
          { name: 'Facebook', value: 9876 },
          { name: 'Twitter', value: 6001 }
        ],
        browser: [
          { name: 'chrome', value: 30789 },
          { name: 'firefox', value: 11234 },
          { name: 'safari', value: 7634 },
          { name: 'edge', value: 5132 }
        ],
        os: [
          { name: 'windows', value: 26789 },
          { name: 'macos', value: 16123 },
          { name: 'android', value: 7634 },
          { name: 'ios', value: 4243 }
        ],
        country: [
          { name: 'US', value: 30789 },
          { name: 'GB', value: 11234 },
          { name: 'DE', value: 7634 },
          { name: 'FR', value: 5132 }
        ]
      }
    },
    updatedAt: new Date().toISOString()
  };

  const currentLink = linkData || mockLinkData;
  const currentStats = statsData || mockStatsData;
  const periodKey = `last${activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)}` as keyof LinkStats;
  const currentPeriodData = currentStats[periodKey] as typeof currentStats.lastDay;

  // Utility functions
  const createViewsChartLabels = (period: StatsPeriod): string[] => {
    const labels: string[] = [];
    const now = new Date();

    switch (period) {
      case 'day':
        for (let i = 23; i >= 0; i--) {
          let hour = now.getHours() - i;
          if (hour < 0) hour = 24 + hour;
          labels.push(`${hour}:00`);
        }
        break;
      case 'week':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(`${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`);
        }
        break;
      case 'month':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(`${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`);
        }
        break;
      case 'year':
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          labels.push(`${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`);
        }
        break;
    }
    return labels;
  };

  const beautifyBrowserName = (name: string): string => {
    const browserMap: Record<string, string> = {
      chrome: 'Chrome',
      firefox: 'Firefox',
      safari: 'Safari',
      edge: 'Edge',
      opera: 'Opera',
      ie: 'IE',
      other: 'Other'
    };
    return browserMap[name.toLowerCase()] || name;
  };

  const beautifyOsName = (name: string): string => {
    const osMap: Record<string, string> = {
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux',
      android: 'Android',
      ios: 'iOS',
      other: 'Other'
    };
    return osMap[name.toLowerCase()] || name;
  };

  const formatLastUpdate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };



  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-red-500 text-lg">
              ✕ {error}
            </div>
            <RouterLink
              to="/"
              className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <ChevronLeftIcon className="size-4" />
              Back to homepage
            </RouterLink>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <RouterLink
              to="/"
              className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <ChevronLeftIcon className="size-4" />
              Back to homepage
            </RouterLink>
          </div>

          <div className="mb-6">
            <Heading className="mb-2">
              Stats for:{' '}
              <a 
                href={currentLink.original_url} 
                className="text-violet-600 hover:text-violet-700"
                title="Short link"
              >
                {window.location.origin}/{currentLink.lookup_code}
              </a>
            </Heading>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              {currentLink.original_url}
            </p>
          </div>

          {/* Stats Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <p className="text-lg">
              Total views:{' '}
              <span className="font-bold text-2xl text-violet-600">
                {currentStats.lastDay.total + currentStats.lastWeek.total + currentStats.lastMonth.total}
              </span>
            </p>

            {/* Period Navigation */}
            <nav className="flex gap-2">
              {(['year', 'month', 'week', 'day'] as StatsPeriod[]).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setActivePeriod(period)}
                  disabled={activePeriod === period}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePeriod === period
                      ? 'bg-violet-600 text-white cursor-not-allowed'
                      : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Stats Content */}
        <div className="space-y-8">
          {/* Period Summary */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <h2 className="text-xl font-semibold mb-2">
              <span className="text-violet-600 text-2xl font-bold">
                {currentPeriodData?.total || 0}
              </span>{' '}
              tracked visits in the last {activePeriod}.
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Last update at {formatLastUpdate(currentStats.updatedAt)}.
            </p>

            {/* Views Chart */}
            <ViewsChart 
              data={currentPeriodData?.views || []} 
              labels={createViewsChartLabels(activePeriod)} 
            />
          </div>

          <hr className="border-zinc-200 dark:border-zinc-700" />

          {/* Referrers and Browsers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Referrers</h2>
              <SimpleChart 
                data={currentPeriodData?.stats.referrer || []} 
                title="" 
              />
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Browsers</h2>
              <SimpleChart 
                data={currentPeriodData?.stats.browser || []} 
                title="" 
                beautifyName={beautifyBrowserName}
              />
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-700" />

          {/* Countries and Operating Systems */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Countries</h2>
              <div className="space-y-2">
                {(currentPeriodData?.stats.country || []).map((country, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-zinc-50 dark:bg-zinc-700 rounded">
                    <span className="font-medium">{country.name}</span>
                    <span className="text-violet-600 font-semibold">{country.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Operating Systems</h2>
              <SimpleChart 
                data={currentPeriodData?.stats.os || []} 
                title="" 
                beautifyName={beautifyOsName}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pb-8">
          <RouterLink
            to="/"
            className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <ChevronLeftIcon className="size-4" />
            Back to homepage
          </RouterLink>
        </div>
      </div>
    </MainLayout>
  );
};

export default StatsPage;