import { useState } from "react";
import { AppProvider, useApp, ROLE_DEFAULT_SCREEN } from "./context/AppContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Landing from "./screens/Landing.jsx";
import Login from "./screens/Login.jsx";
import Overview from "./screens/Overview.jsx";
import Analytics from "./screens/Analytics.jsx";
import Venues from "./screens/Venues.jsx";
import Courses from "./screens/Courses.jsx";
import Invigilators from "./screens/Invigilators.jsx";
import Timetable from "./screens/Timetable.jsx";
import Allocation from "./screens/Allocation.jsx";
import PrintCenter from "./screens/PrintCenter.jsx";
import MyAssignments from "./screens/MyAssignments.jsx";
import FindVenue from "./screens/FindVenue.jsx";
import MyTimetable from "./screens/MyTimetable.jsx";
import ExamSlip from "./screens/ExamSlip.jsx";

const SCREENS = {
  overview: Overview,
  analytics: Analytics,
  venues: Venues,
  courses: Courses,
  invigilators: Invigilators,
  timetable: Timetable,
  allocation: Allocation,
  allocations: Allocation,
  printcenter: PrintCenter,
  myassignments: MyAssignments,
  findvenue: FindVenue,
  mytimetable: MyTimetable,
  examslip: ExamSlip,
};

function Shell() {
  const { loggedIn, restoring, role, screen, toast } = useApp();
  const [showLogin, setShowLogin] = useState(false);

  // Briefly checking a saved token against the server on first load —
  // show nothing (rather than flashing the landing page and then the
  // dashboard a moment later) while that's in flight.
  if (restoring) return <div className="app-loading" aria-hidden="true" />;

  if (!loggedIn) {
    return showLogin
      ? <Login onBack={() => setShowLogin(false)} />
      : <Landing onSignIn={() => setShowLogin(true)} />;
  }

  // Falls back to *this role's* default screen, not unconditionally to the
  // admin Overview — a stale/unrecognised screen id should never land a
  // student or invigilator on an admin-only page.
  const Screen = SCREENS[screen] || SCREENS[ROLE_DEFAULT_SCREEN[role]] || FindVenue;
  return (
    <div className="app-shell">
      <Sidebar />
      <Topbar />
      <main className="content"><Screen /></main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
