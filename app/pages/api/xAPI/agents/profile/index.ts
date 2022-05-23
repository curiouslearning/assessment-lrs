import { NextApiRequest, NextApiResponse } from 'next';
import { omit } from 'lodash';
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
function formatProfile (profile: {[key: string]: any}) {
  if(!profile.agent || !helpers.validateBody(profile.agent)) {
    throw `profile ${profile.profileId} is missing an Agent`
  }
  let datum = {
    profileId: profile.profileId,
    agent: profile.agent,
    continent: profile.continent,
    country: profile.country,
    region: profile.region,
    city: profile.city,
    referralId: profile.referralId,
    utmAttribution: profile.utmAttribution,
    organization: profile.organization,
    language: profile.language,
    lat: profile.lat.slice(0, profile.lat.indexOf('.')+3), //only save last 2 decimal places of lat/lng for anonymity
    lng: profile.lng.slice(0, profile.lng.indexOf('.') + 3),
    extendedProfile: {}
  };
  const extendedProfile = omit(profile, Object.keys(datum));
  datum.extendedProfile = extendedProfile;
  return datum;
}
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
      let retVal = {};
      if (profile) {
        profile.agent = helpers.formatAgentToXapi(profile.agent);
        retVal = {
          ...omit(profile, ["extendedProfile"]),
          ...profile.extendedProfile as {[key: string]: any}
        }
      }
      return res.status(200).json(retVal);
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
      let postBody: {[key: string]: any} = req.body as {[key: string]: any}
      if(!Array.isArray(postBody)) {
        postBody = [postBody];
      }
      const data = postBody.map((profile: {[key: string]: any}) => {return formatProfile(profile)});
      await model.add(data);
    } else {
      throw "invalid request body";
    }
    return res.status(204).end();
  } catch(err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientValidationError) {
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
      let putBody = req.body;
      if(!Array.isArray(putBody)) {
        putBody = [putBody];
      }
      const data = putBody.map((profile:{[key: string]: any})=> {return formatProfile(profile)});
      await model.add(data);
    } else {
      throw "invalid request body";
    }
    return res.status(204).send({});
  } catch(err) {
    console.error(err);
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
