import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import '../styles/App.css';
import BackButton from "../components/BackButton";
import { API_BASE } from "../config/config";

// Permissions and languages offered by the profile form
const PERMISSIONS = [
  { id: "permCreateUsers", value: "create_users", label: "Create users" },
  { id: "permEditUsers", value: "edit_users", label: "Edit users" },
  { id: "permDeleteUsers", value: "delete_users", label: "Delete users" },
  { id: "permExportReports", value: "export_reports", label: "Export reports" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ro", label: "Romanian" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
];

// Document of the bio editor: a rich text editor in an iframe, whose body is the editable element,
// as in the classic editors (TinyMCE, CKEditor). The sandbox runs no script of the bio.
const editorDocument = (bio) =>
  `<!doctype html><html><head><style>body { font-family: sans-serif; margin: 8px; min-height: 80px; outline: none; }</style></head>` +
  `<body id="bioContent" contenteditable="true">${bio || "<p><br></p>"}</body></html>`;

// Edit User page: find a user by e-mail, then edit and save the profile
export default function EditUser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lookupEmail, setLookupEmail] = useState(searchParams.get("email") || "");
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [notifications, setNotifications] = useState("email");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("en");
  const [editorDoc, setEditorDoc] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | error
  const [loading, setLoading] = useState(false);
  const bioFrame = useRef(null);

  useEffect(() => {
    document.title = "Automation Playground - Edit User";
  }, []);

  // Find the user by e-mail, then load the profile; the e-mail goes into the URL, so a reload keeps the user
  const loadUser = async (email) => {
    setLoading(true);
    setMessage("");
    setUser(null);

    try {
      const res = await fetch(`${API_BASE}/users?search=${encodeURIComponent(email)}`);
      const data = await res.json();
      const found = (data.items || []).find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!found) {
        setMessage("User not found.");
        setMessageType("error");
        return;
      }

      const profileRes = await fetch(`${API_BASE}/users/${found.id}/profile`);
      const profile = await profileRes.json();

      setPermissions(profile.permissions);
      setNotifications(profile.notifications);
      setPhone(profile.phone || "");
      setLanguage(profile.language);
      setEditorDoc(editorDocument(profile.bio));
      setUser(found);
      setSearchParams({ email: found.email }, { replace: true });

    } catch (err) {
      console.error(err);
      setMessage("Failed to load the user.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Load the user of the URL once, when the page opens (after a reload, or from a link)
  useEffect(() => {
    const email = searchParams.get("email");
    if (email) loadUser(email);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Lookup form: the Load button or Enter in the e-mail field
  const handleLookup = (e) => {
    e.preventDefault();

    if (!lookupEmail.trim()) {
      setMessage("Enter the e-mail of a user.");
      setMessageType("error");
      return;
    }

    loadUser(lookupEmail.trim());
  };

  const togglePermission = (value) => {
    setPermissions((current) =>
      current.includes(value) ? current.filter((p) => p !== value) : [...current, value]
    );
  };

  // Save the profile. The browser validates the form first: the phone is required for SMS
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const bio = bioFrame.current.contentDocument.body.innerHTML;

      const res = await fetch(`${API_BASE}/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions,
          notifications,
          phone: phone.trim() || null,
          language,
          bio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("Error: " + (typeof data.detail === "string" ? data.detail : "the profile is not valid."));
        setMessageType("error");
        return;
      }

      setMessage("Profile saved successfully!");
      setMessageType("success");

    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <div className="center-page">
      <div style={styles.container}>
        {/* Back button */}
        <BackButton to="/" text="Back" />

        <div style={styles.panel}>
          <h2>Edit User</h2>

          {/* Lookup by e-mail */}
          <form id="lookupForm" onSubmit={handleLookup} style={styles.lookup}>
            <input
              id="lookupEmail"
              type="email"
              placeholder="E-mail of the user"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              style={styles.input}
            />
            <button id="loadUserBtn" type="submit" style={styles.loadButton}>
              Load
            </button>
          </form>

          {/* Profile of the loaded user */}
          {user && (
            <form id="profileForm" onSubmit={handleSave} style={styles.form}>
              <p id="loadedUser" style={styles.loadedUser}>
                {user.name} ({user.email})
              </p>

              <fieldset style={styles.fieldset}>
                <legend>Permissions</legend>
                {PERMISSIONS.map((p) => (
                  <label key={p.value} style={styles.option}>
                    <input
                      id={p.id}
                      type="checkbox"
                      name="permissions"
                      value={p.value}
                      checked={permissions.includes(p.value)}
                      onChange={() => togglePermission(p.value)}
                    />
                    {p.label}
                  </label>
                ))}
              </fieldset>

              <fieldset style={styles.fieldset}>
                <legend>Notifications</legend>
                {[["notifyEmail", "email", "E-mail"], ["notifySms", "sms", "SMS"], ["notifyNone", "none", "None"]].map(
                  ([id, value, label]) => (
                    <label key={value} style={styles.option}>
                      <input
                        id={id}
                        type="radio"
                        name="notifications"
                        value={value}
                        checked={notifications === value}
                        onChange={() => setNotifications(value)}
                      />
                      {label}
                    </label>
                  )
                )}
              </fieldset>

              <div style={styles.field}>
                <label htmlFor="phone">Phone (required for SMS):</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+40 712 345 678"
                  pattern="\+?[0-9 ]{7,15}"
                  title="7 to 15 digits, optionally starting with +"
                  required={notifications === "sms"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="language">Language:</label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={styles.input}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label>Bio:</label>
                <iframe
                  id="bioEditor"
                  title="Bio editor"
                  ref={bioFrame}
                  srcDoc={editorDoc}
                  sandbox="allow-same-origin"
                  style={styles.editor}
                />
              </div>

              <button id="saveProfileBtn" type="submit" disabled={loading} style={styles.saveButton}>
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </form>
          )}

          {message && (
            <div id="profileMessage" className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

// Styles for the EditUser component
const styles = {
  container: {
    padding: "40px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  panel: {
    padding: "30px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    background: "#fafafa",
    textAlign: "center",
  },
  lookup: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "20px",
    textAlign: "left",
  },
  loadedUser: {
    fontWeight: "bold",
    margin: 0,
  },
  fieldset: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "10px 15px",
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  editor: {
    width: "100%",
    height: "120px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "white",
  },
  loadButton: {
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  saveButton: {
    padding: "14px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    fontSize: "16px",
  },
};
