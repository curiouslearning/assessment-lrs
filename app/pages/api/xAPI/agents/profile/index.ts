import { NextApiRequest, NextApiResponse } from 'next';
import deepEqual from "deep-equal";
import { apiHandler } from "../../../helpers/api/api-handler";
import middleware, { Next } from "../../../helpers/api/middleware";
import * as model from "../../../../../models/agentProfile";
import {
  Agent,
  Group,
  Activity,
  SubStatement,
  StatementRef,
  Statement,
  Result,
  Context
} from '../../models';

import { Prisma } from "@prisma/client";

const helpers = middleware();

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  try {
    if(!req.url || !req.headers || !req.headers.host) throw 'improper url in request headers';
    const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const query = Object.fromEntries(params.entries());
    if(!query || !query.agent) {
      throw "you must provide an agent and a profileId or timestamp cursor";
    }
    const agent = JSON.parse(query.agent);
    if(query.profileId && query.since) {
      throw("cannot specify a profile id and a timestamp!")
    }
    if (query.profileId) {
      const profile = await model.getProfile(agent, query.profileId);
      if (profile) {
        profile.agent = helpers.formatAgentToXapi(profile.agent);
      }
      return res.status(200).json(profile);
    } else {
      const idList = await model.getAllForAgent(agent, query.since);
      console.log(`idList: ${idList}`)
      return res.status(200).json(idList);
    }
  } catch(err) {
    throw err;
  }
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  if (!req.body) {
    return res.status(204).end();
  }
  try {
    if(helpers.validateBody(req.body)) {
      if(!Array.isArray(req.body)) {
        await model.add([req.body])
      } else {
        await model.add(req.body);
      }
    } else {
      throw "invalid request body";
    }
    return res.status(204).end();
  } catch(err) {
    if (err instanceof Prisma.PrismaClientValidationError) {
      console.error(err);
      throw "invalid profile in request body";
    }
    throw err;
  }
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  if (!req.body) {
    return res.status(204).end();
  }
  try {
    if (helpers.validateBody(req.body)) {
      if(!Array.isArray(req.body)) {
        await model.add([req.body])
      } else {
        await model.add(req.body);
      }
    } else {
      throw "invalid request body";
    }
    return res.status(204).send({});
  } catch(err) {
    if (err instanceof Prisma.PrismaClientValidationError) {
      throw "invalid profile in request body";
    }
    throw err;
  }
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  try {
    if(!req.url || !req.headers || !req.headers.host) throw 'improper url in request header';
    const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const query = Object.fromEntries(params.entries());
    if(!query || (!query.agent && !query.profileId)) {
      throw "please specify an agent and a profile Id";
    }
    const agent = JSON.parse(query.agent);
    await model.deleteProfile(agent, query.profileId);
    return res.status(204).send({});
  } catch(err) {
    throw err;
  }
}

export default apiHandler({
  get: handleGET,
  post: handlePOST,
  put: handlePUT,
  delete: handleDELETE,
})
