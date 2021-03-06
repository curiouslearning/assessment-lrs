import {
  profileCollection,
  singleAgentProfile,
  singleAgentCollection,
  illegalProfile
} from "../../../../fixtures/agentProfileFixtures.json";
import dbClient from "../../../../../../lib/db";
import handlers from "../../../../../../pages/api/xAPI/agents/profile/index";
import { testServer } from "../../../../../server";

const usr = "test-user";
const pw= "test-password";

beforeEach(async() => {
  //reset db
  await dbClient.activityProfile.deleteMany({});
  await dbClient.agentProfile.deleteMany({});
  await dbClient.statement.deleteMany({});
});

describe ("[POST] /api/xAPI/agents/profile", () => {
  it.skip("returns 404 on requests without authorization", async () => {
    await testServer(handlers).post("/").expect(404);
  });

  it("returns 204 No Content", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(profileCollection.profiles)
      .expect(204);
  });
  it("returns 204 No Content", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(singleAgentProfile.profile)
      .expect(204);
  });
  it("returns 400 on invalid agent profile", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(illegalProfile.profile)
      .expect(400);
  });
});

describe("[PUT] /api/xAPI/agents/profile", async () => {
  it.skip("returns 404 on requests without authorization", async () => {
    await testServer(handlers).get("/").expect(404);
  });

  it("returns 204 No Content", async () => {
    await testServer(handlers)
      .put("/")
      .auth(usr, pw)
      .send(singleAgentProfile.profile)
      .expect(204);
  });

  it("returns 204 No Content", async () => {
    await testServer(handlers)
      .put("/")
      .auth(usr, pw)
      .expect(204);
  });

  it("returns 400 on invalid agent profile", async () => {
    await testServer(handlers)
      .put("/")
      .auth(usr, pw)
      .send(illegalProfile.profile)
      .expect(400);
  });
});

describe("[GET] /api/xAPI/agents/profile", async () => {
  it.skip("returns 404 on requests without authorization", async () => {
    await testServer(handlers).get("/").expect(404);
  });

  it("returns 200 ok and no content", async () => {
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({
        agent: JSON.stringify(singleAgentProfile.agent),
        profileId: singleAgentProfile.profileId
      }).expect([])
      .expect(200);
  });

  it("returns 200 ok and no content", async () => {
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({
        agent: JSON.stringify(singleAgentCollection.agent)
      }).expect([])
      .expect(200);
  });

  it("returns 200 ok and the profile document", async () => {
    const {
      agent,
      profile,
      profileId
    } = singleAgentProfile;

    const formatExpected = (obj) => {
      obj.lat = obj.lat.slice(0, obj.lat.indexOf('.') + 3)
      obj.lng = obj.lng.slice(0, obj.lng.indexOf('.') + 3)
      return obj
    };
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(profile);

    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({
        agent: JSON.stringify(agent),
        profileId: profileId.profileId
      }).expect(res => {
        delete res.body['stored'];
        delete res.body['objectType'];
        delete res.body['agentId'];
        return res;
      }).expect(formatExpected(profile))
      .expect(200);
  });

  it("returns 200 ok and the list of available IDs", async () => {
    const {
      profiles,
      agent,
      profileIds
    } = singleAgentCollection;

    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(profiles);

    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({agent: JSON.stringify(agent)})
      .expect(res => res.body.sort() === profileIds.sort())
      .expect(200);
  });

  it("returns 200 ok and IDs with timestamps > 'since'", async () => {
    const {
      agent,
      profiles,
      since,
      profileIds
    } = singleAgentCollection;

    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(profiles);

    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({agent: JSON.stringify(agent), since: since})
      .expect(res => res.body.sort() === profileIds.sort())
      .expect(200);
  })

  it("returns 400 with no params", async() => {
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({})
      .expect(400);
  });

  it("returns 400 with invalid params", async () => {
    const {
      agent,
      since
    } = singleAgentCollection;
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({agentr: agent, timestamp: since})
      .expect(400);
  });
});

describe("[DELETE] /api/xAPI/agents/profile", () => {
  it.skip("returns 404 on improper authorization", async () => {
    await testServer(handlers).delete("/").expect(404)
  });

  it("returns 204 No Content", async () => {
    const {
      agent,
      profile,
      profileId
    } = singleAgentProfile;

    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(profile);

    await testServer(handlers)
      .delete("/")
      .auth(usr, pw)
      .query({agent: JSON.stringify(agent), profileId: profileId.profileId})
      .expect(204)
  });

  it("returns 400 on invalid params", async () => {
    const {
      agent,
      since,
    } = singleAgentProfile as any;

    await testServer(handlers)
      .delete("/")
      .auth(usr, pw)
      .query({agent: agent, since: since})
      .expect(400);
  });
});
