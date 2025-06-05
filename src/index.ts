import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import momentPlugin from '@fullcalendar/moment';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import timeGridPlugin from '@fullcalendar/timegrid';

import type { Event } from './types';

const decodeHTML = (str: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};
window.Webflow ||= [];
window.Webflow.push(() => {
  const calendarElement = document.querySelector<HTMLElement>('[data-element="calendar"]');
  if (!calendarElement) return;

  const allEvents = getEvents(); // Renamed from 'events'

  const calendar = new Calendar(calendarElement, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, momentPlugin, momentTimezonePlugin],
    eventDisplay: 'block',
    timeZone: 'America/Toronto',
    initialView: 'dayGridMonth',
    slotMinTime: '13:00:00',
    slotMaxTime: '23:59:59',
    slotDuration: '01:00:00',
    allDaySlot: false,
    expandRows: true,

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    },
    events: function (fetchInfo, successCallback) {
      const isListView = calendarElement.classList.contains('fc-list');

      const filtered = isListView
        ? allEvents.filter((event) => {
            const start = new Date(event.start);
            // Only include events where start is within the fetch window
            return start >= fetchInfo.start && start < fetchInfo.end;
          })
        : allEvents;

      successCallback(filtered);
    },

    eventTimeFormat: {
      hour: 'numeric',
      meridiem: 'short',
      hour12: true,
    },

    eventContent(info) {
      const viewType = info.view.type;
      const { event } = info;
      const { extendedProps } = event;

      const imageHTML = extendedProps.image
        ? `<div class="fc-event-image"><img src="${extendedProps.image}" alt="" /></div>`
        : '';

      // Week View
      if (viewType === 'timeGridWeek') {
        return {
          html: `
        <div class="fc-event-main-frame">
          <div class="fc-event-title">${event.title}</div>
          ${imageHTML}
        </div>
      `,
        };
      }

      // Day View
      if (viewType === 'timeGridDay') {
        return {
          html: `
        <div class="fc-event-main-frame">
          <div class="fc-event-time">${info.timeText}</div>
          <div class="fc-event-title">${event.title.toUpperCase()}</div>
          ${imageHTML}
        </div>
      `,
        };
      }

      // List View (listWeek or listDay)
      if (viewType.startsWith('list')) {
        return {
          html: `
        <div class="fc-event-main-frame">
          <div class="fc-event-title">${event.title}</div>
        </div>
      `,
        };
      }

      // Month View (dayGridMonth)
      return {
        html: `
      <div class="fc-event-main-frame">
        <div class="fc-event-time">${info.timeText}</div>
        <div class="fc-event-title">${event.title}</div>
      </div>
    `,
      };
    },
    eventDidMount(info) {
      const viewType = info.view.type;

      // Only trim in list views
      if (viewType.startsWith('list')) {
        const { event } = info;
        const { start } = event;
        const { end } = event;

        if (end) {
          const sameDay = start.toDateString() === end.toDateString();
          const endsAfterMidnight = end.getDate() !== start.getDate();

          if (!sameDay && endsAfterMidnight) {
            const trimmedEnd = new Date(start);
            trimmedEnd.setHours(23, 59, 59, 999);
            event.setEnd(trimmedEnd);
          }
        }
      }

      // Keep your existing 'highlight today' logic
      const today = new Date();
      const eventDate = info.event.start;
      const isToday =
        eventDate.getFullYear() === today.getFullYear() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getDate() === today.getDate();

      if (viewType === 'listDay' && isToday) {
        info.el.style.backgroundColor = '#cce5fa3d';
      }
    },
  });

  calendar.render();
});

import moment from 'moment-timezone';
const getEvents = (): Event[] => {
  const scripts = document.querySelectorAll<HTMLScriptElement>('[data-element="event-data"]');
  const now = moment();

  return [...scripts].map((script) => {
    const raw = JSON.parse(script.textContent!);
    const startMoment = moment.tz(raw.start, 'America/Toronto');
    const endMoment = raw.end ? moment.tz(raw.end, 'America/Toronto') : null;

    const isPast = endMoment ? endMoment.isBefore(now) : startMoment.isBefore(now);

    return {
      ...raw,
      title: decodeHTML(raw.title),
      url: decodeHTML(raw.url),
      start: startMoment.toDate(),
      end: endMoment ? endMoment.toDate() : null,
      color: raw.color,
      textColor: '#fff',
      classNames: ['custom-event', isPast ? 'past-event' : ''],
      extendedProps: {
        image: raw.image,
      },
    };
  });
};
