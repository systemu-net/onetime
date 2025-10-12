import { Subheading } from '@/components/elements/heading';
import { Link, StatsData, StatsPeriod } from '@/types';
import { useMemo, useState } from 'react';
import WorldMapComponent from './WorldMapComponent';

interface LinkStatsComponentProps {
  link: Link;
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

const SimpleChart: React.FC<{ data: StatsData[]; title: string; beautifyName?: (name: string) => string }> = ({ 
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
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
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

const ViewsChart: React.FC<{ data: number[]; labels: string[]; period: StatsPeriod }> = ({ data, labels, period }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Views over time</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data);
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h3 className="text-lg font-semibold mb-4">Views over time ({period})</h3>
      <div className="grid gap-2 h-48" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
        {data.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const label = labels[index];
          
          return (
            <div key={index} className="flex flex-col items-center justify-end group">
              <div 
                className="w-full bg-gradient-to-t from-violet-500 to-purple-400 rounded-t-sm transition-all duration-300 hover:from-violet-600 hover:to-purple-500 min-h-[2px] relative"
                style={{ height: `${Math.max(height, 2)}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {value} views
                </div>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LinkStatsComponent: React.FC<LinkStatsComponentProps> = ({ link }) => {
  const [activePeriod, setActivePeriod] = useState<StatsPeriod>('week');

  // Process clicks data to generate stats
  const processedStats = useMemo(() => {
    const now = new Date();
    const clicks = link.clicks || [];
    
    // Filter clicks by period
    const getClicksForPeriod = (period: StatsPeriod) => {
      const startDate = new Date(now);
      
      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      return clicks.filter(click => new Date(click.created_at) >= startDate);
    };

    const periodClicks = getClicksForPeriod(activePeriod);
    
    // Generate country stats
    const countryStats: Record<string, number> = {};
    periodClicks.forEach(click => {
      const country = click.country || 'Unknown';
      countryStats[country] = (countryStats[country] || 0) + 1;
    });
    
    const countriesData: StatsData[] = Object.entries(countryStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Generate referrer stats (extract domain from referrer)
    const referrerStats: Record<string, number> = {};
    periodClicks.forEach(click => {
      let referrer = 'Direct';
      if (click.referrer && click.referrer !== '') {
        try {
          const url = new URL(click.referrer);
          referrer = url.hostname.replace('www.', '');
        } catch {
          referrer = 'Other';
        }
      }
      referrerStats[referrer] = (referrerStats[referrer] || 0) + 1;
    });
    
    const referrersData: StatsData[] = Object.entries(referrerStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Generate browser stats (extract from user agent)
    const browserStats: Record<string, number> = {};
    periodClicks.forEach(click => {
      const userAgent = click.user_agent.toLowerCase();
      let browser = 'Other';
      
      if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
        browser = 'Chrome';
      } else if (userAgent.includes('firefox')) {
        browser = 'Firefox';
      } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        browser = 'Safari';
      } else if (userAgent.includes('edg')) {
        browser = 'Edge';
      } else if (userAgent.includes('opera')) {
        browser = 'Opera';
      }
      
      browserStats[browser] = (browserStats[browser] || 0) + 1;
    });
    
    const browsersData: StatsData[] = Object.entries(browserStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Generate OS stats (extract from user agent)
    const osStats: Record<string, number> = {};
    periodClicks.forEach(click => {
      const userAgent = click.user_agent.toLowerCase();
      let os = 'Other';
      
      if (userAgent.includes('windows')) {
        os = 'Windows';
      } else if (userAgent.includes('mac os')) {
        os = 'macOS';
      } else if (userAgent.includes('linux')) {
        os = 'Linux';
      } else if (userAgent.includes('android')) {
        os = 'Android';
      } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        os = 'iOS';
      }
      
      osStats[os] = (osStats[os] || 0) + 1;
    });
    
    const osData: StatsData[] = Object.entries(osStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Generate views over time
    const viewsData: number[] = [];
    const labelsData: string[] = [];
    
    switch (activePeriod) {
      case 'day': {
        // Group by hour
        for (let i = 23; i >= 0; i--) {
          const hourStart = new Date(now);
          hourStart.setHours(hourStart.getHours() - i, 0, 0, 0);
          const hourEnd = new Date(hourStart);
          hourEnd.setHours(hourEnd.getHours() + 1);
          
          const hourClicks = clicks.filter(click => {
            const clickDate = new Date(click.created_at);
            return clickDate >= hourStart && clickDate < hourEnd;
          });
          
          viewsData.push(hourClicks.length);
          labelsData.push(`${hourStart.getHours()}:00`);
        }
        break;
      }
      case 'week': {
        // Group by day
        for (let i = 6; i >= 0; i--) {
          const dayStart = new Date(now);
          dayStart.setDate(dayStart.getDate() - i);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);
          
          const dayClicks = clicks.filter(click => {
            const clickDate = new Date(click.created_at);
            return clickDate >= dayStart && clickDate <= dayEnd;
          });
          
          viewsData.push(dayClicks.length);
          labelsData.push(`${dayStart.getDate()}/${dayStart.getMonth() + 1}`);
        }
        break;
      }
      case 'month': {
        // Group by day for the last 30 days
        for (let i = 29; i >= 0; i--) {
          const dayStart = new Date(now);
          dayStart.setDate(dayStart.getDate() - i);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);
          
          const dayClicks = clicks.filter(click => {
            const clickDate = new Date(click.created_at);
            return clickDate >= dayStart && clickDate <= dayEnd;
          });
          
          viewsData.push(dayClicks.length);
          labelsData.push(`${dayStart.getDate()}`);
        }
        break;
      }
      case 'year': {
        // Group by month
        for (let i = 11; i >= 0; i--) {
          const monthStart = new Date(now);
          monthStart.setMonth(monthStart.getMonth() - i, 1);
          monthStart.setHours(0, 0, 0, 0);
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          
          const monthClicks = clicks.filter(click => {
            const clickDate = new Date(click.created_at);
            return clickDate >= monthStart && clickDate <= monthEnd;
          });
          
          viewsData.push(monthClicks.length);
          labelsData.push(monthStart.toLocaleString('default', { month: 'short' }));
        }
        break;
      }
    }

    return {
      total: periodClicks.length,
      countries: countriesData,
      referrers: referrersData,
      browsers: browsersData,
      os: osData,
      views: viewsData,
      labels: labelsData
    };
  }, [link.clicks, activePeriod]);

  if (!link.clicks || link.clicks.length === 0) {
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

      {/* Summary */}
      <div className="mb-6 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
        <p className="text-lg">
          <span className="font-bold text-2xl text-violet-600">
            {processedStats.total}
          </span>{' '}
          tracked visits in the last {activePeriod}.
        </p>
      </div>

      {/* Views Chart */}
      <div className="mb-8">
        <ViewsChart 
          data={processedStats.views} 
          labels={processedStats.labels} 
          period={activePeriod}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SimpleChart 
          data={processedStats.referrers} 
          title="Referrers" 
        />
        <SimpleChart 
          data={processedStats.browsers} 
          title="Browsers" 
        />
      </div>

      {/* World Map and OS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Countries</h3>
          <WorldMapComponent data={processedStats.countries} />
        </div>
        <SimpleChart 
          data={processedStats.os} 
          title="Operating Systems" 
        />
      </div>
    </>
  );
};

export default LinkStatsComponent;