import sinon from 'sinon';
import {
  illegalStatementCollection,
  singleStatement,
  statementCollection,
  voidedStatementCollection,
  relatedStatementCollection,
} from "../../../fixtures/statementFixtures.json";
import dbClient from "../../../../../lib/db";
import handlers from "../../../../../pages/api/xAPI/statements/index";
import { testServer } from "../../../../server";

const usr = "test-user";
const pw = "test-password";

beforeEach(async () => {
  // reset db
  await dbClient.activityProfile.deleteMany({});
  await dbClient.agentProfile.deleteMany({});
  await dbClient.statement.deleteMany({});
});

describe("[POST] /pages/xAPI/statements", () => {
  it.skip("returns 404 on requests without authorization", async () => {
    await testServer(handlers).get("/").expect(404);
  });

  it("returns 200 ok and the array of statement IDs", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(statementCollection.statements)
      .expect("content-type", "application/json; charset=utf-8")
      .expect(200);
  });

  it("returns 204 No Content when given an existing Statement", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(singleStatement.statement)
      .expect(200);

    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(singleStatement.statement)
      .expect(204);
  });

  it("returns 409 Conflict when given a conflicting statement", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(singleStatement.statement)
      .expect(200);

    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(singleStatement.conflict)
      .expect(409);
  });

  it.skip("returns 400 if not all statement ids are unique", async () => {
    //TODO: COPY MONGO ERROR MESSAGE
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(illegalStatementCollection.statements)
      .expect("content-type", "application/json; charset=utf-8")
      .expect(400);
  });
});

describe("[GET] /pages/api/statements", () => {
  it("returns 200 and a list of statements", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(statementCollection.statements);
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        delete res.body.statements[0]['stored'];
        delete res.body.statements[1]['stored'];
        delete res.body.statements[2]['stored'];
        delete res.body.statements[2]['id'];
        delete res.body.statements[3]['stored'];
        delete res.body.statements[3]['id'];
      })
      .expect({
        statements: statementCollection.statements,
        more: "",
      });
  });

  it("returns 200 and a single statement", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(statementCollection.statements);
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({statementId: "2ca05e3a-b571-48ea-b3b5-8d28216b3094"})
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        delete res.body.statements[0]['stored'];
      })
      .expect({
        statements: [statementCollection.statements[0]],
        more: "",
      });
  })

  it("returns 200 and no statements", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(statementCollection.statements);
    await testServer(handlers)
      .get("/")
      .auth(usr,pw)
      .query({since: new Date(Date.now()).toISOString()})
      .expect(200)
      .expect({
        statements: [],
        more: ''
      })
  });

  it("returns 200 and all statements", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(statementCollection.statements);
    await testServer(handlers)
      .get("/")
      .auth(usr,pw)
      .query({until: new Date(Date.now()).toISOString()})
      .expect(200)
      .expect((res) => {
        delete res.body.statements[0]['stored'];
        delete res.body.statements[1]['stored'];
        delete res.body.statements[2]['stored'];
        delete res.body.statements[2]['id'];
        delete res.body.statements[3]['stored'];
        delete res.body.statements[3]['id'];
      })
      .expect({
        statements: statementCollection.statements,
        more: ""
      })
  })

  it("returns 200 and an empty statement array", async () => {
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect({
        statements: [],
        more: "",
      });
  });

  it("returns 200 and the statement with the matching actor", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(statementCollection.statements)
      .expect(200);

    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({
        agent: JSON.stringify({mbox: "mailto:ev@picanufu.kp"})
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        delete res.body.statements[0]['stored']
      })
      .expect({
        statements: [statementCollection.statements[0]],
        more: ""
      });
  });

  it("returns 200 and the statement with the matching object", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(statementCollection.statements)
      .expect(200);
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({activity: "http://adlnet.gov/expapi/activities/example"})
      .expect(200)
      .expect(res => {
        delete res.body.statements[0].stored
        delete res.body.statements[0].id
      })
      .expect({
        statements: [statementCollection.statements[3]],
        more: ""
      });
  })

  it("returns 200 and statements with the matching verb", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(statementCollection.statements)
      .expect(200);
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({verb: "http://adlnet.gov/expapi/verbs/answered"})
      .expect(200)
      .expect(res => {
        delete res.body.statements[0].stored
        delete res.body.statements[0].id
      })
      .expect({
        statements: [statementCollection.statements[3]],
        more: ""
      });
  })

  it("returns 200 and exactly two statements", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(statementCollection.statements)
      .expect(200);
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({
        limit: 2
      })
      .expect(200)
      .expect(res => {
        res.body.statements.length === 2
      });
  })
  it.skip("returns 200 and exactly one statement", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(voidedStatementCollection.statements)
      .expect(200);

    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .expect(200)
      .expect(res => {
        delete res.body.statements[0].id;
        delete res.body.statements[0].stored;
      })
      .expect({
        statements: [voidedStatementCollection.statements[2]],
        more: ""
      })

  })

  it("returns 200 and all data referencing the activity id", async () => {
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(relatedStatementCollection.statements)
      .expect(200);

    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({activity: "https://data.curiouslearning.org/xAPI/activities/assessment/english/example", related_activities: true})
      .expect(200)
      .expect(res => {
        res.body.statements.forEach((statement) => {
          delete statement.id;
          delete statement.stored;
        })
      })
      .expect((res) => {
        if(res.body.statements.length !== relatedStatementCollection.statements.length) {
          throw new Error("Not all statements returned")
        }
      })
  });

  it("returns 200 and the next set of data excluding the cursor", async () => {
    function matchIfString(res: any) {
      if(res.body.statements === statementCollection.statements.slice(0,2)) {
        if (typeof res.more === "string" && res.more !== "")
        {
          return true
        }
      }
      return false;
    }
    await testServer(handlers)
      .post("/")
      .auth(usr, pw)
      .send(statementCollection.statements)
      .expect(200)
    const res = await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({limit: 2})
      .expect(200)
      .expect(res => {
        delete res.body.statements[0]['stored'];
        delete res.body.statements[1]['stored'];
      })
      .expect(matchIfString);

    const params = "?" + res.body.more.split('?')[1];

    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query(params)
      .expect(200)
      .expect(res=> {
        delete res.body.statements[0]['stored'];
        delete res.body.statements[0]['id'];
        delete res.body.statements[1]['stored'];
        delete res.body.statements[1]['id'];
      })
      .expect({
        statements: statementCollection.statements.slice(2, 4),
        more: ""
      })

  });

  it("returns 400 when statementId and voidedStatementId are specified", async () => {
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({ statementId: "statement", voidedStatementId: "voided" })
      .expect(400);
  });

  it("returns 400 when (voided) statemenId is passed with illegal params", async () => {
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({ statementId: "statement", verb: "http://adlnet.gov/expapi/interacted" })
      .expect(400);
  });

  it.skip("returns 404 on requests without authorization", async () => {
    await testServer(handlers).get("/").expect(404);
  });

  it.skip("includes the X-Experience-API-Consistent-Through header", async () => {
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .expect(200)
      .expect(
        "X-Experience-API-Consistent-Through",
        new Date(Date.now()).toISOString()
      );
  });

  it.skip("uses multipart response format when returning attachments", async () => {
    //TODO: implement test of multipart format
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({ attachments: true })
      .expect("Content-Type", "multipart/mixed");
  });

  it.skip("uses application/json when not returning attachments", async () => {
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .query({ attachments: false })
      .expect("Content-Type", /json/);
  });

  it.skip('returns a "Last-Modified" header', async () => {
    //TODO: have Mongo return statement with proper LastMod
    const lastMod = new Date(Date.now()).toISOString();
    await testServer(handlers)
      .get("/")
      .auth(usr, pw)
      .expect("Last-Modified", lastMod);
  });
});

describe("[PUT] /pages/api/statements", () => {
  it.skip("returns 404 on requests without authorization", async () => {
    await testServer(handlers)
      .put("/")
      .send(singleStatement.statement)
      .expect(404);
  });

  it.skip("returns 400 when attempting to PUT multiple statements", async () => {
    //TODO: attach multiple statements
    await testServer(handlers)
      .put("/")
      .auth(usr, pw)
      .send(statementCollection.statements)
      .expect(400);
  });

  it.skip("returns 409 when attempting to PUT a conflicting statement", async () => {
    await testServer(handlers)
      .put("/")
      .auth(usr, pw)
      .send(singleStatement.conflict)
      .expect(409);
  });

  it.skip("returns 201 on a successful PUT", async () => {
    await testServer(handlers)
      .put("/")
      .auth(usr, pw)
      .send(singleStatement.statement)
      .expect(201);
  });
});

describe("[HEAD] /pages/api/statements", () => {
  it.skip("returns 201 and the metadata for the statement", async () => {});

  it.skip("returns 201 and the metadata for the statements", async () => {});

  it.skip("returns 404 on requests without authorization", async () => {});

  it.skip("returns 400 on ", async () => {});
});
