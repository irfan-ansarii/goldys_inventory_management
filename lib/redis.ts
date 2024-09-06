import Redis from "ioredis";

export const client = new Redis(
  "redis://default:AeNjAAIjcDFhMzVlOGRjYmUyZTI0YzhjODQ2YjZkNDFmNTdmMDkzY3AxMA@intense-gator-58211.upstash.io:6379"
);
