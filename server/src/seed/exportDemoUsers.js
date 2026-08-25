import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateStudents, invigilatorDefs } from "./seedData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const outputDir = path.join(repoRoot, "docs");
const outputPath = path.join(outputDir, "demo-users.csv");
const password = "password";

const rows = [
  {
    role: "Administrator",
    loginId: "FUL/STAFF/ADMIN",
    name: "System Administrator",
    department: "Registry",
    level: "",
    password,
  },
  {
    role: "Exam Officer",
    loginId: "FUL/STAFF/OFFICER",
    name: "Examinations Office",
    department: "Academic Planning",
    level: "",
    password,
  },
  ...invigilatorDefs.map((staff) => ({
    role: "Invigilator",
    loginId: staff.staffId,
    name: staff.name,
    department: staff.department,
    level: "",
    password,
  })),
  ...generateStudents(30).map((student) => ({
    role: "Student",
    loginId: student.matricNo,
    name: student.name,
    department: student.department,
    level: student.level ? `${student.level}L` : "",
    password,
  })),
];

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  outputPath,
  [
    ["Role", "Login ID", "Name", "Department", "Level", "Password"].map(csvEscape).join(","),
    ...rows.map((row) => [row.role, row.loginId, row.name, row.department, row.level, row.password].map(csvEscape).join(",")),
  ].join("\n")
);

console.log(`Wrote ${rows.length} demo users to ${outputPath}`);
