import fp from "fastify-plugin";
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    httpClient: AxiosInstance;
  }
}

interface HttpClientOptions {
  timeout?: number;
  retries?: number;
}

export default fp(async (fastify: FastifyInstance, opts: HttpClientOptions) => {
  const axiosInstance = axios.create({
    timeout: opts.timeout || 5000, // Default timeout
  });

  /**
   * Configure Axios retry logic
   * https://github.com/softonic/axios-retry
   * defaults to retrying on network errors and 5xx responses only
   * The goal is to handle transient errors and reduce the number of failing requests
   */
  axiosRetry(axiosInstance, {
    retries: opts.retries || 3, // Default retry attempts
    shouldResetTimeout: true,
  });

  // Decorate the Fastify instance with `httpClient`
  fastify.decorate("httpClient", axiosInstance);

  fastify.log.info("Generic Axios HTTP client configured successfully.");
});
