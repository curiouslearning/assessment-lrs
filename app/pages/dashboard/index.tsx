import { useState, useEffect } from 'react'
import EventCounter from '../../components/EventCounter';
import * as statements from '../../models/statements';
import { Activity, Statement } from '../api/xAPI/models';

export default function ProjectHealthDashboard (props: {[key:string]: Statement[]}) {
    const data = {
        startEvents: props.startEvents,
        terminateEvents: props.terminateEvents,
        completeEvents: props.completeEvents,
        anonymousUsers: props.anonymousUsers
    };
    const [startEvents, setStartEvents] = useState<Statement[]>([]);
    const [terminateEvents, setTerminateEvents] = useState<Statement[]>([])
    const [completeEvents, setCompleteEvents] = useState<Statement[]>([])
    const [anonymousUsers, setAnonymousUsers] = useState<Statement[]>([])

    useEffect(() => {
        setStartEvents(data.startEvents);
    }, [data.startEvents])
    useEffect(() => {
        setTerminateEvents(data.terminateEvents)
    }, [data.terminateEvents])
    useEffect(()=>{
        setCompleteEvents(data.completeEvents);
    }, [data.completeEvents])
    useEffect(()=> {
        setAnonymousUsers(data.anonymousUsers);
    }, [data.anonymousUsers])
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
                                {setGlobalOptions([...startEvents, ...terminateEvents, ...completeEvents])}
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

export async function getServerSideProps(context: any) {
    const DAY_IN_MS = 86400000;
    const timestamp = new Date(Date.now() - DAY_IN_MS).toISOString();
    const fetchEvents = async (timestamp: string, verb: string) => {
        let queryOptions: statements.QueryOptions = {
            params: {
                timestamp: {gte: timestamp},
                verb
            },
        }
        let results: Statement[] = [];
        let rows: Statement[] = [];
         do {
            rows = await statements.getByParams(queryOptions);
            results = [...results, ...rows];
            if(rows.length > 0 && rows[rows.length-1]) {
                queryOptions.cursor = rows[rows.length - 1].id;
            }
         } while (rows.length === 1000 )
        return results;
    }
    const startEvents =  await fetchEvents(timestamp, "http://adlnet.gov/expapi/verbs/initialized");
    const terminateEvents = await fetchEvents(timestamp, "http://adlnet.gov/expapi/verbs/terminated")
    let completeEvents =  await fetchEvents(timestamp, "http://adlnet.gov/expapi/verbs/completed")
    completeEvents = completeEvents.filter(statement=> {
        const castObject = statement.object as Activity;
        return castObject.id.indexOf("bucket") === -1 //bucket completed events are deprecated and throw off our metrics
    })
    const anonymousUsers= startEvents.filter(
        statement=> statement.actor.account &&
            statement.actor.account.name === "anonymous"
    )
    return {props:{
        startEvents,
        terminateEvents,
        completeEvents,
        anonymousUsers
    }};
}