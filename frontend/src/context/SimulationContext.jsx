import React, { createContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const SimulationContext = createContext();

const workoutProfiles = {
  Running: { baseHr: 130, cardioStress: 1.8, muscleStress: 0.3, legStress: 1.6, spo2Dip: 2.5 },
  Cycling: { baseHr: 125, cardioStress: 1.4, muscleStress: 0.2, legStress: 2.2, spo2Dip: 1.0 },
  Swimming: { baseHr: 135, cardioStress: 1.9, muscleStress: 1.0, legStress: 0.6, spo2Dip: 6.0 },
  Gym: { baseHr: 110, cardioStress: 0.6, muscleStress: 2.5, legStress: 0.8, spo2Dip: 0.5 },
  Calisthenics: { baseHr: 120, cardioStress: 1.2, muscleStress: 1.9, legStress: 1.0, spo2Dip: 1.5 }
};

export const SimulationProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false); // ✅ NEW

  const [workout, setWorkout] = useState("Running");
  const [phase, setPhase] = useState("Warm-up");
  const [scenario, setScenario] = useState("Normal");
  const [intensity, setIntensity] = useState(50);

  const [vitals, setVitals] = useState({
    hr: 75,
    spo2: 98.0,
    fatigue: { overall: 0, cardio: 0, muscle: 0, leg: 0 }
  });

  const [history, setHistory] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logs, setLogs] = useState([]);
  const [location, setLocation] = useState(null);

  const prevStatusRef = useRef("success");
  const socketRef = useRef(null);
  const sendCounterRef = useRef(0);
  const locationWatchId = useRef(null);

  // 🔌 SOCKET
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to backend");
    });

    return () => socketRef.current.disconnect();
  }, []);

  // 📍 LOCATION
  useEffect(() => {
    if (!navigator.geolocation) return;

    locationWatchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.log("Location error:", error.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (locationWatchId.current) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, []);

  const addLog = (message, type = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, message, type }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    addLog(isRunning ? "System simulation started." : "Simulation stopped.");
  }, [isRunning]);

  // 🚀 SIMULATION LOOP
  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);

        setVitals(prev => {
          const profile = workoutProfiles[workout];
          let { hr, spo2, fatigue } = prev;

          // 🚨 EMERGENCY OVERRIDE
          if (isEmergency) {
            hr = 0;
          } else {
            let targetHr = profile.baseHr + intensity * 0.4;
            if (scenario === "HR Spike") targetHr = 195;
            hr += (targetHr - hr) * 0.1;
          }

          spo2 = Math.max(90, 99 - intensity * 0.05);

          const newVitals = {
            ...prev,
            hr: Math.round(hr),
            spo2,
          };

          sendCounterRef.current++;

          if (sendCounterRef.current % 5 === 0 && socketRef.current) {
            const userId = localStorage.getItem("userId");

            const payload = {
              userId: Number(userId) || 1,
              heartRate: newVitals.hr,
              spo2: newVitals.spo2,
              lat: location?.lat || null,
              lng: location?.lng || null,
            };

            console.log("📡 Sending vitals:", payload);
            socketRef.current.emit("vitals", payload);
          }

          setHistory(h => [
            ...h,
            {
              time: new Date().toLocaleTimeString(),
              ...newVitals,
              ...newVitals.fatigue
            }
          ].slice(-60));

          return newVitals;
        });

      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, workout, scenario, intensity, location, isEmergency]); // ✅ added dependency

  useEffect(() => {
    if (!isRunning) sendCounterRef.current = 0;
  }, [isRunning]);

  const toggleEmergency = () => {
    setIsEmergency(prev => !prev);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setIsEmergency(false); // ✅ reset
    setElapsedTime(0);
    setVitals({
      hr: 75,
      spo2: 98.0,
      fatigue: { overall: 0, cardio: 0, muscle: 0, leg: 0 }
    });
    setHistory([]);
    setLogs([]);
    prevStatusRef.current = "success";
  };

  return (
    <SimulationContext.Provider value={{
      isRunning, setIsRunning,
      workout, setWorkout,
      phase, setPhase,
      scenario, setScenario,
      intensity, setIntensity,
      vitals, history,
      elapsedTime, logs,
      resetSimulation,
      toggleEmergency,
      isEmergency
    }}>
      {children}
    </SimulationContext.Provider>
  );
};