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
  const baseUrl=import.meta.env.VITE_API_URL;
  // 🔌 SOCKET
  useEffect(() => {
    socketRef.current = io(baseUrl);

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

  // 🚀 OPTIMIZED SIMULATION LOOP - NO ANOMALIES
  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);

        setVitals(prev => {
          const profile = workoutProfiles[workout];
          let { hr, spo2, fatigue } = prev;

          // ❤️ HEART RATE CALCULATION - Phase-aware with realistic recovery
          if (isEmergency) {
            // Emergency override
            hr = 0;
          } else {
            // Base target HR from workout profile and intensity
            let targetHr = profile.baseHr + (intensity * 0.5);
            
            // Phase-specific HR adjustments
            if (phase === "Warm-up") {
              targetHr = 75 + (intensity * 0.3); // Gradual increase from resting
            } else if (phase === "Active") {
              targetHr = profile.baseHr + (intensity * 0.5);
            } else if (phase === "Peak") {
              targetHr = profile.baseHr + (intensity * 0.7); // Higher at peak
            } else if (phase === "Cooldown") {
              // Realistic cooldown: HR gradually returns to resting (75 BPM)
              // Target is always resting HR during cooldown
              targetHr = 75;
            }
            
            // Scenario overrides (except during cooldown)
            if (scenario === "HR Spike" && phase !== "Cooldown") {
              targetHr = Math.max(targetHr, 185 + (intensity * 0.1));
            }
            
            // Smooth transition to target with phase-specific speeds
            let transitionSpeed = 0.15; // Default
            
            if (phase === "Cooldown") {
              // Slower HR recovery during cooldown (realistic)
              // Speed increases as HR gets closer to resting
              const hrAboveResting = Math.max(0, hr - 75);
              transitionSpeed = 0.03 + (hrAboveResting / 1000); // Adaptive speed
            } else if (phase === "Peak") {
              transitionSpeed = 0.20; // Faster response at peak
            }
            
            const hrDelta = (targetHr - hr) * transitionSpeed;
            hr = hr + hrDelta;
            
            // Clamp HR to realistic bounds
            hr = Math.max(60, Math.min(200, hr));
          }

          // 💧 SPO2 CALCULATION - Realistic oxygen levels
          let targetSpo2 = 99;
          
          if (phase === "Warm-up") {
            targetSpo2 = 98 - (intensity * 0.02);
          } else if (phase === "Active") {
            targetSpo2 = 97 - (intensity * 0.04) - (profile.spo2Dip * 0.1);
          } else if (phase === "Peak") {
            targetSpo2 = 96 - (intensity * 0.06) - (profile.spo2Dip * 0.15);
          } else if (phase === "Cooldown") {
            targetSpo2 = 98 - (intensity * 0.01); // Recovery
          }
          
          // Scenario effects
          if (scenario === "Oxygen Drop") {
            targetSpo2 = Math.max(88, targetSpo2 - 6);
          }
          
          // Smooth transition
          const spo2Delta = (targetSpo2 - spo2) * 0.08;
          spo2 = spo2 + spo2Delta;
          spo2 = Math.max(88, Math.min(99, spo2));

          // 💪 FATIGUE CALCULATION - Rational and phase-aware
          const intensityFactor = intensity / 100;
          
          // Phase-specific fatigue behavior
          let phaseFactor;
          let isRecovery = false;
          
          if (phase === "Warm-up") {
            phaseFactor = 0.4; // Light accumulation
          } else if (phase === "Active") {
            phaseFactor = 1.3; // Moderate accumulation
          } else if (phase === "Peak") {
            phaseFactor = 2.8; // High accumulation
          } else if (phase === "Cooldown") {
            phaseFactor = -1.2; // Active recovery (faster cooldown)
            isRecovery = true;
          } else {
            phaseFactor = 1.0;
          }

          // Scenario multipliers
          const scenarioMultiplier = {
            "Normal": 1.0,
            "HR Spike": 1.3,
            "Oxygen Drop": 1.5,
            "Overtraining": 2.0
          }[scenario] || 1.0;

          // Base rate - tuned for realistic progression
          const baseRate = 0.9;

          // Calculate fatigue increments
          let cardioIncrement, muscleIncrement, legIncrement;
          
          if (isRecovery) {
            // During cooldown: recovery rate based on current fatigue level
            // Higher fatigue = faster initial recovery (realistic)
            const recoveryBoost = 1 + (fatigue.cardio / 200); // Up to 1.5x boost
            cardioIncrement = phaseFactor * baseRate * recoveryBoost;
            
            const muscleRecoveryBoost = 1 + (fatigue.muscle / 200);
            muscleIncrement = phaseFactor * baseRate * muscleRecoveryBoost;
            
            const legRecoveryBoost = 1 + (fatigue.leg / 200);
            legIncrement = phaseFactor * baseRate * legRecoveryBoost;
          } else {
            // During exercise: accumulation based on workout profile
            cardioIncrement = profile.cardioStress * intensityFactor * phaseFactor * scenarioMultiplier * baseRate;
            muscleIncrement = profile.muscleStress * intensityFactor * phaseFactor * scenarioMultiplier * baseRate;
            legIncrement = profile.legStress * intensityFactor * phaseFactor * scenarioMultiplier * baseRate;
          }

          // Apply increments
          let newCardio = fatigue.cardio + cardioIncrement;
          let newMuscle = fatigue.muscle + muscleIncrement;
          let newLeg = fatigue.leg + legIncrement;

          // Clamp and round to 1 decimal place
          newCardio = parseFloat(Math.min(100, Math.max(0, newCardio)).toFixed(1));
          newMuscle = parseFloat(Math.min(100, Math.max(0, newMuscle)).toFixed(1));
          newLeg = parseFloat(Math.min(100, Math.max(0, newLeg)).toFixed(1));
          
          // Overall is weighted average
          const newOverall = parseFloat(((newCardio + newMuscle + newLeg) / 3).toFixed(1));

          const newFatigue = {
            overall: newOverall,
            cardio: newCardio,
            muscle: newMuscle,
            leg: newLeg
          };

          const newVitals = {
            hr: Math.round(hr),
            spo2: parseFloat(spo2.toFixed(1)),
            fatigue: newFatigue
          };

          // 📊 Smart logging - only log significant changes
          const fatigueChange = newFatigue.overall - prev.fatigue.overall;
          
          // Fatigue milestones (accumulation)
          if (fatigueChange > 0) {
            if (newFatigue.overall >= 25 && prev.fatigue.overall < 25) {
              addLog("Fatigue: Light exertion detected", "info");
            } else if (newFatigue.overall >= 50 && prev.fatigue.overall < 50) {
              addLog("Fatigue: Moderate fatigue accumulating", "warning");
            } else if (newFatigue.overall >= 75 && prev.fatigue.overall < 75) {
              addLog("Fatigue: High exhaustion levels!", "danger");
            } else if (newFatigue.overall >= 90 && prev.fatigue.overall < 90) {
              addLog("Fatigue: CRITICAL - Consider stopping!", "danger");
            }
          }
          
          // Recovery milestones (cooldown)
          if (fatigueChange < -0.5 && sendCounterRef.current % 8 === 0) {
            if (newFatigue.overall < 25 && prev.fatigue.overall >= 25) {
              addLog("Recovery: Fatigue minimal, feeling fresh!", "success");
            } else if (newFatigue.overall < 50 && prev.fatigue.overall >= 50) {
              addLog("Recovery: Moderate recovery achieved", "success");
            } else {
              addLog("Recovery: Fatigue levels decreasing", "success");
            }
          }

          sendCounterRef.current++;

          // Socket emission
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

          // Update history
          setHistory(h => [
            ...h,
            {
              time: new Date().toLocaleTimeString(),
              hr: newVitals.hr,
              spo2: newVitals.spo2,
              overall: newVitals.fatigue.overall,
              cardio: newVitals.fatigue.cardio,
              muscle: newVitals.fatigue.muscle,
              leg: newVitals.fatigue.leg
            }
          ].slice(-60));

          return newVitals;
        });

      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, workout, phase, scenario, intensity, location, isEmergency]);

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