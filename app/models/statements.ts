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
  registration: string;
  timestamp?: any;
}

export type QueryOptions = {
  params: QueryParams;
  limit?: number;
  sort?: {[key:string]: string};
  attachments?: Array<string>;
  format?: string;
  cursor?: string;
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

export async function getByParams(params: QueryOptions): Promise<Statement[]> {
  const queryObj = await buildQueryObj(params);
  const rows = await dbClient.statement.findMany(queryObj);
  const statements = rows.map(row => row.statement) as unknown as Statement[];
  return statements;
}

async function buildQueryObj (options: QueryOptions) {
  const params = options.params;
  let queryObj: any = {where: {}, select: {statement: true}};
  if (params.id) {
    queryObj.where['id'] = params.id
  }
  if (params.agent) {
    queryObj.where["OR"] = [
      {actorId: await getIdentifierForObjectType(params.agent)},
      {objectId: await getIdentifierForObjectType(params.agent)}
    ];
  }
  if (params.activity) {
    queryObj.where["OR"] =[
      {actorId: params.activity},
      {objectId: params.activity}
    ];
  }
  if (params.registration) {
    queryObj.where["context"] = {
      registration: queryObj.registration
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
    queryObj["orderBy"] = [
      {id: "asc"},
      options.sort
    ]
  }

  if (options.cursor) {
    queryObj["cursor"] = {
      id: options.cursor
    }
    queryObj["skip"] = 1
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
