import dbClient from "../lib/db";
import { Prisma } from '@prisma/client'

export type StatementSelect = Prisma.PromiseReturnType<typeof getByIDs>;
export type StatementIds = Prisma.PromiseReturnType<typeof add>;
export type AllStatements = Prisma.PromiseReturnType<typeof all>;

export async function add(statements: any) {
  const ids = await dbClient.$transaction(
    statements.map((statement: any) => dbClient.statement.create({ data: statement, select: {id: true}}))
  );
  return ids;
}

export async function all()  {
  const rows = await dbClient.statement.findMany();
  return rows.map((row) => row.statement);
}

export async function getByIDs(ids: string[]) {
  return await dbClient.statement.findMany({
    select: { statement: true },
    where: { id: { in: ids } },
  });
}
