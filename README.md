# Brawl Pick

A way to pull and visualize analytics for Brawl Stars

## Prerequisites
- Node.js and npm installed
- PostgreSQL installed and running
- Brawl Stars API token (obtain from [Brawl Stars Developer Portal](https://developer.brawlstars.com))

To start, clone the repository
```
git clone https://github.com/gusev03/brawlpick.git
```

## data-collection

The data collection folder includes scripts for retrieving data from the Brawl Stars API and interacting with a PostgreSQL database for reading and writing.

1. Create a PostgreSQL database and record the username, password, and database name

2. Make a .env file with environment variables:
```
# Database Configuration
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Brawl Stars API
BRAWL_STARS_TOKEN=your_token

# Data Filters
MINIMUM_TROPHIES=700                 # Optional: Trophy threshold for battles
MINIMUM_POWER_LEAGUE_RANK=10         # Optional: Power League rank (e.g. 10 = Diamond 1)
CUTOFF_DATE=2025-01-16               # Date format: YYYY-MM-DD
```

3. To set up the environment with all the packages and export the environment variables, run the following commands:
```
cd data-collection
python3 -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
export $(cat .env | xargs)
```

4. To run data collection:
```
python3 main.py
```

5. To pull analytics from the database, run the following command:
```
python3 -m scripts.pull_analytics
```

6. Return back to the root directory
```
cd ..
```

## frontend

1. After running the the data collection script, move the ```data-collection/data/``` folder to ```frontend/public```
```
mv data-collection/data/ frontend/public
```

2. Install the required packages:
```
cd frontend
npm install
```

3. Start the development server:
```
npm run dev
```

Go to ```http://localhost:3000``` to view the analytics
