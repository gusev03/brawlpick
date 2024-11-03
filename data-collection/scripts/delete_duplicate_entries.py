import asyncpg
import os
import asyncio

async def delete_duplicate_entries():
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
        print("\nConnection successful. Counting duplicate entries...")

        count = await conn.fetchval("""
            WITH DuplicateCTE AS (
                SELECT battle_id, player_id,
                       ROW_NUMBER() OVER (
                           PARTITION BY battle_id, player_id 
                           ORDER BY battle_time DESC
                       ) as row_num
                FROM battles
            )
            SELECT COUNT(*)
            FROM DuplicateCTE
            WHERE row_num > 1
        """)
        
        confirmation = input(f"\n⚠️ This will delete {count} duplicate entries. Proceed? (y/N): ")
        
        if confirmation.lower() != 'y':
            print("\n❌ Operation cancelled by user")
            await conn.close()
            return

        print("\nDeleting duplicate entries...")
        deleted_rows = await conn.execute("""
            WITH DuplicateCTE AS (
                SELECT battle_id, player_id,
                       ROW_NUMBER() OVER (
                           PARTITION BY battle_id, player_id 
                           ORDER BY battle_time DESC
                       ) as row_num
                FROM battles
            )
            DELETE FROM battles
            WHERE (battle_id, player_id) IN (
                SELECT battle_id, player_id
                FROM DuplicateCTE
                WHERE row_num > 1
            )
        """)
        
        count = int(deleted_rows.split()[1])
        print(f"\n✅ Successfully deleted {count} duplicate entries")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(delete_duplicate_entries())
