import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import config from "../config/config";

export default function Login() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const [focusField, setFocusField] = useState(null); 
  const [showPassword, setShowPassword] = useState(false);

  // mouse position in viewport
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // caret tracking for userId input
  const userIdInputRef = useRef(null);
  const mirrorRef = useRef(null);
  const [caretPos, setCaretPos] = useState(null); // {x,y} in viewport

  // target point for eyes to look at
  const targetRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // ✅ Mouse listener
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // only update target if not using caret
      if (!(focusField === "userId" && caretPos)) {
        targetRef.current = mouseRef.current;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [focusField, caretPos]);

  // ✅ Update caret position (hidden mirror technique)
  const updateCaretPosition = () => {
    const input = userIdInputRef.current;
    const mirror = mirrorRef.current;
    if (!input || !mirror) return;

    const value = input.value || "";
    const caretIndex = input.selectionStart ?? value.length;

    // Put text up to caret into mirror, then a span caret marker
    // convert spaces to nbsp so width matches
    const before = value.substring(0, caretIndex).replace(/ /g, "\u00a0");
    const after = value.substring(caretIndex).replace(/ /g, "\u00a0");

    mirror.innerHTML = `${escapeHtml(before)}<span id="__caret__">|</span>${escapeHtml(after)}`;

    const caretEl = mirror.querySelector("#__caret__");
    if (!caretEl) return;

    const permissionsStr = localStorage.getItem("permissions");
    let permissions = {};

    try {
      permissions = permissionsStr ? JSON.parse(permissionsStr) : {};
    } catch {
      permissions = {};
    }

    const caretRect = caretEl.getBoundingClientRect();
    // Place target near caret inside input
    setCaretPos({
      x: caretRect.left,
      y: caretRect.top + caretRect.height / 2,
    });
  };

  // ✅ Recompute caret on typing / click / key nav
  <input
    ref={userIdInputRef}
    style={styles.input}
    value={userId}
    onChange={(e) => {
      setUserId(e.target.value);
      requestAnimationFrame(updateCaretPosition); // ✅ SAFE
    }}
    onClick={() => requestAnimationFrame(updateCaretPosition)}
    onKeyUp={() => requestAnimationFrame(updateCaretPosition)}
    onFocus={() => {
      setFocusField("userId");
      targetRef.current = mouseRef.current;
      requestAnimationFrame(updateCaretPosition);
    }}
    onBlur={() => {
      setFocusField(null);
      setCaretPos(null);
    }}
    placeholder="Enter User ID"
    type="text"
  />

  // ✅ Set target to caret when available
  useEffect(() => {
    if (focusField === "userId" && caretPos) {
      targetRef.current = caretPos;
    }
  }, [caretPos, focusField]);

  // ✅ "Shy" state rules
  const shy = focusField === "password" && !showPassword; // if reveal is ON, mascots come back

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await authService.login({ userId, password });

      // ✅ STORE EVERYTHING
      const resolvedUserId = String(
        data?.userId ?? data?.UserId ?? userId ?? "",
      ).trim();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", resolvedUserId);
      localStorage.setItem("role", data.role);
      localStorage.setItem(
        "userName",
        data?.userName ?? data?.UserName ?? resolvedUserId,
      );

      // ⚠️ permissions is STRING → store as-is
      localStorage.setItem("permissions", data.permissions);

      navigate("/testing");
    } catch (err) {
      console.error(err);

      if (err?.response?.status === 401) {
        alert("Invalid credentials");
        return;
      }

      if (err?.code === "ERR_NETWORK") {
        alert(`Unable to connect to backend at ${config.apiBaseUrl}. Please ensure the .NET API is running.`);
        return;
      }

      alert(err?.response?.data?.message ?? "Login failed. Please try again.");
    }
  };


  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>
      <div style={styles.shell} className="login-shell">
        <div style={styles.topHeader}>
          <div style={styles.topHeaderRow} className="login-header-row">
            <img
              src="https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyds-metals-logo.svg"
              alt="Lloyds Metals"
              style={styles.logo}
            />
            <div style={styles.headerTitleGroup}>
              <div style={styles.brand} className="brand-pop">
                Laboratory Information Management System
              </div>
              <div style={styles.tagline} className="tagline-pop">LIMS</div>
            </div>
          </div>
          <div style={styles.headerDivider} />
          <div style={styles.headerAmbient} className="header-ambient" aria-hidden="true">
            <div className="lab-computer">
              <div className="monitor">
                <div className="screen">
                  <div className="scanline" />
                  <div className="terminal-line tl1" />
                  <div className="terminal-line tl2" />
                  <div className="terminal-line tl3" />
                </div>
                <div className="stand" />
              </div>
              <div className="cpu">
                <span className="cpu-led" />
                <span className="cpu-slot" />
              </div>
              <div className="keyboard">
                <span className="key k1" />
                <span className="key k2" />
                <span className="key k3" />
                <span className="key k4" />
              </div>
            </div>
          </div>
        </div>

        <div style={styles.contentWrapper} className="login-content">
          {/* LEFT: Lab Animation Panel */}
          <div style={styles.left} className="login-left-pane">
            <div style={styles.labStageWrap}>
              <div style={styles.labStage} className="lab-stage">
                <div className="tube-grid">
                  {["A", "B", "C", "D"].map((label, index) => (
                    <div key={label} className={`tube tube-${index + 1}`}>
                      <div className="tube-neck" />
                      <div className="tube-body">
                        <div className="liquid" />
                        <div className="bubble b1" />
                        <div className="bubble b2" />
                        <div className="bubble b3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Login Card */}
          <div style={styles.right} className="login-right-pane">
            <div style={styles.card} className="login-card-animated">
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Sign in</div>
                <div style={styles.cardSub}>Use your User ID and Password</div>
              </div>

              <form onSubmit={handleSubmit}>
                <label style={styles.label}>User ID</label>

                <div style={styles.inputWrap}>
                  <input
                    ref={userIdInputRef}
                    style={styles.input}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    onFocus={() => {
                      setFocusField("userId");
                      // set target to mouse until caret computed
                      targetRef.current = mouseRef.current;
                      // then caret effect kicks in
                      setTimeout(updateCaretPosition, 0);
                    }}
                    onBlur={() => {
                      setFocusField(null);
                      setCaretPos(null);
                    }}
                    placeholder="Enter User ID"
                    type="text"
                    autoComplete="username"
                  />

                  {/* Hidden mirror for caret measurement */}
                  <div ref={mirrorRef} style={styles.caretMirror} />
                </div>

                <label style={styles.label}>Password</label>
                <div style={styles.passwordRow}>
                  <input
                    style={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusField("password")}
                    onBlur={() => setFocusField(null)}
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={styles.eyeBtn}
                    className="login-eye-btn"
                    aria-label="Toggle password visibility"
                    title="Show/Hide Password"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>

                </div>
                <div
                  style={{
                    height: 1,
                    background: "linear-gradient(to right, transparent, #cbd5e1, transparent)",
                    margin: "20px 0",
                  }}
                />

                <button style={styles.button} className="login-submit-btn" type="submit">
                  Sign in
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.pageFooter}>
        © 2026 Lloyds Metals & Energy Limited (LMEL) - LIMS. All rights reserved.
      </div>

      <style>{css}</style>
    </div>
  );
}

/* ---------------- Mascot Group (SVG) ---------------- */

function MascotGroup({ shy, targetRef }) {
  // Overlap positions (like the picture)
  return (
    <div style={styles.groupWrap}>
      {/* Purple tall block */}
      <Mascot
        variant="purple"
        shy={shy}
        targetRef={targetRef}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          zIndex: 1,
        }}
      />

      {/* Black medium pillar (in front) */}
      <Mascot
        variant="black"
        shy={shy}
        targetRef={targetRef}
        style={{
          position: "absolute",
          left: 110,
          bottom: 0,
          zIndex: 3,
        }}
      />

      {/* Orange dome (front-left bottom) */}
      <Mascot
        variant="orange"
        shy={shy}
        targetRef={targetRef}
        style={{
          position: "absolute",
          left: 25,
          bottom: -4,
          zIndex: 2,
        }}
      />

      {/* Yellow rounded pillar (right) */}
      <Mascot
        variant="yellow"
        shy={shy}
        targetRef={targetRef}
        style={{
          position: "absolute",
          left: 190,
          bottom: -2,
          zIndex: 2,
        }}
      />
    </div>
  );
}

function Mascot({ variant, shy, targetRef, style }) {
  const wrapRef = useRef(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  const MAX = 6;

  const privacyVector = useMemo(() => {
    // shy direction differs per character
    if (variant === "purple") return { x: -MAX, y: MAX };
    if (variant === "black") return { x: MAX, y: MAX };
    if (variant === "orange") return { x: -MAX, y: -MAX };
    return { x: MAX, y: -MAX };
  }, [variant]);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const el = wrapRef.current;
      if (!el) return;

      if (shy) {
        setPupil(privacyVector);
        raf = requestAnimationFrame(tick);
        return;
      }

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const { x: tx, y: ty } = targetRef.current;

      const dx = tx - cx;
      const dy = ty - cy;
      const angle = Math.atan2(dy, dx);

      setPupil({
        x: Math.cos(angle) * MAX,
        y: Math.sin(angle) * MAX,
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shy, privacyVector, targetRef]);

  const s = getMascotSpec(variant);

  return (
    <div
      ref={wrapRef}
      style={{
        ...s.wrap,
        ...style,
        transform: shy ? `${s.shyTransform} scale(0.98)` : "translate(0,0) scale(1)",
      }}
      className="mascot"
      aria-label={variant}
      title={variant}
    >
      <svg width={s.w} height={s.h} viewBox={`0 0 ${s.w} ${s.h}`}>
        {/* Body */}
        <path d={s.bodyPath} fill={s.color} />

        {/* Eyes whites */}
        <circle cx={s.eye1.x} cy={s.eye1.y} r={s.eyeR} fill="rgba(255,255,255,0.95)" />
        <circle cx={s.eye2.x} cy={s.eye2.y} r={s.eyeR} fill="rgba(255,255,255,0.95)" />

        {/* Pupils */}
        <circle
          cx={s.eye1.x + pupil.x}
          cy={s.eye1.y + pupil.y}
          r={s.pupilR}
          fill="#111827"
        />
        <circle
          cx={s.eye2.x + pupil.x}
          cy={s.eye2.y + pupil.y}
          r={s.pupilR}
          fill="#111827"
        />

        {/* Mouth (simple) */}
        {s.mouthPath && <path d={s.mouthPath} stroke="#111827" strokeWidth="4" strokeLinecap="round" fill="none" />}
      </svg>
    </div>
  );
}

function getMascotSpec(variant) {
  // Simple vector shapes so they look like your reference
  switch (variant) {
    case "purple":
      return {
        w: 140,
        h: 200,
        color: "#5b21b6",
        wrap: { width: 140, height: 200 },
        bodyPath: "M30 20 Q30 10 40 10 H110 Q120 10 120 20 V190 Q120 195 115 195 H35 Q30 195 30 190 Z",
        eyeR: 12,
        pupilR: 4.8,
        eye1: { x: 70, y: 55 },
        eye2: { x: 100, y: 55 },
        mouthPath: "",
        shyTransform: "translate(-2px, 6px) rotate(-1.5deg)",
      };
    case "black":
      return {
        w: 120,
        h: 190,
        color: "#0b1220",
        wrap: { width: 120, height: 190 },
        bodyPath: "M35 18 Q35 10 45 10 H95 Q105 10 105 18 V182 Q105 190 97 190 H43 Q35 190 35 182 Z",
        eyeR: 12,
        pupilR: 4.8,
        eye1: { x: 60, y: 55 },
        eye2: { x: 88, y: 55 },
        mouthPath: "",
        shyTransform: "translate(3px, 7px) rotate(1.5deg)",
      };
    case "orange":
      return {
        w: 220,
        h: 140,
        color: "#f97316",
        wrap: { width: 220, height: 140 },
        bodyPath: "M20 120 Q20 35 110 25 Q200 35 200 120 Q200 130 190 130 H30 Q20 130 20 120 Z",
        eyeR: 12,
        pupilR: 4.8,
        eye1: { x: 85, y: 70 },
        eye2: { x: 130, y: 70 },
        mouthPath: "M90 98 Q110 112 130 98",
        shyTransform: "translate(-4px, 8px) rotate(-2deg)",
      };
    case "yellow":
    default:
      return {
        w: 150,
        h: 170,
        color: "#facc15",
        wrap: { width: 150, height: 170 },
        bodyPath: "M45 20 Q45 10 55 10 H110 Q120 10 120 20 V160 Q120 168 112 168 H53 Q45 168 45 160 Z",
        eyeR: 12,
        pupilR: 4.8,
        eye1: { x: 72, y: 60 },
        eye2: { x: 102, y: 60 },
        mouthPath: "",
        shyTransform: "translate(5px, 6px) rotate(2deg)",
      };
  }
}

/* ---------------- Helpers ---------------- */

function escapeHtml(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------- Styling ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: `url("https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyd-metals/Ghughus-Steel-Plant.jpg") center/cover no-repeat`,
    fontFamily: "Segoe UI, system-ui, Arial",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 22px 26px",
    position: "relative",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 0,
  },
  shell: {
    width: "100%",
    maxWidth: 1120,
    minHeight: 640,
    display: "flex",
    flexDirection: "column",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 22px 65px rgba(0,0,0,0.42)",
    background: "#f3f4f6",
    position: "relative",
    zIndex: 2,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  topHeader: {
    minHeight: 92,
    padding: "18px 24px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    background: "linear-gradient(90deg, rgba(43,12,12,0.98), rgba(122,12,12,0.96) 60%, rgba(192,0,0,0.88))",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "relative",
    overflow: "hidden",
  },
  topHeaderRow: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    minWidth: 0,
    flex: 1,
  },
  headerTitleGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  headerDivider: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
  },
  headerAmbient: {
    position: "relative",
    width: 220,
    height: 88,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    pointerEvents: "none",
    opacity: 0.96,
    flexShrink: 0,
  },
  contentWrapper: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    flex: 1,
    background: "#f3f4f6",
  },
  left: {
    padding: "28px 24px 30px",
    position: "relative",
    zIndex: 1,
    background: "linear-gradient(180deg, rgba(243,244,246,0.96), rgba(234,236,239,0.98))",
  },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px 26px 30px",
    position: "relative",
    zIndex: 2,
    background: "linear-gradient(180deg, rgba(243,244,246,0.96), rgba(234,236,239,0.98))",
  },
  logo: {
    height: 34,
    width: "auto",
    flexShrink: 0,
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.18))",
  },
  brand: {
    fontWeight: 800,
    fontSize: 19,
    letterSpacing: "0.4px",
    color: "#ffffff",
    lineHeight: 1.2,
    textTransform: "none",
    textShadow: "0 2px 10px rgba(0,0,0,0.25)",
  },
  tagline: {
    marginTop: 4,
    color: "rgba(255,255,255,0.82)",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "1.6px",
    textTransform: "uppercase",
  },
  labStageWrap: {
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  labStage: {
    position: "relative",
    width: "100%",
  },
  card: {
    width: "100%",
    maxWidth: 430,
    borderRadius: 12,
    padding: 28,
    background: "#f3f4f6",
    border: "1.5px solid rgba(192,0,0,0.42)",
    boxShadow: "0 18px 40px rgba(17,24,39,0.16), 0 0 0 1px rgba(122,12,12,0.06)",
  },
  cardHeader: {
    marginBottom: 18,
  },
  cardTitle: {
    color: "#1f2937",
    fontWeight: 800,
    fontSize: 28,
    lineHeight: 1.1,
    marginBottom: 6,
  },
  cardSub: {
    color: "#4b5563",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1.4,
  },
  label: {
    display: "block",
    color: "#111827",
    fontWeight: 800,
    fontSize: 13,
    marginTop: 14,
    marginBottom: 8,
  },
  inputWrap: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    color: "#111827",
    background: "#ffffff",
    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.06)",
    outline: "none",
  },
  passwordRow: {
    display: "grid",
    gridTemplateColumns: "1fr 48px",
    gap: 10,
    alignItems: "center",
  },
  eyeBtn: {
    height: 46,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 18,
    color: "#7a0c0c",
    boxShadow: "0 6px 16px rgba(15,23,42,0.08)",
  },
  button: {
    marginTop: 22,
    width: "100%",
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(90deg, #7a0c0c, #c00000)",
    color: "white",
    fontWeight: 800,
    fontSize: 15,
    letterSpacing: "0.3px",
    boxShadow: "0 12px 24px rgba(122,12,12,0.28)",
    cursor: "pointer",
  },
  pageFooter: {
    marginTop: 18,
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    lineHeight: 1.4,
    textAlign: "center",
    position: "relative",
    zIndex: 2,
    textShadow: "0 2px 8px rgba(0,0,0,0.35)",
  },
  caretMirror: {
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
    whiteSpace: "pre",
    fontSize: 14,
    fontFamily: "Segoe UI, system-ui, Arial",
    fontWeight: 400,
    pointerEvents: "none",
  },
};

const css = `
.mascot{
  transition: transform 240ms cubic-bezier(.2,.9,.2,1);
}
.brand-pop{
  animation: brandIn 700ms cubic-bezier(.2,.8,.2,1), brandPulse 5s ease-in-out 900ms infinite;
  transform-origin: center;
}
.tagline-pop{
  animation: tagIn 900ms ease-out;
}
.login-card-animated{
  animation: cardIn 700ms cubic-bezier(.2,.8,.2,1);
}
svg{
  display:block;
}
.login-submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(122,12,12,0.34);
  background: #a00000 !important;
}
.login-eye-btn:hover {
  border-color: rgba(192,0,0,0.42);
  box-shadow: 0 10px 22px rgba(122,12,12,0.14);
}
input:focus {
  border-color: #c00000;
  box-shadow: 0 0 0 3px rgba(192,0,0,0.12);
}
input,
input[type="text"],
input[type="password"] {
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  caret-color: #111827;
}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-text-fill-color: #111827 !important;
  caret-color: #111827;
  transition: background-color 9999s ease-in-out 0s;
}
input::placeholder {
  color: #6b7280;
  opacity: 1;
}
input::-webkit-input-placeholder {
  color: #6b7280;
}
.lab-stage .tube-grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 18px;
  padding: 8px;
}
.lab-stage .tube{
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border: 1px solid rgba(203,213,225,0.9);
  border-radius: 14px;
  padding: 12px;
  display:flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 172px;
  position: relative;
  box-shadow: 0 10px 24px rgba(15,23,42,0.08);
}
.lab-stage .tube-neck{
  width: 28px;
  height: 18px;
  border-radius: 8px 8px 6px 6px;
  background: rgba(15,23,42,0.1);
  margin-bottom: 6px;
}
.lab-stage .tube-body{
  width: 60px;
  height: 105px;
  border-radius: 14px 14px 18px 18px;
  border: 2px solid rgba(148,163,184,0.4);
  background: rgba(255,255,255,0.72);
  position: relative;
  overflow: hidden;
}
.lab-stage .liquid{
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(180deg, #c00000, #7a0c0c);
  animation: liquidWave 3s ease-in-out infinite;
}
.lab-stage .tube-2 .liquid{
  background: linear-gradient(180deg, #1fa34a, #127836);
  animation-delay: 0.4s;
}
.lab-stage .tube-3 .liquid{
  background: linear-gradient(180deg, #d79b07, #a16207);
  animation-delay: 0.8s;
}
.lab-stage .tube-4 .liquid{
  background: linear-gradient(180deg, #ef4444, #c00000);
  animation-delay: 1.2s;
}
.lab-stage .bubble{
  position:absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(255,255,255,0.72);
  bottom: 10px;
  left: 12px;
  animation: bubbleRise 2.8s ease-in-out infinite;
}
.lab-stage .bubble.b2{ left: 34px; animation-delay: 0.7s; }
.lab-stage .bubble.b3{ left: 48px; animation-delay: 1.4s; }
.header-ambient .lab-computer{
  width: 200px;
  height: 88px;
  display: grid;
  grid-template-columns: 1fr 56px;
  grid-template-rows: 1fr 20px;
  gap: 8px 10px;
  align-items: end;
  animation: computerFloat 3.2s ease-in-out infinite;
}
.header-ambient .monitor{
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.header-ambient .screen{
  width: 128px;
  height: 62px;
  border-radius: 8px;
  border: 2px solid rgba(192,0,0,0.26);
  background: linear-gradient(180deg, #120b0b, #3a1111);
  box-shadow: inset 0 0 18px rgba(192,0,0,0.2);
  position: relative;
  overflow: hidden;
}
.header-ambient .scanline{
  position: absolute;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(180deg, rgba(192,0,0,0.22), rgba(192,0,0,0));
  animation: scanMove 2.4s linear infinite;
}
.header-ambient .terminal-line{
  height: 5px;
  border-radius: 4px;
  margin: 8px 10px 0;
  background: linear-gradient(90deg, rgba(74,222,128,0.95), rgba(16,185,129,0.15));
  animation: terminalPulse 1.6s ease-in-out infinite;
}
.header-ambient .terminal-line.tl2{ width: 80%; animation-delay: .2s; }
.header-ambient .terminal-line.tl3{ width: 58%; animation-delay: .45s; }
.header-ambient .stand{
  width: 34px;
  height: 12px;
  margin-top: 4px;
  border-radius: 4px;
  background: rgba(226,232,240,0.4);
}
.header-ambient .cpu{
  grid-column: 2;
  grid-row: 1 / span 2;
  height: 72px;
  border-radius: 8px;
  border: 2px solid rgba(203,213,225,0.95);
  background: linear-gradient(180deg, rgba(241,245,249,0.95), rgba(226,232,240,1));
  position: relative;
}
.header-ambient .cpu-led{
  position: absolute;
  top: 12px;
  left: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 10px rgba(34,197,94,0.7);
  animation: ledBlink 1.5s ease-in-out infinite;
}
.header-ambient .cpu-slot{
  position: absolute;
  bottom: 14px;
  left: 10px;
  right: 10px;
  height: 4px;
  border-radius: 3px;
  background: rgba(148,163,184,0.7);
}
.header-ambient .keyboard{
  grid-column: 1;
  grid-row: 2;
  height: 14px;
  border-radius: 6px;
  border: 1px solid rgba(203,213,225,0.8);
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(226,232,240,0.96));
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 2px 6px;
}
.header-ambient .key{
  border-radius: 2px;
  background: rgba(148,163,184,0.5);
  animation: keyTap 1.9s ease-in-out infinite;
}
.header-ambient .key.k2{ animation-delay: .15s; }
.header-ambient .key.k3{ animation-delay: .3s; }
.header-ambient .key.k4{ animation-delay: .45s; }
@keyframes liquidWave{
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(6px); }
}
@keyframes bubbleRise{
  0%{ transform: translateY(0) scale(0.8); opacity: 0.6; }
  70%{ opacity: 0.85; }
  100%{ transform: translateY(-55px) scale(1); opacity: 0; }
}
@keyframes computerFloat{
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-4px); }
}
@keyframes scanMove{
  0%{ top: -12px; }
  100%{ top: 62px; }
}
@keyframes terminalPulse{
  0%,100%{ opacity: .45; }
  50%{ opacity: .95; }
}
@keyframes ledBlink{
  0%,100%{ opacity: .45; }
  50%{ opacity: 1; }
}
@keyframes keyTap{
  0%,100%{ transform: translateY(0); opacity: .7; }
  50%{ transform: translateY(-1px); opacity: 1; }
}
@keyframes cardIn{
  from{ opacity: 0; transform: translateY(14px) scale(.985); }
  to{ opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes brandIn{
  from{ opacity: 0; transform: translateY(-8px) scale(.95); }
  to{ opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes tagIn{
  from{ opacity: 0; transform: translateY(8px); }
  to{ opacity: 1; transform: translateY(0); }
}
@keyframes brandPulse{
  0%,100%{ text-shadow: 0 0 0 rgba(255,255,255,0); }
  50%{ text-shadow: 0 2px 10px rgba(255,255,255,0.12); }
}
@media (max-width: 900px){
  .header-ambient{ display:none; }
}
@media (max-width: 860px){
  .brand-pop{ font-size: 16px; }
  .tagline-pop{ font-size: 12px; }
}
@media (max-width: 820px){
  .login-content{
    grid-template-columns: 1fr !important;
  }
  .login-left-pane,
  .login-right-pane{
    padding: 22px 18px !important;
  }
  .lab-stage .tube-grid{
    grid-template-columns: repeat(2, minmax(100px, 1fr));
    gap: 14px;
  }
}
@media (max-width: 760px){
  .login-shell{
    border-radius: 14px !important;
  }
  .login-card-animated{
    max-width: 100%;
  }
}
@media (max-width: 640px){
  .login-header-row{
    flex-direction: column;
    align-items: flex-start;
  }
}
`;
