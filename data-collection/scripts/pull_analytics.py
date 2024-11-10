import asyncio
import asyncpg
import os
import json
from collections import defaultdict

TROPHY_BUCKETS = [700, 800, 900, 1000] # Trophy buckets: 700+, 800+, 900+, 1000+
RANK_BUCKETS = list(range(10, 20))  # 10-19 for Power League ranks

async def fetch_trophy_stats(conn):
    trophy_query = f"""
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
    return await conn.fetch(trophy_query)

async def fetch_power_league_stats(conn):
    power_league_query = f"""
        WITH bucketed_battles AS (
            SELECT
                game_mode,
                game_map,
                brawler,
                result,
                rank,
                unnest(array{RANK_BUCKETS}) AS bucket
            FROM battles
            WHERE
                game_type = 'soloRanked' AND
                rank >= ANY(array{RANK_BUCKETS})
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
    return await conn.fetch(power_league_query)

async def fetch_team_stats(conn):
    team_query = f"""
        WITH bucketed_battles AS (
            SELECT
                game_mode,
                game_map,
                team,
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
            team,
            COUNT(*) AS games_played,
            SUM(CASE WHEN result = 'victory' THEN 1 ELSE 0 END) AS victories
        FROM bucketed_battles
        WHERE rank >= bucket
        GROUP BY game_mode, game_map, bucket, team
        HAVING COUNT(*) >= 300
    """
    return await conn.fetch(team_query)

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
        print("\nExecuting queries...")
        
        trophy_records = await fetch_trophy_stats(conn)
        power_league_records = await fetch_power_league_stats(conn)
        team_records = await fetch_team_stats(conn)

        # Process trophy records
        process_brawler_records(trophy_records, 'trophies')

        # Process Power League records
        process_brawler_records(power_league_records, 'ranked')

        # Process team records
        data_teams = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
        
        for record in team_records:
            game_mode = record['game_mode'].lower()
            game_map = record['game_map']
            bucket = record['bucket']
            team = record['team']
            games_played = record['games_played']
            victories = record['victories']
            win_rate = victories / games_played if games_played > 0 else 0

            data_teams[game_mode][game_map][bucket].append({
                'team': json.loads(team),
                'games_played': games_played,
                'win_rate': win_rate
            })

        # Modified team data writing
        for game_mode, maps in data_teams.items():
            if game_mode is None:
                continue
            for game_map, buckets in maps.items():
                if game_map is None:
                    continue
                for bucket, team_stats in buckets.items():
                    if bucket is None:
                        continue

                    # Sort team stats by win rate descending
                    team_stats.sort(key=lambda x: x['win_rate'], reverse=True)

                    directory = os.path.join('data', str(game_mode), str(game_map), 'trophies')
                    os.makedirs(directory, exist_ok=True)

                    # Write to JSON file with trophy bucket in filename
                    file_path = os.path.join(directory, f'team-{bucket}-trophies.json')
                    with open(file_path, 'w') as f:
                        json.dump(team_stats, f, indent=4)

                    print(f"✅ Written team data to {file_path}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        await conn.close()

def process_brawler_records(records, mode_type):
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
            'games_played': games_played // 3,
            'win_rate': win_rate
        })

    for game_mode, maps in data.items():
        if game_mode is None:
            continue
        for game_map, buckets in maps.items():
            if game_map is None:
                continue
            for bucket, brawler_stats in buckets.items():
                if bucket is None:
                    continue

                brawler_stats.sort(key=lambda x: x['win_rate'], reverse=True)
                
                directory = os.path.join('data', str(game_mode), str(game_map), mode_type)
                os.makedirs(directory, exist_ok=True)

                suffix = 'rank' if mode_type == 'ranked' else 'trophies'
                file_path = os.path.join(directory, f'brawler-{bucket}-{suffix}.json')
                
                with open(file_path, 'w') as f:
                    json.dump(brawler_stats, f, indent=4)

                print(f"✅ Written data to {file_path}")

if __name__ == "__main__":
    asyncio.run(main())