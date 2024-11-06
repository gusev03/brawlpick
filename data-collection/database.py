import asyncpg
import os
from typing import List, Dict

class Database:
    
    def __init__(self):
        self.pool = None

    @classmethod
    async def create(cls):
        self = cls()
        await self.create_pool()
        await self.initialize_table()
        return self

    async def create_pool(self):
        self.pool = await asyncpg.create_pool(
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            database=os.getenv('POSTGRES_DB'),
            host=os.getenv('POSTGRES_HOST'),
            port=os.getenv('POSTGRES_PORT'),
            min_size=10,
            max_size=20
        )

    async def initialize_table(self):
        async with self.pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS battles (
                    battle_id TEXT,
                    battle_time TEXT,
                    game_mode TEXT,
                    game_map TEXT,
                    game_type TEXT,
                    brawler TEXT,
                    power INTEGER,
                    rank INTEGER,
                    result TEXT,
                    team TEXT,
                    team_power TEXT,
                    team_rank TEXT,
                    opponents TEXT,
                    opponents_power TEXT,
                    opponents_rank TEXT,
                    player_id TEXT,
                    team_ids TEXT,
                    opponents_ids TEXT,
                    PRIMARY KEY (battle_id, player_id)
                )
            """)

    async def get_unique_battle_ids(self) -> List[str]:
        async with self.pool.acquire() as conn:
            unique_battle_ids = await conn.fetch("SELECT DISTINCT battle_id FROM battles")
            return [row['battle_id'] for row in unique_battle_ids]

    async def insert_battles(self, battles: List[Dict]):
        async with self.pool.acquire() as conn:
            await conn.executemany("""
                INSERT INTO battles 
                (battle_id, battle_time, game_mode, game_map, game_type, brawler, power, rank, result,
                 team, team_power, team_rank, opponents, opponents_power, opponents_rank, player_id, team_ids, opponents_ids)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                ON CONFLICT (battle_id, player_id) DO NOTHING
            """, [
                (b['battle_id'], b['battle_time'], b['game_mode'], b['game_map'],
                 b['game_type'], b['brawler'], b['power'], b['rank'], b['result'],
                 b['team'], b['team_power'], b['team_rank'], b['opponents'],
                 b['opponents_power'], b['opponents_rank'], b['player_id'], b['team_ids'], b['opponents_ids'])
                for b in battles
            ])

    async def remove_duplicate_battles(self):
        async with self.pool.acquire() as conn:
            await conn.execute("""
                DELETE FROM battles
                WHERE ctid NOT IN (
                    SELECT MIN(ctid)
                    FROM battles
                    GROUP BY battle_id, player_id
                )
            """)

    async def cleanup(self):
        await self.pool.close()