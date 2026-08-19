// Mirrors client/src/lib/sampleData.js so the live API and the offline
// demo-mode fallback show consistent data.

import { departmentFromMatric } from "../utils/department.js";

// Real Federal University Lokoja venues, with actual campus photos (served
// from client/public/venues/) — these replace the earlier placeholder
// venue names ("New Lecture Theatre", "CBAS Lab Block Hall", etc.), which
// didn't correspond to any real building and had no real photos behind them.
export const venues = [
  { name: "Makoju Memorial Hall", location: "Main Campus", capacity: 500, art: "nlt", tag: "Makoju", mapX: 90, mapY: 100,
    images: ["/venues/makoju-memorial-hall/makoju-memorial-hall-1.jpg", "/venues/makoju-memorial-hall/makoju-memorial-hall-2.jpg", "/venues/makoju-memorial-hall/makoju-memorial-hall-3.jpg", "/venues/makoju-memorial-hall/makoju-memorial-hall-4.jpg"] },
  { name: "Faculty of Engineering Halls", location: "Faculty of Engineering Complex", capacity: 450, art: "sci", tag: "FoE Halls", mapX: 220, mapY: 100,
    images: ["/venues/faculty-of-engineering/faculty-of-engineering-1.jpg", "/venues/faculty-of-engineering/faculty-of-engineering-2.jpg", "/venues/faculty-of-engineering/faculty-of-engineering-3.jpg", "/venues/faculty-of-engineering/faculty-of-engineering-4.jpg", "/venues/faculty-of-engineering/faculty-of-engineering-5.jpg", "/venues/faculty-of-engineering/faculty-of-engineering-6.jpg", "/venues/faculty-of-engineering/faculty-of-engineering-7.jpg", "/venues/faculty-of-engineering/faculty-of-engineering-8.jpg"] },
  { name: "FALST Lecture Theatre 1", location: "Faculty of Applied Sciences Complex", capacity: 300, art: "olt1", tag: "FALST 1", mapX: 350, mapY: 100,
    images: ["/venues/falst-1/falst-1-1.jpg", "/venues/falst-1/falst-1-2.jpg", "/venues/falst-1/falst-1-3.jpg", "/venues/falst-1/falst-1-4.jpg"] },
  { name: "Faculty Science Lecture Theatre 2 (FSLT2)", location: "Science Complex", capacity: 280, art: "sci", tag: "FSLT2", mapX: 480, mapY: 100,
    images: ["/venues/fslt-2/fslt-2-1.jpg", "/venues/fslt-2/fslt-2-2.jpg", "/venues/fslt-2/fslt-2-3.jpg", "/venues/fslt-2/fslt-2-4.jpg"] },
  { name: "ICT Centre Hall", location: "ICT Centre, Main Campus", capacity: 120, art: "nlt", tag: "ICT", mapX: 610, mapY: 100,
    images: ["/venues/ict/ict-1.jpg", "/venues/ict/ict-2.jpg"] },
  { name: "Computer Science Classroom", location: "CBAS Building", capacity: 90, art: "cbas", tag: "CompSci", mapX: 130, mapY: 218,
    images: ["/venues/computer-classroom/computer-classroom-1.jpg", "/venues/computer-classroom/computer-classroom-2.jpg"] },
  { name: "Mathematics Classroom", location: "Science Complex", capacity: 110, art: "sci", tag: "Maths", mapX: 260, mapY: 218,
    images: ["/venues/maths-classroom/maths-classroom-1.jpg", "/venues/maths-classroom/maths-classroom-2.jpg", "/venues/maths-classroom/maths-classroom-3.jpg"] },
  { name: "Chemistry Classroom", location: "Science Complex", capacity: 90, art: "sci", tag: "Chem", mapX: 390, mapY: 218,
    images: ["/venues/chemistry-classroom/chemistry-classroom-1.jpg", "/venues/chemistry-classroom/chemistry-classroom-2.jpg"] },
  { name: "Industrial Chemistry Classroom", location: "Science Complex", capacity: 80, art: "sci", tag: "Ind. Chem", mapX: 520, mapY: 218,
    images: ["/venues/industrial-chemistry-classroom/industrial-chemistry-classroom-1.jpg", "/venues/industrial-chemistry-classroom/industrial-chemistry-classroom-2.jpg"] },
  { name: "Biochemistry Classroom", location: "CBAS Building", capacity: 80, art: "cbas", tag: "Biochem", mapX: 650, mapY: 218,
    images: ["/venues/biochemistry-classroom/biochemistry-classroom-1.jpg", "/venues/biochemistry-classroom/biochemistry-classroom-2.jpg"] },
  { name: "Microbiology Classroom", location: "CBAS Building, Block D", capacity: 70, art: "cbas", tag: "Microbio", mapX: 90, mapY: 336,
    images: ["/venues/microbiology/microbiology-1.jpg", "/venues/microbiology/microbiology-2.jpg"] },
  { name: "Botany Classroom", location: "CBAS Building", capacity: 60, art: "cbas", tag: "Botany", mapX: 220, mapY: 336,
    images: ["/venues/botany-classroom/botany-classroom-1.jpg"] },
  { name: "Zoology Classroom", location: "CBAS Building", capacity: 60, art: "cbas", tag: "Zoology", mapX: 350, mapY: 336,
    images: ["/venues/zoo/zoo-1.jpg"] },
  { name: "Geography Classroom", location: "Faculty of Social Sciences", capacity: 60, art: "arts", tag: "Geo", mapX: 480, mapY: 336,
    images: ["/venues/geo-class/geo-class-1.jpg"] },
  { name: "Physics Classroom", location: "Science Complex", capacity: 90, art: "sci", tag: "Physics", mapX: 610, mapY: 336,
    images: ["/venues/phy-classroom/phy-classroom-1.jpg"] },
  { name: "BTC Room", location: "Science Complex", capacity: 50, art: "sci", tag: "BTC", mapX: 130, mapY: 454,
    images: ["/venues/btc-room/btc-room-1.jpg"] },
  { name: "Lecture Theatre A (LT A)", location: "Main Campus", capacity: 220, art: "arts", tag: "LT A", mapX: 260, mapY: 454,
    images: ["/venues/lt-a/lt-a-1.jpg", "/venues/lt-a/lt-a-2.jpg", "/venues/lt-a/lt-a-3.jpg"] },
  { name: "Lecture Theatre B (LT B)", location: "Main Campus", capacity: 220, art: "olt2", tag: "LT B", mapX: 390, mapY: 454,
    images: ["/venues/lt-b/lt-b-1.jpg", "/venues/lt-b/lt-b-2.jpg", "/venues/lt-b/lt-b-3.jpg"] },
  { name: "Twin Theatre Complex", location: "Main Campus", capacity: 360, art: "cbas", tag: "Twin Th.", mapX: 520, mapY: 454,
    images: ["/venues/twin-theatre/twin-theatre-1.jpg", "/venues/twin-theatre/twin-theatre-2.jpg", "/venues/twin-theatre/twin-theatre-3.jpg"] },
  { name: "Faculty of Management Science Hall", location: "Faculty of Management Sciences", capacity: 260, art: "olt1", tag: "FMS Hall", mapX: 650, mapY: 454,
    images: ["/venues/faculty-of-management-science/fms-1.jpg", "/venues/faculty-of-management-science/fms-2.jpg", "/venues/faculty-of-management-science/fms-3.jpg", "/venues/faculty-of-management-science/fms-4.jpg", "/venues/faculty-of-management-science/fms-5.jpg", "/venues/faculty-of-management-science/fms-6.jpg", "/venues/faculty-of-management-science/fms-7.jpg", "/venues/faculty-of-management-science/fms-8.jpg"] },
  { name: "Faculty of Social Science Auditorium", location: "Faculty of Social Sciences", capacity: 240, art: "arts", tag: "FSS Aud", mapX: 90, mapY: 572,
    images: ["/venues/faculty-of-social-science/fss-1.jpg", "/venues/faculty-of-social-science/fss-2.jpg", "/venues/faculty-of-social-science/fss-3.jpg", "/venues/faculty-of-social-science/fss-4.jpg"] },
  { name: "FSS Lecture Room 3 (LR3)", location: "Faculty of Social Sciences", capacity: 100, art: "arts", tag: "FSS LR3", mapX: 220, mapY: 572,
    images: ["/venues/fss-lr3/fss-lr3-1.jpg", "/venues/fss-lr3/fss-lr3-2.jpg"] },
  { name: "FSS Lecture Room 4 (LR4)", location: "Faculty of Social Sciences", capacity: 100, art: "arts", tag: "FSS LR4", mapX: 350, mapY: 572,
    images: ["/venues/fss-lr4/fss-lr4-1.jpg", "/venues/fss-lr4/fss-lr4-2.jpg"] },
];


export const courseDefs = [
  { code: "CSC406", title: "Special Topics in Computer Science", department: "Computer Science" },
  { code: "CSC401", title: "Software Engineering II", department: "Computer Science" },
  { code: "MTH201", title: "Mathematical Methods I", department: "Mathematics" },
  { code: "BIO305", title: "Cell Biology & Genetics", department: "Life Sciences" },
  { code: "CHM202", title: "Organic Chemistry II", department: "Chemistry" },
  { code: "ENG101", title: "Use of English I", department: "General Studies" },
];

export const invigilatorDefs = [
  { staffId: "FUL/STAFF/0231", name: "Mrs. A. Yusuf", department: "Computer Science", contact: "a.yusuf@ful.edu.ng" },
  { staffId: "FUL/STAFF/0417", name: "Mr. T. Nubi", department: "Environmental Sciences", contact: "t.nubi@ful.edu.ng" },
  { staffId: "FUL/STAFF/0188", name: "Dr. K. Adeyemi", department: "Mathematics", contact: "k.adeyemi@ful.edu.ng" },
  { staffId: "FUL/STAFF/0509", name: "Mrs. F. Bello", department: "Life Sciences", contact: "f.bello@ful.edu.ng" },
];

export const timeSlotDefs = [
  { label: "Morning", startTime: "09:00", endTime: "11:00" },
  { label: "Afternoon", startTime: "13:00", endTime: "15:00" },
];

// A modest but realistic student roster, auto-registered across the six
// courses above so the scheduling engine has real conflicts to resolve.
// Department is intentionally NOT copied from the course — it's derived
// from the matric number itself (departmentFromMatric), exactly the way
// the real login flow works, so the seed data proves the mechanism rather
// than faking its result.
export function generateStudents(countPerCourse = 30) {
  const students = [];
  let n = 1;
  for (const course of courseDefs) {
    for (let i = 0; i < countPerCourse; i++) {
      const matricNo = `FUL/${course.code.slice(0, 3)}/22/${String(n).padStart(4, "0")}`;
      students.push({
        matricNo,
        name: `Student ${n}`,
        department: departmentFromMatric(matricNo) || course.department,
        courseCode: course.code,
      });
      n++;
    }
  }
  // A handful of students double-registered across courses, to give the
  // scheduler genuine clash-avoidance work to do.
  students.push({ matricNo: "FUL/CSC/22/0201", name: "Cross-Reg Student A", department: departmentFromMatric("FUL/CSC/22/0201"), courseCode: "MTH201" });
  students.push({ matricNo: "FUL/CSC/22/0202", name: "Cross-Reg Student B", department: departmentFromMatric("FUL/CSC/22/0202"), courseCode: "ENG101" });

  return students;
}
