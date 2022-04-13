import dbClient from "../lib/db";
import { Prisma } from '@prisma/client'
import {
  Agent,
  Group,
  Activity,
  StatementRef,
  Statement
} from '../pages/api/xAPI/models'
import * as agentModel from './agent';

export type QueryParams = {
  id?: string;
  agent?: Agent | Group | Activity | string;
  verb?: string;
  activity?: Agent | Group | Activity | StatementRef | Statement | string;
  context?: {
    registration: string;
  };
  timestamp?: any;
}

export type QueryOptions = {
  params: QueryParams;
  limit?: number;
  sort?: {[key:string]: string};
  attachments?: Array<string>;
  format?: string;
}

export type StatementSelect = Prisma.PromiseReturnType<typeof getByIDs>;
export type StatementIds = Prisma.PromiseReturnType<typeof add>;
export type AllStatements = Prisma.PromiseReturnType<typeof all>;
export type StatementParams = Prisma.PromiseReturnType<typeof getByParams>;

export async function add(statements: any) {
  const ids = await dbClient.$transaction(
    statements.map((statement: any) => dbClient.statement.create({ data: statement, select: {id: true}}))
  );
  return ids;
}

export async function all()  {
  const rows = await dbClient.statement.findMany({select: {statement: true}});
  return rows.map((row) => row.statement);
}

export async function getByIDs(ids: string[]) {
  return await dbClient.statement.findMany({
    select: { statement: true },
    where: { id: { in: ids } },
  });
}

export async function getByParams(params: QueryOptions) {
  const queryObj = await buildQueryObj(params);
  console.log(queryObj);
  const rows = await dbClient.statement.findMany(queryObj);
  console.log(`found ${rows.length} rows`)
  return rows.map(row => row.statement);
}

async function buildQueryObj (options: QueryOptions) {
  const params = options.params;
  let queryObj: any = {where: {}, select: {statement: true}};
  if (params.id) {
    console.log("setting id");
    queryObj.where['id'] = params.id
  }
  if (params.agent) {
    queryObj.where["OR"] = [
      {actorId: await getIdentifierForObjectType(params.agent)},
      {objectId: await getIdentifierForObjectType(params.agent)}
    ];
    console.log(queryObj.where.OR);
  }
  if (params.activity) {
    queryObj.where["OR"] =[
      {actorId: await getIdentifierForObjectType(params.activity)},
      {objectId: await getIdentifierForObjectType(params.activity)}
    ];
  }
  if (params.context) {
    queryObj.where["context"] = {
      registration: queryObj.context.registration
    };
  }
  if (params.verb) {
    queryObj.where["verbId"] = params.verb
  }
  if (params.timestamp) {
    queryObj.where["stored"] = params.timestamp;
  }
  if (options.limit) {
    queryObj["take"] = options.limit < 1000 ? options.limit : 1000;
  }
  if (options.attachments) {
    queryObj.select["attachments"] = options.attachments
  }
  if (options.sort) {
    queryObj["orderBy"] = [options.sort]
  }
  return queryObj
}

async function getIdentifierForObjectType (param: any ) {
  let subObj
  if (param.id ) {
    subObj = param.id
  } else if (param.objectType === "SubStatement") {
    //TODO: write out identifier logic for substatements
  } else {
    //TODO: REWRITE POST TO CREATE AGENTS, ACTIVITIES AND SUBSTATEMENT OBJECTS
    subObj = param
  }
  return subObj;
}
