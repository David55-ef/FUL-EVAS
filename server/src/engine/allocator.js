// Allocation engine — fits registered students into venues without exceeding
// capacity, and assigns invigilators without double-booking, per time slot.
//
// Modelled as bin packing: venues are bins with fixed capacity, courses are
// items to be packed (split across bins when a single venue is too small).
// Venues are tried largest-first, courses placed largest-first.

/**
 * @param {Array<{id:string, capacity:number}>} venues
 * @param {Array<{courseId:string, timeSlotId:string, studentCount:number}>} scheduledCourses
 * @returns {{
 *   allocations: Array<{courseId:string, venueId:string, studentCount:number}>,
 *   shortfalls: Array<{courseId:string, remaining:number}>
 * }}
 */
export function allocateVenues(venues, scheduledCourses) {
  const allocations = [];
  const shortfalls = [];

  const bySlot = new Map();
  for (const c of scheduledCourses) {
    if (!bySlot.has(c.timeSlotId)) bySlot.set(c.timeSlotId, []);
    bySlot.get(c.timeSlotId).push(c);
  }

  for (const [timeSlotId, coursesInSlot] of bySlot) {
    // Each time slot gets its own independent capacity ledger.
    const freeCapacity = new Map(venues.map((v) => [v.id, v.capacity]));
    const sortedVenues = [...venues].sort((a, b) => b.capacity - a.capacity);
    const sortedCourses = [...coursesInSlot].sort((a, b) => b.studentCount - a.studentCount);

    for (const course of sortedCourses) {
      let remaining = course.studentCount;
      for (const venue of sortedVenues) {
        if (remaining <= 0) break;
        const free = freeCapacity.get(venue.id);
        if (free <= 0) continue;
        const take = Math.min(remaining, free);
        allocations.push({ courseId: course.courseId, venueId: venue.id, studentCount: take, timeSlotId });
        freeCapacity.set(venue.id, free - take);
        remaining -= take;
      }
      if (remaining > 0) {
        shortfalls.push({ courseId: course.courseId, remaining });
      }
    }
  }

  return { allocations, shortfalls };
}

/**
 * @param {Array<{id:string}>} invigilators
 * @param {Array<{courseId:string, venueId:string, studentCount:number, timeSlotId:string}>} allocations
 * @param {number} ratio - students per invigilator, e.g. 40
 * @returns {{
 *   assignments: Array<{venueId:string, courseId:string, invigilatorId:string}>,
 *   understaffed: Array<{courseId:string, venueId:string, needed:number, available:number}>
 * }}
 */
export function assignInvigilators(invigilators, allocations, ratio = 40) {
  const assignments = [];
  const understaffed = [];

  const bySlot = new Map();
  for (const a of allocations) {
    if (!bySlot.has(a.timeSlotId)) bySlot.set(a.timeSlotId, []);
    bySlot.get(a.timeSlotId).push(a);
  }

  for (const [timeSlotId, allocsInSlot] of bySlot) {
    const freeInvigilators = [...invigilators.map((i) => i.id)];
    for (const alloc of allocsInSlot) {
      const needed = Math.max(1, Math.ceil(alloc.studentCount / ratio));
      const assigned = freeInvigilators.splice(0, needed);
      for (const invigilatorId of assigned) {
        assignments.push({ venueId: alloc.venueId, courseId: alloc.courseId, timeSlotId, invigilatorId });
      }
      if (assigned.length < needed) {
        understaffed.push({ courseId: alloc.courseId, venueId: alloc.venueId, needed, available: assigned.length });
      }
    }
  }

  return { assignments, understaffed };
}
