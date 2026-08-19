const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

let backendReachable = null;

async function req(path, opts = {}) {
  const token = localStorage.getItem("fulevas_token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  backendReachable = true;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function isBackendUp() {
  if (backendReachable !== null) return backendReachable;
  try {
    const res = await fetch(`${API_BASE.replace(/\/api\/v1$/, "")}/health`, { signal: AbortSignal.timeout(2500) });
    backendReachable = res.ok;
  } catch {
    backendReachable = false;
  }
  return backendReachable;
}

export async function login(role, id, password) {
  return req("/auth/login", { method: "POST", body: JSON.stringify({ role, id, password }) });
}

// Re-derives the signed-in user's role + department from their token, never
// from anything stored client-side. Used on app boot to restore a session
// after a page refresh, and returns null (rather than throwing) for a
// missing/expired/tampered token so callers can fall back to the login screen.
export async function getProfile() {
  const token = localStorage.getItem("fulevas_token");
  if (!token) return null;
  try {
    return await req("/me/profile");
  } catch {
    localStorage.removeItem("fulevas_token");
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("fulevas_token");
}

export async function getVenues() {
  return req("/venues");
}

export async function getCourses() {
  return req("/courses");
}

export async function getInvigilators() {
  return req("/invigilators");
}

export async function getTimetable() {
  return req("/timetable");
}

export async function getAllocations() {
  return req("/allocation");
}

export async function searchVenue(query) {
  return req(`/me/venue?query=${encodeURIComponent(query)}`);
}

export async function fetchVenueImage(venueName) {
  return req(`/images/venue?query=${encodeURIComponent(venueName + " Federal University Lokoja")}`);
}
