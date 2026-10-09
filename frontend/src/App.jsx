
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // READ: Get users from backend
  async function loadUsers() {
    try {
      const response = await fetch(`${API_URL}/users`);

      if (!response.ok) {
        throw new Error("Could not load users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to backend. Check FastAPI.");
    } finally {
      setLoading(false);
    }
  }

  // CREATE / UPDATE
  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      setMessage("Please enter name and email.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const isEditing = editingId !== null;
      const url = isEditing
        ? `${API_URL}/users/${editingId}`
        : `${API_URL}/users`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Operation failed");
      }

      setMessage(data.message || "Operation successful");
      setName("");
      setEmail("");
      setEditingId(null);

      await loadUsers();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // EDIT
  function editUser(user) {
    setName(user.name);
    setEmail(user.email);
    setEditingId(user.id);
    setMessage("");
  }

  // DELETE
  async function deleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Delete failed");
      }

      setMessage(data.message);
      await loadUsers();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Delete failed");
    }
  }

  // CANCEL EDIT
  function cancelEdit() {
    setName("");
    setEmail("");
    setEditingId(null);
    setMessage("");
  }

  // Load data when page opens
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <main className="container">
      <header className="page-header">
        <p className="eyebrow">MANAGEMENT SYSTEM</p>
        <h1>User CRUD Application</h1>
        <p className="subtitle">
          Create, view, update and delete users.
        </p>
      </header>

      {message && (
        <div className="message" role="status">
          {message}
          <button
            type="button"
            className="message-close"
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      <section className="form-card">
        <h2>{editingId === null ? "Add New User" : "Edit User"}</h2>

        <form onSubmit={handleSubmit} className="user-form">
          <label>
            Name
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Please wait..."
                : editingId === null
                  ? "Add User"
                  : "Update User"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="cancel-button"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="users-card">
        <div className="users-heading">
          <div>
            <h2>Users</h2>
            <p>All registered users</p>
          </div>
          <span className="user-count">{users.length} users</span>
        </div>

        {loading ? (
          <p className="empty-state">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="empty-state">No users found. Add your first user!</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => editUser(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;