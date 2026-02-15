# US State Travel Tracker

A web application to track which US states you and your travel companions have visited, with persistent SQLite storage.

## Features

- 🗺️ Interactive US map with clickable states
- 💾 Persistent SQLite database storage
- 📊 Real-time statistics tracking
- 📤 Export/Import data as JSON
- 🎨 Color-coded visit status:
  - **Yellow**: Ben only
  - **Pink**: Matt only
  - **Light Green**: Both (separately)
  - **Sky Blue**: Together

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure you have `state_paths.js` in the `public` directory (this file contains the SVG path data for the US states map)

3. Start the server:
```bash
npm start
```

4. Open your browser to:
```
http://localhost:3000
```

## Usage

### Tracking States

1. Click on any state on the map
2. Select the visit status from the dropdown menu:
   - **None**: No visits recorded
   - **Ben**: Only Ben has visited
   - **Matt**: Only Matt has visited
   - **Both (Separately)**: Both have visited at different times
   - **Together**: Visited together

### Exporting Data

Click the "Export Data" button to download your current data as a JSON file. This creates a backup you can save anywhere.

### Importing Data

1. Click the "Import Data" button
2. Select a previously exported JSON file
3. Your data will be restored from the backup

## Database

Data is stored in `state-tracker.db` (SQLite database) in the project root directory. The database is automatically created when you first run the server.

### Database Schema

```sql
CREATE TABLE state_visits (
  state_id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## API Endpoints

- `GET /api/states` - Get all state visit data
- `POST /api/states/:stateId` - Update a state's status
- `DELETE /api/states/:stateId` - Remove a state's status
- `GET /api/export` - Export data as JSON
- `POST /api/import` - Import data from JSON

## File Structure

```
.
├── server.js              # Express server with SQLite
├── package.json           # Dependencies
├── state-tracker.db       # SQLite database (auto-generated)
├── public/
│   ├── index.html        # Frontend application
│   └── state_paths.js    # US state SVG paths
└── README.md
```

## Development

The server runs on port 3000 by default. To change this, modify the `PORT` constant in `server.js`.

## Backup Strategy

Your data is safe! It's stored in three places:
1. **SQLite database** - Persistent storage on your server
2. **Export files** - Manual JSON backups you can download
3. **Database backups** - You can copy `state-tracker.db` file directly

## Troubleshooting

### "Failed to load data from server"
- Make sure the server is running (`npm start`)
- Check that you're accessing `http://localhost:3000` (not file://)

### States not saving
- Check the browser console for errors
- Verify the server console shows no errors
- Make sure `state-tracker.db` file permissions allow writing

### Import fails
- Ensure the JSON file was exported from this app
- Check the file format matches the expected structure

## License

MIT
