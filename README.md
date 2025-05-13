## Getting Started

## Components
* React frontend
* Appserver backend
* Scrapper backend
* Mongo, Redis, Sqs
* gemini llm api, google search api

### Environment Configuration

Create these env files and add up the necessary environment variables

* `backend/appserver/.env`
* `backend/scrapper/.env`

### Backend Run

Install dependencies and run services
    
    ```bash
    bash restart_backend.sh
    ```
    or individual services with

    ```bash
    cd backend/appserver
    npm install

    node server.js
    or
    pm2 start server.js --name "appservice" --env .env

    cd ../..
    ```

    ```bash
    cd /backend/scrapper
    npm install

    node server.js
    or
    pm2 start server.js --name "scrapper" --env .env
    ```
    
    (run npm install in /common as well)

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


## Components

### Frontend

* **MaterialUI:** Modern and responsive user interface.

* **Search:** Robust search functionality.

* **Pagination:** Efficient navigation through large datasets.

* **Filters:** Flexible filtering options.

* **Reusable Components:** Modular and maintainable codebase.

* **CardViews:** Organized display of information.

### Appserver

* **JWT Auth:** Secure authentication using JSON Web Tokens.

* **API Design:** Well-structured and documented API.

* **Asynchronous Processing:** Efficient handling of tasks.

* **Simple Filtering:** Basic data filtering.

* **Open Text Filtering through AI:** Advanced search using AI analysis.

* **Advanced Google Search Filtering:** Integration with Google Search for enhanced results.

* **Caching:** Improved performance with data caching.

* **Indexing:** Optimized database queries.

* **Mongoose:** MongoDB object modeling.

### Database

* **MongoDB/Atlas:** Cloud-based NoSQL database.

* **Indexing:** Database performance optimization.

* **Schemas:**

    * **Company:** Stores company data.

    * **User:** Stores user information.

    * **UserBookmark:** Stores user's saved bookmarks.

### Scrapper

* **Scraping through Puppeteer:** Web scraping functionality.

* **Resource Management:** Efficient handling of scraping resources.

* **Auto Scale for Message Processing:** Scalable message processing.

* **AI Summary:** Generation of summaries using AI.

* **Asynchronous processing**

### Redis

* Caching of data.

* Storage of tokens.

### SQS

* Highly available message queuing.

## API Endpoints

### Base URL

`/api/v1`

### Public Endpoints

* `/public/filters/company`: Retrieves filter configuration for the user interface.

* `/user/login`: User login.

* `/user/create`: User signup with email and password.

### Authenticated Endpoints

* `/query/company/simple_search`: Searches the database with given search text and filters.

* `/query/company/open_text_search`: Searches with free text using a filter URL obtained from Gemini AI.

* `/query/company/advanced_text_search`: Searches websites obtained from Google Search with the provided search text.

* `/bookmarks/`: Retrieves the user's saved bookmarks.

* `/bookmarks/create`: Creates a bookmark for a user and company.

* `/bookmarks/delete`: Deletes a user's bookmark.

* `/summary/company`: Retrieves a summary of a company using Gemini.
