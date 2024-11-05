'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';

interface BrawlerStats {
  brawler: string;
  games_played: number;
  win_rate: number;
}

interface MapPageProps {
  params: Promise<{
    gameMode: string;
    mapName: string;
  }>
}

export default function MapPage({ params }: MapPageProps) {
  const { gameMode, mapName } = use(params);
  const [trophyLevel, setTrophyLevel] = useState(700);
  const [stats, setStats] = useState<BrawlerStats[]>([]);
  const [minGames, setMinGames] = useState(500);
  
  // Fetch data when trophy level changes
  const fetchData = async (level: number) => {
    try {
      const response = await fetch(`/data/${gameMode}/${mapName}/${level}-trophies.json`);
      if (!response.ok) throw new Error('Data not found');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setStats([]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData(700);
  }, [gameMode, mapName]);

  // Update data when trophy level changes
  const handleTrophyLevelChange = (level: number) => {
    setTrophyLevel(level);
    fetchData(level);
  };

  const getWinRateColor = (winRate: number) => {
    const percentage = winRate * 100;
    if (percentage >= 57) return 'text-emerald-500 dark:text-emerald-400';
    if (percentage >= 55) return 'text-green-500 dark:text-green-400';
    if (percentage >= 53) return 'text-lime-500 dark:text-lime-400';
    if (percentage >= 51) return 'text-yellow-500 dark:text-yellow-400';
    if (percentage >= 49) return 'text-amber-500 dark:text-amber-400';
    if (percentage >= 47) return 'text-orange-500 dark:text-orange-400';
    if (percentage >= 45) return 'text-rose-500 dark:text-rose-400';
    if (percentage >= 43) return 'text-red-500 dark:text-red-400';
    return 'text-red-700 dark:text-red-600';
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${gameMode}`}
          className="inline-flex items-center mb-4 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Maps
        </Link>

        <h1 className="text-3xl font-bold mb-6">
          {decodeURIComponent(mapName).split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </h1>

        {/* Replace the two separate selector sections with this new combined filters section */}
        <div className="mb-8 flex justify-end gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Trophy Range:</span>
            <div className="inline-flex rounded-lg shadow-sm bg-white dark:bg-gray-800">
              {[700, 800, 900, 1000].map((value) => (
                <button
                  key={value}
                  onClick={() => handleTrophyLevelChange(value)}
                  className={`
                    relative px-3 py-1 text-sm font-medium
                    transition-all duration-200 ease-out
                    ${trophyLevel === value 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                    ${value === 700 ? 'rounded-l-lg' : ''}
                    ${value === 1000 ? 'rounded-r-lg' : ''}
                    border-r border-gray-200 dark:border-gray-700
                    last:border-r-0
                  `}
                >
                  {value}+
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Min Games:</span>
            <div className="inline-flex rounded-lg shadow-sm bg-white dark:bg-gray-800">
              {[100, 250, 500, 1000, 2000].map((value) => (
                <button
                  key={value}
                  onClick={() => setMinGames(value)}
                  className={`
                    relative px-3 py-1 text-sm font-medium
                    transition-all duration-200 ease-out
                    ${minGames === value 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                    ${value === 100 ? 'rounded-l-lg' : ''}
                    ${value === 2000 ? 'rounded-r-lg' : ''}
                    border-r border-gray-200 dark:border-gray-700
                    last:border-r-0
                  `}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main brawlers section */}
        <div className="space-y-2 mb-8">
          {stats
            .filter(stat => stat.games_played >= minGames)
            .sort((a, b) => b.win_rate - a.win_rate)
            .map((stat) => (
              <div
                key={stat.brawler}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="flex items-center p-1.5">
                  <div className="h-12 w-12 flex-shrink-0">
                    <img
                      src={`/characters/${stat.brawler.toLowerCase().replace(/[ .-]/g, '')}_portrait.png`}
                      alt={stat.brawler}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <h3 className="font-bold text-base text-gray-800 dark:text-gray-100">
                      {stat.brawler}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 mr-3">
                    <div className="text-right w-24">
                      <p className={`font-bold text-lg ${getWinRateColor(stat.win_rate)}`}>
                        {(stat.win_rate * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                    </div>
                    <div className="text-right w-24">
                      <p className="text-gray-800 dark:text-gray-200 font-bold text-lg">
                        {stat.games_played.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Games</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Underplayed brawlers section */}
        {stats.some(stat => stat.games_played < minGames) && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Underplayed Brawlers
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                (Less than {minGames} games)
              </span>
            </h2>
            <div className="space-y-2">
              {stats
                .filter(stat => stat.games_played < minGames)
                .sort((a, b) => b.win_rate - a.win_rate)
                .map((stat) => (
                  <div
                    key={stat.brawler}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden opacity-75"
                  >
                    <div className="flex items-center p-1.5">
                      <div className="h-12 w-12 flex-shrink-0">
                        <img
                          src={`/characters/${stat.brawler.toLowerCase().replace(/[ .-]/g, '')}_portrait.png`}
                          alt={stat.brawler}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <h3 className="font-bold text-base text-gray-800 dark:text-gray-100">
                          {stat.brawler}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 mr-3">
                        <div className="text-right w-24">
                          <p className={`font-bold text-lg ${getWinRateColor(stat.win_rate)}`}>
                            {(stat.win_rate * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                        </div>
                        <div className="text-right w-24">
                          <p className="text-gray-800 dark:text-gray-200 font-bold text-lg">
                            {stat.games_played.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Games</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {stats.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
            No data available for this trophy range.
          </p>
        )}
      </div>
    </main>
  );
} 