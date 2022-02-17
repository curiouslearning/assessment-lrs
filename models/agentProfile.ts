import dbClient from "../lib/db";

export async function add(profiles) {
  const inserts = await dbClient.$transaction(
    profiles.map((profile) => {
      const agent = profile.agent;
      if (!agent) throw "Agent Profile missing agent";
      return dbClient.agentProfile.create({
        data:{
          profileId: profile.profileId,
          agent: {
            connectOrCreate: {
              where: {
                homepage_name_mbox_mbox_sha1sum_openid: {
                  mbox:agent.mbox? agent.mbox : "",
                  mbox_sha1sum: agent.mbox_sha1sum? agent.mbox_sha1sum : "",
                  openid: agent.openid? agent.openid : "",
                  name: agent.account? (agent.account.name? agent.account.name: "" ) : "",
                  homepage: agent.account? (agent.account.homepage? agent.account.homepage : "") : ""
                }
              }, create: {
                mbox: agent.mbox? agent.mbox : "",
                mbox_sha1sum: agent.mbox_sha1sum? agent.mbox_sha1sum : "",
                openid: agent.openid? agent.openid : "",
                homepage: agent.account? agent.account.homepage : "",
                name: agent.account? agent.account.name : ""
             }
           }
          },
          continent: profile.continent,
          country: profile.country,
          region: profile.region,
          languages: profile.languages,
          referralId: profile.referralId,
          city: profile.city,
          lat: profile.lat,
          lng: profile.lng,
        },
        include: {agent: true}
      });
    })
  );
  return inserts;
}

export async function all() {
  return await dbClient.agentProfile.findMany();
}

export async function getAllForAgent(agent, since) {
  const rows = await dbClient.agentProfile.findMany({
    where:{
      agent,
      stored: {
        gt: since? new Date(since): new Date("1980-01-01").toISOString()
      }
    },
    select: {
      profileId: true
    }
  });

  return rows;
}

export async function getProfile(agent, profileId) {
  const row = await dbClient.agentProfile.findFirst({
    where: {
      agent,
      profileId: profileId
    },
    include: {
      agent: true
    }
  });
  return row;
}

export async function deleteProfile(agent, profileId) {
  await dbClient.agentProfile.delete({
    where: {
      profileId: profileId
    }
  });
}
