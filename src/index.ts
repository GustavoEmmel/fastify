import fastify from "fastify";
import dependenciesPlugin from "./plugins/dependencies";

const app = fastify();

// Registra o plugin de dependências
app.register(dependenciesPlugin);

app.get<{ Params: { id: string } }>("/users/:id", async (request, reply) => {
  const userService = app.services.userService;
  const user = await userService.getUserById(request.params.id);
  reply.send(user);
});

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
