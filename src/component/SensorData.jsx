import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// Firebase Configuration (Move to .env file for production)
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

  useEffect(() => {
    const sensorRef = ref(db, "/SensorData");

    // Subscribe to Firebase Realtime Database updates
    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
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
      },
      (error) => {
        console.error("Error reading from Firebase:", error);
      }
    );

    // Cleanup function to unsubscribe on unmount
    return () => unsubscribe();
  }, []);

  const toggleRelay = (relay) => {
    const newState = sensorData[relay] === "ON" ? 0 : 1;
    set(ref(db, `/SensorData/${relay}_Status`), newState)
      .then(() => {
        console.log(`${relay} toggled successfully.`);
      })
      .catch((error) => {
        console.error(`Error toggling ${relay}:`, error);
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
        <RelayControl
          label="🔌 Relay 1"
          state={sensorData.Relay1}
          onToggle={() => toggleRelay("Relay1")}
        />
        <RelayControl
          label="🔌 Relay 2"
          state={sensorData.Relay2}
          onToggle={() => toggleRelay("Relay2")}
        />
        <RelayControl
          label="🔌 Relay 3"
          state={sensorData.Relay3}
          onToggle={() => toggleRelay("Relay3")}
        />
      </div>
    </div>
  );
}

// Reusable Sensor Display Component
const SensorDisplay = ({ label, value }) => (
  <p>
    <strong>{label}:</strong> {value}
  </p>
);

// Reusable Relay Control Component
const RelayControl = ({ label, state, onToggle }) => (
  <p>
    <strong>{label}:</strong> {state}{" "}
    <button onClick={onToggle}>Toggle</button>
  </p>
);

// Inline Styles
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f4f4f4",
    borderRadius: "10px",
    maxWidth: "400px",
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
};

export default SensorData;