// Maps the department code embedded in a matriculation number
// (e.g. "FUL/CSC/20/1234" -> "CSC") to the department's full name.
// This is the single source of truth for matric-driven department
// detection — used at login, on the student's profile, and by the
// seed script, so it can never drift between those three places.

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

/** "FUL/CSC/20/1234" -> "CSC" (or null if the matric doesn't parse) */
export function departmentCodeFromMatric(matricNo) {
  const parts = String(matricNo || "").toUpperCase().trim().split("/");
  return parts.length >= 2 ? parts[1] : null;
}

/** "FUL/CSC/20/1234" -> "Computer Science" (or null if unrecognised) */
export function departmentFromMatric(matricNo) {
  const code = departmentCodeFromMatric(matricNo);
  return code ? DEPARTMENTS[code] || null : null;
}
