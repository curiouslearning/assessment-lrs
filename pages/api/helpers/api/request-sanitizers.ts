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
        console.log(typeof(req.body.data))
        if(!req.body.data.length)  {
          req.body.data = [req.body.data];
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
            const agent = statement.actor.account? statement.actor.account.name: '';
            const timestamp = statement.timestamp;
            const verb = statement.verb.id;
            const objectId = statement.object.id;
            const registration = statement.context? (statement.context.registration?
              statement.context.registration : '') : '';
            const seed = String.prototype.concat(
              agent,
              timestamp,
              verb,
              objectId,
              registration
            );
            const id = hash.update(seed).digest('base64');
            statement['id'] = id;
            statement['_id'] = id; //for MongoDB insertion
          }
          else {
            statement['_id'] = statement.id
          }
        });
        return body;
      } catch(err) {
          next(err);
      }
    },

    validateQueryParams: (
      req: NextRequest,
      res: NextFetchEvent,
      next:Next
    ): void => {
      try {
        const query = req.query
        if(query.statementId && query.voidedStatementId)  {
          throw new Error('cannot include both statementID and voidedStatementId');
        }
        if(query.statementId || query.voidedStatementId) {
          for(let prop in Object.keys(query)) {
            if (prop === 'attachments' || prop === 'format') {
              continue;
            } else {
              throw new Error(`invalid query parameter ${prop}`)
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
