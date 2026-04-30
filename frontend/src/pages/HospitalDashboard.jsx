import { useEffect, useState } from "react";
import axios from "axios";
import "./HospitalDashboard.css";

export default function HospitalDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState("PENDING");

  const hospitalId = localStorage.getItem("hospitalId");
  const playNotification = () => {
    const audio = new Audio()
      audio.src="https://www.myinstants.com/media/sounds/alexis-texas-high-pitched-slowed-sound.mp3"
    audio.load()
    audio.play().then(()=>{
      console.log("Playback started");
      
    }).catch((error)=>{
      console.log("Playback error",error.message);
      
    })
    
  };
  useEffect(() => {
    fetchAlerts();

    // 🔁 POLLING every 3 seconds
    const interval = setInterval(() => {
      fetchAlerts();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 📡 Fetch alerts from DB
  const fetchAlerts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/hospitals/alerts/${hospitalId}`
      );
      console.log("Polled");
      setAlerts(res.data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  // 🔄 Update alert status
  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/hospitals/alerts/${id}/status`,
        { status }
      );

      // 🔥 Optimistic update
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // 🧠 Filter alerts
  const filteredAlerts = alerts.filter(
    (a) => (a.status || "PENDING") === activeTab
  );

  return (
    <div className="dashboard-container">
      <h2>🚨 Hospital Dashboard</h2>

      {/* 🔘 Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "PENDING" ? "active" : ""}
          onClick={() => setActiveTab("PENDING")}
        >
          Pending
        </button>

        <button
          className={activeTab === "ACCEPTED" ? "active" : ""}
          onClick={() => setActiveTab("ACCEPTED")}
        >
          Accepted
        </button>

        <button
          className={activeTab === "REJECTED" ? "active" : ""}
          onClick={() => setActiveTab("REJECTED")}
        >
          Rejected
        </button>
        <button onClick={playNotification}>click</button>
      </div>

      {/* 📋 Alerts */}
      {filteredAlerts.length === 0 ? (
        <p className="no-alerts">No alerts</p>
      ) : (
        filteredAlerts.map((alert) => (
          <div key={alert.id} className="alert-card">
            <div className="alert-header">
              <h3>{alert.alert_type}</h3>
            </div>

            <p>{alert.message}</p>

            <p>
              <strong>Patient:</strong> {alert.patient_name}
            </p>
            <p>
              <strong>Email:</strong> {alert.email}
            </p>
            <p>
              <strong>Location:</strong> {alert.latitude}, {alert.longitude}
            </p>
            <p>
              <strong>Status:</strong> {alert.status}
            </p>

            {/* ✅ Only for pending */}
            {alert.status === "PENDING" && (
              <div className="actions">
                <button
                  className="accept-btn"
                  onClick={() => updateStatus(alert.id, "ACCEPTED")}
                >
                  Accept
                </button>

                <button
                  className="reject-btn"
                  onClick={() => updateStatus(alert.id, "REJECTED")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
