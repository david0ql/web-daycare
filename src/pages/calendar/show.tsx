import React from "react";
import { useParams } from "react-router";
import { CalendarShowForm } from "../../domains/calendar";
import { useLanguage } from "../../shared/contexts/language.context";

const CALENDAR_SHOW_PAGE_TRANSLATIONS = {
  english: { invalidId: "Invalid event ID" },
  spanish: { invalidId: "ID de evento inválido" },
} as const;

export const CalendarShow: React.FC = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const t = CALENDAR_SHOW_PAGE_TRANSLATIONS[language];
  const eventId = parseInt(id as string);

  if (isNaN(eventId)) {
    return (
      <div>
        <h2>{t.invalidId}</h2>
      </div>
    );
  }

  return <CalendarShowForm eventId={eventId} />;
};
