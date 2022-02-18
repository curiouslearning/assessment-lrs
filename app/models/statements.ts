import dbClient from "../lib/db";

export async function add(statements) {
  const inserts = await dbClient.$transaction(
    statements.map((statement) => dbClient.statement.create({ data: statement }))
  );
  return inserts.map((statement) => statement.id);
}

export async function all() {
  const rows = await dbClient.statement.findMany();
  return rows.map((row) => row.statement);
}

export async function getByIDs(ids) {
  return await dbClient.statement.findMany({
    select: { statement: true },
    where: { id: { in: ids } },
  });
}
