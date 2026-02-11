import React from "react";
import { Create } from "@refinedev/antd";
import { CalendarCreateForm } from "../../domains/calendar";
import { useLanguage } from "../../shared/contexts/language.context";

const CALENDAR_CREATE_TRANSLATIONS = {
  english: { title: "Create Event", save: "Save" },
  spanish: { title: "Crear evento", save: "Guardar" },
} as const;

export const CalendarCreate: React.FC = () => {
  const { language } = useLanguage();
  const t = CALENDAR_CREATE_TRANSLATIONS[language];
  
  return (
    <Create title={t.title} saveButtonProps={{ style: { display: "none" } }}>
      <CalendarCreateForm />
    </Create>
  );
};
