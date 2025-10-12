import { StatsData } from '@/types';
import mapData from '@/utils/map.json';
import React, { useMemo, useState } from 'react';

interface WorldMapComponentProps {
  data: StatsData[];
}

// Country code to name mapping for better display
const countryCodeToName: Record<string, string> = {
  'ae': 'United Arab Emirates',
  'af': 'Afghanistan',
  'al': 'Albania',
  'am': 'Armenia',
  'ao': 'Angola',
  'ar': 'Argentina',
  'at': 'Austria',
  'au': 'Australia',
  'az': 'Azerbaijan',
  'ba': 'Bosnia and Herzegovina',
  'bd': 'Bangladesh',
  'be': 'Belgium',
  'bf': 'Burkina Faso',
  'bg': 'Bulgaria',
  'bi': 'Burundi',
  'bj': 'Benin',
  'bn': 'Brunei Darussalam',
  'bo': 'Bolivia',
  'br': 'Brazil',
  'bs': 'Bahamas',
  'bt': 'Bhutan',
  'bw': 'Botswana',
  'by': 'Belarus',
  'bz': 'Belize',
  'ca': 'Canada',
  'cd': 'Democratic Republic of Congo',
  'cf': 'Central African Republic',
  'cg': 'Republic of Congo',
  'ch': 'Switzerland',
  'ci': 'Côte d\'Ivoire',
  'cl': 'Chile',
  'cm': 'Cameroon',
  'cn': 'China',
  'co': 'Colombia',
  'cr': 'Costa Rica',
  'cu': 'Cuba',
  'cy': 'Cyprus',
  'cz': 'Czech Republic',
  'de': 'Germany',
  'dj': 'Djibouti',
  'dk': 'Denmark',
  'do': 'Dominican Republic',
  'dz': 'Algeria',
  'ec': 'Ecuador',
  'ee': 'Estonia',
  'eg': 'Egypt',
  'eh': 'Western Sahara',
  'er': 'Eritrea',
  'es': 'Spain',
  'et': 'Ethiopia',
  'fk': 'Falkland Islands',
  'fi': 'Finland',
  'fj': 'Fiji',
  'fr': 'France',
  'ga': 'Gabon',
  'gb': 'United Kingdom',
  'ge': 'Georgia',
  'gf': 'French Guiana',
  'gh': 'Ghana',
  'gl': 'Greenland',
  'gm': 'Gambia',
  'gn': 'Guinea',
  'gq': 'Equatorial Guinea',
  'gr': 'Greece',
  'gt': 'Guatemala',
  'gw': 'Guinea-Bissau',
  'gy': 'Guyana',
  'hn': 'Honduras',
  'hr': 'Croatia',
  'ht': 'Haiti',
  'hu': 'Hungary',
  'id': 'Indonesia',
  'ie': 'Ireland',
  'il': 'Israel',
  'in': 'India',
  'iq': 'Iraq',
  'ir': 'Iran',
  'is': 'Iceland',
  'it': 'Italy',
  'jm': 'Jamaica',
  'jo': 'Jordan',
  'jp': 'Japan',
  'ke': 'Kenya',
  'kg': 'Kyrgyzstan',
  'kh': 'Cambodia',
  'kp': 'North Korea',
  'kr': 'South Korea',
  'xk': 'Kosovo',
  'kw': 'Kuwait',
  'kz': 'Kazakhstan',
  'la': 'Lao People\'s Democratic Republic',
  'lb': 'Lebanon',
  'lk': 'Sri Lanka',
  'lr': 'Liberia',
  'ls': 'Lesotho',
  'lt': 'Lithuania',
  'lu': 'Luxembourg',
  'lv': 'Latvia',
  'ly': 'Libya',
  'ma': 'Morocco',
  'md': 'Moldova',
  'me': 'Montenegro',
  'mg': 'Madagascar',
  'mk': 'Macedonia',
  'ml': 'Mali',
  'mm': 'Myanmar',
  'mn': 'Mongolia',
  'mr': 'Mauritania',
  'mt': 'Malta',
  'mw': 'Malawi',
  'mx': 'Mexico',
  'my': 'Malaysia',
  'mz': 'Mozambique',
  'na': 'Namibia',
  'nc': 'New Caledonia',
  'ne': 'Niger',
  'ng': 'Nigeria',
  'ni': 'Nicaragua',
  'nl': 'Netherlands',
  'no': 'Norway',
  'np': 'Nepal',
  'nz': 'New Zealand',
  'om': 'Oman',
  'pa': 'Panama',
  'pe': 'Peru',
  'pg': 'Papua New Guinea',
  'ph': 'Philippines',
  'pk': 'Pakistan',
  'pl': 'Poland',
  'pr': 'Puerto Rico',
  'ps': 'Palestinian Territories',
  'pt': 'Portugal',
  'py': 'Paraguay',
  'qa': 'Qatar',
  'ro': 'Romania',
  'rs': 'Serbia',
  'ru': 'Russia',
  'rw': 'Rwanda',
  'sa': 'Saudi Arabia',
  'sb': 'Solomon Islands',
  'sd': 'Sudan',
  'se': 'Sweden',
  'si': 'Slovenia',
  'sj': 'Svalbard and Jan Mayen',
  'sk': 'Slovakia',
  'sl': 'Sierra Leone',
  'sn': 'Senegal',
  'so': 'Somalia',
  'sr': 'Suriname',
  'ss': 'South Sudan',
  'sv': 'El Salvador',
  'sy': 'Syria',
  'sz': 'Swaziland',
  'td': 'Chad',
  'tf': 'French Southern and Antarctic Lands',
  'tg': 'Togo',
  'th': 'Thailand',
  'tj': 'Tajikistan',
  'tl': 'Timor-Leste',
  'tm': 'Turkmenistan',
  'tn': 'Tunisia',
  'tr': 'Turkey',
  'tt': 'Trinidad and Tobago',
  'tw': 'Taiwan',
  'tz': 'Tanzania',
  'ua': 'Ukraine',
  'ug': 'Uganda',
  'us': 'United States',
  'uy': 'Uruguay',
  'uz': 'Uzbekistan',
  've': 'Venezuela',
  'vn': 'Vietnam',
  'vu': 'Vanuatu',
  'ye': 'Yemen',
  'za': 'South Africa',
  'zm': 'Zambia',
  'zw': 'Zimbabwe',
};

// Helper function to get country code from country name
const getCountryCode = (countryName: string): string => {
  // Direct mapping
  const directMap: Record<string, string> = {
    // Common country name variations
    'United States': 'us',
    'USA': 'us',
    'US': 'us',
    'United Kingdom': 'gb',
    'UK': 'gb',
    'Britain': 'gb',
    'South Korea': 'kr',
    'North Korea': 'kp',
    'Democratic Republic of Congo': 'cd',
    'Republic of Congo': 'cg',
    'Côte d\'Ivoire': 'ci',
    'Ivory Coast': 'ci',
    'Brunei Darussalam': 'bn',
    'Brunei': 'bn',
    'Lao People\'s Democratic Republic': 'la',
    'Laos': 'la',
    'Palestinian Territories': 'ps',
    'Palestine': 'ps',
    'Svalbard and Jan Mayen': 'sj',
    'French Southern and Antarctic Lands': 'tf',
    'Timor-Leste': 'tl',
    'East Timor': 'tl',
    'Trinidad and Tobago': 'tt',
    
    // All countries from pairs.txt
    'United Arab Emirates': 'ae',
    'Afghanistan': 'af',
    'Albania': 'al',
    'Armenia': 'am',
    'Angola': 'ao',
    'Argentina': 'ar',
    'Austria': 'at',
    'Australia': 'au',
    'Azerbaijan': 'az',
    'Bosnia and Herzegovina': 'ba',
    'Bangladesh': 'bd',
    'Belgium': 'be',
    'Burkina Faso': 'bf',
    'Bulgaria': 'bg',
    'Burundi': 'bi',
    'Benin': 'bj',
    'Bolivia': 'bo',
    'Brazil': 'br',
    'Bahamas': 'bs',
    'Bhutan': 'bt',
    'Botswana': 'bw',
    'Belarus': 'by',
    'Belize': 'bz',
    'Canada': 'ca',
    'Central African Republic': 'cf',
    'Switzerland': 'ch',
    'Chile': 'cl',
    'Cameroon': 'cm',
    'China': 'cn',
    'Colombia': 'co',
    'Costa Rica': 'cr',
    'Cuba': 'cu',
    'Cyprus': 'cy',
    'Czech Republic': 'cz',
    'Germany': 'de',
    'Djibouti': 'dj',
    'Denmark': 'dk',
    'Dominican Republic': 'do',
    'Algeria': 'dz',
    'Ecuador': 'ec',
    'Estonia': 'ee',
    'Egypt': 'eg',
    'Western Sahara': 'eh',
    'Eritrea': 'er',
    'Spain': 'es',
    'Ethiopia': 'et',
    'Falkland Islands': 'fk',
    'Finland': 'fi',
    'Fiji': 'fj',
    'France': 'fr',
    'Gabon': 'ga',
    'Georgia': 'ge',
    'French Guiana': 'gf',
    'Ghana': 'gh',
    'Greenland': 'gl',
    'Gambia': 'gm',
    'Guinea': 'gn',
    'Equatorial Guinea': 'gq',
    'Greece': 'gr',
    'Guatemala': 'gt',
    'Guinea-Bissau': 'gw',
    'Guyana': 'gy',
    'Honduras': 'hn',
    'Croatia': 'hr',
    'Haiti': 'ht',
    'Hungary': 'hu',
    'Indonesia': 'id',
    'Ireland': 'ie',
    'Israel': 'il',
    'India': 'in',
    'Iraq': 'iq',
    'Iran': 'ir',
    'Iceland': 'is',
    'Italy': 'it',
    'Jamaica': 'jm',
    'Jordan': 'jo',
    'Japan': 'jp',
    'Kenya': 'ke',
    'Kyrgyzstan': 'kg',
    'Cambodia': 'kh',
    'Kosovo': 'xk',
    'Kuwait': 'kw',
    'Kazakhstan': 'kz',
    'Lebanon': 'lb',
    'Sri Lanka': 'lk',
    'Liberia': 'lr',
    'Lesotho': 'ls',
    'Lithuania': 'lt',
    'Luxembourg': 'lu',
    'Latvia': 'lv',
    'Libya': 'ly',
    'Morocco': 'ma',
    'Moldova': 'md',
    'Montenegro': 'me',
    'Madagascar': 'mg',
    'Macedonia': 'mk',
    'Mali': 'ml',
    'Myanmar': 'mm',
    'Mongolia': 'mn',
    'Mauritania': 'mr',
    'Malta': 'mt',
    'Malawi': 'mw',
    'Mexico': 'mx',
    'Malaysia': 'my',
    'Mozambique': 'mz',
    'Namibia': 'na',
    'New Caledonia': 'nc',
    'Niger': 'ne',
    'Nigeria': 'ng',
    'Nicaragua': 'ni',
    'Netherlands': 'nl',
    'Norway': 'no',
    'Nepal': 'np',
    'New Zealand': 'nz',
    'Oman': 'om',
    'Panama': 'pa',
    'Peru': 'pe',
    'Papua New Guinea': 'pg',
    'Philippines': 'ph',
    'Pakistan': 'pk',
    'Poland': 'pl',
    'Puerto Rico': 'pr',
    'Portugal': 'pt',
    'Paraguay': 'py',
    'Qatar': 'qa',
    'Romania': 'ro',
    'Serbia': 'rs',
    'Russia': 'ru',
    'Rwanda': 'rw',
    'Saudi Arabia': 'sa',
    'Solomon Islands': 'sb',
    'Sudan': 'sd',
    'Sweden': 'se',
    'Slovenia': 'si',
    'Slovakia': 'sk',
    'Sierra Leone': 'sl',
    'Senegal': 'sn',
    'Somalia': 'so',
    'Suriname': 'sr',
    'South Sudan': 'ss',
    'El Salvador': 'sv',
    'Syria': 'sy',
    'Swaziland': 'sz',
    'Chad': 'td',
    'Togo': 'tg',
    'Thailand': 'th',
    'Tajikistan': 'tj',
    'Turkmenistan': 'tm',
    'Tunisia': 'tn',
    'Turkey': 'tr',
    'Taiwan': 'tw',
    'Tanzania': 'tz',
    'Ukraine': 'ua',
    'Uganda': 'ug',
    'Uruguay': 'uy',
    'Uzbekistan': 'uz',
    'Venezuela': 've',
    'Vietnam': 'vn',
    'Vanuatu': 'vu',
    'Yemen': 'ye',
    'South Africa': 'za',
    'Zambia': 'zm',
    'Zimbabwe': 'zw',
  };

  if (directMap[countryName]) {
    return directMap[countryName];
  }

  // Try to find by country name in the reverse mapping
  const code = Object.entries(countryCodeToName).find(
    ([, name]) => name.toLowerCase() === countryName.toLowerCase()
  )?.[0];

  return code || countryName.toLowerCase().slice(0, 2);
};

// Helper function to get color intensity based on visit count
const getColorIntensity = (value: number, maxValue: number): string => {
  if (value === 0) return '#e4e4e7'; // zinc-300
  
  const intensity = Math.min(value / maxValue, 1);
  
  if (intensity <= 0.2) return '#ddd6fe'; // violet-200
  if (intensity <= 0.4) return '#c4b5fd'; // violet-300
  if (intensity <= 0.6) return '#a78bfa'; // violet-400
  if (intensity <= 0.8) return '#8b5cf6'; // violet-500
  return '#7c3aed'; // violet-600
};

const WorldMapComponent: React.FC<WorldMapComponentProps> = ({ data }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Process data for mapping
  const countryData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    let maxValue = 0;

    data.forEach(item => {
      const countryCode = getCountryCode(item.name);
      dataMap[countryCode] = item.value;
      maxValue = Math.max(maxValue, item.value);
    });

    return { dataMap, maxValue };
  }, [data]);

  const handleMouseEnter = (event: React.MouseEvent, countryId: string) => {
    setHoveredCountry(countryId);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
  };

  const getCountryVisits = (countryId: string): number => {
    return countryData.dataMap[countryId] || 0;
  };

  const getCountryName = (countryId: string): string => {
    return countryCodeToName[countryId] || countryId.toUpperCase();
  };

  if (!mapData.layers || mapData.layers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 dark:text-zinc-400">Map data not available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* SVG Map */}
      <div className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4">
        <svg
          viewBox={mapData.viewBox}
          className="w-full h-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        >
          {mapData.layers.map((country) => {
            const visits = getCountryVisits(country.id);
            const fillColor = getColorIntensity(visits, countryData.maxValue);
            const isHovered = hoveredCountry === country.id;
            
            return (
              <path
                key={country.id}
                d={country.d}
                fill={fillColor}
                stroke={isHovered ? '#7c3aed' : '#ffffff'}
                strokeWidth={isHovered ? 2 : 0.5}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  filter: isHovered ? 'brightness(1.1)' : 'none'
                }}
                onMouseEnter={(e) => handleMouseEnter(e, country.id)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredCountry && (
        <div
          className="fixed z-50 bg-zinc-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 40,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-medium">{getCountryName(hoveredCountry)}</div>
          <div className="text-zinc-300">
            {getCountryVisits(hoveredCountry)} visits
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <span>Fewer visits</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-zinc-300 dark:bg-zinc-600 rounded-sm" />
          <div className="w-4 h-3 bg-violet-200 rounded-sm" />
          <div className="w-4 h-3 bg-violet-300 rounded-sm" />
          <div className="w-4 h-3 bg-violet-400 rounded-sm" />
          <div className="w-4 h-3 bg-violet-500 rounded-sm" />
          <div className="w-4 h-3 bg-violet-600 rounded-sm" />
        </div>
        <span>More visits</span>
      </div>

      {/* Top Countries List */}
      {data.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Top Countries</h4>
          <div className="space-y-1">
            {data.slice(0, 5).map((country, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">{country.name}</span>
                <span className="font-medium text-violet-600">{country.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMapComponent;