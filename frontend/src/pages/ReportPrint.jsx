import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../styles/App.css';
import { API_BASE } from "../config/config";

// Printable view of a report, opened in a new tab from the Export & Reports page
export default function ReportPrint() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = `Automation Playground - Report ${reportId}`;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/reports/${reportId}`);
        const data = await res.json();

        if (!res.ok) {
          setError("Report not found.");
          return;
        }
        if (data.status !== "ready") {
          setError("The report is not ready yet.");
          return;
        }

        setReport(data);

      } catch (err) {
        console.error(err);
        setError("Failed to load the report.");
      }
    };

    load();
  }, [reportId]);

  const total = report ? report.result.reduce((sum, r) => sum + r.count, 0) : 0;

  // Render
  return (
    <div style={styles.page}>
      {error && (
        <div id="printError" className="message error">
          {error}
        </div>
      )}

      {report && (
        <>
          <h1 id="printTitle">{report.title}</h1>
          <p id="printInfo">
            Report #{report.id}, {report.search ? `users matching "${report.search}"` : "all users"}.
          </p>

          <table id="printTable" style={styles.table}>
            <thead>
              <tr>
                <th style={styles.cell}>{report.type === "by_role" ? "Role" : "Status"}</th>
                <th style={styles.cell}>Users</th>
              </tr>
            </thead>
            <tbody>
              {report.result.map((r) => (
                <tr key={r.label}>
                  <td style={styles.cell}>{r.label}</td>
                  <td style={styles.cell}>{r.count}</td>
                </tr>
              ))}
              {report.result.length === 0 && (
                <tr>
                  <td colSpan="2" style={styles.cell}>No users</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td style={styles.cell}><strong>Total</strong></td>
                <td id="printTotal" style={styles.cell}><strong>{total}</strong></td>
              </tr>
            </tfoot>
          </table>

          <button id="printBtn" type="button" onClick={() => window.print()} style={styles.button}>
            Print
          </button>
        </>
      )}
    </div>
  );
}

// Styles for the ReportPrint component
const styles = {
  page: {
    padding: "40px",
    maxWidth: "700px",
    margin: "0 auto",
    background: "white",
    textAlign: "left",
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    marginTop: "20px",
  },
  cell: {
    border: "1px solid #ccc",
    padding: "8px 12px",
    textAlign: "left",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
