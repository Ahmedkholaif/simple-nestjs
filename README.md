# Voucher Pool API

A NestJS-based Voucher Pool API that manages customer vouchers and special offers. This application provides endpoints for creating and managing customers, special offers, and voucher codes.

## Technologies

- NestJS
- PostgreSQL
- Redis
- Docker
- Swagger/OpenAPI


## Installation

1. Clone the repository and install dependencies:

```bash
git clone  https://github.com/Ahmedkholaif/simple-nestjs.git
cd simple-nestjs

npm install
```

## Running the Application
- (Local Development)[#local-development]
- (Development Using Docker)[#using-docker]



# Local Development

- Configure environment variables in `.env` if you are running locally: 
```env
 PORT=
 POSTGRES_HOST=
 POSTGRES_PORT=
 POSTGRES_USER=
 POSTGRES_PASSWORD=
 POSTGRES_DB=
 SYNC_DB= # not recommended for production
 REDIS_HOST= # Optional
 REDIS_PORT= # Optional
```

## Running the Application

### Local Development

```bash
# Development mode
npm run start

# Watch mode
npm run start:dev

# Production mode
npm run start:prod
```

### Using Docker

- the docker-compose file will start the application, PostgreSQL, and Redis services.
- the docker file is configured to run the application in development mode.
local directory is bind to the container directory to allow for hot-reloading.

```bash
# Start the application and database
docker-compose up -d --build # -d to run in detached mode (background) - remove it to see logs
```

The application will be running at `http://localhost:3000`.
The health check endpoint is available at `http://localhost:3000/health`.

## API Documentation

The API is documented using Swagger/OpenAPI and is split into two interfaces:

### 1. Main API Documentation
Access the main API documentation at:
```
http://localhost:3000/explore
```

This interface includes endpoints for:

#### Customers
- `POST /api/customers` - Create a new customer
- `GET /api/customers` - Get all customers

#### Special Offers
- `POST /api/special-offers` - Create a new special offer
- `GET /api/special-offers` - Get all special offers 

#### Vouchers
- `POST /api/vouchers` - Generate a new voucher code
- `GET /api/vouchers` - Get all vouchers, or use query parameters to filter by customer email 'email' or special offer ID 'offerId' 
- `POST /api/vouchers/redeem` - Redeem a voucher code
- `POST /api/vouchers/get-by-email` - Get all vouchers for a specific customer by email

## Testing

```bash
# unit tests
npm run test
npx jest

# coverage
npm run test:cov
npx jest --coverage
```

- coverage report will be available in the `coverage` directory.

## possible improvements

- add proper logging
- add more validation
- add more tests
- add more documentation
- add more error handling
- Enhance db migrations
- create production-ready docker image


## Support

For support and questions, please open an issue in the repository.
