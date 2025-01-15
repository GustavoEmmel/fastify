# Fastify API

## API Documentation

The documentation for the available endpoints, including the proxy for fetching all Pokémon, can be accessed via Swagger. Once the application is running, visit the following URL in your browser:

http://127.0.0.1:3000/docs

Swagger provides a detailed view of all available endpoints, including example requests and responses.

## Requirements

Before you can run the project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v22 recommended)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
````

### 2. Copy env variables
```bash
cp .env.template .env
````

### 3. Start the Development Server
This project depends on Redis. When running the start:dev command, it will spin up a Docker instance with a Redis container, setting up the application to run locally with the required dependencies.
```bash
pnpm start:dev
````
This will start the application in development mode, ensuring that Redis is available for caching functionalities.

### 4. Run the Tests
```bash
pnpm t
````
Run the tests with Vitest to ensure that everything is working as expected.

## Code Structure
Here’s a breakdown of the key folders in the project:

### 1. plugins
Contains Fastify plugins like the Redis client and any other reusable Fastify extensions that manage integrations with external services.
### 2. routes
Contains all the endpoint definitions. Each route is defined in its own file, making it easy to manage and extend the API.
### 3. schemas
Contains Zod schemas for validating request bodies, query parameters, and responses. This ensures type safety and validation across the application.
### 4. services
Contains the logic for interacting with external APIs or databases. This is where things like data fetching or caching logic live.