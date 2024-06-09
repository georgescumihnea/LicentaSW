import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useDispatch } from "react-redux";
import { useAuth } from "./components/AuthContext";
import { showNotification } from "./components/headerSlice";

Modal.setAppElement("#root");

function Dashboard() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    isAdmin: false,
  });
  const [newClient, setNewClient] = useState({ name: "", description: "" });
  const [associate, setAssociate] = useState({ userId: "", clientId: "" });
  const [editData, setEditData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchClients();
    fetchAssociations();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/users", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Error fetching users. Please try again.");
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("http://localhost:5000/clients", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setErrorMessage("Error fetching clients. Please try again.");
    }
  };

  const fetchAssociations = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/user_clients", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch associations");
      }

      const data = await response.json();
      setAssociations(data);
    } catch (error) {
      console.error("Error fetching associations:", error);
      setErrorMessage("Error fetching associations. Please try again.");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) {
      setErrorMessage("Username and password are required.");
      return;
    }
    try {
      const userToAdd = {
        username: newUser.username,
        password: newUser.password,
        is_admin: newUser.isAdmin,
      };

      const response = await fetch("http://localhost:5000/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(userToAdd),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add user");
      }

      fetchUsers();
      dispatch(
        showNotification({ message: "User added successfully", status: 1 }),
      );
      setNewUser({ username: "", password: "", isAdmin: false });
      setErrorMessage("");
      setSuccessMessage("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      setErrorMessage(error.message);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.description) {
      setErrorMessage("Client name and description are required.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/admin/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add client");
      }

      fetchClients();
      dispatch(
        showNotification({ message: "Client added successfully", status: 1 }),
      );
      setNewClient({ name: "", description: "" });
      setErrorMessage("");
      setSuccessMessage("Client added successfully");
    } catch (error) {
      console.error("Error adding client:", error);
      setErrorMessage(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/admin/users?id=${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      fetchUsers();
      dispatch(
        showNotification({ message: "User deleted successfully", status: 1 }),
      );
      setErrorMessage("");
      setSuccessMessage("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      setErrorMessage(error.message);
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/admin/clients?id=${clientId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete client");
      }

      fetchClients();
      dispatch(
        showNotification({ message: "Client deleted successfully", status: 1 }),
      );
      setErrorMessage("");
      setSuccessMessage("Client deleted successfully");
    } catch (error) {
      console.error("Error deleting client:", error);
      setErrorMessage(error.message);
    }
  };

  const handleDeleteAssociation = async (userId, clientId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/admin/user_clients?user_id=${userId}&client_id=${clientId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete association");
      }

      fetchAssociations();
      dispatch(
        showNotification({
          message: "Association deleted successfully",
          status: 1,
        }),
      );
      setErrorMessage("");
      setSuccessMessage("Association deleted successfully");
    } catch (error) {
      console.error("Error deleting association:", error);
      setErrorMessage(error.message);
    }
  };

  const handleAssociateClient = async () => {
    if (!associate.userId || !associate.clientId) {
      setErrorMessage("Both user and client must be selected.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/admin/user_clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          user_id: associate.userId,
          client_id: associate.clientId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to associate client");
      }

      fetchAssociations();
      dispatch(
        showNotification({
          message: "Client associated with employee successfully",
          status: 1,
        }),
      );
      setAssociate({ userId: "", clientId: "" });
      setErrorMessage("");
      setSuccessMessage("Client associated with employee successfully");
    } catch (error) {
      console.error("Error associating client:", error);
      setErrorMessage(error.message);
    }
  };

  const handleUpdateUser = async (userId, username, isAdmin) => {
    try {
      const response = await fetch("http://localhost:5000/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ id: userId, username, is_admin: isAdmin }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      fetchUsers();
      dispatch(
        showNotification({ message: "User updated successfully", status: 1 }),
      );
      setEditData(null);
      setErrorMessage("");
      setSuccessMessage("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage(error.message);
    }
  };

  const handleUpdateClient = async (clientId, name, description) => {
    try {
      const response = await fetch("http://localhost:5000/admin/clients", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ id: clientId, name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update client");
      }

      fetchClients();
      dispatch(
        showNotification({ message: "Client updated successfully", status: 1 }),
      );
      setEditData(null);
      setErrorMessage("");
      setSuccessMessage("Client updated successfully");
    } catch (error) {
      console.error("Error updating client:", error);
      setErrorMessage(error.message);
    }
  };

  const handleUpdateAssociation = async (
    oldUserId,
    oldClientId,
    userId,
    clientId,
  ) => {
    try {
      const response = await fetch("http://localhost:5000/admin/user_clients", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          old_user_id: oldUserId,
          old_client_id: oldClientId,
          user_id: userId,
          client_id: clientId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update association");
      }

      fetchAssociations();
      dispatch(
        showNotification({
          message: "Association updated successfully",
          status: 1,
        }),
      );
      setEditData(null);
      setErrorMessage("");
      setSuccessMessage("Association updated successfully");
    } catch (error) {
      console.error("Error updating association:", error);
      setErrorMessage(error.message);
    }
  };

  const openEditModal = (type, data) => {
    setEditData({ type, data });
  };

  const closeModal = () => {
    setEditData(null);
  };

  const renderEditModal = () => {
    if (!editData) return null;

    const { type, data } = editData;

    return (
      <Modal
        isOpen={true}
        onRequestClose={closeModal}
        className="mx-auto my-auto max-w-6xl rounded bg-white p-6 shadow-lg"
      >
        <h2 className="mb-4 text-2xl font-semibold">Edit {type}</h2>
        {type === "User" && (
          <>
            <input
              type="text"
              value={data.username}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  data: { ...data, username: e.target.value },
                })
              }
              placeholder="Username"
              className="input input-bordered mb-4 w-full"
            />
            <label className="mb-4 inline-flex items-center">
              <input
                type="checkbox"
                checked={data.isAdmin}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    data: { ...data, isAdmin: e.target.checked },
                  })
                }
                className="checkbox"
              />
              <span className="ml-2">Admin</span>
            </label>
            <button
              className="btn w-full bg-blue-400 text-white"
              onClick={() =>
                handleUpdateUser(data.id, data.username, data.isAdmin)
              }
            >
              Update User
            </button>
          </>
        )}
        {type === "Client" && (
          <>
            <input
              type="text"
              value={data.name}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  data: { ...data, name: e.target.value },
                })
              }
              placeholder="Client Name"
              className="input input-bordered mb-4 w-full"
            />
            <input
              type="text"
              value={data.description}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  data: { ...data, description: e.target.value },
                })
              }
              placeholder="Client Description"
              className="input input-bordered mb-4 w-full"
            />
            <button
              className="btn w-full bg-blue-400 text-white"
              onClick={() =>
                handleUpdateClient(data.id, data.name, data.description)
              }
            >
              Update Client
            </button>
          </>
        )}
        {type === "Association" && (
          <>
            <select
              value={data.userId}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  data: { ...data, userId: e.target.value },
                })
              }
              className="input input-bordered mb-4 w-full"
            >
              {users.map((user) => (
                <option key={user[0]} value={user[0]}>
                  {user[1]}
                </option>
              ))}
            </select>
            <select
              value={data.clientId}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  data: { ...data, clientId: e.target.value },
                })
              }
              className="input input-bordered mb-4 w-full"
            >
              {clients.map((client) => (
                <option key={client[0]} value={client[0]}>
                  {client[1]}
                </option>
              ))}
            </select>
            <button
              className="btn w-full bg-blue-400 text-white"
              onClick={() =>
                handleUpdateAssociation(
                  data.oldUserId,
                  data.oldClientId,
                  data.userId,
                  data.clientId,
                )
              }
            >
              Update Association
            </button>
          </>
        )}
        <button className="btn btn-outline mt-4 w-full" onClick={closeModal}>
          Close
        </button>
      </Modal>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-3xl font-bold">Admin Dashboard</h1>
      {errorMessage && <div className="mb-4 text-red-500">{errorMessage}</div>}
      {successMessage && (
        <div className="mb-4 text-green-500">{successMessage}</div>
      )}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">Manage Users</h2>
        <div className="mb-4">
          <input
            type="text"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            placeholder="Username"
            className="input input-bordered mr-2"
          />
          <input
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            placeholder="Password"
            className="input input-bordered mr-2"
          />
          <label className="mr-2 inline-flex items-center">
            <input
              type="checkbox"
              checked={newUser.isAdmin}
              onChange={(e) =>
                setNewUser({ ...newUser, isAdmin: e.target.checked })
              }
              className="checkbox"
            />
            <span className="ml-2">Admin</span>
          </label>
          <button
            onClick={handleAddUser}
            className="btn bg-blue-400 text-white"
          >
            Add User
          </button>
        </div>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user[0]}>
                <td>{user[1]}</td>
                <td>{user[2] ? "Admin" : "User"}</td>
                <td>
                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      openEditModal("User", {
                        id: user[0],
                        username: user[1],
                        isAdmin: user[2],
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline ml-2"
                    onClick={() => handleDeleteUser(user[0])}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">Manage Clients</h2>
        <div className="mb-4">
          <input
            type="text"
            value={newClient.name}
            onChange={(e) =>
              setNewClient({ ...newClient, name: e.target.value })
            }
            placeholder="Client Name"
            className="input input-bordered mr-2"
          />
          <input
            type="text"
            value={newClient.description}
            onChange={(e) =>
              setNewClient({ ...newClient, description: e.target.value })
            }
            placeholder="Client Description"
            className="input input-bordered mr-2"
          />
          <button
            onClick={handleAddClient}
            className="btn bg-blue-400 text-white"
          >
            Add Client
          </button>
        </div>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client[0]}>
                <td>{client[1]}</td>
                <td>{client[2]}</td>
                <td>
                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      openEditModal("Client", {
                        id: client[0],
                        name: client[1],
                        description: client[2],
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline ml-2"
                    onClick={() => handleDeleteClient(client[0])}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          Associate Clients with Employees
        </h2>
        <div className="mb-4 flex items-center">
          <select
            value={associate.userId}
            onChange={(e) =>
              setAssociate({ ...associate, userId: e.target.value })
            }
            className="input input-bordered mr-2"
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user[0]} value={user[0]}>
                {user[1]}
              </option>
            ))}
          </select>
          <select
            value={associate.clientId}
            onChange={(e) =>
              setAssociate({ ...associate, clientId: e.target.value })
            }
            className="input input-bordered mr-2"
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client[0]} value={client[0]}>
                {client[1]}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssociateClient}
            className="btn bg-blue-400 text-white"
          >
            Associate
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          Client-Employee Associations
        </h2>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th>Username</th>
              <th>Client Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {associations.map((association) => (
              <tr key={`${association.user_id}-${association.client_id}`}>
                <td>{association.username}</td>
                <td>{association.client_name}</td>
                <td>
                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      openEditModal("Association", {
                        oldUserId: association.user_id,
                        oldClientId: association.client_id,
                        userId: association.user_id,
                        clientId: association.client_id,
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline ml-2"
                    onClick={() =>
                      handleDeleteAssociation(
                        association.user_id,
                        association.client_id,
                      )
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderEditModal()}
    </div>
  );
}

export default Dashboard;
