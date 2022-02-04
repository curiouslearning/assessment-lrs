import { MongoClient } from "mongodb";
import { mongoDBURI } from "/app/config";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export default new MongoClient(mongoDBURI, options);
