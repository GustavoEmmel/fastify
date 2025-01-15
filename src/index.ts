import fastify from "fastify";
import dependenciesPlugin from "./plugins/dependencies";
import redisPlugin, { autoConfig } from "./plugins/redis";
import httpClient from "./plugins/httpClient";
import pokemonRoutes from "./routes/pokemon";
import rateLimit from "@fastify/rate-limit";
import dotenv from "dotenv";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import healthRoutes from "./routes/health";

// Load environment variables
dotenv.config();

// Create pino transport configuration
const pinoTransport = {
  target: "pino-pretty", // Format logs for readability in the console
  options: {
    colorize: true,
  },
};

// Pass the configuration object to Fastify
const app = fastify({
  logger:
    process.env.NODE_ENV === "test"
      ? false // Disable logging in tests
      : {
          level: process.env.LOG_LEVEL || "info", // Define app log level
          transport: pinoTransport, // Transport configuration for pino-pretty
        },
});

// Register Swagger plugin
app.register(swagger, {
  swagger: {
    info: {
      title: "Pokemon API",
      description: "API to fetch Pokemon data",
      version: "1.0.0",
    },
    externalDocs: {
      url: "https://pokeapi.co/",
      description: "Find more info about the Pokemon API",
    },
    host: `${process.env.HOST || "localhost"}:${process.env.PORT || 3000}`,
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
  },
});

// Register Swagger UI for interactive documentation
app.register(swaggerUi, {
  routePrefix: "/docs", // Access docs at /docs
  uiConfig: {
    docExpansion: "full", // Expand all sections by default
    deepLinking: false,
  },
});

// Register rate limit plugin
app.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // maximum number of requests
  timeWindow: process.env.RATE_LIMIT_TIME_WINDOW || "1 minute", // time window for rate limit
});

// Register redis plugin
app.register(redisPlugin, autoConfig);
// Register http client plugin
app.register(httpClient, {
  timeout: parseInt(process.env.HTTP_CLIENT_TIMEOUT || "10000"), // Optional: global timeout for all requests
  retries: parseInt(process.env.HTTP_CLIENT_RETRY || "3"), // Optional: global retry configuration
});

// Register dependency injection plugin
// This should be the last plugin to ensure that all dependencies are available
app.register(dependenciesPlugin);

// Register routes
app.register(healthRoutes);
app.register(pokemonRoutes);

// Start the server
app.listen(
  { port: parseInt(process.env.PORT || "3000"), host: process.env.HOST || "0.0.0.0" },
  (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Docs available at ${address}/docs`);
  }
);

export default app;
