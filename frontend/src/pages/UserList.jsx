import { useEffect, useRef, useState } from "react";
import BackButton from "../components/BackButton";
import { API_BASE } from "../config/config";

// User List page with filtering and pagination
export default function UserList() {
    useEffect(() => {
        document.title = "Automation Playground - User List";
    }, []);

    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);

    const [page, setPage] = useState(1);
    const [size] = useState(10); // constant page size of 10

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // The number of the latest request. Each key typed in the search sends a request, and the backend answers them
    // concurrently, so an earlier request can end after a later one: only the response of the latest request is shown.
    const latestRequest = useRef(0);

    const fetchUsers = async () => {
        const request = ++latestRequest.current;
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams({
                page,
                size,
            });

            if (search) params.append("search", search);
            if (role) params.append("role", role);
            if (status) params.append("status", status);

            const res = await fetch(`${API_BASE}/users?${params.toString()}`);
            const data = await res.json();
            if (request !== latestRequest.current) return; // a later request was sent meanwhile

            setUsers(data.items || []);
            setTotal(data.total || 0);

        } catch (err) {
            if (request !== latestRequest.current) return;
            console.error(err);
            setError("Failed to load users.");
        } finally {
            if (request === latestRequest.current) setLoading(false);
        }
    };

    // Fetch when filters or page changes
    useEffect(() => {
        fetchUsers();
    }, [page, search, role, status]);

    // Reset filters
    const resetFilters = () => {
        setSearch("");
        setRole("");
        setStatus("");
        setPage(1);
    };

    const totalPages = Math.ceil(total / size);

    // Render
    return (
        <div className="center-page">
            <div style={styles.container}>
                {/* Back button */}
                <BackButton to="/" text="Back" />
                <h2>User List</h2>

                {/* Filters */}
                <div style={styles.filters}>
                    <input
                        id="searchInput"
                        type="text"
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }}
                        style={styles.input}
                    />

                    <select
                        id="filterRole"
                        value={role}
                        onChange={(e) => {
                            setPage(1);
                            setRole(e.target.value);
                        }}
                        style={styles.input}
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                    </select>

                    <select
                        id="filterStatus"
                        value={status}
                        onChange={(e) => {
                            setPage(1);
                            setStatus(e.target.value);
                        }}
                        style={styles.input}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                    </select>

                    <button onClick={resetFilters} style={styles.resetBtn}>
                        Reset Filters
                    </button>

                </div>

                {/* Loading overlay */}
                {loading && (
                    <div className="spinner-overlay">
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Error */}
                {error && <p style={{ color: "red" }}>{error}</p>}

                {/* Table */}
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th id="nameHeader" style={styles.th}>Name</th>
                            <th id="emailHeader" style={styles.th}>Email</th>
                            <th id="roleHeader" style={styles.th}>Role</th>
                            <th id="statusHeader" style={styles.th}>Status</th>
                            <th id="createdHeader" style={styles.th}>Created</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.length === 0 && !loading && (
                            <tr>
                                <td id="noUsersCell" colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                                    No users found.
                                </td>
                            </tr>
                        )}

                        {users.map((u) => (
                            <tr id={`userRow-${u.id}`}
                                key={u.id}
                                style={{ cursor: "default" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                            >
                                <td id="nameCell" style={styles.td}>{u.name}</td>
                                <td id="emailCell" style={styles.td}>{u.email}</td>
                                <td id="roleCell" style={styles.td}>{u.role}</td>
                                <td id="statusCell" style={styles.td}>{u.status}</td>
                                <td id="createdCell" style={styles.td}>{new Date(u.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>


                {/* Pagination */}
                <div style={styles.pagination}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        id="prevPage"
                    >
                        Prev
                    </button>

                    <span style={{ margin: "0 10px" }}>
                        Page {page} of {totalPages || 1}
                    </span>

                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                        id="nextPage"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

// Styles for the UserList component
const styles = {
    container: {
        padding: "40px",
        maxWidth: "900px",
        margin: "0 auto",
    },
    filters: {
        display: "flex",
        gap: "15px",
        marginBottom: "20px",
    },
    input: {
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
    },
    table: {
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        marginBottom: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
    },
    th: {
        background: "#f4f4f4",
        padding: "12px",
        borderBottom: "2px solid #ddd",
        textAlign: "left",
        fontWeight: "600",
        fontSize: "15px",
    },

    td: {
        padding: "12px",
        borderBottom: "1px solid #eee",
        fontSize: "14px",
    },
    rowHover: {
        backgroundColor: "#fafafa",
        cursor: "pointer",
    },
    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20px",
    },
};
