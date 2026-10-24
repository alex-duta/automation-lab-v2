import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import '../styles/App.css';
import BackButton from "../components/BackButton";
import { API_BASE } from "../config/config";

// The e-mail of the sign-in form can be remembered on this browser, in a cookie of the page, for 30 days.
// An e-mail address is a valid cookie value, so it is stored as it is.
const EMAIL_COOKIE = "rememberedEmail";

const readCookie = (name) => {
  const entry = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
  return entry ? entry.slice(name.length + 1) : null;
};

const writeCookie = (name, value) => {
  document.cookie = `${name}=${value}; path=/; max-age=2592000; samesite=lax`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

// Preferences of the signed-in user, kept by the server; the defaults when nobody is signed in
const DEFAULT_PREFERENCES = { theme: "light", date_format: "iso" };
const DATE_FORMATS = { iso: "2026-10-22", eu: "22.10.2026", us: "10/22/2026" };

// A date in the chosen format, with the time when asked
const formatDate = (date, format, withTime = false) => {
  const pad = (n) => String(n).padStart(2, "0");
  const [d, m, y] = [pad(date.getDate()), pad(date.getMonth() + 1), date.getFullYear()];
  const day = format === "eu" ? `${d}.${m}.${y}` : format === "us" ? `${m}/${d}/${y}` : `${y}-${m}-${d}`;
  return withTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
};

// Session & Preferences page: two tabs in the history of the browser (?tab=session, ?tab=preferences).
// The session is in the HTTP-only cookie of the backend, which the page cannot read: it asks GET /session,
// which also returns the preferences of the signed-in user.
export default function Account() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "preferences" ? "preferences" : "session";

  const [session, setSession] = useState(undefined); // undefined while checking, null when signed out
  const [email, setEmail] = useState(() => readCookie(EMAIL_COOKIE) || "");
  const [remember, setRemember] = useState(() => readCookie(EMAIL_COOKIE) !== null);
  const [formTheme, setFormTheme] = useState(DEFAULT_PREFERENCES.theme);
  const [formDateFormat, setFormDateFormat] = useState(DEFAULT_PREFERENCES.date_format);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | error
  const [loading, setLoading] = useState(false);

  const preferences = session ? session.preferences : DEFAULT_PREFERENCES;

  useEffect(() => {
    document.title = `Automation Playground - ${tab === "preferences" ? "Preferences" : "Session"}`;
    setMessage("");
  }, [tab]);

  // The preferences form starts from the preferences of the signed-in user
  useEffect(() => {
    setFormTheme(preferences.theme);
    setFormDateFormat(preferences.date_format);
  }, [preferences.theme, preferences.date_format]);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  // Ask the backend for the session of the cookie (credentials: the browser sends the cookie)
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/session`, { credentials: "include" });
        setSession(res.ok ? await res.json() : null);
      } catch (err) {
        console.error(err);
        setSession(null);
      }
    };
    check();
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage("Error: " + (typeof data.detail === "string" ? data.detail : "enter a valid e-mail."), "error");
        return;
      }

      // Remember the e-mail on this browser, or forget it
      if (remember) {
        writeCookie(EMAIL_COOKIE, data.user.email);
      } else {
        deleteCookie(EMAIL_COOKIE);
        setEmail("");
      }

      setSession(data);
      showMessage(`Signed in as ${data.user.name}.`, "success");

    } catch (err) {
      console.error(err);
      showMessage("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage("");

    try {
      await fetch(`${API_BASE}/session`, { method: "DELETE", credentials: "include" });
      setSession(null);
      showMessage("Signed out.", "success");
    } catch (err) {
      console.error(err);
      showMessage("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Save the preferences of the signed-in user on the server
  const savePreferences = async (theme, dateFormat, doneMessage) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/session/preferences`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, date_format: dateFormat }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setSession(null);
        showMessage("Your session has ended. Sign in again.", "error");
        return;
      }
      if (!res.ok) {
        showMessage("Error: the preferences are not valid.", "error");
        return;
      }

      setSession((current) => ({ ...current, preferences: data }));
      showMessage(doneMessage, "success");

    } catch (err) {
      console.error(err);
      showMessage("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    savePreferences(formTheme, formDateFormat, "Preferences saved.");
  };

  const handleResetPreferences = () => {
    savePreferences(DEFAULT_PREFERENCES.theme, DEFAULT_PREFERENCES.date_format, "Preferences reset to the defaults.");
  };

  const colors = styles.themes[preferences.theme] || styles.themes.light;

  // Render
  return (
    <div className="center-page">
      <div id="accountPage" data-theme={preferences.theme} style={{ ...styles.container, background: colors.background, color: colors.text }}>
        {/* Back button */}
        <BackButton to="/" text="Back" />
        <h2>Session & Preferences</h2>

        {/* Signed-in user, on both tabs */}
        <p id="sessionUser" style={styles.sessionUser}>
          {session === undefined
            ? "Checking the session..."
            : session
              ? `Signed in as ${session.user.name} (${session.user.email})`
              : "Not signed in"}
        </p>

        {/* Tabs: each one is an entry in the history of the browser */}
        <div style={styles.tabs}>
          <Link id="tabSession" to="/account?tab=session" style={tab === "session" ? styles.activeTab : styles.tab}>
            Session
          </Link>
          <Link id="tabPreferences" to="/account?tab=preferences" style={tab === "preferences" ? styles.activeTab : styles.tab}>
            Preferences
          </Link>
        </div>

        {tab === "session" && (
          <div id="sessionPanel" style={{ ...styles.panel, background: colors.panel }}>
            {session === null && (
              <form id="signInForm" onSubmit={handleSignIn} style={styles.form}>
                <p>Sign in as a user (no password: this is a test application).</p>
                <input
                  id="signInEmail"
                  type="email"
                  placeholder="E-mail of the user"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                />
                <label style={styles.check}>
                  <input
                    id="rememberEmail"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember my e-mail on this browser
                </label>
                <button id="signInBtn" type="submit" disabled={loading} style={styles.button}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}

            {session && (
              <div style={styles.form}>
                <p id="sessionName"><strong>{session.user.name}</strong></p>
                <p id="sessionEmail">{session.user.email}</p>
                <p id="sessionRole">Role: {session.user.role}</p>
                <p id="signedInAt">Signed in at {formatDate(new Date(session.created_at + "Z"), preferences.date_format, true)}</p>
                <p style={styles.note}>The session is kept in an HTTP-only cookie: only the server can read it.</p>
                <button id="signOutBtn" type="button" onClick={handleSignOut} disabled={loading} style={styles.secondaryButton}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "preferences" && !session && (
          <div id="preferencesSignedOut" style={{ ...styles.panel, background: colors.panel }}>
            <p>Sign in to choose your preferences.</p>
            <Link to="/account?tab=session">Go to Session</Link>
          </div>
        )}

        {tab === "preferences" && session && (
          <form id="preferencesForm" onSubmit={handleSavePreferences} style={{ ...styles.panel, ...styles.form, background: colors.panel }}>
            <p>The preferences of {session.user.name}, kept by the server.</p>
            <label style={styles.field}>
              Theme:
              <select id="themeSelect" value={formTheme} onChange={(e) => setFormTheme(e.target.value)} style={styles.input}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label style={styles.field}>
              Date format:
              <select id="dateFormatSelect" value={formDateFormat} onChange={(e) => setFormDateFormat(e.target.value)} style={styles.input}>
                {Object.entries(DATE_FORMATS).map(([value, example]) => (
                  <option key={value} value={value}>{example}</option>
                ))}
              </select>
            </label>
            <p id="preferencesPreview">Today: {formatDate(new Date(), preferences.date_format)}</p>
            <button id="savePreferencesBtn" type="submit" disabled={loading} style={styles.button}>
              Save Preferences
            </button>
            <button id="resetPreferencesBtn" type="button" onClick={handleResetPreferences} disabled={loading} style={styles.secondaryButton}>
              Reset Preferences
            </button>
          </form>
        )}

        {message && (
          <div id="accountMessage" className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </div>

      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

// Styles for the Account component
const styles = {
  container: {
    padding: "40px",
    width: "520px",
    margin: "0 auto",
    borderRadius: "10px",
    textAlign: "center",
  },
  sessionUser: {
    fontWeight: "bold",
  },
  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    margin: "20px 0",
  },
  tab: {
    padding: "8px 20px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    color: "inherit",
    textDecoration: "none",
  },
  activeTab: {
    padding: "8px 20px",
    borderRadius: "6px",
    border: "1px solid #007bff",
    background: "#007bff",
    color: "white",
    textDecoration: "none",
  },
  panel: {
    padding: "30px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
  },
  check: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  note: {
    fontSize: "0.9em",
    opacity: 0.8,
  },
  button: {
    padding: "14px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  secondaryButton: {
    padding: "12px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  themes: {
    light: { background: "#ffffff", panel: "#fafafa", text: "#213547" },
    dark: { background: "#1e1e2e", panel: "#2a2a3c", text: "#e0e0e0" },
  },
};
