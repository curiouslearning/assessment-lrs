import type { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import querystring from 'querystring'
import crypto from 'crypto'

export type Next = () => void | Promise<void>;
export default function middleware () {
  return ({
    sanitizeQueryParams: (
      req: NextRequest,
      res: NextFetchEvent,
      next: Next
    ): void => {

    },
    sanitizeBody: (
      req: NextRequest,
      res: NextFetchEvent,
      next: Next
    ):void => {
      try{
        console.log(typeof(req.body))
        if(!req.body.length)  {
          req.body = [req.body];
        }
      } catch(err) {
        next(err);
      }

    },
    createStatementID: (
      body: Array,
      res: NextFetchEvent,
      next: Next
    ): Array => {
      try {
        body.forEach((statement) => {
          if(!statement.id){
            const hash = crypto.createHash('sha256');
            const agent = statement.actorId;
            const timestamp = statement.timestamp;
            const verb = statement.verbId;
            const objectId = statement.objectId;
            const registration = statement.statement.context? (statement.statement.context.registration?
              statement.statement.context.registration : '') : '';
            const seed = String.prototype.concat(
              agent,
              timestamp,
              verb,
              objectId,
              registration
            );
            const id = hash.update(seed).digest('base64');
            statement.id = id;
            statement.statement['id'] = id;
          }
        });
        return body;
      } catch(err) {
          next(err);
      }
    },
    getIRI: (agent) => {
      if (agent.mbox) {
        return agent.mbox
      }
      if (agent.mbox_sha1sum) {
        return agent.mbox_sha1sum
      }
      if (agent.openid) {
        return agent.openid
      }
      if (agent.account) {
        return `${agent.account.homePage}/${agent.account.name}`;
      }
      if (agent.member) {
        if (agent.name) {
          return agent.name;
        } else {
          return "Group"
        }
      }
      if(agent.objectType && agent.objectType === "SubStatement") {
        return "SubStatement"
      }
      console.warn(`Unable to find IRI for object: ${JSON.stringify(agent)}`);
      return null;
    },
    validateQueryParams: (
      req: NextRequest,
      res: NextFetchEvent,
      next:Next
    ): void => {
      try {
        const query = new URL(req.url, `http://${req.headers.host}`).searchParams;
        if(query.has("statementId") && query.has("voidedStatementId"))  {
          throw 'cannot include both statementID and voidedStatementId';
        }
        if(query.has("statementId") || query.has("voidedStatementId")) {
          for (const prop of query.keys()){
            if (!(prop === "statementId" ||
                prop === "voidedStatementId") &&
                prop !== 'attachments' &&
                prop !== 'format') {
              throw `invalid query parameter ${prop}`
            }
          }
        }
      next(req.query);
      } catch(err) {
        next(err);
      }
    }
  });
}
