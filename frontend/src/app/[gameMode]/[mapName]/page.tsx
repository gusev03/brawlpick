'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrawlerStats {
  brawler: string;
  games_played: number;
  win_rate: number;
}

interface TeamComposition {
  team: string[];
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
  const [viewMode, setViewMode] = useState<'trophies' | 'ranked' | 'teams'>();
  const [rank, setRank] = useState(10);
  const [teamStats, setTeamStats] = useState<TeamComposition[]>([]);

  const [hasTrophyData, setHasTrophyData] = useState(true);
  const [hasRankedData, setHasRankedData] = useState(true);

  const [selectedBrawlers, setSelectedBrawlers] = useState<string[]>([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchData = useCallback(async (level: number) => {
    try {
      let endpoint;
      const subFolder = viewMode === 'trophies' || viewMode === 'teams' ? 'trophies' : 'ranked';
      
      if (viewMode === 'ranked') {
        endpoint = `/data/${gameMode}/${mapName}/ranked/brawler-${rank}-rank.json`;
      } else if (viewMode === 'teams') {
        endpoint = `/data/${gameMode}/${mapName}/${subFolder}/team-${level}-trophies.json`;
      } else {
        endpoint = `/data/${gameMode}/${mapName}/${subFolder}/brawler-${level}-trophies.json`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Data not found');
      const data = await response.json();
      if (viewMode === 'teams') {
        setTeamStats(data);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (viewMode === 'teams') {
        setTeamStats([]);
      } else {
        setStats([]);
      }
    }
  }, [gameMode, mapName, viewMode, rank]);

  useEffect(() => {
    const checkDataAvailability = async () => {
      try {
        const trophyResponse = await fetch(`/data/${gameMode}/${mapName}/trophies/brawler-700-trophies.json`);
        const hasTrophy = trophyResponse.ok;
        setHasTrophyData(hasTrophy);

        const rankedResponse = await fetch(`/data/${gameMode}/${mapName}/ranked/brawler-10-rank.json`);
        const hasRanked = rankedResponse.ok;
        setHasRankedData(hasRanked);

        if (!viewMode) {
          if (hasTrophy) {
            setViewMode('trophies');
          } else if (hasRanked) {
            setViewMode('ranked');
          }
        }
      } catch (error) {
        console.error('Error checking data availability:', error);
      }
    };

    checkDataAvailability();
  }, [gameMode, mapName, viewMode]);

  useEffect(() => {
    if (!viewMode) return;

    if (viewMode === 'ranked') {
      fetchData(0);
    } else {
      fetchData(700);
    }
  }, [viewMode, rank, gameMode, mapName, fetchData]);

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

  const ViewModeSelector = () => {
    const viewModeOptions = [
      { id: 'trophies', label: 'Brawlers', icon: '/ranks/icon_trophy.png', show: hasTrophyData },
      { id: 'teams', label: 'Teams', icon: '/ranks/icon_trophy.png', show: hasTrophyData },
      { id: 'ranked', label: 'Ranked', icon: '/ranks/icon_ranked_front.png', show: hasRankedData }
    ].filter(option => option.show);

    if (viewModeOptions.length === 0) return null;

    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">View Mode:</span>
        <div className="grid grid-flow-col auto-cols-fr rounded-lg shadow-sm bg-white dark:bg-gray-800 w-fit">
          {viewModeOptions.map(({ id, label, icon }, index) => (
            <button
              key={id}
              onClick={() => setViewMode(id as 'trophies' | 'ranked' | 'teams')}
              className={`
                relative px-3 py-1 text-sm font-medium
                transition-all duration-200 ease-out flex items-center gap-1 justify-center
                ${viewMode === id 
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                ${index === 0 ? 'rounded-l-lg' : ''}
                ${index === viewModeOptions.length - 1 ? 'rounded-r-lg' : ''}
                border-r border-gray-200 dark:border-gray-700
                last:border-r-0
              `}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <Image src={icon} alt="" width={16} height={16} className="max-w-full max-h-full object-contain" />
              </div>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const RankSelector = () => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">Rank:</span>
      <div className="inline-flex rounded-lg shadow-sm bg-white dark:bg-gray-800">
        {[
          { label: 'Diamond+', value: 10, icon: '/ranks/icon_ranked_diamond.png' },
          { label: 'Mythic+', value: 13, icon: '/ranks/icon_ranked_mythic.png' },
          { label: 'Legendary+', value: 16, icon: '/ranks/icon_ranked_legendary.png' },
          { label: 'Masters', value: 19, icon: '/ranks/icon_ranked_masters.png' }
        ].map(({ label, value, icon }) => (
          <button
            key={value}
            onClick={() => {
              setRank(value);
              fetchData(0);
            }}
            className={`
              relative px-3 py-1 text-sm font-medium
              transition-all duration-200 ease-out flex items-center gap-1
              ${rank === value 
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
              ${value === 10 ? 'rounded-l-lg' : ''}
              ${value === 19 ? 'rounded-r-lg' : ''}
              border-r border-gray-200 dark:border-gray-700
              last:border-r-0
            `}
          >
            <Image src={icon} alt="" width={16} height={16} className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  const BrawlerFilter = () => {
    const uniqueBrawlers = Array.from(
      new Set(teamStats.flatMap(comp => comp.team))
    ).sort();

    const handleBrawlerSelect = (brawler: string) => {
      setSelectedBrawlers(prev => {
        if (prev.includes(brawler)) {
          return prev.filter(b => b !== brawler);
        }
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, brawler];
      });
    };

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(prev => !prev)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
              <svg
                className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Filter by Brawler
            </button>
            {selectedBrawlers.length > 0 && (
              <div className="flex items-center gap-1">
                {selectedBrawlers.map(brawler => (
                  <div
                    key={brawler}
                    className="flex items-center gap-1 bg-blue-500 text-white px-2 py-0.5 rounded-full text-sm"
                  >
                    <Image
                      src={`/characters/${brawler.toLowerCase().replace(/[ .-]/g, '')}_portrait.png`}
                      alt={brawler}
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                    {brawler}
                    <button
                      onClick={() => setSelectedBrawlers(prev => prev.filter(b => b !== brawler))}
                      className="ml-1 hover:text-blue-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSelectedBrawlers([])}
                  className="text-sm text-gray-500 hover:text-red-500 ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
          {selectedBrawlers.length >= 3 && (
            <span className="text-sm text-amber-500">
              Maximum of 3 brawlers reached
            </span>
          )}
        </div>

        {isFilterOpen && (
          <div className="grid grid-cols-6 gap-2 mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {uniqueBrawlers.map(brawler => (
              <button
                key={brawler}
                onClick={() => handleBrawlerSelect(brawler)}
                disabled={!selectedBrawlers.includes(brawler) && selectedBrawlers.length >= 3}
                className={`
                  flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm
                  transition-all duration-200 ease-out
                  ${selectedBrawlers.includes(brawler)
                    ? 'bg-blue-500 text-white'
                    : selectedBrawlers.length >= 3
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Image
                  src={`/characters/${brawler.toLowerCase().replace(/[ .-]/g, '')}_portrait.png`}
                  alt={brawler}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
                {brawler}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const TeamCompositions = () => (
    <div className="space-y-2 mb-8">
      <BrawlerFilter />
      {teamStats
        .filter(stat => stat.games_played >= minGames)
        .filter(stat => 
          selectedBrawlers.length === 0 || 
          selectedBrawlers.every(brawler => stat.team.includes(brawler))
        )
        .sort((a, b) => b.win_rate - a.win_rate)
        .map((comp, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="flex items-center p-1.5">
              <div className="flex-grow grid grid-cols-3 gap-2 w-[600px]">
                {comp.team.map((brawler, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0 flex items-center justify-start">
                      <Image
                        src={`/characters/${brawler.toLowerCase().replace(/[ .-]/g, '')}_portrait.png`}
                        alt={brawler}
                        width={48}
                        height={48}
                        className="h-[40px] w-auto object-contain"
                      />
                    </div>
                    <span className="ml-3 font-bold text-base text-gray-800 dark:text-gray-100">{brawler}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mr-3">
                <div className="text-right w-24">
                  <p className={`font-bold text-lg ${getWinRateColor(comp.win_rate)}`}>
                    {(comp.win_rate * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                </div>
                <div className="text-right w-24">
                  <p className="text-gray-800 dark:text-gray-200 font-bold text-lg">
                    {comp.games_played}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Games</p>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );

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

        <ViewModeSelector />

        <div className="mb-8 flex justify-end gap-6">
          {viewMode === 'ranked' ? (
            <RankSelector />
          ) : viewMode === 'trophies' || viewMode === 'teams' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Trophy Range:</span>
                <div className="inline-flex rounded-lg shadow-sm bg-white dark:bg-gray-800">
                  {[700, 800, 900, 1000].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleTrophyLevelChange(value)}
                      className={`
                        relative px-3 py-1 text-sm font-medium
                        transition-all duration-200 ease-out flex items-center gap-1
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
                      <Image src="/ranks/icon_trophy.png" alt="" width={16} height={16} className="w-4 h-4" />
                      {value}+
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Minimum Games:</span>
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
            </>
          ) : null}
        </div>

        {viewMode === 'teams' ? (
          <TeamCompositions />
        ) : (
          <>
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
                      <div className="h-12 w-12 flex-shrink-0 flex items-center justify-start">
                        <Image
                          src={`/characters/${stat.brawler.toLowerCase().replace(/[ .-]/g, '')}_portrait.png`}
                          alt={stat.brawler}
                          width={48}
                          height={48}
                          className="h-[40px] w-auto object-contain"
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
                          <div className="h-12 w-12 flex-shrink-0 flex items-center justify-start">
                            <Image
                              src={`/characters/${stat.brawler.toLowerCase().replace(/[ .-]/g, '')}_portrait.png`}
                              alt={stat.brawler}
                              width={48}
                              height={48}
                              className="h-[40px] w-auto object-contain"
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
          </>
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