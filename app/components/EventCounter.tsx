import { useEffect, useState } from "react";
import { Statement, Activity } from "../pages/api/xAPI/models";

export default function EventCounter ({ eventList, name, filter="" }: {eventList: Statement[], name: string, filter: string}) {

    const formatEventCount = (events: Statement[], filter: string) => {
        let subset = filter? events.filter(statement => {
            const castObject = statement.object as Activity;
            return castObject.id === filter
        }): events;
        const sum = subset.reduce((sum, val) => sum + 1, 0);
        return <p className="is-size-3">{sum}</p>
    }

    return (
        <div className="card py-2 is-flex is-flex-direction-column  is-align-items-center text-justified">
            <div className="card-header is-shadowless">
                <p className="has-text-justified">{ name }</p>
            </div>
            <div className="card-content">
                { formatEventCount(eventList, filter) }
            </div>
        </div>
    )
}