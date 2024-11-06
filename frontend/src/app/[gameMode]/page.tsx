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
  const gameModeDir = path.join(process.cwd(), 'public', 'data', gameMode);
  
  try {
    const maps = await fs.promises.readdir(gameModeDir);
    return maps;
  } catch {
    console.error(`Error reading maps for ${gameMode}`);
    return [];
  }
}

// Add this function to get total games for a map
async function getMapGames(gameMode: string, mapName: string) {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', gameMode, mapName, '700-trophies.json');
    const fileContent = await fs.promises.readFile(dataPath, 'utf8');
    const data = JSON.parse(fileContent);
    return data.reduce((total: number, stat: { games_played: number }) => total + stat.games_played, 0);
  } catch {
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
  trophythieves: 'Zombie Plunder',
  payload: 'Payload',
  volleybrawl: 'Volley Brawl'
};

function getMapImagePath(gameMode: string, mapName: string): string {
  const formattedGameMode = gameModeLabels[gameMode].toLowerCase().replace(/ /g, '_');
  const formattedMapName = mapName.toLowerCase().replace(/ /g, '_');
  return `/game_maps/${formattedGameMode}/${formattedMapName}.png`;
}

export default async function GameModePage({ params }: GameModePageProps) {
  const { gameMode } = await params;
  
  const validGameModes = ['brawlball', 'gemgrab', 'heist', 'knockout', 'bounty', 'hotzone', 'trophythieves', 'payload', 'volleybrawl'];
  
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
  ).then(stats => stats.filter(map => map.games >= 100000));  // Filter maps with < 100k games

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