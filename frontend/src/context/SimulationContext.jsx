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

  const prevStatusRef = useRef("success");
  const socketRef = useRef(null);
  const sendCounterRef = useRef(0);

  // 🔌 SOCKET CONNECTION
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to backend");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const addLog = (message, type = "info") => {
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    setLogs(prev => [{ time, message, type }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    addLog(isRunning ? "System simulation initialized." : "System simulation halted.", "info");
  }, [isRunning]);

  useEffect(() => {
    addLog(`Phase shifted to: ${phase}`, "info");
  }, [phase]);

  useEffect(() => {
    if (scenario !== "Normal") addLog(`ANOMALY INJECTED: ${scenario}`, "danger");
    else addLog("Scenario normalized.", "success");
  }, [scenario]);

  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);

        setVitals(prev => {
          const profile = workoutProfiles[workout];
          let { hr, spo2, fatigue } = prev;

          let phaseMult =
            phase === "Warm-up" ? 0.8 :
            phase === "Active" ? 1.0 :
            phase === "Peak" ? 1.3 : 0.6;

          let targetHr = (profile.baseHr * phaseMult) + (intensity * 0.45);

          if (scenario === "HR Spike") targetHr = 195;
          if (scenario === "Irregular HR") targetHr += (Math.random() > 0.5 ? 45 : -45);

          hr += (targetHr - hr) * 0.12;
          hr += (Math.random() * 3 - 1.5);

          let exertionDip = profile.spo2Dip * (intensity / 100) * phaseMult;

          if (hr > 165) exertionDip += (hr - 165) * 0.1;

          let targetSpo2 = 99.0 - exertionDip;

          if (scenario === "Oxygen Drop") targetSpo2 = 84.0;

          let breathRate = workout === "Swimming" ? 3 : 1.5;
          let breathingVariance = Math.sin(elapsedTime / breathRate) * (workout === "Swimming" ? 1.2 : 0.4);

          spo2 += (targetSpo2 + breathingVariance - spo2) * 0.2;
          spo2 = Math.max(70, Math.min(100, spo2));

          let hrStrain = Math.max(0, (hr - 80) / (200 - 80));
          let baseFatigueRate = Math.pow(hrStrain, 2) * 1.5;

          if (scenario === "Overtraining") baseFatigueRate *= 2.5;

          let isRecovering = phase === "Cooldown" || hr < 100;

          if (isRecovering) baseFatigueRate = -0.8;

          let recoveryPenalty = isRecovering ? 0.33 : 1;

          let newCardio = Math.max(0, Math.min(100, fatigue.cardio + baseFatigueRate * profile.cardioStress));
          let newMuscle = Math.max(0, Math.min(100, fatigue.muscle + baseFatigueRate * profile.muscleStress * recoveryPenalty));
          let newLeg = Math.max(0, Math.min(100, fatigue.leg + baseFatigueRate * profile.legStress * recoveryPenalty));

          let newOverall = (newCardio * 0.3) + (newMuscle * 0.45) + (newLeg * 0.25);

          let currentStatus = "success";

          if (hr > 185 || spo2 < 90 || newOverall > 90) currentStatus = "danger";
          else if (hr > 165 || spo2 < 94 || newOverall > 70) currentStatus = "warning";

          if (currentStatus !== prevStatusRef.current) {
            if (currentStatus === "danger") addLog("CRITICAL RISK detected", "danger");
            else if (currentStatus === "warning") addLog("HIGH STRAIN detected", "warning");
            else addLog("Vitals stabilized", "success");

            prevStatusRef.current = currentStatus;
          }

          const newVitals = {
            hr: Math.round(hr),
            spo2: Number(spo2.toFixed(1)),
            fatigue: {
              overall: Number(newOverall.toFixed(1)),
              cardio: Number(newCardio.toFixed(1)),
              muscle: Number(newMuscle.toFixed(1)),
              leg: Number(newLeg.toFixed(1))
            }
          };

          // 📡 SEND DATA EVERY 5 SECONDS
          sendCounterRef.current++;

          if (sendCounterRef.current % 5 === 0 && socketRef.current) {
            const userId = localStorage.getItem("userId");

            const payload = {
              userId: Number(userId) || 1,
              heartRate: newVitals.hr,
              spo2: newVitals.spo2,
              lat: 18.52,
              lng: 73.85
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
  }, [isRunning, workout, phase, scenario, intensity, elapsedTime]);

  useEffect(() => {
    if (!isRunning) {
      sendCounterRef.current = 0;
    }
  }, [isRunning]);

  const resetSimulation = () => {
    setIsRunning(false);
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
      resetSimulation
    }}>
      {children}
    </SimulationContext.Provider>
  );
};