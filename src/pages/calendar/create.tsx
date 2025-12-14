import React from "react";
import { Create } from "@refinedev/antd";
import { CalendarCreateForm } from "../../domains/calendar";

export const CalendarCreate: React.FC = () => {
  console.log('🔍 CalendarCreate: Componente montado');
  
  return (
    <Create title="Create Event">
      <CalendarCreateForm />
    </Create>
  );
};
