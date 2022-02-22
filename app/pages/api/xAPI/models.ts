export interface Agent {
  mbox: string | null;
  mbox_sha1sum: string | null;
  openid: string | null;
  account: {
    name: string;
    homepage: string
  } | null;
};

export interface Activity {
  id: string;
  objectType: string | null;
  type: string | null
  definition: ActivityDef | null;
};

export interface ActivityDef {
  name: {[key: string]: string} | null;
  description: {[key: string]: string} | null;
  type: string | null;
  extensions: {[key: string]: string} | null;
  interactionType: string | null;
  correctResponsesPattern: Array<string> | null;
  choices: Array<string | number> | null;
  scale: Array<string | number> | null;
  target: Array<string | number> | null;
  steps: Array<string> | null;
  source: Array<string | number> | null;
};

export interface Group extends Agent{
  member: Array<Agent>;
  name: string | null;
};

export interface SubStatement {
  objectType: string;
  actor: Agent | Group | Activity;
  verb: {
    id: string;
    display: {[key: string]: string};
  }
  object: Agent | Group | Activity;
  result: Result | null;
  context: Context | null;
  timestamp: string | null;
};

export interface StatementRef {
  objectType: string;
  id: string
};

export interface Result {
  score: {
    min: number;
    max: number;
    raw: number;
    scaled: number
  } | null;
  success: boolean | null;
  completion: boolean | null;
  response: string | null;
  duration: string | null;
  extensions: {[key: string]: string} | null;
}

export interface Context {
  registration: string | null;
  instructor: Agent | Group | null;
  team: Group | null;
  contextActivities: {
    parent: [{id: string}] | null;
    grouping: [{id: string}] | null;
    category: [{id: string}] | null;
    other: [{id: string}] | null;
  } | null;
  revision: string | null;
  platform: string | null;
  language: string | null;
  statement: StatementRef | null;
  extensions: {[key: string]: string} | null;
}

export interface Statement {
  actor: Agent | Group | Activity;
  verb: {
    id: string;
    display: {[key: string]: string};
  }
  object: Agent | Group | Activity | SubStatement |StatementRef;
  result: Result | null;
  context: Context | null;
  timestamp: string | null;
  stored: string | null;
  version: string | null;
  authority: Agent | Group | Activity | null;
};
