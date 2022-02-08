import dbClient from "../lib/db";

export async function add(profiles) {
  if(!Array.isArray(profiles)) {
    profiles = [profiles]
  }
  const inserts = await dbClient.$transaction(
    profiles.map((profile) => {
      const agent = profile.agent;
      if (!agent) throw "Agent Profile missing agent";
      dbClient.agentProfile.create({
        data:{
          profileId: profile.id,
          agent: {
            connectOrCreate: {
              where: {
                mbox: agent.mbox? agent.mbox : null,
                mbox_sha1sum: agent.mbox_sha1sum? agent.mbox_sha1sum : null,
                openid: agent.openid? agent.openid : null,
                name: agent.account? (agent.account.name? agent.account.name: null ) : null,
                homepage: agent.account? (agent.account.homepage? agent.account.homepage : null) : null
              }, create: {
                mbox: agent.mbox,
                mbox_sha1sum: agent.mbox_sha1sum,
                openid: agent.openid,
                homepage: agent.account? agent.account.homepage :null,
                name: agent.account? agent.account.name : null
             }
           }
          },
          continent: profile.continent,
          country: profile.country,
          region: profile.region,
          city: profile.city,
          lat: profile.lat,
          lng: profile.lng,
        },
        include: {agent: true}
      });
    })
  );
  return;
}

export async function all() {
  return await dbClient.agentProfile.findMany();
}

export async function getAllForAgent(agent, since) {
  const rows = await dbClient.agentProfile.findMany({
    where:{
      agent: agent,
      stored: {
        gt: since? since: new Date("1980-01-01").toISOString()
      }
    }
  });

  //format for xAPI and return
  return (rows.map((row) => {
    const agent = row.agent;
    if (agent.homepage && agent.name) {
      agent['account'] = {
        homepage: agent.homepage,
        name: agent.name
      };
      delete agent['id'];
      delete agent['homepage'];
      delete agent['name'];
      row.agent = agent;
      return row;
    }
  }));
}

export async function getProfile(agent, profileId) {
  const rows = await dbClient.agentProfile.findUnique({
    where: {
      agent: agent,
      profileId: profileId
    }
  });
  return (rows.map(rows => {
    const agent = row.agent;
    if (agent.homepage && agent.name) {
      agent['account'] = {
        homepage: agent.homepage,
        name: agent.name
      };
      delete agent['id'];
      delete agent['homepage'];
      delete agent['name'];
      row.agent = agent;
      return row;
    }
  }));
}

export async function deleteProfile(agent, profileId) {
  await dbClient.agentProfile.delete({
    where: {
      agent: agent,
      profileId: profileId
    }
  });
}
