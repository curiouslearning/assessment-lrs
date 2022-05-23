import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { FormattedAgent, Group } from '../../../../models/agent';

export type Next = (err: any) => void | Promise<void>;
export default function middleware () {
  return ({
    validateBody: ( //https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
      body: any
    ): boolean => {
      return (
        body &&
        Object.keys(body).length !== 0 &&
        ( Array.isArray(body) ||
          Object.getPrototypeOf(body) === Object.prototype )
      )
    },
    sanitizeQueryParams: (
      req: NextApiRequest,
      res: NextApiResponse,
      next: Next
    ): void => {
    },

    formatAgentToXapi: (agent: any): any => {
      const formattedAgent = agent;
      Object.keys(formattedAgent).forEach((prop) => {
        if (!formattedAgent[prop]) {
          delete formattedAgent[prop]
        }
      });
      if (formattedAgent.homePage && formattedAgent.name) {
        formattedAgent['account'] = {
          homePage: formattedAgent.homePage,
          name: formattedAgent.name
        };
        delete formattedAgent['homePage'];
        delete formattedAgent['name'];
      }
      delete formattedAgent['id'];
      return formattedAgent;
    },
    sanitizeBody: (
      req: NextApiRequest,
      res: NextApiResponse,
      next: Next
    ):void => {
      try{
        if(req.body && !req.body.length)  {
          req.body = [req.body];
        }
      } catch(err) {
        next(err);
      }

    },
    createStatementID: (
      body: Array<any>,
      res: NextApiResponse,
      next: Next
    ): Array<any> | undefined => {
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
    getIRI: (agent: FormattedAgent & Group) => {
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
      req: NextApiRequest,
      res: NextApiResponse,
      next:Next
    ): void => {
      try {
        if(!req.url || !req.headers || !req.headers.host) throw 'improper URL in request headers'
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
      } catch(err) {
        throw err;
      }
    }
  });
}
