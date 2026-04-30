import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true); // Added a loading state

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await axios.get("http://localhost:5000/admin/users");
      const hospitalsRes = await axios.get("http://localhost:5000/admin/hospitals");
      setUsers(usersRes.data.data || []);
      setHospitals(hospitalsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await axios.delete(`http://localhost:5000/admin/user/${id}`);
      fetchData();
    }
  };

  const deleteHospital = async (id) => {
    if (window.confirm("Are you sure you want to delete this hospital?")) {
      await axios.delete(`http://localhost:5000/admin/hospital/${id}`);
      fetchData();
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin <span>Control Center</span></h1>
        <div className="stats-bar">
          <div className="stat-item"><strong>{users.length}</strong> Users</div>
          <div className="stat-item"><strong>{hospitals.length}</strong> Hospitals</div>
        </div>
      </header>

      {/* User Management Section */}
      <section className="management-section">
        <div className="section-header">
          <h2>👤 User Management</h2>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name">{u.name}</td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Actions">
                    <button className="delete-btn" onClick={() => deleteUser(u.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Hospital Management Section */}
      <section className="management-section">
        <div className="section-header">
          <h2>🏥 Hospital Management</h2>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Hospital Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.length > 0 ? (
              hospitals.map((h) => (
                <tr key={h.id}>
                  <td data-label="Hospital Name">{h.name}</td>
                  <td data-label="Email">{h.email}</td>
                  <td data-label="Actions">
                    <button className="delete-btn" onClick={() => deleteHospital(h.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">No hospitals registered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}