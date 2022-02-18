import { apiResolver } from "next/dist/server/api-utils";
import supertest from "supertest";

export const testServer = (handler) => {
  const app = (req, res) => apiResolver(req, res, undefined, handler);
  return supertest(app);
};
