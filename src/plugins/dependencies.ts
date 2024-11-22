import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { UserService } from "../services/userService";
import { UserRepository } from "../repositories/userRepository";

declare module "fastify" {
  interface FastifyInstance {
    services: RegisteredServices;
  }
}

interface RegisteredServices {
  userService: UserService;
  userRepository: UserRepository;
}

export default fp((app: FastifyInstance, opts, done) => {
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);

  const services: RegisteredServices = {
    userService,
    userRepository,
  };

  app.decorate("services", services);

  done();
});
