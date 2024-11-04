import asyncio
import asyncpg
import os
import json
from collections import defaultdict

# Trophy buckets: 700+, 800+, ..., 1200+
TROPHY_BUCKETS = [700, 800, 900, 1000, 1100, 1200]

async def main():
    # Check environment variables
    print("\nChecking environment variables...")

    for var in ['POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD']:
        if not os.getenv(var):
            raise EnvironmentError(f"❌ {var} not set")
    
    # Connect to the database
    print("\nTrying to connect to the database...")
    
    try:
        conn = await asyncpg.connect(
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            database=os.getenv('POSTGRES_DB'),
            host=os.getenv('POSTGRES_HOST'),
            port=os.getenv('POSTGRES_PORT'),
            timeout=float(os.getenv('POSTGRES_TIMEOUT', 30))
        )
    except Exception as e:
        print(f"\n❌ Error connecting to the database: {e}")
        return

    try:
        print("\nConnection successful.")

        # Prepare the SQL query
        # We'll generate a CTE that computes the applicable trophy buckets for each battle
        sql_query = f"""
            WITH bucketed_battles AS (
                SELECT
                    game_mode,
                    game_map,
                    brawler,
                    result,
                    rank,
                    unnest(array{TROPHY_BUCKETS}) AS bucket
                FROM battles
                WHERE
                    game_type = 'ranked' AND
                    rank >= ANY(array{TROPHY_BUCKETS})
            )
            SELECT
                game_mode,
                game_map,
                bucket,
                brawler,
                COUNT(*) AS games_played,
                SUM(CASE WHEN result = 'victory' THEN 1 ELSE 0 END) AS victories
            FROM bucketed_battles
            WHERE rank >= bucket
            GROUP BY game_mode, game_map, bucket, brawler
        """

        print("\nExecuting aggregation query...")
        records = await conn.fetch(sql_query)

        if not records:
            print("No data found.")
            return

        print("\nProcessing records and writing JSON files...")

        # Organize data into a nested dictionary
        # data[game_mode][game_map][bucket] = list of brawler stats
        data = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))

        for record in records:
            game_mode = record['game_mode']
            game_map = record['game_map']
            bucket = record['bucket']
            brawler = record['brawler']
            games_played = record['games_played']
            victories = record['victories']
            win_rate = victories / games_played if games_played > 0 else 0

            data[game_mode][game_map][bucket].append({
                'brawler': brawler,
                'games_played': games_played,
                'win_rate': win_rate
            })

        # Write data to JSON files
        for game_mode, maps in data.items():
            if game_mode is None:
                continue
            for game_map, buckets in maps.items():
                if game_map is None:
                    continue
                for bucket, brawler_stats in buckets.items():
                    if bucket is None:
                        continue
                    
                    # Sort brawler stats by win rate descending
                    brawler_stats.sort(key=lambda x: x['win_rate'], reverse=True)

                    # Ensure directory exists
                    directory = os.path.join('data', str(game_mode), str(game_map))
                    os.makedirs(directory, exist_ok=True)

                    # Write to JSON file
                    file_path = os.path.join(directory, f'{bucket}-trophies.json')
                    with open(file_path, 'w') as f:
                        json.dump(brawler_stats, f, indent=4)

                    print(f"✅ Written data to {file_path}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(main())