## an LRS to support the Curious Reader platform

# Instructions for Using the API
This is a RESTful API, being implemented according to the [xAPI specification](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-About.md#experience-api). It is in beta and therefore not all LRS functionality is present, however what has been implemented is fully conformant with the specification unless otherwise specified. All resources for LRS functionality are located at `/api/xAPI/{resource}`. Any resources outside of the specification can be found at `api/{resource}`

## Resources


### api/xAPI/statements
----
Full LRS conformant behavior is specified [here](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md#stmtres)

Currently, the API has the following support for this resource:

- POST: 
    - Accepts: a list of xAPI compliant [Statements](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#statements) in JSON format
    - RETURNS: `200`, the list of Statement IDs
    - STATUS: implemented
- PUT: NOT implemented
- GET: partially implemented:
    - Accepts (taken from [Statements Resource](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md#213-get-statements)): 
        <table>
            <tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th><th>Required</th></tr>
            <tr id="2.1.3.s1.table1.row1">
                <td>statementId</td>
                <td>String</td>
                <td> </td>
                <td>Id of Statement to fetch</td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row2">
                <td>voidedStatementId</td>
                <td>String</td>
                <td> </td>
                <td>Id of voided Statement to fetch. </td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row3">
                <td>agent</td>
                <td>Agent or Identified Group Object (JSON)</td>
                <td> </td>
                <td>Filter, only return Statements for which the specified Agent or Group is 
                the Actor or Object of the Statement.
                    <ul>
                        <li> 
                            Agents or Identified Groups are equal when the same 
                            Inverse Functional Identifier is used in each Object compared and 
                            those Inverse Functional Identifiers have equal values.
                        </li><li>
                            For the purposes of this filter, Groups that have members 
                            which match the specified Agent	based on their Inverse Functional
                            Identifier as described above are considered a match
                        </li>
                    </ul>
                </td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row4">
                <td>verb</td>
                <td>Verb id (IRI)</td>
                <td> </td>
                <td>Filter, only return Statements matching the specified Verb id.</td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row5">
                <td>activity</td>
                <td>Activity id (IRI)</td>
                <td> </td>
                <td>
                    Filter, only return Statements for which the Object of the Statement is 
                    an Activity with the specified id.
                </td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row6">
                <td>registration</td>
                <td>UUID</td>
                <td> </td>
                <td>
                    Filter, only return Statements matching the specified registration 
                    id. Note that although frequently a unique registration will be used 
                    for one Actor assigned to one Activity, this cannot be assumed. 
                    If only Statements for a certain Actor or Activity are required, 
                    those parameters also need to be specified.
                </td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row7">
            <td>related_activities</td>
                <td>Boolean</td>
                <td>false</td>
                <td>
                    Apply the Activity filter broadly. Include Statements for which the Object,
                    any of the  context Activities, or any of those properties in a contained
                    SubStatement match the Activity parameter, instead of that parameter's 
                    normal behavior. Matching is defined in the same way it is for the 
                    "activity" parameter.
                </td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row8">
                <td>related_agents</td>
                <td>Boolean</td>
                <td>false</td>
                <td>
                    Apply the Agent filter broadly. Include Statements for which 
                    the Actor, Object, Authority, Instructor, Team,
                    or any of these properties in a contained SubStatement match the Agent parameter,
                    instead of that parameter's normal behavior. Matching is defined in the same way
                    it is for the "agent" parameter.
                </td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row9">
                <td>since</td>
                <td>Timestamp</td>
                <td> </td>
                <td>Only Statements stored since the specified Timestamp (exclusive) are returned.</td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row10">
                <td>until</td>
                <td>Timestamp</td>
                <td> </td>
                <td>Only Statements stored at or before the specified Timestamp are returned.</td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row11">
                <td>limit</td>
                <td>Nonnegative Integer</td>
                <td>0</td>
                <td>
                    Maximum number of Statements to return. 0 indicates return the 
                    maximum the server will allow.
                </td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row12">
                <td>format</td>
                <td>String: (<code>ids</code>, <code>exact</code>, or <code>canonical</code>)</td>
                <td>exact</td>
                <td>If <code>ids</code>, only include minimum information necessary in Agent, Activity, Verb 
                    and Group Objects to identify them. For Anonymous Groups this means including 
                    the minimum information needed to identify each member. 
                    <br/><br/>
                    If <code>exact</code>, return Agent, Activity, Verb and Group Objects populated exactly as they 
                    were when the Statement was received. An LRS requesting Statements for the purpose 
                    of importing them would use a format of "exact" in order to maintain 
                    Statement Immutability.  
                    <br/><br/>
                    If <code>canonical</code>, return Activity Objects and Verbs populated with the canonical
                    definition of the Activity Objects and Display of the Verbs as determined by the LRS, after
                    applying the language filtering process,
                    and return the original Agent and Group Objects as in "exact" mode.  
                </td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row13">
                <td>attachments</td><td>Boolean</td><td>false</td>
                <td>If <code>true</code>, the LRS uses the multipart response format and includes all attachments as 
                described previously.  If <code>false</code>, the LRS sends the prescribed response with Content-Type 
                application/json and does not send attachment data.</td>
                <td>Optional</td>
            </tr>
            <tr id="2.1.3.s1.table1.row14">
                <td>ascending</td>
                <td>Boolean</td>
                <td>false</td>
                <td>If <code>true</code>, return results in ascending order of stored time</td>
                <td>Optional</td>
            </tr>
        </table>

        __Note:__ The values of Boolean parameters are represented as `true` or `false` as in JSON.

    - Query Parameters:

        - statementId: implemented
        - voidedStatmentId: NOT implemented
        - agent: implemented
        - verb: implemented
        - activity: implemented
        - registrtion: implemented
        - related_activities: implemented
        - related_ agents: NOT implemented
        - since: implemented
        - until: implemented
        - limit: implemented
        - format: NOT implemented (all resources returned in `exact` format)
        - attachments: NOT implemented
        - ascending: implemented
- Alternate Request Syntax: NOT implemented

#### Example Queries

- Fetch all data between May 1st and May 6th 2022, exclusive: 
`https://{hostname}/api/xAPI/statements?since=2022-05-21&until=2022-06-21`
- Fetch all statements related to a certain agent:
`https://{hostname}/api/xAPI/statements?agent={"account":{"name":"johnSmith","homePage":"www.example.com"}}`
- Fetch all statements whose object is a certain assessment:
`https://{hostname}/api/xAPI/statements?activity=https://data.curiouslearning.org/xAPI/activities/assessment/english/example`
- Fetch all statements that are related to the given activity:
`https://{hostname}/api/xAPI/statements?activity=https://data.curiouslearning.org/xAPI/activities/assessment/english/example&related_activities=true`
- Fetch all statements with a given verb:
`https://{hostname}/api/xAPI/statements?verb=http://adlnet.gov/expapi/answered`
- Compound query, fetch all "answered" statements for a given agent on a given assessment within a 24 hour period:
`https://{hostname}/api/xAPI/statements?agent={"account":{"name":"johnSmith", "homePage": "www.example.com"}}&verb=http://adlnet.gov/expapi/verbs/answered&activity=https://data.curiouslearning.org/xAPI/activities/assessment/english/example&related_activities=true&since=2022-05-01&until=2022-05-02`

<br>

### api/xAPI/agents/profile
----

Full LRS conformant behavior is specified [here](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md#26-agent-profile-resource)

Currently, the API has the following support for this resource:

- POST:
    - Accepts: the document to be stored or updated
    - Returns: `204`
    - STATUS: implemented
- PUT: NOT implemented
- GET: 
    - Parameters: 
        - single document GET:
            - agent (agent object JSON): REQUIRED
            - profileID (string): REQUIRED
        - Multiple document GET:
            - agent (agent object JSON): REQUIRED
            - since (timestamp): OPTIONAL
    - STATUS: implemented
- DELETE:
    - Accepts:
        - agent (agent object JSON): REQUIRED
        - profileId (string): REQUIRED 
    - Returns: `204`
    - STATUS: NOT implemented

#### Example Queries

- Fetch all profiles associated with the given agent:
`https://{hostname}/api/xAPI/agents/profile?agent={"mbox": "john.smith@example.com}`
    - returns: a list of profile ids
- Fetch all profiles for an agent generated after a given timestamp:
`https://{hostname}/api/xAPI/agents/profile?agent={"mbox": "john.smith@example.com}&since=2022-05-01T13:01:00.000Z`
    - returns: a list of profile ids
- Fetch the profile that matches the given agent and id
`https://{hostname}/api/xAPI/agents/profile?agent={"mbox": "john.smith@example.com}&profileId=c12395gsagy7`
    - returns: a single profile, represented by a JSON object

<br>

# Instructions For Developers

## Project Structure

All source code can be found in `/app`. The API is implemented with [NextJS](https://nextjs.org), so each endpoint for the api is located at `/app/pages/api/{route}/index.ts`, which is a structure used for dynamic API routing. Data models are hosted in `/app/models/`. Database connection logic is stored in `/app/lib/db.ts`

For deployment to a Kubernetes cluster, helm charts are stored in the top level directory `/helm`. See _Deploying to Production_ for more information on how to use the Helm Charts.

To use Docker Desktop to create a development build without running tests, use the `/dev` directory. Run `/dev/dev-env.sh` and then `/dev/dev.sh`. Rerun `dev.sh` to generate a new build on changes.

<br>

## Prerequisites

- [Node.js](https://nodejs.org/en/) version 16.x
- [npm](https://docs.npmjs.com/cli/v8) v8.x
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), for running test scripts
- [Helm CLI](https://helm.sh/docs/intro/install) for production deployment
- [kubectl CLI](https://kubernetes.io/docs/tasks/tools/) for interfacing with deployment environment

<br>

## Setup The Development Environment

1. Ensure all prerequisites are installed and configured
2. Clone or download the project from this github repository
3. cd into `/app` and run `npm install` to install dependencies
4. Generate the Prisma client by running `npx prisma generate`
5. To enable unit tests that re-run as you develop, run `/app/test.sh` (requires Docker Desktop)

### Optional
To connect to a development database (locally hosted or otherwise), set the `DATABASE_URL` environment variable to the connection string for your database.
You must ensure the database is publicly accessible, or provide the authentication credentials in your connection string.

### Notes on Prisma

[Prisma](https://prisma.io) is the ORM the API uses to interface with the database. The database schema is declared in `/app/prisma/schema.prisma`. If the schema file is edited, the Prisma Client must be updated by running `npx prisma generate`. To migrate your database, use `npx prisma migrate {dev | deploy}`. Running `prisma migrate` also runs `prisma generate` unless you specify otherwise. Migration SQL files are stored in `/app/prisma/migrations` and are applied to the database in the order they are generated. See the Prisma docs for more information, or run `npx prisma {command} -h` for documentation on the desired command.

<br>

## Deploying to Production

The LRS is designed to be hosted on a Kubernetes Cluster. Although this is not strictly necessary, it is recommended, and this repository is equipped with Github Actions for Kubernetes CI/CD .

### Deploy to a Kubernetes Cluster


1. in the top level directory `/helm` (of your local repository) create a folder named `/values` (this directory is gitignored).
2. in `/values` create a file called `prod.yaml`. 
3. Add the following text to `prod.yaml`, substituting production environment data for `{variables}`:
    ```
    env:
    secret:
        DATABASE_URL:  {percent encoded Database Connection String}
    initialDelaySeconds: 30

    image:
    repository: {URL of container repo}
    pullPolicy: IfNotPresent
    tag: {version}

    ingress:
    enabled: true
    className: nginx
    annotations:
        cert-manager.io/cluster-issuer: letsencrypt-prod
        acme.cert-manager.io/http01-edit-in-place: "true"
        nginx.ingress.kubernetes.io/rewrite-target: /
        # kubernetes.io/tls-acme: "true"
    hosts:
        - host: {hostname}
        paths:
            - path: /
            pathType: Prefix
            backend:
                service:
                name: assessment-lrs
                port:
                    number: 80
    tls:
        - secretName: lrs-certificate
        hosts:
            - {hostname}
    ```

    **Notes:**

    - The value of `env.secret.DATABASE_URL` is a sensitive piece of production data, DO NOT commit it to this repository under any circumstances. You can check the format [here](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
        - additionally, if the username or password in the DB connection string has any special characters ('*', '@', '$', '#' etc.) those characters must be percent encoded in the connection string
    - The ingress resource requires an [nginx ingress controller](https://kubernetes.github.io/ingress-nginx/) be present on the production cluser.
    - This setup assumes the container build is publicly accessible. If credentials are required to access the build, ensure they are stored in a [secret resource](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry) on the production cluster and declared in `prod.yaml` under `imagePullSecrets`. 
    - the value of `tag` MUST correspond to a build present at the container repo (e.g. If the tag is `1.1.2`, there MUST be a build named `assessment-lrs-1.1.2` at the repo specified in `repository`)
    - the version number MUST change between deployments for the deployment to update. To always update on an install regardless of tag, set the `pullPolicy` to `Always` (not recommended for production).


4. Ensure you are connected to your production cluster, then run the following command: 

    `helm install --values {path/to/prod.yaml} {deployment-name} {path/to/assessment-lrs-chart}`

    If, for example, you execute this command from the top level directory, the command would be 
    
    `helm install --values helm/values/prod.yaml {deployment-name} helm/assessment-lrs`

<br>

### Other Deployment Methods

If deploying to an environment other than a kubernetes cluster, ensure the following values are defined:
- `DATABASE_URL` environment variable is set to the production database's connection string (**NEVER** expose this value publicly)

To make a production build run the following commands:
- `npx prisma migrate deploy`
- `npm run build`

    **NB:** _`next build` will fail if there are typescript or ESLint errors. This can be [suppressed](https://nextjs.org/docs/api-reference/next.config.js/ignoring-typescript-errors)_

To run the app execute: `npm run start`

For continuous integration, these commands are bundled in the `start-ci` script in `/app/package.json`

