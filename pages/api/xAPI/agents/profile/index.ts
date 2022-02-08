import Cors from "cors";
import deepEqual from "deep-equal";
import type { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "../../../helpers/api/api-handler";
import middleware, { Next } from "../../../helpers/api/request-sanitizers";
import dbClient from "../../../../../lib/db";
import * as model from "../../../../../models/agentProfile";
import { Prisma } from "@prisma/client";

const helpers = middleware();

async function handleGET(req, res) {
  try {
    const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const query = Object.fromEntries(params.entries());
    if(!query || !query.agent) {
      throw "you must provide an agent and a profileId or timestamp cursor";
    }
    query['agent'] = JSON.parse(query['agent'])
    if(req.profileId && req.since) {
      throw("cannot specify a profile id and a timestamp!")
    }
    if (req.profileId) {
      const profile = await model.getProfile(query.agent, req.profileId);
      return res.status(200).json(profile);
    } else {
      const idList = await model.getAllForAgent(req.agent, req.since);
      return res.status(200).json(idList);
    }
  } catch(err) {
    throw err;
  }
}

async function handlePOST(req, res) {
  try {
    if(helpers.validateBody(req.body)) {
      await model.add(req.body);
    }
    return res.status(204).send();
  } catch(err) {
    if (err instanceof Prisma.PrismaClientValidationError) {
      throw "invalid profile in request body";
    }
    throw err;
  }
}

async function handlePUT(req, res) {
  try {
    if (helpers.validateBody(req.body)) {
      await model.add(req.body);
    }
    return res.status(204).send({});
  } catch(err) {
    if (err instanceof Prisma.PrismaClientValidationError) {
      throw "invalid profile in request body";
    }
    throw err;
  }
}

async function handleDELETE(req, res) {
  try {
    const query = new URL(`http://${req.headers.host}`).searchParams
    if(!query || (!query.agent && !query.profileId)) {
      throw "please specify an agent and a profile Id";
    }
    await model.deleteProfile(agent, profileId);
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
