import { useEffect, useRef, useState } from "react";
import VenueCard from "../components/VenueCard.jsx";
import CampusMap from "../components/CampusMap.jsx";
import FindVenue from "./FindVenue.jsx";
import { IconLogo } from "../lib/icons.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getVenues, getCourses } from "../lib/api.js";
import { sampleVenues, sampleCourses } from "../lib/sampleData.js";

export default function Landing({ onSignIn }) {
  const { data: venues } = useApiData(getVenues, sampleVenues);
  const { data: courses } = useApiData(getCourses, sampleCourses);

  const totalCapacity = venues.reduce((sum, v) => sum + (v.cap || 0), 0);
  const departmentsServed = new Set(courses.map((c) => c.dept)).size || 1;
  const registrations = courses.reduce((sum, c) => sum + (c.students || 0), 0);

  // Hero carousel: one real photo per venue that actually has one, cycling
  // automatically — the same photos used on the venue cards further down,
  // so nothing here is a stock/placeholder image.
  const slides = venues.filter((v) => Array.isArray(v.images) && v.images.length > 0);
  const [slideIdx, setSlideIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    timerRef.current = setInterval(() => setSlideIdx((i) => (i + 1) % slides.length), 4200);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  function goToSlide(i) {
    setSlideIdx(((i % slides.length) + slides.length) % slides.length);
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length > 1) {
      timerRef.current = setInterval(() => setSlideIdx((n) => (n + 1) % slides.length), 4200);
    }
  }

  const activeSlide = slides[slideIdx];

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">
          <div className="brand-mark"><IconLogo /></div>
          <div className="brand-text"><div className="t1">FUL-EVAS</div><div className="t2">Federal University Lokoja</div></div>
        </div>
        <nav className="landing-nav-links">
          <a href="#showcase">Venues</a>
          <a href="#map">Campus map</a>
          <a href="#tour">Photo tour</a>
          <a href="#who">Who it's for</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onSignIn(); }}>Sign in</a>
        </nav>
        <div className="landing-nav-cta">
          <button className="btn btn-ghost" onClick={onSignIn}>Sign in</button>
          <a className="btn btn-gold" href="#search">Find my venue</a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="badge hero-eyebrow">EXAMINATION VENUE ALLOCATION SYSTEM</div>
          <h1>Every student, <span className="hl">the right seat</span>, the first time.</h1>
          <p>FUL-EVAS handles venue registration, clash-free timetabling, and invigilator assignment for Federal University Lokoja's examinations — so no student ever shows up to the wrong hall again.</p>
          <div className="hero-actions">
            <a className="btn btn-gold" href="#search">🔍 Find my exam venue</a>
            <button className="btn btn-ghost" onClick={onSignIn}>Staff / Admin sign in</button>
          </div>
          <div className="hero-microstats">
            <div><b>{venues.length}</b><span>Registered venues</span></div>
            <div><b>{registrations.toLocaleString("en-US")}</b><span>Course registrations</span></div>
            <div><b>{courses.length}</b><span>Courses this semester</span></div>
            <div><b>0</b><span>Double-booked seats</span></div>
          </div>
        </div>

        <div className="hero-visual">
          {activeSlide ? (
            <>
              <div className="hero-slide" style={{ backgroundImage: `url('${activeSlide.images[0]}')` }} />
              <div className="hero-scrim" />
              {slides.length > 1 && (
                <div className="hero-dots">
                  {slides.map((s, i) => (
                    <button key={s.tag} className={i === slideIdx ? "active" : ""} onClick={() => goToSlide(i)} aria-label={`Show ${s.name}`} />
                  ))}
                </div>
              )}
              <div className="hero-caption">
                <div className="hc-name">{activeSlide.name}</div>
                <div className="hc-sub">{activeSlide.loc} · {activeSlide.cap} seats</div>
              </div>
            </>
          ) : (
            <div className="hero-slide hero-slide-empty" />
          )}
        </div>
      </section>

      <section className="marquee">
        <div className="m-item"><b>{venues.length}</b><span>Examination halls</span></div>
        <div className="m-item"><b>{totalCapacity.toLocaleString("en-US")}</b><span>Total seating capacity</span></div>
        <div className="m-item"><b>{departmentsServed}</b><span>Departments served</span></div>
        <div className="m-item"><b>4</b><span>User roles supported</span></div>
        <div className="m-item"><b>{registrations.toLocaleString("en-US")}</b><span>Course registrations</span></div>
      </section>

      <section className="landing-section" id="search">
        <FindVenue />
      </section>

      <section className="landing-section" id="showcase">
        <div className="section-title" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column" }}>
          <span className="eyebrow">Explore campus</span>
          <h2 style={{ margin: "6px 0 0" }}>A look inside our examination halls</h2>
          <p style={{ color: "var(--text-soft)", fontWeight: 400, marginTop: 6 }}>Real venues, real photos — the same halls the allocation engine assigns students to.</p>
        </div>
        <div className="grid grid-3" style={{ marginTop: 20 }}>
          {venues.map((v) => (<VenueCard key={v.tag} venue={v} />))}
        </div>
      </section>

      <section className="landing-section" id="map">
        <div className="section-title" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column" }}>
          <span className="eyebrow">Getting there</span>
          <h2 style={{ margin: "6px 0 0" }}>Find your way around campus</h2>
        </div>
        <div className="map-shell" style={{ marginTop: 20 }}>
          <CampusMap venues={venues} />
        </div>
      </section>

      <section className="landing-section" id="who">
        <div className="section-title" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column" }}>
          <span className="eyebrow">Built for everyone on exam day</span>
          <h2 style={{ margin: "6px 0 0" }}>One system, four roles</h2>
        </div>
        <div className="grid grid-4" style={{ marginTop: 20 }}>
          <div className="card"><b>Administrator</b><p style={{ color: "var(--text-soft)", fontSize: 13.5, marginTop: 6 }}>Registers venues, generates the clash-free timetable, and runs venue allocation.</p></div>
          <div className="card"><b>Exam Officer</b><p style={{ color: "var(--text-soft)", fontSize: 13.5, marginTop: 6 }}>Reviews allocations and prints seating plans and attendance sheets.</p></div>
          <div className="card"><b>Invigilator</b><p style={{ color: "var(--text-soft)", fontSize: 13.5, marginTop: 6 }}>Sees exactly which venue and course they're assigned to invigilate.</p></div>
          <div className="card"><b>Student</b><p style={{ color: "var(--text-soft)", fontSize: 13.5, marginTop: 6 }}>Finds their exam venue and seat — department detected automatically from their matric number.</p></div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="brand">
          <div className="brand-mark"><IconLogo /></div>
          <div className="brand-text"><div className="t1">FUL-EVAS</div><div className="t2">Federal University Lokoja</div></div>
        </div>
        <p>Examination Venue Allocation System · React + Express + MongoDB build</p>
      </footer>
    </div>
  );
}
