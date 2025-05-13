
## Components

* **frontend:** A React-based user interface.
* **backend\_appserver:** The main application server.
* **backend\_scrapper:** A service responsible for scraping URLs and updating the database.
* **backend\_common:** Contains shared files used across backend services.
* **sqs (aws/local):** A message queue for managing scraping tasks asynchronously and scrapper can scale on it.
* **mongodb:** Stores all the data
* **redis:** For caching and rate limiting.
* **apis:**
    * **googleSearchJsonApi:** Fetches search results from Google.
    * **geminiApi:** Used for summarizing data.
* **auth:** JWT  for authentication.

## Getting Started

### Environment Configuration

Set up the necessary environment variables in the following files using .env.example files:

* `backend/appserver/.env`
* `backend/scrapper/.env`

### Backend Quickstart (Development)

Install dependencies and quickstart backend services with pm2:
    ```bash
    bash restart_backend.sh
    ```

### Frontend Run Development

1.  Install dependencies:

    ```bash
    npm install --prefix "./frontend"
    ```
2.  Start the devserver:

    ```bash
    pm2 start npm --name "fuse_frontend" -- start
    ```
3.  Open the application in your browser at [http://localhost:3000](http://localhost:3000).

### Frontend Production Build

1. Build the production-ready application:

    ```bash
    npm run build --prefix ./frontend
    ```