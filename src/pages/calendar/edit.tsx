import React from "react";
import { useParams } from "react-router";
import { CalendarEditForm } from "../../domains/calendar";
import { useLanguage } from "../../shared/contexts/language.context";

const CALENDAR_EDIT_PAGE_TRANSLATIONS = {
  english: { invalidId: "Invalid event ID" },
  spanish: { invalidId: "ID de evento inválido" },
} as const;

export const CalendarEdit: React.FC = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const t = CALENDAR_EDIT_PAGE_TRANSLATIONS[language];
  const eventId = parseInt(id as string);

  if (isNaN(eventId)) {
    return (
      <div>
        <h2>{t.invalidId}</h2>
      </div>
    );
  }

  return <CalendarEditForm eventId={eventId} />;
};
