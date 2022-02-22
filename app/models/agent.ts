import dbClient from '../lib/db';
export interface FormattedAgent {
  objectType: string;
  mbox: string;
  mbox_sha1sum: string;
  openid: string;
  account: {
    name: string;
    homepage: string;
  };
}

export interface Group extends FormattedAgent {
  member: Array<FormattedAgent>;
  name: string;
}

export async function createAgent(agent: FormattedAgent) {
  const id = await dbClient.agent.create({data: agent, select: { id: true }});
  return id;
}

export async function findByAgent(agent: FormattedAgent) {
    const agentId = await dbClient.agent.findFirst({
     where: {
       mbox: agent.mbox? agent.mbox : "",
       mbox_sha1sum: agent.mbox_sha1sum? agent.mbox_sha1sum : "",
       openid: agent.openid? agent.openid : "",
       name: agent.account && agent.account.name? agent.account.name : "",
       homepage: agent.account && agent.account.homepage? agent.account.homepage: ""
     }
   });
   return agentId
}

export async function findById(id: string) {
  const agent = await dbClient.agent.findUnique({where:{id: id}});
  return agent;
}
