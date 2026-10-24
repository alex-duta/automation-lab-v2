import { useEffect, useState } from "react";
import '../styles/App.css';
import BackButton from "../components/BackButton";
import { API_BASE } from "../config/config";

// Text of the status of a report
const statusText = (report) => {
  if (report.status === "queued") return "Queued";
  if (report.status === "running") return `Running (${report.progress}%)`;
  return "Ready";
};

// Export & Reports page: download the users as CSV, request a report and follow its status,
// then open its printable view in a new tab
export default function UserReports() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [reportType, setReportType] = useState("by_role");
  const [reportSearch, setReportSearch] = useState("");
  const [delay, setDelay] = useState("3");
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | error
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    document.title = "Automation Playground - Export & Reports";
  }, []);

  // Link of the CSV export: the backend sends the file as an attachment, so the browser downloads it
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (role) params.append("role", role);
  if (status) params.append("status", status);
  const exportUrl = `${API_BASE}/users/export.csv${params.toString() ? "?" + params.toString() : ""}`;

  // Ask for the status of the report every 500 ms until it is ready
  useEffect(() => {
    if (!report || report.status === "ready") return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/reports/${report.id}`);
        if (res.ok) {
          setReport(await res.json());
          return;
        }
      } catch (err) {
        console.error(err);
      }
      setReport((current) => ({ ...current })); // ask again
    }, 500);
    return () => clearTimeout(timer);
  }, [report]);

  // Request a report
  const handleGenerate = async (e) => {
    e.preventDefault();
    setRequesting(true);
    setMessage("");
    setReport(null);

    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          search: reportSearch.trim(),
          delay: Number(delay),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("Error: " + (typeof data.detail === "string" ? data.detail : "the report request is not valid."));
        setMessageType("error");
        return;
      }

      setReport(data);

    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
      setMessageType("error");
    } finally {
      setRequesting(false);
    }
  };

  // Render
  return (
    <div className="center-page">
      <div style={styles.container}>
        {/* Back button */}
        <BackButton to="/" text="Back" />

        <div style={styles.twoColumn}>

          {/* LEFT PANEL — CSV EXPORT */}
          <div style={styles.panel}>
            <h2>Export Users</h2>
            <p>Download the users that match the filters as a CSV file.</p>

            <div style={styles.form}>
              <input
                id="exportSearch"
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.input}
              />
              <select id="exportRole" value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <select id="exportStatus" value={status} onChange={(e) => setStatus(e.target.value)} style={styles.input}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              <a id="exportCsvLink" href={exportUrl} style={styles.linkButton}>
                Export CSV
              </a>
            </div>
          </div>

          {/* RIGHT PANEL — REPORTS */}
          <div style={styles.panel}>
            <h2>Reports</h2>
            <p>Count the users by role or by status. A report takes some time to process.</p>

            <form id="reportForm" onSubmit={handleGenerate} style={styles.form}>
              <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} style={styles.input}>
                <option value="by_role">Users by role</option>
                <option value="by_status">Users by status</option>
              </select>
              <input
                id="reportSearch"
                type="text"
                placeholder="Only users matching... (optional)"
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                style={styles.input}
              />
              <label style={styles.label}>
                Processing time (seconds):
                <input
                  id="reportDelay"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={delay}
                  onChange={(e) => setDelay(e.target.value)}
                  style={styles.delayInput}
                />
              </label>
              <button id="generateReportBtn" type="submit" disabled={requesting} style={styles.button}>
                {requesting ? "Requesting..." : "Generate Report"}
              </button>
            </form>

            {report && (
              <div id="currentReport" data-report-id={report.id} style={styles.report}>
                <p style={styles.reportLine}>
                  Report #{report.id}: {report.title}
                </p>
                <p style={styles.reportLine}>
                  Status:{" "}
                  <span id="reportStatus" data-status={report.status} style={styles.status[report.status]}>
                    {statusText(report)}
                  </span>
                </p>
                {report.status === "ready" && (
                  <>
                    <p id="reportTotal" style={styles.reportLine}>
                      Users counted: {report.result.reduce((sum, r) => sum + r.count, 0)}
                    </p>
                    <a id="openPrintable" href={`/user-reports/print/${report.id}`} target="_blank" rel="noopener noreferrer">
                      Open printable view
                    </a>
                  </>
                )}
              </div>
            )}

            {message && (
              <div id="reportMessage" className={`message ${messageType}`}>
                {message}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// Styles for the UserReports component
const styles = {
  container: {
    padding: "40px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  twoColumn: {
    display: "flex",
    gap: "40px",
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: "20px",
  },
  panel: {
    flex: 1,
    padding: "30px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    background: "#fafafa",
    maxWidth: "420px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  label: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },
  delayInput: {
    width: "80px",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  linkButton: {
    display: "block",
    padding: "14px",
    background: "#007bff",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "16px",
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
  report: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "white",
    textAlign: "left",
  },
  reportLine: {
    margin: "0 0 10px 0",
  },
  status: {
    queued: { color: "#6c757d", fontWeight: "bold" },
    running: { color: "#007bff", fontWeight: "bold" },
    ready: { color: "#28a745", fontWeight: "bold" },
  },
};
