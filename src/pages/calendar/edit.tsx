import React from "react";
import { useParams } from "react-router";
import { CalendarEditForm } from "../../domains/calendar";

export const CalendarEdit: React.FC = () => {
  const { id } = useParams();
  const eventId = parseInt(id as string);

  if (isNaN(eventId)) {
    return (
      <div>
        <h2>Invalid event ID</h2>
      </div>
    );
  }

  return <CalendarEditForm eventId={eventId} />;
};
