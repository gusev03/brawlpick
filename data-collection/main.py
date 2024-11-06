import asyncio
import logging
import json
from brawl_stars_api import get_top_players, get_player_battlelog
from database import Database
from collections import deque
from datetime import datetime, timezone
import time

async def get_top_players_ids() -> list[str]:
    top_players = await get_top_players()
    return [player["tag"] for player in top_players["items"]]

async def process_player(db: Database, player_id: str, seen_battles: set[str], processed_players: set[str]):
    battlelog = await get_player_battlelog(player_id)
    battlelog = battlelog["items"]
    new_players = []
    battles_to_insert = []

    for battle in battlelog:
        data = dict()
        data["game_mode"] = battle["battle"]["mode"]

        if data["game_mode"] in ["soloShowdown", "duoShowdown", "duels", "bossFight"]:
            continue

        data["game_type"] = battle["battle"]["type"]
        
        if data["game_type"] == "friendly":
            continue

        data["battle_time"] = battle["battleTime"]
        battle_datetime = datetime.strptime(data["battle_time"].replace('Z', ''), '%Y%m%dT%H%M%S.%f').replace(tzinfo=timezone.utc)
        cutoff_date = datetime(2024, 11, 1, tzinfo=timezone.utc)

        if battle_datetime < cutoff_date:
            continue

        data["team1"] = battle["battle"]["teams"][0]
        data["team2"] = battle["battle"]["teams"][1]

        min_id = min([player["tag"] for player in data["team1"] + data["team2"]])
        data["battle_id"] = data["battle_time"] + min_id

        if data["battle_id"] in seen_battles:
            continue
        seen_battles.add(data["battle_id"])

        if player_id not in [player["tag"] for player in data["team1"]]:
            data["team1"], data["team2"] = data["team2"], data["team1"]
        
        data["game_map"] = battle["event"]["map"]
        data["result"] = battle["battle"]["result"]

        def extract_team(team: list[dict]):
            brawlers, powers, ranks, ids = [], [], [], []
            for player in sorted(team, key=lambda x: x["brawler"]["name"]):
                brawlers.append(player["brawler"]["name"])
                powers.append(player["brawler"]["power"])
                ranks.append(player["brawler"]["trophies"])
                ids.append(player["tag"])
            return json.dumps(brawlers), json.dumps(powers), json.dumps(ranks), json.dumps(ids)
        
        data["team"], data["team_power"], data["team_rank"], data["team_ids"] = extract_team(data["team1"])
        data["opponents"], data["opponents_power"], data["opponents_rank"], data["opponents_ids"] = extract_team(data["team2"])

        for player in data["team1"]:
            battle_entry = data.copy()
            battle_entry["player_id"] = player["tag"]
            battle_entry["brawler"] = player["brawler"]["name"]
            battle_entry["power"] = player["brawler"]["power"]
            battle_entry["rank"] = player["brawler"]["trophies"]
            battles_to_insert.append(battle_entry)
            if player["tag"] not in processed_players:
                new_players.append(player["tag"])
                processed_players.add(player["tag"])

        if data["result"] == "victory":
            data["result"] = "defeat"
        elif data["result"] == "defeat":
            data["result"] = "victory"
        
        data["team"], data["opponents"] = data["opponents"], data["team"]
        data["team_power"], data["opponents_power"] = data["opponents_power"], data["team_power"]
        data["team_rank"], data["opponents_rank"] = data["opponents_rank"], data["team_rank"]
        data["team_ids"], data["opponents_ids"] = data["opponents_ids"], data["team_ids"]

        for player in data["team2"]:
            battle_entry = data.copy()
            battle_entry["player_id"] = player["tag"]
            battle_entry["brawler"] = player["brawler"]["name"]
            battle_entry["power"] = player["brawler"]["power"]
            battle_entry["rank"] = player["brawler"]["trophies"]
            battles_to_insert.append(battle_entry)
            if player["tag"] not in processed_players:
                new_players.append(player["tag"])
                processed_players.add(player["tag"])
        
    if battles_to_insert:
        await db.insert_battles(battles_to_insert)
    
    return seen_battles, processed_players, new_players

async def main():
    
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Connect and initialize the postgres database
    logger.info("Connecting and initializing database...")
    db = await Database.create()
    
    # Get unique battle ids from the database to avoid duplicates
    logger.info("Getting unique battle ids...")
    seen_battles = set(await db.get_unique_battle_ids()) 
    
    # Loops, so players can be reprocessed (processed_players resets)
    while True:
        try:
            # Get top players' ids for initial queue (high ranking battles + their battle logs constantly update)
            logger.info("Getting top players ids...")
            queue = deque(await get_top_players_ids())

            # Prevents reprocessing a player in the same loop iteration (gives time for player battle logs to update)
            processed_players = set(queue)

            async def worker():

                while queue:
                    player_id = queue.popleft()
                    try:
                        seen_battles_local, processed_players_local, new_players = await process_player(db, player_id, seen_battles, processed_players)
                        seen_battles.update(seen_battles_local)
                        processed_players.update(processed_players_local)
                        queue.extend(new_players)
                        logger.info(f"Processed player {player_id}. Players: {len(processed_players)}, Battles: {len(seen_battles)}")
                    except Exception as e:
                        logger.error(f"Error processing player {player_id}: {str(e)}")

            workers = []

            # Create 20 workers
            logger.info("Creating first batch of workers...")
            for _ in range(20):
                workers.append(asyncio.create_task(worker()))
            
            # Wait 1 million processed players before cutting off workers to reset the loop
            logger.info(f"Waiting for {500_000} players to be processed...")
            while len(processed_players) < 500_000:
                await asyncio.sleep(5)
            
            # Cancel all workers
            logger.info("Cancelling workers...")
            for w in workers:
                w.cancel()
            
            # Restart the loop
            logger.info(f"Finished a loop. Current total battles: {len(seen_battles)}")
            
        except Exception as e:
            logger.error(f"An error occurred during data collection: {str(e)}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(main())
