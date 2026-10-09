import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [users, setUsers] = useState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // READ
  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to FastAPI");
    }
  };

  // CREATE / UPDATE
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name || !email) {
      setMessage("Please enter name and email");
      return;
    }

    try {
      let response;

      if (editingId === null) {
        // CREATE
        response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name,
            email: email
          })
        });
      } else {
        // UPDATE
        response = await fetch(`${API_URL}/users/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name,
            email: email
          })
        });
      }

      const data = await response.json();

      setMessage(data.message);

      setName("");
      setEmail("");
      setEditingId(null);

      loadUsers();

    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  // EDIT
  const editUser = (user) => {
    setName(user.name);
    setEmail(user.email);
    setEditingId(user.id);
    setMessage("");
  };

  // DELETE
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      setMessage(data.message);

      loadUsers();

    } catch (error) {
      console.error(error);
      setMessage("Delete failed");
    }
  };

  // CANCEL
  const cancelEdit = () => {
    setName("");
    setEmail("");
    setEditingId(null);
    setMessage("");
  };

  // Load users when page starts
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="container">

      <h1>User CRUD Application</h1>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="user-form">

        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button type="submit">
          {editingId === null ? "Add User" : "Update User"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            onClick={cancelEdit}
            className="cancel-button"
          >
            Cancel
          </button>
        )}

      </form>

      <h2>Users</h2>

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

          {users.length === 0 ? (
            <tr>
              <td colSpan="4">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>

                <td>{user.id}</td>

                <td>{user.name}</td>

                <td>{user.email}</td>

                <td>

                  <button
                    onClick={() => editUser(user)}
                    className="edit-button"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteUser(user.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}

export default App;