// Create a new dynamic route page that handles all game modes
interface GameModePageProps {
  params: {
    gameMode: string;
  }
}

export default function GameModePage({ params: { gameMode } }: GameModePageProps) {
  // Add validation for valid game modes
  const validGameModes = ['brawlball', 'gemgrab', 'heist', 'knockout', 'bounty', 'hotzone', 'zombieplunder', 'payload', 'volleybrawl'];
  
  // Game mode display names mapping
  const gameModeLabels: { [key: string]: string } = {
    brawlball: 'Brawl Ball',
    gemgrab: 'Gem Grab',
    heist: 'Heist',
    knockout: 'Knock Out',
    bounty: 'Bounty',
    hotzone: 'Hot Zone',
    duels: 'Duels',
    basketbrawl: 'Basket Brawl',
    volleybrawl: 'Volley Brawl'
  };
  
  if (!validGameModes.includes(gameMode)) {
    // Handle invalid game mode - could redirect or show error
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{gameModeLabels[gameMode]}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add your game mode specific content here */}
        {/* This could include: */}
        {/* - Best brawlers for this mode */}
        {/* - Current map rotation */}
        {/* - Strategy tips */}
        {/* - Statistics */}
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Mode Description</h2>
        <p className="text-gray-700 dark:text-gray-300">
          {/* Add mode-specific description here */}
          Description for {gameModeLabels[gameMode]}
        </p>
      </div>
    </main>
  );
} 