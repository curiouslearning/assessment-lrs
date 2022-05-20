import { useState, useEffect } from 'react'
import EventCounter from '../../components/EventCounter';
import * as statements from '../../models/statements';
import { Activity, Statement } from '../api/xAPI/models';

export default function ProjectHealthDashboard (props: {[key:string]: Statement[]}) {
    const {
        startEvents,
        terminateEvents,
        completeEvents,
        anonymousUsers
    } = props;
    const [globalFilter, setGlobalFilter] = useState("");

    const setGlobalOptions = (eventList: Statement[]) => {
        let ids = new Set<string>();
        let options = [<option key={0} value="">--All Activities--</option>];
        eventList.map((statement) => {
            const castObject = statement.object as Activity;
            ids.add(castObject.id)
        });
        let i=1;
        ids.forEach(id => {
            options.push(<option key={i} value={id}>{id}</option>)
            i++
        })
        return options;
    }
    return(
        <div>
        <div className="hero my-4 is-info">
            <div className="hero-body">
                <p className="title">LRS Project Health Dashboard</p>
                <p className="subititle">Simple metrics for determining project health over the past 24 hours</p>
            </div>
        </div>
        <div className="content">
            <div className="columns">
                <div className="column">
                    <EventCounter
                        name="Start Events"
                        eventList= {startEvents}
                        filter= {globalFilter}
                    />
                </div>
                <div className="column">
                    <EventCounter
                        name = "Terminate Events"
                        eventList={terminateEvents}
                        filter= {globalFilter}
                     />
                <div className="columns py-4">
                    <div className="column">
                        <EventCounter
                            name="Anonymous Users"
                            eventList={anonymousUsers}
                            filter= {globalFilter}
                        />
                    <div className="columns">
                        <div className="column my-4 is-flex is-flex-direction-column is-align-items-center"> <select value={globalFilter} onChange={(e) => setGlobalFilter(e.currentTarget.value)}>
                                {setGlobalOptions([...startEvents, ...terminateEvents, ...completeEvents, ...anonymousUsers])}
                            </select>
                        </div>

                    </div>
                    </div>
                </div>
                </div>
                <div className="column">
                    <EventCounter
                        name="Complete Events"
                        eventList={completeEvents}
                        filter= {globalFilter}
                    />

                </div>
            </div>
        </div>
        </div>
    )

}

export async function getServerSideProps() {
    const DAY_IN_MS = 864000000;
    const timestamp = new Date(Date.now() - DAY_IN_MS).toISOString();
    const fetchEvents = async (timestamp: string, verb: string) => {
        let queryOptions: statements.QueryOptions = {
            params: {
                timestamp,
                verb
            },
        }
        let results: Statement[] = [];
        let rows: Statement[] = [];
         do {
            rows = await statements.getByParams(queryOptions);
            results = [...results, ...rows];
            queryOptions.cursor = rows[rows.length - 1].id;
         } while (rows.length === 1000 )
        return results;
    }
    const startEvents =  await fetchEvents(timestamp, "http://adlnet.gov/expapi/verbs/initialized");
    const terminateEvents = await fetchEvents(timestamp, "http://adlnet.gov/expapi/verbs/terminated")
    const completeEvents =  await fetchEvents(timestamp, "http://adlnet.gov/expapi/verbs/completed")
    const anonymousUsers= startEvents.filter(statement=> statement.actor.account && statement.actor.account.name === "anonymous")
    return {props:{
        startEvents,
        terminateEvents,
        completeEvents,
        anonymousUsers
    }};
}