export const IconHome = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/></svg>);
export const IconBuilding = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="4" width="14" height="16"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/></svg>);
export const IconBook = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z"/></svg>);
export const IconUsers = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3"/><path d="M2.5 19c0-3 3-5 6.5-5s6.5 2 6.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14c2.6.3 4.5 2 4.5 5"/></svg>);
export const IconCalendar = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="5.5" width="16" height="14" rx="1.5"/><path d="M4 10h16M8 3.5v3M16 3.5v3"/></svg>);
export const IconGrid = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></svg>);
export const IconPrinter = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9V4h12v5"/><rect x="4" y="9" width="16" height="7" rx="1"/><path d="M6 16h12v4H6z"/></svg>);
export const IconSearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6"/><path d="m20 20-4.8-4.8"/></svg>);
export const IconTicket = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.2a1.6 1.6 0 0 0 0 3.2V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.6a1.6 1.6 0 0 0 0-3.2Z"/><path d="M9 7v10" strokeDasharray="2.2 2.2"/></svg>);
export const IconPin = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>);
export const IconUpload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 15V4M12 4 8 8M12 4l4 4"/><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>);
export const IconLogo = () => (<img src="/ful-logo.png" alt="Federal University Lokoja" className="brand-crest" />);

export const IconChart = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M11 20V4M18 20v-7"/></svg>);

export const NAV_ICONS = {
  overview: IconHome, analytics: IconChart, venues: IconBuilding, courses: IconBook, invigilators: IconUsers,
  timetable: IconCalendar, allocation: IconGrid, allocations: IconGrid, printcenter: IconPrinter,
  myassignments: IconCalendar, findvenue: IconSearch, mytimetable: IconCalendar, examslip: IconTicket,
};
