import Cors from "cors";
import deepEqual from "deep-equal";
import type { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "../../helpers/api/api-handler";
import middleware, { Next } from "../../helpers/api/request-sanitizers";
import dbClient from "../../../../lib/db";
import { Prisma } from "@prisma/client";

const helpers = middleware();
enum FormatTypes {
  ids = "ids",
  exact = "exact",
  canonical = "canonical",
}
type QueryParams = {
  statementId?: string;
  voidedStatmentId?: string;
  agent: {
    objectType?: "Agent";
    name?: string;
    account: {
      homepage: string;
      name: string;
    };
  };
  activit: string;
  registration: string;
  related_activities: bool;
  related_agents: bool;
  since: timestamp;
  until: Timestamp;
  limit: number;
  format: FormatTypes;
  attachments: bool;
  ascending: bool;
};

/********************************HELPER MIDDLEWARE*****************************/
const cors = Cors({
  methods: ["GET", "HEAD"],
});

async function runMiddleware(
  req: NextRequest,
  res: NextResponse,
  fn: Next
): void {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      console.log(result);
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

/******************************GET, HEAD***************************************/
async function handleGET(req: NextRequest, res: NextResponse): void {
  try {
    // await runMiddleware(req, res, sanitizeQueryParams);
    // await runMiddleware(req, res, cors);
    helpers.validateQueryParams(req, res, (err) => {if (err) throw err});
    const queryOptions = generateQueryParams(req.query);
    const rows = await dbClient
      .statement
      .findMany();
    const statements = rows.map((row) => row.statement);
    res.status(200).json({
      statements: statements,
      more: "",
    });
  } catch (err) {
    throw err;
  } finally {
  }
}

function generateQueryParams(query: QueryParams = {}): any {
  let options = {};
  let params = {};
  if (query) {
    if (query.voidedStatmentId) {
      params["_id"] = query.voidedStatmentId;
    } else if (query.statementId) {
      params["_id"] = query.statementId;
    }

    if (query.agent) {
      params["actor"] = query.agent;
      params["object"] = query.agent;
    }
    if (query.verb) {
      params["verb"] = query.verb;
    }
    if (query.activity) {
      params["object"]["id"] = query.activity;
    }
    if (query.registration) {
      params["context"]["registration"] = query.registration;
    }
    //TODO: implement these related flags as described in the specification
    // github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md#213-get-statements
    if (query.related_activities) {
      params["object"]["id"] = query.activity;
    }
    if (query.related_agents) {
      params["actor"] = query.activity;
    }

    if (query.since && query.until && query.since < query.until) {
      params["timestamp"] = {
        or: [{ $gte: query.since }, { $lte: query.until }],
      };
    } else if (query.since) {
      params["timestamp"] = { $gte: query.since };
    } else if (query.until) {
      param["timestamp"] = { $lte: query.since };
    }
  }
  options["limit"] = query.limit ? query.limit : 0;
  options["format"] = query.format ? query.format : "exact";

  options["attachments"] = query.attachments ? query.attachments : false;
  options["sort"] = {
    stored: query.ascending ? 1 : -1,
  };
  options["params"] = params;
  return options;
}

async function handleHEAD(req: NextRequest, res: NextResponse): void {
  return res.status(500).send("I'm not implemented yet!");
}

/************************************POST, PUT ********************************/
async function addSingleStatement(
  req: NextRequest,
  res: NextResponse,
  next: Next
): void {}

async function addMultipleStatements(
  req: NextRequest,
  res: NextResponse
): void {}

async function handlePOST(req: NextRequest, res: NextResponse): void {
  if (!req.body) {
    res.status(200).end();
  }
  try {
    helpers.sanitizeBody(req, res, (err) => {
      throw err;
    });
    let body = req.body;

    //elevate indexable fields for DB storage
    let rows = body.map((statement) => {
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
    req['rows'] = rows;
    const inserts = await dbClient.$transaction(
      rows.map((row) => dbClient.statement.create({data: row}))
    );
    const ids = inserts.map((statement) => statement.id);
    res.status(200).send(ids);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if(err.code === 'P2002') {
        return await runDupeCheck(req, res, err)
      }
    }
    throw err;
  } finally {
  }
}
async function runDupeCheck(req, res, err) {
  const requestIds = req.rows.map((element) => element.id);
  const dupes = await dbClient
    .statement
    .findMany({select: {statement: true}, where: {id:{ in: requestIds}}})
  const conflicts = dupes.map((dupe) => {
    const conflict = req.rows.find((elem) => elem.statement.id === dupe.statement.id);
    if(conflict){
      return {original: dupe.statement, conflict: conflict.statement};
    }
  });
  let conflictIds = [];
  conflicts.forEach((pair) => {
    delete pair.original["stored"];
    delete pair.conflict["stored"];
    if (!deepEqual(pair.original, pair.conflict)) {
      conflictIds.push(pair.original.id);
    }
  });
  if(conflictIds.length > 0) {
      return res
        .status(409)
        .send(
          `conflicting statement(s) with id(s) ${conflictIds} already in database`
      );
  }
  return res.status(204).send('insert did not complete, 1 or more duplicate records');
}

async function handlePUT(req: NextRequest, res: NextResponse): void {
  return res.status(500).send("I'm not implemented yet!");
}

export default apiHandler({
  get: handleGET,
  post: handlePOST,
  put: handlePUT,
  head: handleHEAD,
});
