# Calendar Module

A comprehensive calendar module for managing daycare events with a beautiful UI and full CRUD functionality.

## Features

- 📅 **Beautiful Calendar View**: Interactive calendar with Ant Design Calendar component
- 🎨 **Event Type Colors**: Color-coded events by type (holiday, vacation, meeting, event, closure)
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⏰ **Time Support**: All-day events and specific time events
- 🔍 **Event Details**: Rich event information with tooltips and detailed views
- 📊 **Dashboard Widget**: Upcoming events widget for the dashboard
- 🛠️ **Full CRUD**: Create, read, update, and delete calendar events
- 🌍 **Spanish Localization**: All text and dates in Spanish

## Components

### CalendarList
Main calendar view with:
- Monthly calendar display
- Event visualization with colors
- Date selection and navigation
- Event details sidebar
- Event type legend

### CalendarCreateForm
Form for creating new events with:
- Event title and description
- Event type selection
- Date range selection
- All-day or specific time options
- Form validation

### CalendarEditForm
Form for editing existing events with:
- Pre-populated form fields
- Same validation as create form
- Update functionality

### UpcomingEventsWidget
Dashboard widget showing:
- Next 5 upcoming events
- Event details and times
- Quick access to create new events
- Link to full calendar view

## API Integration

The module integrates with the backend API endpoints:
- `GET /calendar/events` - List events with pagination and filters
- `POST /calendar/events` - Create new event
- `PATCH /calendar/events/:id` - Update event
- `DELETE /calendar/events/:id` - Delete event
- `GET /calendar/events/range` - Get events in date range

## Event Types

The calendar supports 5 event types with distinct colors:

1. **Holiday** (Día Festivo) - Red
2. **Vacation** (Vacaciones) - Green  
3. **Meeting** (Reunión) - Blue
4. **Event** (Evento) - Purple
5. **Closure** (Cierre) - Orange

## Usage

### Basic Calendar View
```tsx
import { CalendarList } from '@/domains/calendar';

<CalendarList />
```

### Create Event Form
```tsx
import { CalendarCreateForm } from '@/domains/calendar';

<CalendarCreateForm onSuccess={() => {}} />
```

### Upcoming Events Widget
```tsx
import { UpcomingEventsWidget } from '@/domains/calendar';

<UpcomingEventsWidget 
  title="Próximos Eventos"
  maxItems={5}
  showCreateButton={true}
/>
```

### Calendar Hooks
```tsx
import { useCalendarEvents, useCalendarEvent } from '@/domains/calendar';

// Get all events
const { events, isLoading, getEventsForDate } = useCalendarEvents();

// Get specific event
const { event, isLoading } = useCalendarEvent(eventId);

// Get events for today
const todayEvents = getEventsForDate(moment().format('YYYY-MM-DD'));
```

## Utilities

### CalendarUtils
Utility functions for date handling and event processing:

- `formatDate()` - Format dates for display
- `formatTime()` - Format times for display
- `getEventTypeLabel()` - Get Spanish labels for event types
- `getEventTypeColor()` - Get colors for event types
- `getEventsForDate()` - Filter events for specific date
- `getUpcomingEvents()` - Get events in next N days
- `validateEventDates()` - Validate date ranges
- `getEventDuration()` - Calculate event duration

## Dependencies

- **Ant Design**: UI components and calendar
- **Moment.js**: Date manipulation and formatting
- **RC Calendar**: Calendar component foundation
- **Refine**: Data management and API integration

## File Structure

```
src/domains/calendar/
├── api/
│   └── calendar.api.ts          # API client functions
├── components/
│   ├── calendar.list.tsx        # Main calendar view
│   ├── calendar.create.form.tsx # Create event form
│   ├── calendar.edit.form.tsx   # Edit event form
│   └── upcoming-events.widget.tsx # Dashboard widget
├── hooks/
│   └── use-calendar.hook.ts     # Custom hooks
├── types/
│   └── calendar.types.ts        # TypeScript interfaces
├── utils/
│   └── calendar.utils.ts        # Utility functions
├── index.ts                     # Module exports
└── README.md                    # This file
```

## Permissions

The calendar module respects user roles:
- **Administrators**: Full access to create, edit, and delete events
- **Educators**: Full access to create, edit, and delete events  
- **Parents**: Read-only access to view events

## Future Enhancements

- Recurring events support
- Event notifications and reminders
- Calendar export (PDF, ICS)
- Event attachments and images
- Event categories and tags
- Integration with external calendars
- Mobile app notifications
