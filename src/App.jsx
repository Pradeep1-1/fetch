import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://jsonplaceholder.typicode.com/users";
const avatarColors = [
  ["#e9edff", "#5d70dc"], ["#e7f7f1", "#399b79"], ["#fff1e6", "#d98243"],
  ["#f5eaff", "#9564c5"], ["#e5f4fb", "#3889ad"], ["#fff0f2", "#d66c83"],
];

function initials(name) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function UserAvatar({ name, index }) {
  const [background, color] = avatarColors[index % avatarColors.length];
  return (
    <span className="avatar" style={{ "--avatar-bg": background, "--avatar-color": color }}>
      {initials(name)}
    </span>
  );
}

function UserTable({ users }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Website</th></tr></thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td className="id">{String(user.id).padStart(2, "0")}</td>
              <td><div className="person"><UserAvatar name={user.name} index={index} />{user.name}</div></td>
              <td className="username">@{user.username}</td>
              <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
              <td className="phone">{user.phone}</td>
              <td><a href={`https://${user.website}`} target="_blank" rel="noreferrer">{user.website}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserCards({ users }) {
  return (
    <div className="cards">
      {users.map((user, index) => (
        <article className="user-card" key={user.id}>
          <div className="card-head">
            <UserAvatar name={user.name} index={index} />
            <div><div className="card-name">{user.name}</div><div className="card-user">@{user.username}</div></div>
            <span className="card-id">#{String(user.id).padStart(2, "0")}</span>
          </div>
          <div className="card-details">
            <div className="detail"><span className="detail-label">Email</span><a href={`mailto:${user.email}`}>{user.email}</a></div>
            <div className="detail"><span className="detail-label">Phone</span><span className="phone">{user.phone}</span></div>
            <div className="detail"><span className="detail-label">Website</span><a href={`https://${user.website}`} target="_blank" rel="noreferrer">{user.website}</a></div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        setUsers(await response.json());
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError("We couldn't load the directory. Check your connection and try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchUsers();
    return () => controller.abort();
  }, [refreshKey]);

  const filteredUsers = users.filter((user) =>
    [user.name, user.username, user.email, user.phone, user.website]
      .some((value) => value.toLowerCase().includes(query.trim().toLowerCase()))
  );

  return (
    <main className="shell">
      <header className="topline">
        <div className="brand"><span className="brand-mark" aria-hidden="true">♧</span>Peopleboard</div>
        <span className="eyebrow">Workspace directory</span>
      </header>
      <section className="intro">
        <div><div className="eyebrow">Your people, at a glance</div><h1>People directory</h1><p className="subtitle">Browse and find the people in your workspace.</p></div>
        <button className="refresh" type="button" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}>
          ↻ {loading ? "Loading people…" : "Refresh list"}
        </button>
      </section>
      <section aria-label="People">
        <div className="summary">
          <div className="count"><span className="live-dot" /><strong>{loading ? "—" : filteredUsers.length}</strong> {query ? "matching people" : "people in directory"}</div>
          <label className="search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people…" aria-label="Search people" /></label>
        </div>
        <div className="panel">
          {loading ? (
            <div className="state" role="status"><div><div className="spinner" /><h2>Finding your people</h2><p>Loading the workspace directory…</p></div></div>
          ) : error ? (
            <div className="state" role="alert"><div><div className="state-icon">!</div><h2>Something went wrong</h2><p>{error}</p><button className="refresh" onClick={() => setRefreshKey((key) => key + 1)}>Try again</button></div></div>
          ) : filteredUsers.length === 0 ? (
            <div className="state"><div><div className="state-icon">⌕</div><h2>No people found</h2><p>Try a different name, email, or username.</p></div></div>
          ) : (
            <><UserTable users={filteredUsers} /><UserCards users={filteredUsers} /><div className="footer"><span>Showing {filteredUsers.length} of {users.length} people</span><span className="status">Directory up to date</span></div></>
          )}
        </div>
      </section>
    </main>
  );
}
