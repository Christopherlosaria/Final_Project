# War Thunder Command Dashboard

A War Thunder-inspired personal vehicle roster dashboard with a separate Overview page and Vehicle Hangar page. This is an unofficial fan-made project and is not affiliated with Gaijin Entertainment.

## Requirements
- Node.js 18 or newer
- npm

## Run locally
1. Extract the ZIP.
2. Open a terminal in the project folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open http://localhost:3000 for the Overview dashboard. Use **Vehicle Hangar** in the sidebar to open the separate CRUD page.

The SQLite database file (`war_thunder.db`) is created automatically on first run and seeded with sample vehicles.

## CRUD API
- `GET /api/vehicles` — list vehicles; supports `search`, `type`, and `nation` query parameters
- `POST /api/vehicles` — create a vehicle
- `PUT /api/vehicles/:id` — update a vehicle
- `DELETE /api/vehicles/:id` — delete a vehicle
- `GET /api/stats` — dashboard summary statistics

## Vehicle fields
`name`, `nation`, `type` (`Ground`, `Aircraft`, `Naval`), `battle_rating`, `rank`, `role`, `notes`.

## Notes
- The sample data is illustrative. Replace it with vehicles from your own collection.
- This app stores user-entered records locally in SQLite; it does not connect to War Thunder accounts or retrieve live game statistics.
