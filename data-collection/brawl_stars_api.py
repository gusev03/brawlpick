import os
import aiohttp

if not (BRAWL_STARS_TOKEN := os.getenv("BRAWL_STARS_TOKEN")):
    raise ValueError("BRAWL_STARS_TOKEN is not set")

async def get_top_players() -> list[dict]:
    try:
        url = "https://api.brawlstars.com/v1/rankings/global/players"
        headers = {"Authorization": f"Bearer {BRAWL_STARS_TOKEN}"}
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
    except aiohttp.ClientError as e:
        print(f"HTTP error occurred: {e}")
        return []

async def get_player_battlelog(player_id: str) -> list[dict]:
    try:
        player_id = player_id.replace("#", "%23")
        url = f"https://api.brawlstars.com/v1/players/{player_id}/battlelog"
        headers = {"Authorization": f"Bearer {BRAWL_STARS_TOKEN}"}
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
    except aiohttp.ClientError as e:
        print(f"HTTP error occurred: {e}")
        return []
