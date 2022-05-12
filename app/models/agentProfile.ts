import dbClient from "../lib/db";
import { FormattedAgent } from './agent';
import { Prisma } from '@prisma/client';

export interface AgentProfile {
  profileId: string;
  agent: FormattedAgent;
  continent: string;
  country: string;
  region: string;
  city: string;
  lat: string;
  lng: string;
  referralId: string;
  utmAttribution: string;
  organization: string;
  language: string;
  stored: string;
}

export type AgentProfileInclude = Prisma.PromiseReturnType<typeof getProfile>;
export async function add(profiles: AgentProfile[]) {
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
                homePage_name_mbox_mbox_sha1sum_openid: {
                  mbox:agent.mbox? agent.mbox : "",
                  mbox_sha1sum: agent.mbox_sha1sum? agent.mbox_sha1sum : "",
                  openid: agent.openid? agent.openid : "",
                  name: agent.account? (agent.account.name? agent.account.name: "" ) : "",
                  homePage: agent.account? (agent.account.homePage? agent.account.homePage : "") : ""
                }
              }, create: {
                agentName: agent.name? agent.name: "",
                mbox: agent.mbox? agent.mbox : "",
                mbox_sha1sum: agent.mbox_sha1sum? agent.mbox_sha1sum : "",
                openid: agent.openid? agent.openid : "",
                homePage: agent.account? agent.account.homePage : "",
                name: agent.account? agent.account.name : ""
             }
           }
          },
          continent: profile.continent,
          country: profile.country,
          region: profile.region,
          language: profile.language,
          referralId: profile.referralId,
          utmAttribution: profile.utmAttribution,
          organization: profile.organization,
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

export async function getAllForAgent(agent: FormattedAgent, since: string): Promise<{profileId: string}[]> {
  const rows = await dbClient.agentProfile.findMany({
    where:{
      agent:{
        is: {
          mbox: agent.mbox? agent.mbox : "",
          mbox_sha1sum: agent.mbox_sha1sum? agent.mbox_sha1sum : "",
          openid: agent.openid? agent.openid : "",
          name: agent.account? (agent.account.name? agent.account.name: "" ) : "",
          homePage: agent.account? (agent.account.homePage? agent.account.homePage : "") : ""
        }
      },
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

export async function getProfile(agent: FormattedAgent, profileId: string) {
  const row = await dbClient.agentProfile.findFirst({
    where: {
      agent: {
        is: {
          mbox: agent.mbox? agent.mbox : "",
          mbox_sha1sum: agent.mbox_sha1sum? agent.mbox_sha1sum : "",
          openid: agent.openid? agent.openid : "",
          name: agent.account? (agent.account.name? agent.account.name: "" ) : "",
          homePage: agent.account? (agent.account.homePage? agent.account.homePage : "") : ""
        }
      },
      profileId: profileId
    },
    include: {
      agent: true
    }
  });
  return row;
}

export async function deleteProfile(agent: FormattedAgent, profileId: string): Promise<void> {
  await dbClient.agentProfile.delete({
    where: {
      profileId: profileId
    }
  });
}
