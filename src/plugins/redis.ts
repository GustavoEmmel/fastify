import fp from "fastify-plugin";
import Redis from "ioredis";

declare module "fastify" {
  interface FastifyInstance {
    redisClient: Redis;
  }
}

// Mock Redis Client
// Another option would be use a Redis docker image to run the tests
class MockRedis {
  private store: Record<string, string> = {};

  async get(key: string): Promise<string | null> {
    return this.store[key] || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.store[key] = value;
  }

  async flushall(): Promise<void> {
    this.store = {};
  }

  on(): void {
    // No-op for event handling in the mock
  }
}

export const autoConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: +(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  clusterHost: process.env.REDIS_CLUSTER_HOST ?? "",
  slotsRefreshTimeout: +(process.env.REDIS_SLOT_TIMEOUT ?? 2500),
};

export default fp<Partial<typeof autoConfig>>(
  (fastify, { username, host, port, slotsRefreshTimeout, password, clusterHost }, done) => {
    let redisClient;

    if (process.env.NODE_ENV === "test") {
      // Use mock Redis in test environment
      redisClient = new MockRedis();
      fastify.log.info("Using mock Redis client in test environment");
    } else {
      // Use real Redis/Redis Cluster in non-test environments
      redisClient =
        process.stdout.isTTY || process.env.NODE_ENV === "development"
          ? new Redis({ host, port })
          : new Redis.Cluster([{ host: clusterHost, port }], {
              slotsRefreshTimeout,
              redisOptions: { username, password, tls: {} },
            });

      redisClient.on("error", (err) => {
        fastify.log.error(`Redis connection error: ${err.message}`);
      });
    }

    fastify.decorate("redisClient", redisClient as Redis);
    done();
  },
  { name: "redis" }
);
