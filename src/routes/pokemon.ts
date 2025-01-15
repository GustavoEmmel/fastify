import { FastifyInstance } from "fastify";
import { PokemonQueryParams, querystringGetPokemon, responsePokemonList } from "../schemas/pokemon";
import { cacheKey } from "../constants";

export default async function pokemonRoutes(app: FastifyInstance) {
  // this fastify hook will run before the request handler
  // it will act as a cache middleware
  app.addHook("preHandler", async (request, reply) => {
    // only search cached data for GET requests
    if (request.method === "GET") {
      const key = cacheKey(JSON.stringify(request.query));
      const cachedData = await app.redisClient.get(key);
      if (cachedData) {
        app.log.info("Cache hit");
        // set fastify-cache-hit header to true
        void reply.header("fastify-cache-hit", "true");
        reply.status(200).send(JSON.parse(cachedData));
        reply.hijack();
      }
    }
  });

  // this fastify hook will run when it tries to send the response
  app.addHook("onSend", (request, reply, payload, done) => {
    // validate if is a get request, the status code is 200, the payload is a string
    // the cache-hit header is not set don't want to set the cache with the same data from cache
    if (
      request.method === "GET" &&
      reply.statusCode === 200 &&
      typeof payload === "string" &&
      !reply.hasHeader("fastify-cache-hit")
    ) {
      app.log.info("Setting cache");
      const key = cacheKey(JSON.stringify(request.query));
      app.redisClient.set(key, payload ?? "", "EX", 60).catch((error) => {
        app.log.error({ key, error }, "Failed to cache Pokemon list");
      });
    }

    done();
  });

  app.get<{ Querystring: PokemonQueryParams }>(
    "/v1/pokemon",
    {
      schema: {
        querystring: querystringGetPokemon,
        response: {
          200: responsePokemonList,
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { pokemonService } = app.services;

        const pokemonList = await pokemonService.getPokemonList(request.query);

        if (!pokemonList.success || !pokemonList.data) {
          throw new Error(pokemonList.error?.message || "Failed to fetch Pokemon list");
        }

        // Send the response
        reply.code(200).send(pokemonList.data);
      } catch (error) {
        app.log.error(
          { query: request.query, headers: request.headers, error },
          "Failed to fetch Pokemon list"
        );

        reply.code(500).send({ error: "Failed to fetch Pokemon list" });
      }
    }
  );
}
