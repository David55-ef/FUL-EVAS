export const sampleVenues = [
  { name: "New Lecture Theatre (NLT)", loc: "Main Campus, Block C", cap: 400, used: 372, art: "nlt", tag: "NLT", mx: 112, my: 82 },
  { name: "Faculty of Science Auditorium", loc: "Science Complex", cap: 250, used: 250, art: "sci", tag: "Sci. Aud.", mx: 292, my: 68 },
  { name: "Old Lecture Theatre 1 (OLT1)", loc: "Main Campus, Block A", cap: 180, used: 96, art: "olt1", tag: "OLT1", mx: 86, my: 168 },
  { name: "Faculty of Arts Hall", loc: "Arts Complex", cap: 150, used: 150, art: "arts", tag: "Arts Hall", mx: 302, my: 186 },
  { name: "CBAS Lab Block Hall", loc: "CBAS Building", cap: 120, used: 0, art: "cbas", tag: "CBAS", mx: 206, my: 214 },
  { name: "Old Lecture Theatre 2 (OLT2)", loc: "Main Campus, Block A", cap: 180, used: 264, art: "olt2", tag: "OLT2", mx: 142, my: 178 },
];

export const sampleCourses = [
  { code: "CSC406", title: "Special Topics in Computer Science", dept: "Computer Science", students: 214 },
  { code: "CSC401", title: "Software Engineering II", dept: "Computer Science", students: 186 },
  { code: "MTH201", title: "Mathematical Methods I", dept: "Mathematics", students: 342 },
  { code: "BIO305", title: "Cell Biology & Genetics", dept: "Life Sciences", students: 298 },
  { code: "CHM202", title: "Organic Chemistry II", dept: "Chemistry", students: 176 },
  { code: "ENG101", title: "Use of English I", dept: "General Studies", students: 410 },
];

export const sampleInvigilators = [
  { id: "FUL/STAFF/0231", name: "Mrs. A. Yusuf", dept: "Computer Science" },
  { id: "FUL/STAFF/0417", name: "Mr. T. Nubi", dept: "Environmental Sciences" },
  { id: "FUL/STAFF/0188", name: "Dr. K. Adeyemi", dept: "Mathematics" },
  { id: "FUL/STAFF/0509", name: "Mrs. F. Bello", dept: "Life Sciences" },
];

export const sampleTimetable = [
  { time: "Mon 9:00 – 11:00 AM", items: [
    { code: "MTH201", title: "Mathematical Methods I", venue: "New Lecture Theatre (NLT)" },
    { code: "CHM202", title: "Organic Chemistry II", venue: "Old Lecture Theatre 1 (OLT1)" },
  ]},
  { time: "Mon 1:00 – 3:00 PM", items: [
    { code: "CSC406", title: "Special Topics in Computer Science", venue: "Faculty of Science Auditorium" },
  ]},
  { time: "Tue 9:00 – 11:00 AM", items: [
    { code: "BIO305", title: "Cell Biology & Genetics", venue: "New Lecture Theatre (NLT)" },
    { code: "ENG101", title: "Use of English I", venue: "Old Lecture Theatre 2 (OLT2)", clash: true },
  ]},
  { time: "Tue 1:00 – 3:00 PM", items: [
    { code: "CSC401", title: "Software Engineering II", venue: "Faculty of Arts Hall" },
  ]},
];

export const sampleMyTimetable = [
  { time: "Mon 1:00 – 3:00 PM", code: "CSC406", title: "Special Topics in Computer Science", venue: "Faculty of Science Auditorium" },
  { time: "Wed 9:00 – 11:00 AM", code: "CSC401", title: "Software Engineering II", venue: "Faculty of Arts Hall" },
  { time: "Fri 9:00 – 11:00 AM", code: "ENG101", title: "Use of English I", venue: "Old Lecture Theatre 2 (OLT2)" },
];

export const sampleSearchResult = {
  code: "CSC406",
  title: "Special Topics in Computer Science",
  venue: "Faculty of Science Auditorium",
  venueArt: "sci",
  date: "Monday, 8 Sept",
  time: "1:00 – 3:00 PM",
  seat: "B-114",
};
