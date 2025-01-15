import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Define schema for the full Pokemon API response
export const PokemonList = z.object({
  count: z.number(), // Total number of available Pokemon
  next: z
    .string()
    .url()
    .nullable()
    .transform((url) => convertUrl(url)), // Transform the URL
  previous: z
    .string()
    .url()
    .nullable()
    .transform((url) => convertUrl(url)), // Transform the URL
  results: z.array(
    z.object({
      name: z.string(), // The name of the Pokemon
      url: z.string().url(), // URL to access details about the Pokemon
    })
  ), // List of Pokemon results
});

// Function to convert the external URL to your custom format
const convertUrl = (url: string | null): string | null => {
  if (!url) return null;

  // Extract query parameters like offset and limit
  const urlObj = new URL(url);
  const offset = urlObj.searchParams.get("offset");
  const limit = urlObj.searchParams.get("limit");

  // Build the new URL based on your format
  const baseURL = process.env.API_URL || "http://localhost:3000";

  const newUrl = new URL(`${baseURL}/v1/pokemon`);
  if (limit) newUrl.searchParams.set("limit", limit);
  if (offset) newUrl.searchParams.set("offset", offset);

  return newUrl.toString(); // Return the modified URL
};

export type PokemonList = z.infer<typeof PokemonList>;

export const responsePokemonList = zodToJsonSchema(PokemonList, { target: "openApi3" });

export const PokemonQueryParams = z.object({
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1") // Ensure limit is a positive integer
    .max(1000, "Limit cannot exceed 1000")
    .default(10), // Provide a default value for limit
  offset: z
    .number()
    .int()
    .min(0, "Offset must be a non-negative integer") // Ensure offset is non-negative
    .default(0), // Provide a default value for offset
});

export type PokemonQueryParams = z.infer<typeof PokemonQueryParams>;

export const querystringGetPokemon = zodToJsonSchema(PokemonQueryParams, {
  target: "openApi3",
});
