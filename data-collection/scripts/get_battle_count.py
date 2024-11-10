import asyncpg
import os
import asyncio

async def get_battle_count():
    print("\nChecking environment variables...")

    for var in ['POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD']:
        if not os.getenv(var):
            raise EnvironmentError(f"❌ {var} not set")

    print("\nTrying to connect to database...")
    
    try:
        conn = await asyncpg.connect(
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            database=os.getenv('POSTGRES_DB'),
            host=os.getenv('POSTGRES_HOST'),
            port=os.getenv('POSTGRES_PORT'),
            timeout=os.getenv('POSTGRES_TIMEOUT', 30)
        )
    except asyncpg.exceptions.PostgresError as e:
        print(f"\n❌ PostgreSQL error: {str(e)}")
    except asyncio.TimeoutError:
        print("\n❌ Connection timed out.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")

    try:
        print("\nConnection successful. Counting battles...")

        total_count = await conn.fetchval("SELECT COUNT(DISTINCT battle_id) FROM battles")
        
        print(f"Total unique battles: {total_count:,}")
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(get_battle_count())