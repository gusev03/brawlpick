import asyncio
import asyncpg
import os

async def test_connection():
    print("\nChecking environment variables...")

    for var in ['POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD']:
        if not os.getenv(var):
            raise EnvironmentError(f"❌ {var} not set")

    print(f"\nTrying to connect to database...")
    
    try:
        conn = await asyncpg.connect(
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            database=os.getenv('POSTGRES_DB'),
            host=os.getenv('POSTGRES_HOST'),
            port=os.getenv('POSTGRES_PORT'),
            timeout=30
        )
        version = await conn.fetchval('SELECT version();')
        print("\n✅ Connection successful!")
        print(f"PostgreSQL version: {version}")
        
        await conn.close()
        
    except asyncpg.exceptions.PostgresError as e:
        print(f"\n❌ PostgreSQL error: {str(e)}")
    except asyncio.TimeoutError:
        print("\n❌ Connection timed out.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_connection())