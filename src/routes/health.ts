import { FastifyInstance } from "fastify";

export default async function healthRoutes(app: FastifyInstance) {
  app.get("/v1/health", async (_, reply) => {
    reply.code(200).send({ app: "Pokemon API", version: "v1.0.0" });
  });
}
