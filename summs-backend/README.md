# SUMMS Backend Server

## Setup Database
The app uses a Supabase instance as a PostgreSQL database. To set up the database, follow these steps:

Create a ```.env``` file in the backend directory ```/summs-backend``` and add the following environment variables:

```env
SUPABASE_JDBC_URL=YOUR_URL
SUPABASE_DB_USER=YOUR_USER
SUPABASE_DB_PASS=YOUR_PASSWORD
```

## Run

Open terminal in /summs-backend

### Linux

To start the server execute `./mvnw spring-boot:run`

## Test

To test the app execute `./mvnw test`

## Docs

Swagger documentation is available at `http://localhost:8080/swagger-ui.html`
