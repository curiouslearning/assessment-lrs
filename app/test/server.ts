import { apiResolver } from "next/dist/server/api-utils";
import supertest from "supertest";

export const testServer = (handler: any) => {
  const app = (req:any, res:any) => apiResolver(req, res, undefined, handler, {
    previewModeEncryptionKey: "",
    previewModeId: "",
    previewModeSigningKey: ""
  }, false);
  return supertest(app);
};
