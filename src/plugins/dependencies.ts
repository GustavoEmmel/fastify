import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { PokemonService } from "../services/pokemon";

// Extend Fastify's type system to include the `services` property
// This ensures that TypeScript recognizes the injected services when accessing `app.services`.
declare module "fastify" {
  interface FastifyInstance {
    services: RegisteredServices;
  }
}

// Define an interface for the registered services.
// This helps maintain a strongly typed structure for injected dependencies.
interface RegisteredServices {
  pokemonService: PokemonService; // Example: Pokemon service
}

// Export a Fastify plugin for dependency injection
export default fp((app: FastifyInstance, _, done) => {
  // Create instances of services that will be injected
  const pokemonService = new PokemonService(app);

  // Organize all services into a single object
  const services: RegisteredServices = {
    pokemonService,
  };

  // Attach the `services` object to the Fastify instance for global access
  // `app.decorate` adds a property to the Fastify instance
  app.decorate("services", services);

  done();
});

/**
 * Summary:
 * This file sets up dependency injection for Fastify using a custom plugin.
 * - Services (like PokemonService) are instantiated and registered in a structured way.
 * - The `services` object is decorated onto the Fastify instance, making it globally accessible.
 * - TypeScript declarations ensure type safety and proper autocompletion when accessing services.
 *
 * Benefits:
 * - Centralized management of service dependencies.
 * - Clean separation of concerns, keeping the core Fastify instance lightweight.
 * - Reusability and scalability by encapsulating service registration in a plugin.
 */
