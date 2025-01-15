import { FastifyInstance } from "fastify";
import { PokemonList, PokemonQueryParams } from "../schemas/pokemon";

export class PokemonService {
  private readonly httpClient;
  private readonly baseUrl: string;

  constructor(fastify: FastifyInstance) {
    this.httpClient = fastify.httpClient;
    this.baseUrl = process.env.POKEMON_BASE_URL || "https://pokeapi.co/api/v2";
  }

  async getPokemonList(params: PokemonQueryParams) {
    const response = await this.httpClient.get<PokemonList>(`${this.baseUrl}/pokemon`, {
      params,
    });

    return PokemonList.safeParse(response.data);
  }
}
