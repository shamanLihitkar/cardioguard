import { useContext } from "react";
import { SimulationContext } from "../context/SimulationContext";
import {
  Play,
  Square,
  RotateCcw,
  Bike,
  Waves,
  Dumbbell,
  Footprints,
  Flame,
  Thermometer,
  BatteryWarning,
  HeartCrack,
  Cpu,
  CheckCircle,
} from "lucide-react";
import VitalsPod from "../components/VitalsPod";
import "./SimulationPage.css";

export default function SimulationPage() {
  const {
    isRunning,
    setIsRunning,
    workout,
    setWorkout,
    phase,
    setPhase,
    scenario,
    setScenario,
    intensity,
    setIntensity,
    resetSimulation,
    vitals,
    isEmergency,
    toggleEmergency
  } = useContext(SimulationContext);

  const workouts = [
    { name: "Running", icon: <Footprints size={18} /> },
    { name: "Cycling", icon: <Bike size={18} /> },
    { name: "Swimming", icon: <Waves size={18} /> },
    { name: "Gym", icon: <Dumbbell size={18} /> },
    { name: "Calisthenics", icon: <Flame size={18} /> },
  ];

  const phases = ["Warm-up", "Active", "Peak", "Cooldown"];

  const scenarios = [
    { name: "Normal", icon: <CheckCircle size={18} /> },
    { name: "HR Spike", icon: <HeartCrack size={18} /> },
    { name: "Oxygen Drop", icon: <Thermometer size={18} /> },
    { name: "Overtraining", icon: <BatteryWarning size={18} /> },
  ];

  const intensityLevels = [
    { label: "Low", val: 25 },
    { label: "Medium", val: 50 },
    { label: "High", val: 75 },
    { label: "Max", val: 100 },
  ];

  const fillPercentage = ((intensity - 10) / 90) * 100;

  return (
    <div className="page-container hide-scrollbar">
      <div className="grid-layout sim-grid">
        
        {/* LEFT PANEL */}
        <div className="card control-panel">
          
          {/* Workout */}
          <div>
            <h3 className="retro-heading control-header">Workout Profile</h3>
            <div className="button-grid">
              {workouts.map((w) => (
                <button
                  key={w.name}
                  className={`btn ${workout === w.name ? "active" : ""}`}
                  onClick={() => setWorkout(w.name)}
                >
                  {w.icon} {w.name}
                </button>
              ))}
            </div>
          </div>

          {/* Phase */}
          <div>
            <h3 className="retro-heading control-header">Simulation Phase</h3>
            <div className="button-flex">
              {phases.map((p) => (
                <button
                  key={p}
                  className={`btn ${phase === p ? "active" : ""}`}
                  onClick={() => setPhase(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="slider-box">
            <div className="slider-header">
              <h3 className="retro-heading" style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Intensity Level
              </h3>
              <span className="slider-val">{intensity}%</span>
            </div>

            <div className="slider-input-wrapper">
              <input
                type="range"
                min="10"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, var(--primary) ${fillPercentage}%, rgba(0,0,0,0.05) ${fillPercentage}%)`,
                }}
              />
            </div>

            <div className="slider-labels">
              {intensityLevels.map((level) => {
                const positionPercent = ((level.val - 10) / 90) * 100;
                return (
                  <span
                    key={level.label}
                    className={`slider-label ${
                      intensity >= level.val - 10 && intensity <= level.val + 10 ? "active" : ""
                    }`}
                    onClick={() => setIntensity(level.val)}
                    style={{
                      left: `${positionPercent}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {level.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Emergency Scenarios */}
          <div>
            <h3 className="retro-heading control-header">
              Emergency Scenarios
            </h3>

            <div className="button-grid-2x2">
              {scenarios.map((s) => (
                <button
                  key={s.name}
                  className={`btn ${
                    scenario === s.name
                      ? s.name === "Normal"
                        ? "active btn-primary"
                        : "active btn-danger"
                      : ""
                  }`}
                  onClick={() => setScenario(s.name)}
                >
                  {s.icon} {s.name}
                </button>
              ))}

              {/* 🚨 Emergency HR=0 Button */}
              <button
                className={`btn ${isEmergency ? "active btn-danger" : "btn-danger"}`}
                onClick={toggleEmergency}
              >
                🚨 {isEmergency ? "Stop Emergency" : "HR = 0"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="engine-column">
          
          <div className={`engine-core ${isRunning ? "running" : ""}`}>
            <div className="engine-inner">
              
              <Cpu
                size={50}
                color={isRunning ? "var(--primary)" : "var(--text-muted)"}
                className="engine-icon"
              />

              <h1 className={`retro-heading engine-title ${isRunning ? "text-primary" : "text-main"}`}>
                Simulation Core
              </h1>

              <p className={`engine-state ${isRunning ? "text-main" : "text-muted"}`}>
                {isRunning ? "Running" : "Standby"}
              </p>

              <div className="engine-actions">
                <button
                  className={`btn ${isRunning ? "active btn-danger" : "btn-primary"}`}
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? (
                    <>
                      <Square size={16} /> Stop
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" /> Start
                    </>
                  )}
                </button>

                <button
                  className="btn"
                  onClick={resetSimulation}
                >
                  <RotateCcw size={16} />
                </button>
              </div>

            </div>
          </div>

          <VitalsPod vitals={vitals} />
        </div>

      </div>
    </div>
  );
}