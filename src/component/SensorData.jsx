import { useEffect, useState, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import PropTypes from "prop-types";

// Firebase Configuration (Move to .env for security)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function SensorData() {
  const [sensorData, setSensorData] = useState({
    Temperature: "N/A",
    Humidity: "N/A",
    GasLevel: "N/A",
    PIR: "No Motion",
    Relay1: "OFF",
    Relay2: "OFF",
    Relay3: "OFF",
  });

  const [logs, setLogs] = useState([]); // Stores Serial Monitor logs
  const logRef = useRef(null); // Ref for auto-scrolling

  useEffect(() => {
    const sensorRef = ref(db, "/SensorData");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const updatedData = {
            Temperature: data.Temperature ?? "N/A",
            Humidity: data.Humidity ?? "N/A",
            GasLevel: data.GasLevel ?? "N/A",
            PIR: data.PIR ? "Motion Detected" : "No Motion",
            Relay1: data.Relay1_Status ? "ON" : "OFF",
            Relay2: data.Relay2_Status ? "ON" : "OFF",
            Relay3: data.Relay3_Status ? "ON" : "OFF",
          };

          setSensorData(updatedData);

          // Append new log
          setLogs((prevLogs) => [
            ...prevLogs,
            `[${new Date().toLocaleTimeString()}] Data Updated: ${JSON.stringify(updatedData)}`,
          ]);
        }
      },
      (error) => {
        console.error("Error reading from Firebase:", error);
        setLogs((prevLogs) => [
          ...prevLogs,
          `[${new Date().toLocaleTimeString()}] Error: ${error.message}`,
        ]);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Auto-scroll to latest log
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleRelay = (relay) => {
    const newState = sensorData[relay] === "ON" ? 0 : 1;
    set(ref(db, `/SensorData/${relay}_Status`), newState)
      .then(() => {
        console.log(`${relay} toggled successfully.`);
        setLogs((prevLogs) => [
          ...prevLogs,
          `[${new Date().toLocaleTimeString()}] ${relay} toggled to ${newState ? "ON" : "OFF"}`,
        ]);
      })
      .catch((error) => {
        console.error(`Error toggling ${relay}:`, error);
        setLogs((prevLogs) => [
          ...prevLogs,
          `[${new Date().toLocaleTimeString()}] Error toggling ${relay}: ${error.message}`,
        ]);
      });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏠 Sensor Data</h1>
      <div style={styles.dataBox}>
        <SensorDisplay label="🌡 Temperature" value={`${sensorData.Temperature}°C`} />
        <SensorDisplay label="💧 Humidity" value={`${sensorData.Humidity}%`} />
        <SensorDisplay label="🔥 Gas Level" value={sensorData.GasLevel} />
        <SensorDisplay label="🚶‍♂️ PIR Motion" value={sensorData.PIR} />
        <RelayControl label="🔌 Relay 1" state={sensorData.Relay1} onToggle={() => toggleRelay("Relay1")} />
        <RelayControl label="🔌 Relay 2" state={sensorData.Relay2} onToggle={() => toggleRelay("Relay2")} />
        <RelayControl label="🔌 Relay 3" state={sensorData.Relay3} onToggle={() => toggleRelay("Relay3")} />
      </div>

      {/* Serial Monitor */}
      <h2 style={styles.monitorTitle}>📟 Serial Monitor</h2>
      <div style={styles.serialMonitor} ref={logRef}>
        {logs.map((log, index) => (
          <p key={index} style={styles.logText}>{log}</p>
        ))}
      </div>
    </div>
  );
}

// Reusable Sensor Display Component
const SensorDisplay = ({ label, value }) => (
  <p style={styles.sensorText}>
    <strong>{label}:</strong> {value}
  </p>
);
SensorDisplay.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

// Reusable Relay Control Component
const RelayControl = ({ label, state, onToggle }) => (
  <div style={styles.relayContainer}>
    <span style={styles.relayText}>
      <strong>{label}:</strong> {state}
    </span>
    <button onClick={onToggle} style={styles.button}>Toggle</button>
  </div>
);
RelayControl.propTypes = {
  label: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
};

// Inline Styles
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f4f4f4",
    borderRadius: "10px",
    maxWidth: "500px",
    margin: "20px auto",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  },
  title: {
    color: "#333",
  },
  dataBox: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  monitorTitle: {
    marginTop: "20px",
    fontSize: "18px",
    color: "#444",
  },
  serialMonitor: {
    backgroundColor: "#222",
    color: "#0f0",
    fontFamily: "monospace",
    fontSize: "14px",
    padding: "10px",
    borderRadius: "5px",
    height: "150px",
    overflowY: "auto",
    textAlign: "left",
  },
  logText: {
    margin: "2px 0",
  },
  relayContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },
  relayText: {
    fontSize: "16px",
  },
  button: {
    padding: "5px 10px",
    marginLeft: "10px",
    cursor: "pointer",
  },
};

export default SensorData;
