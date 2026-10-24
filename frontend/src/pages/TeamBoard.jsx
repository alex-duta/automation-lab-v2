import { useEffect, useState } from "react";
import '../styles/App.css';
import BackButton from "../components/BackButton";
import "../components/UserCard";
import { API_BASE } from "../config/config";

// Highlighted cards are a preference of this browser, kept in localStorage (a list of user ids)
const HIGHLIGHTS_KEY = "teamBoard.highlighted";

const readHighlights = () => {
  try {
    return JSON.parse(localStorage.getItem(HIGHLIGHTS_KEY)) || [];
  } catch {
    return [];
  }
};

// Team Board page: one lane per team; drag a card to another team (HTML5 drag and drop),
// double-click a team name to rename it, right-click a card for its menu
export default function TeamBoard() {
  const [teams, setTeams] = useState([]);
  const [highlights, setHighlights] = useState(readHighlights);
  const [addEmail, setAddEmail] = useState("");
  const [addTeam, setAddTeam] = useState("");
  const [editing, setEditing] = useState(null); // { teamId, name } while a team name is edited
  const [menu, setMenu] = useState(null); // { user, x, y } while the menu of a card is open
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | error
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Automation Playground - Team Board";
  }, []);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchTeams = async () => {
    const res = await fetch(`${API_BASE}/teams`);
    const data = await res.json();
    setTeams(data);
    setAddTeam((current) => current || (data.length ? String(data[0].id) : ""));
  };

  // Run an action against the API with the loading overlay; the board is fetched again after it
  const runAction = async (action) => {
    setLoading(true);
    setMessage("");
    try {
      await action();
    } catch (err) {
      console.error(err);
      showMessage("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAction(fetchTeams);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close the menu of a card on a click anywhere or on Escape
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  // Put the user in the team; the API takes a user out of the team they were in
  const putInTeam = async (user, team, verb) => {
    const res = await fetch(`${API_BASE}/users/${user.id}/team`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: team.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      showMessage("Error: " + data.detail, "error");
      return;
    }
    await fetchTeams();
    showMessage(`${user.name} ${verb} ${team.name}.`, "success");
  };

  // Add form: find the user by e-mail, then put them in the chosen team
  const handleAdd = (e) => {
    e.preventDefault();
    const email = addEmail.trim();
    const team = teams.find((t) => String(t.id) === addTeam);

    if (!email || !team) {
      showMessage("Enter the e-mail of a user and choose a team.", "error");
      return;
    }

    runAction(async () => {
      const res = await fetch(`${API_BASE}/users?search=${encodeURIComponent(email)}`);
      const data = await res.json();
      const user = (data.items || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        showMessage("User not found.", "error");
        return;
      }
      setAddEmail("");
      await putInTeam(user, team, "added to");
    });
  };

  // HTML5 drag and drop: the card carries the user id; a lane accepts the drop
  const handleDragStart = (e, user) => {
    e.dataTransfer.setData("text/plain", user.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, team) => {
    e.preventDefault();
    const userId = e.dataTransfer.getData("text/plain");
    const from = teams.find((t) => t.members.some((m) => m.id === userId));
    if (!from || from.id === team.id) return;
    const user = from.members.find((m) => m.id === userId);
    runAction(() => putInTeam(user, team, "moved to"));
  };

  // Rename a team: Enter saves, Escape or leaving the field cancels
  const handleRenameKey = (e, team) => {
    if (e.key === "Escape") {
      setEditing(null);
      return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();

    runAction(async () => {
      const res = await fetch(`${API_BASE}/teams/${team.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editing.name }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage("Error: " + (typeof data.detail === "string" ? data.detail : "the team name is not valid."), "error");
        return;
      }
      setEditing(null);
      await fetchTeams();
      showMessage(`Team renamed to ${data.name}.`, "success");
    });
  };

  const toggleHighlight = (user) => {
    const next = highlights.includes(user.id) ? highlights.filter((id) => id !== user.id) : [...highlights, user.id];
    setHighlights(next);
    try {
      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable: the highlight lasts until the page is left
    }
  };

  const removeFromTeam = (user) =>
    runAction(async () => {
      await fetch(`${API_BASE}/users/${user.id}/team`, { method: "DELETE" });
      await fetchTeams();
      showMessage(`${user.name} removed from the team.`, "success");
    });

  // Render
  return (
    <div className="center-page">
      <div style={styles.container}>
        {/* Back button */}
        <BackButton to="/" text="Back" />
        <h2>Team Board</h2>

        {/* Add a user to a team */}
        <form id="addMemberForm" onSubmit={handleAdd} style={styles.addForm}>
          <input
            id="addEmail"
            type="email"
            placeholder="E-mail of the user"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            style={styles.input}
          />
          <select id="addTeam" value={addTeam} onChange={(e) => setAddTeam(e.target.value)} style={styles.select}>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button id="addMemberBtn" type="submit" style={styles.addButton}>
            Add to Team
          </button>
        </form>

        <p style={styles.hint}>
          Drag a card to another team. Double-click a team name to rename it. × removes a user from the team;
          right-click a card for more actions.
        </p>

        {/* One lane per team */}
        <div style={styles.board}>
          {teams.map((team) => (
            <div
              key={team.id}
              id={`lane-${team.id}`}
              style={styles.lane}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, team)}
            >
              <div style={styles.laneHeader}>
                {editing && editing.teamId === team.id ? (
                  <input
                    id={`laneNameInput-${team.id}`}
                    autoFocus
                    value={editing.name}
                    onChange={(e) => setEditing({ teamId: team.id, name: e.target.value })}
                    onKeyDown={(e) => handleRenameKey(e, team)}
                    onBlur={() => setEditing(null)}
                    style={styles.laneInput}
                  />
                ) : (
                  <h3
                    id={`laneTitle-${team.id}`}
                    title="Double-click to rename"
                    onDoubleClick={() => setEditing({ teamId: team.id, name: team.name })}
                    style={styles.laneTitle}
                  >
                    {team.name}
                  </h3>
                )}
                <span id={`laneCount-${team.id}`} style={styles.count}>{team.members.length}</span>
              </div>

              {team.members.length === 0 && <p style={styles.empty}>No members</p>}

              {team.members.map((user) => (
                <user-card
                  key={user.id}
                  id={`card-${user.id}`}
                  data-name={user.name}
                  data-email={user.email}
                  data-role={user.role}
                  highlighted={highlights.includes(user.id) ? "" : undefined}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, user)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setMenu({ user, x: e.clientX, y: e.clientY });
                  }}
                >
                  <button
                    slot="actions"
                    id={`remove-${user.id}`}
                    type="button"
                    title="Remove from team"
                    aria-label={`Remove ${user.name} from the team`}
                    onClick={() => removeFromTeam(user)}
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                </user-card>
              ))}
            </div>
          ))}
        </div>

        {/* Menu of a card, opened with the right mouse button */}
        {menu && (
          <ul id="cardMenu" role="menu" style={{ ...styles.menu, left: menu.x, top: menu.y }}>
            <li id="menuHighlight" role="menuitem" onClick={() => toggleHighlight(menu.user)} style={styles.menuItem}>
              {highlights.includes(menu.user.id) ? "Remove highlight" : "Highlight"}
            </li>
            <li id="menuRemove" role="menuitem" onClick={() => removeFromTeam(menu.user)} style={styles.menuItem}>
              Remove from team
            </li>
          </ul>
        )}

        {message && (
          <div id="boardMessage" className={`message ${messageType}`}>
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

// Styles for the TeamBoard component
const styles = {
  container: {
    padding: "40px",
    maxWidth: "1000px",
    margin: "0 auto",
    textAlign: "center",
  },
  addForm: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginTop: "20px",
  },
  input: {
    width: "300px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  addButton: {
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  hint: {
    color: "#555",
    marginTop: "15px",
  },
  board: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    marginTop: "20px",
  },
  lane: {
    flex: 1,
    minHeight: "200px",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    background: "#fafafa",
  },
  laneHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  laneTitle: {
    margin: 0,
    cursor: "text",
  },
  laneInput: {
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #007bff",
    fontSize: "1em",
    width: "60%",
  },
  count: {
    background: "#6c757d",
    color: "white",
    borderRadius: "10px",
    padding: "2px 10px",
  },
  empty: {
    color: "#999",
  },
  menu: {
    position: "fixed",
    listStyle: "none",
    margin: 0,
    padding: "5px 0",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    textAlign: "left",
    zIndex: 1000,
  },
  menuItem: {
    padding: "8px 20px",
    cursor: "pointer",
  },
  removeButton: {
    background: "none",
    border: "none",
    color: "#999",
    fontSize: "18px",
    lineHeight: 1,
    cursor: "pointer",
    padding: "0 4px",
  },
};
