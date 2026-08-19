import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { isBackendUp, getProfile, clearSession } from "../lib/api.js";

const AppCtx = createContext(null);

export const ROLE_LABEL = { admin: "Administrator", officer: "Exam Officer", invigilator: "Invigilator", student: "Student" };
export const ROLE_INITIAL = { admin: "A", officer: "E", invigilator: "I", student: "S" };
export const ROLE_DEFAULT_SCREEN = { admin: "overview", officer: "allocations", invigilator: "myassignments", student: "findvenue" };
export const NAV = {
  admin: [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "venues", label: "Venues" },
    { id: "courses", label: "Courses & Students" },
    { id: "invigilators", label: "Invigilators" },
    { id: "timetable", label: "Timetable" },
    { id: "allocation", label: "Venue Allocation" },
  ],
  officer: [
    { id: "allocations", label: "Allocations" },
    { id: "printcenter", label: "Print Center" },
  ],
  invigilator: [{ id: "myassignments", label: "My Assignments" }],
  student: [
    { id: "findvenue", label: "Find My Venue" },
    { id: "mytimetable", label: "My Timetable" },
    { id: "examslip", label: "Exam Slip" },
  ],
};

// The set of screen ids each role is actually allowed to land on — this is
// the client-side half of access control. It exists purely for UX (so a
// stale bookmark or leftover state can't strand someone on a screen that
// isn't in their own nav); it is NOT what makes the data on that screen
// safe to view. Every API call those screens make is independently checked
// server-side against the caller's JWT role, so even if this check were
// bypassed entirely (e.g. someone editing local React state in devtools),
// no data belonging to another role becomes reachable.
function allowedScreens(role) {
  return new Set((NAV[role] || []).map((item) => item.id).concat(["allocations", "allocation"]));
}

export function AppProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [role, setRoleState] = useState(null);
  const [name, setName] = useState(null);
  const [department, setDepartment] = useState(null);
  const [screen, setScreenState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  // On boot: is there a live backend, and does the saved token (if any)
  // still belong to an active account? Role/department are re-derived from
  // the token server-side here — never read back out of localStorage —
  // so a page refresh can't be used to smuggle in a role that wasn't
  // actually issued by the server for this session.
  useEffect(() => {
    (async () => {
      const up = await isBackendUp();
      setDemoMode(!up);
      if (up) {
        const profile = await getProfile();
        if (profile) {
          setRoleState(profile.role);
          setName(profile.name || null);
          setDepartment(profile.department || null);
          setScreenState(ROLE_DEFAULT_SCREEN[profile.role]);
          setLoggedIn(true);
        }
      }
      setRestoring(false);
    })();
  }, []);

  // Only called after a successful, server-verified login response (or an
  // explicit, clearly-labelled demo-mode entry when no backend is running —
  // see Login.jsx). role/department/name always come from that response,
  // never from whatever the login form's role picker happened to be set to.
  const enter = useCallback(({ role: r, name: n, department: d }) => {
    setRoleState(r);
    setName(n || null);
    setDepartment(d || null);
    setScreenState(ROLE_DEFAULT_SCREEN[r]);
    setLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setLoggedIn(false);
    setRoleState(null);
    setName(null);
    setDepartment(null);
    setScreenState(null);
    setSidebarOpen(false);
  }, []);

  // setScreen is deliberately restricted to the current role's own nav —
  // there is no way to ask the app to render another role's screen.
  const setScreen = useCallback((id) => {
    setScreenState((prev) => (role && allowedScreens(role).has(id) ? id : prev));
  }, [role]);

  const value = {
    loggedIn, restoring, role, name, department,
    screen, setScreen, sidebarOpen, setSidebarOpen, demoMode,
    enter, logout, toast, showToast,
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
