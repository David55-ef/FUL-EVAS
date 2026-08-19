// Client-side mirror of server/src/utils/department.js — used ONLY when
// running in demo mode (no backend reachable), so the login screen can
// still demonstrate matric-driven department detection offline. Whenever
// a real API is available, the department shown comes from the server's
// response instead (see lib/api.js getProfile / login) — this file is
// never the source of truth once a backend exists.

export const DEPARTMENTS = {
  CSC: "Computer Science", MTH: "Mathematics", STA: "Statistics", PHY: "Physics",
  CHM: "Chemistry", ICH: "Industrial Chemistry", BCH: "Biochemistry", MCB: "Microbiology",
  BOT: "Botany", ZOO: "Zoology", GEO: "Geography", GLY: "Geology",
  ACC: "Accounting", BAD: "Business Administration", ECO: "Economics",
  MAC: "Mass Communication", PSC: "Political Science", ENL: "English & Literary Studies",
  ENG: "General Studies", BIO: "Life Sciences",
  LAW: "Law", EEE: "Electrical & Electronics Engineering", MEE: "Mechanical Engineering",
  CVE: "Civil Engineering", AGR: "Agriculture",
};

export function departmentFromMatric(matricNo) {
  const parts = String(matricNo || "").toUpperCase().trim().split("/");
  const code = parts.length >= 2 ? parts[1] : null;
  return code ? DEPARTMENTS[code] || null : null;
}
