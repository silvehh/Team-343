# SUMMS Frontend

## Material UI

The frontend uses the React component library.

Please restrain from creating your own components unless it is necessary.

## API

The schemas for the DTOs (Java) must be generated to be used in TypeScript. To do so, start the backend server and execute `npm run generate-types` from the frontend dir.

Additionally, the swagger api is available at `http://localhost:8080/swagger-ui.html`.

## Run

Open terminal in /summs-frontend

### Linux

First get dependencies by executing `npm i`

To start the server execute `npm run dev`

## Test

To run unit tests execute `npm run test:unit -- --run`
