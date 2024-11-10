import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MapImage from '@/components/MapImage';

interface GameModePageProps {
  params: Promise<{
    gameMode: string;
  }>;
}

// Add this function to get maps for a specific game mode
async function getMapsForGameMode(gameMode: string) {
  const gameModeToFolder: { [key: string]: string } = {
    brawlball: 'brawlBall',
    gemgrab: 'gemGrab',
    heist: 'heist',
    knockout: 'knockout',
    bounty: 'bounty',
    hotzone: 'hotZone',
    siege: 'siege'
  };

  const folderName = gameModeToFolder[gameMode];
  const gameModeDir = path.join(process.cwd(), 'public', 'data', folderName);
  
  try {
    // Get all map folders
    const mapFolders = await fs.promises.readdir(gameModeDir);
    return mapFolders;
  } catch (error) {
    console.error(`Error reading maps for ${gameMode}:`, error);
    return [];
  }
}

// Add this function to get total games for a map
async function getMapGames(gameMode: string, mapName: string) {
  const gameModeToFolder: { [key: string]: string } = {
    brawlball: 'brawlBall',
    gemgrab: 'gemGrab',
    heist: 'heist',
    knockout: 'knockout',
    bounty: 'bounty',
    hotzone: 'hotZone',
    siege: 'siege'
  };

  try {
    // First try to read from trophies folder
    const trophiesPath = path.join(
      process.cwd(), 
      'public', 
      'data', 
      gameModeToFolder[gameMode], 
      mapName, 
      'trophies',
      'brawler-700-trophies.json'
    );

    // If trophies file doesn't exist, try ranked folder
    const rankedPath = path.join(
      process.cwd(), 
      'public', 
      'data', 
      gameModeToFolder[gameMode], 
      mapName, 
      'ranked',
      'brawler-10-rank.json'
    );

    let fileContent;
    try {
      fileContent = await fs.promises.readFile(trophiesPath, 'utf8');
    } catch {
      fileContent = await fs.promises.readFile(rankedPath, 'utf8');
    }

    const data = JSON.parse(fileContent);
    return data.reduce((total: number, stat: { games_played: number }) => total + stat.games_played, 0);
  } catch (error) {
    console.error(`Error reading map games for ${mapName}:`, error);
    return 0;
  }
}

const gameModeLabels: { [key: string]: string } = {
  brawlball: 'Brawl Ball',
  gemgrab: 'Gem Grab',
  heist: 'Heist',
  knockout: 'Knock Out',
  bounty: 'Bounty',
  hotzone: 'Hot Zone',
  siege: 'Siege'
};

function getMapImagePath(gameMode: string, mapName: string): string {
  const gameModeToFolder: { [key: string]: string } = {
    brawlball: 'brawl_ball',
    gemgrab: 'gem_grab',
    heist: 'heist',
    knockout: 'knock_out',
    bounty: 'bounty',
    hotzone: 'hot_zone',
    siege: 'siege'
  };

  const formattedMapName = mapName.toLowerCase().replace(/ /g, '_');
  return `/game_maps/${gameModeToFolder[gameMode]}/${formattedMapName}.png`;
}

export default async function GameModePage({ params }: GameModePageProps) {
  const { gameMode } = await params;
  
  const validGameModes = ['brawlball', 'gemgrab', 'heist', 'knockout', 'bounty', 'hotzone', 'siege'];
  
  if (!validGameModes.includes(gameMode)) {
    notFound();
  }

  // Get all maps for this game mode
  const maps = await getMapsForGameMode(gameMode);

  // Get all maps and their game counts
  const mapStats = await Promise.all(
    maps.map(async (map) => ({
      name: map,
      games: await getMapGames(gameMode, map)
    }))
  ).then(stats => stats.filter(map => map.games >= 5000));

  return (
    <main className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-block mb-6 text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← Back to Home
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">{gameModeLabels[gameMode]}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mapStats
          .sort((a, b) => b.games - a.games)  // Sort by number of games in descending order
          .map(({ name, games }) => (
          <Link
            key={name}
            href={`/${gameMode}/${name}`}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="aspect-[4/3] mb-3 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <MapImage
                src={getMapImagePath(gameMode, name)}
                alt={`${name} map`}
              />
            </div>
            <h2 className="text-lg font-semibold mb-1">
              {name.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {games.toLocaleString()} brawler selections
            </p>
          </Link>
        ))}
      </div>
      
      {mapStats.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
          No maps available for this game mode.
        </p>
      )}
    </main>
  );
} 