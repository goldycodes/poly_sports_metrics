# Poly Sports Metrics

A Node.js project to fetch Polymarket sports market data, compute basic stats, and serve them via a simple API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the server:
   ```bash
   node server/server.js
   ```

3. Access the stats endpoint:
   - http://localhost:3000/stats

## Project Structure
- `aggregator/`: Contains data fetching and stats computation logic
- `server/`: Contains the Express server that exposes the API
- `package.json`: Node.js dependencies
- `.gitignore`: Common ignores
- `README.md`: Project documentation

## Next Steps (Phase 1)
- Implement Polymarket API integration
- Add sports market filtering logic
- Calculate volume and open interest metrics

## Future Plans
- Add per-market breakdown
- Implement historical data tracking
- Add visualization dashboard 