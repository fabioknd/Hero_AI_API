import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  heroGraphqlUrl: process.env.HERO_GRAPHQL_URL,
  heroApiKey: process.env.HERO_API_KEY,
};

if (!config.heroGraphqlUrl) {
  throw new Error("HERO_GRAPHQL_URL fehlt in .env");
}

if (!config.heroApiKey) {
  throw new Error("HERO_API_KEY fehlt in .env");
}