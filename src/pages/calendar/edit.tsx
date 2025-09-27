import React from "react";
import { Edit } from "@refinedev/antd";
import { useParams } from "react-router";
import { CalendarEditForm } from "../../domains/calendar";

export const CalendarEdit: React.FC = () => {
  const { id } = useParams();
  const eventId = parseInt(id as string);

  return (
    <Edit>
      <CalendarEditForm eventId={eventId} />
    </Edit>
  );
};
