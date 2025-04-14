import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import momentPlugin from '@fullcalendar/moment';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import timeGridPlugin from '@fullcalendar/timegrid';

import type { Event } from './types';

window.Webflow ||= [];
window.Webflow.push(() => {
  const calendarElement = document.querySelector<HTMLElement>('[data-element="calendar"]');
  if (!calendarElement) return;

  const events = getEvents();
  console.log({ events }); // Debug check

  const calendar = new Calendar(calendarElement, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, momentPlugin, momentTimezonePlugin],
    eventDisplay: 'block', // important if you want background colors to show
    timeZone: 'America/Toronto',
    initialView: 'dayGridMonth',
    slotMinTime: '12:00:00',
    slotMaxTime: '23:59:59',
    slotDuration: '01:00:00',
    allDaySlot: false,
    expandRows: true, // ✅ ensures equal row heights when height is set

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    },
    events,
    eventTimeFormat: {
      hour: 'numeric',
      meridiem: 'short',
      hour12: true,
    },
    eventClick(data) {
      alert(`User clicked the event ${data.event.title}`);
    },
  });

  calendar.render();
});
import moment from 'moment-timezone';

const getEvents = (): Event[] => {
  const scripts = document.querySelectorAll<HTMLScriptElement>('[data-element="event-data"]');

  return [...scripts].map((script) => {
    const raw = JSON.parse(script.textContent!);

    const startMoment = moment.tz(raw.start, 'America/Toronto');
    const endMoment = raw.end ? moment.tz(raw.end, 'America/Toronto') : null;

    return {
      ...raw,
      start: startMoment.toDate(),
      end: endMoment ? endMoment.toDate() : null,
      color: raw.color, // shorthand for background + border
      textColor: '#fff',
      classNames: ['custom-event'],
    };
  });
};
