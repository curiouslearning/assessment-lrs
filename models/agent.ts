import dbClient from "../lib/db";

export async function createAgent(agent) {
  const id = await dbClient.agent.create({data: agent, select: { id: true }});
  return id;
}

export async function findByAgent(agent) {
    const agentId = await dbClient.agent.findFirst({
     where: {
       mbox: agent.mbox? agent.mbox : null,
       mbox_sha1sum: agent.mbox_sha1sum? agent.mbox_sha1sum : null,
       openid: agent.openId? agent.openid : null,
       account: agent.account? agent.account : null
     }
   });
   return agentId
}

export async function findById(id) {
  const agent = await dbClient.agent.findUnique({where:{id: id}});
  return agent;
}
