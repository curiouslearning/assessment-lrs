import Cors from "cors";
import deepEqual from "deep-equal";
import type { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "../../helpers/api/api-handler";
import middleware, { Next } from "../../helpers/api/middleware";
import * as statementsModel from "../../../../models/statements";
import {
  Agent,
  Group,
  Activity,
  SubStatement,
  StatementRef,
  Statement,
  Result,
  Context
} from '../models';
import { Prisma } from "@prisma/client";

const helpers = middleware();
enum FormatTypes {
  ids = "ids",
  exact = "exact",
  canonical = "canonical",
}

/********************************HELPER MIDDLEWARE*****************************/
const cors = Cors({
  methods: ["GET", "HEAD"],
});

async function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      console.log(result);
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

/******************************GET, HEAD***************************************/
async function handleGET(req: NextApiRequest, res: NextApiResponse): Promise<any>{
  try {
    // await runMiddleware(req, res, sanitizeQueryParams);
    // await runMiddleware(req, res, cors);
    const url = req.url? req.url : "";
    let fullURL =  new URL(url, `http://${req.headers.host}`)
    const params = fullURL.searchParams;
    const query = Object.fromEntries(params.entries());
    helpers.validateQueryParams(req, res, (err) => {if (err) throw err});
    const queryOptions = generateQueryParams(query);
    const statements = await statementsModel.getByParams(queryOptions);
    let more = ""
    if (statements.length === queryOptions.limit) { //more results likely exist
      let cursor = statements[statements.length -1].id
      more = `${fullURL}&cursor=${encodeURIComponent(cursor)}`;
    }
    return res.status(200).json({
      statements,
      more,
    });
  } catch (err) {
    throw err;
  } finally {
  }
}

//TODO: Remove and merge this logic into the logic in /models/statements.ts
function generateQueryParams(query: any = {}): statementsModel.QueryOptions {
  let params = {} as statementsModel.QueryParams;
  let options = {} as statementsModel.QueryOptions;
  if (query) {
    if (query.voidedStatmentId) {
      params["id"] = query.voidedStatmentId;
    } else if (query.statementId) {
      params["id"] = query.statementId;
    }

    if (query.agent) {
      const id =  helpers.getIRI(JSON.parse(query.agent));
      params["agent"] = id? id: "";
    }
    if (query.verb) {
      params["verb"] = query.verb;
    }
    if (query.activity) {
      params["activity"] = query.activity
    }
    if (query.registration) {
      params["registration"] = query.registration
    }
    //TODO: implement these related flags as described in the specification
    // github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md#213-get-statements
    if (query.related_activities) {
      params["activity"] = JSON.parse(query.activity);
    }
    if (query.related_agents) {
      params["agent"] = JSON.parse(query.activity);
    }

    if (query.since && query.until && query.since < query.until) {
      params["timestamp"] = {
        or: [{ gte: query.since }, { lte: query.until }],
      };
    } else if (query.since) {
      params["timestamp"] = { gte: query.since };
    } else if (query.until) {
      params["timestamp"] = { lte: query.until};
    }
  }
  options["limit"]= query.limit && query.limit > 0 ? parseInt(query.limit):1000;
  options["format"] = query.format ? query.format : "exact";

  options["attachments"] = query.attachments ? query.attachments : false;
  options["sort"] = {
    stored: query.ascending ? 'asc' : 'desc',
  };

  if(query.cursor) {
    options["cursor"] = query.cursor;
  }
  options["params"] = params;
  return options;
}

async function handleHEAD(req: NextApiRequest, res: NextApiResponse): Promise<any>{
  return res.status(500).send("I'm not implemented yet!");
}

/************************************POST, PUT ********************************/
async function addSingleStatement(
  req: NextApiRequest,
  res: NextApiResponse,
  next: Next
): Promise<void> {}

async function addMultipleStatements(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {}

async function handlePOST(req: NextApiRequest, res: NextApiResponse): Promise<any> {
  //TODO: REWRITE POST TO CREATE AGENTS, ACTIVITIES AND SUBSTATEMENT OBJECTS
  if (!req.body) {
    return res.status(200).end();
  }
  try {
    helpers.sanitizeBody(req, res, (err) => {
      throw err;
    });
    let body = req.body;

    //elevate indexable fields for DB storage
    let rows = body.map((statement: any) => {
      const {
        actor,
        verb,
        object,
        timestamp,
        attachments
      } = statement
      const row = {
        id: statement.id? statement.id: "",
        actorId: helpers.getIRI(actor),
        actorType: actor.objectType? actor.objectType: "Agent",
        verbId: verb.id,
        objectId: object.id? object.id: helpers.getIRI(object),
        objectType: object.objectType? object.objectType: "Activity",
        timestamp: timestamp,
        stored: new Date(Date.now()).toISOString(),
        statement: statement
      }
      row.statement['stored'] = row.stored;
      return row;
    });

    rows = helpers.createStatementID(rows, res, (err) => {
      throw err;
    });
    req.body = rows;
    const ids = await statementsModel.add(rows);
    return res.status(200).send(ids);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if(err.code === 'P2002') {
        const dupes = await runDupeCheck(req.body)
        if(dupes) {
          return res
            .status(409)
            .send(
              `conflicting statement(s) already in database`
          );
        } else {
          return res.status(204)
            .send('insert did not complete, 1 or more duplicate records');
        }
      }
    }
    throw err;
  } finally {
  }
}
async function runDupeCheck(rows: any) {
  const requestIds = rows.map((element: any) => element.id);
  const dupes = await statementsModel.getByIDs(requestIds);
  const conflicts = dupes.map((dupe: any) => {
    const conflict = rows.find((elem: any) => elem.statement.id === dupe.statement.id);
    if(conflict){
      return {original: dupe.statement, conflict: conflict.statement};
    }
  });
  let conflictIds = [];
  conflicts.forEach((pair) => {
    if(pair) {
      if (pair.original) {
        delete pair.original["stored"];
      }
      if (pair.conflict) {
        delete pair.conflict["stored"];
      }
      if (!deepEqual(pair.original, pair.conflict)) {
        conflictIds.push(pair.original.id);
      }
    }
  });
  if(conflictIds.length > 0) {
    return true;
  }
  return false;
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse): Promise<any> {
  return res.status(500).send("I'm not implemented yet!");
}

export default apiHandler({
  get: handleGET,
  post: handlePOST,
  put: handlePUT,
  head: handleHEAD,
});
