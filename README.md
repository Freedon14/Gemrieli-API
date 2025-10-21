# Gemrieli Bot API

Backend API for the Telegram bot "Gemrieli" to rate and discover dishes in restaurants.

- Stack: Node.js, Express.js, MongoDB (Mongoose)
- Ready for deployment on Render.com and Vercel
- CORS enabled for external requests (Telegram, Make.com, etc.)

## Environment

Copy `.env.example` to `.env` and fill values:

```
MONGODB_URI=<your-mongodb-atlas-uri>
PORT=8080
ADMIN_TOKEN=<secure-admin-token>
```

## Install & Run

```
npm install
npm run dev   # local development
npm start     # production
```

## Data Models

- Users: `name`, `telegram_id`, `city`, `join_date`
- Restaurants: `name`, `address`, `city`, `social_links[]`, `website`
- Dishes: `restaurant`, `name`, `category`, `photo_url`, `avg_rating`, `ratings_count`
- Ratings: `user`, `dish`, `rating(1–5)`, `comment`, `photo_url`, `date`

Average rating and ratings count are updated automatically on each new rating.

## API Endpoints

- `POST /rate`
  - Body: `{ telegram_id, user_name?, user_city?, dish_id, rating(1–5), comment?, photo_url? }`
  - Creates/updates user by `telegram_id`, adds rating, updates dish average.

- `GET /top?dish={dish_name}&city={city}`
  - Returns top 5 dishes with highest average rating matching name, optionally filtered by city.

- `GET /restaurant/{id}/menu`
  - Returns restaurant and all its dishes.

- `POST /add_dish`
  - Headers: `x-admin-token: <ADMIN_TOKEN>` (required)
  - Body: `{ restaurant_id, name, category?, photo_url? }`
  - Adds a dish under a restaurant.

- `GET /user/{telegram_id}/ratings`
  - Returns rating history for the user (with dish + restaurant info.

## Deployment

### Render.com
- Create a new Web Service from this repo.
- Build command: `npm install`
- Start command: `npm start`
- Set Environment Variables: `MONGODB_URI`, `ADMIN_TOKEN`, `PORT` (optional).

### Vercel
- This project includes `vercel.json` to route all requests to the Express app.
- Install Vercel CLI: `npm i -g vercel`
- Set env vars: `vercel env add MONGODB_URI`, `vercel env add ADMIN_TOKEN`, `vercel env add PORT` (optional)
- Deploy: `vercel`

## Notes
- Image fields `photo_url` are optional for both dishes and ratings.
- CORS is enabled globally.
- If you need stricter CORS, update `app.use(cors())` in `src/server.js`.