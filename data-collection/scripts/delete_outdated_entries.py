import asyncio
import asyncpg
import os
from datetime import datetime

async def delete_outdated_entries():
    print("\nChecking environment variables...")

    for var in ['POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'CUTOFF_DATE']:
        if not os.getenv(var):
            raise EnvironmentError(f"❌ {var} not set")
    
    try:
        cutoff_date = datetime.strptime(os.getenv('CUTOFF_DATE'), '%Y-%m-%d')
    except ValueError:
        raise EnvironmentError("❌ CUTOFF_DATE must be in YYYY-MM-DD format")

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
        print(f"\nConnection successful. Fetching number of entries before {cutoff_date.date()}...")

        count = await conn.fetchval("""
            SELECT COUNT(*) 
            FROM battles 
            WHERE TO_TIMESTAMP(battle_time, 'YYYYMMDD"T"HH24MISS.MS"Z"') < $1
        """, cutoff_date)
        
        confirmation = input(f"\n⚠️ This will delete {count} entries before {cutoff_date.date()}. Proceed? (y/N): ")
        
        if confirmation.lower() != 'y':
            print("\n❌ Operation cancelled by user")
            await conn.close()
            return
            
        print(f"\nDeleting entries before {cutoff_date.date()}...")
        deleted_rows = await conn.execute("""
            DELETE FROM battles 
            WHERE TO_TIMESTAMP(battle_time, 'YYYYMMDD"T"HH24MISS.MS"Z"') < $1
        """, cutoff_date)
        
        count = int(deleted_rows.split()[1])
        print(f"\n✅ Successfully deleted {count} entries that occurred before {cutoff_date.date()}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(delete_outdated_entries())