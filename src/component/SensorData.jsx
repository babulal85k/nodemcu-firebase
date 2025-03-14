import { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { db } from "../firebase";
import { ref, onValue, set } from "firebase/database";

const SensorData = () => {
  const [sensorData, setSensorData] = useState({
    Temperature: "N/A",
    Humidity: "N/A",
    GasLevel: "N/A",
    PIR: "No Motion",
    Relay1: "OFF",
    Relay2: "OFF",
    Relay3: "OFF",
  });

  const logRef = useRef(null);

  useEffect(() => {
    const sensorRef = ref(db, "/SensorData");
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData({
          Temperature: data.Temperature ?? "N/A",
          Humidity: data.Humidity ?? "N/A",
          GasLevel: data.GasLevel ?? "N/A",
          PIR: data.PIR ? "Motion Detected" : "No Motion",
          Relay1: data.Relay1_Status ? "ON" : "OFF",
          Relay2: data.Relay2_Status ? "ON" : "OFF",
          Relay3: data.Relay3_Status ? "ON" : "OFF",
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleRelay = useCallback((relay) => {
    const newState = sensorData[relay] === "ON" ? 0 : 1;
    set(ref(db, `/SensorData/${relay}_Status`), newState);
  }, [sensorData]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏠 Sensor Dashboard</h1>
      <div style={styles.grid}>
        <SensorCard label="🌡 Temperature" value={`${sensorData.Temperature}°C`} />
        <SensorCard label="💧 Humidity" value={`${sensorData.Humidity}%`} />
        <SensorCard label="🔥 Gas Level" value={sensorData.GasLevel} />
        <SensorCard label="🚶 PIR Motion" value={sensorData.PIR} />
        <RelayButton label="🔌 Relay 1" state={sensorData.Relay1} onToggle={() => toggleRelay("Relay1")} />
        <RelayButton label="🔌 Relay 2" state={sensorData.Relay2} onToggle={() => toggleRelay("Relay2")} />
        <RelayButton label="🔌 Relay 3" state={sensorData.Relay3} onToggle={() => toggleRelay("Relay3")} />
      </div>
    </div>
  );
};

// Prop Types for Validation
SensorData.propTypes = {};

// Sensor Card Component
const SensorCard = ({ label, value }) => (
  <div style={styles.card}>
    <strong>{label}:</strong> {value}
  </div>
);

// PropTypes for SensorCard
SensorCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

// Relay Button Component
const RelayButton = ({ label, state, onToggle }) => (
  <button onClick={onToggle} style={{ ...styles.button, backgroundColor: state === "ON" ? "#28a745" : "#dc3545" }}>
    {state === "ON" ? "🔅 ON" : "💡 OFF"}
  </button>
);

// PropTypes for RelayButton
RelayButton.propTypes = {
  label: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
};

// Styling Object
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f4f4f4",
    borderRadius: "10px",
    maxWidth: "400px",
    margin: "auto",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
  title: {
    fontSize: "20px",
    marginBottom: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    color: "#fff",
    width: "100px",
    margin: "auto",
  },
};

export default SensorData;
