
---

# **🏠 IoT Home Automation & Monitoring System with ESP8266 & Firebase**  

This project is a **smart home automation system** using **ESP8266 (NodeMCU)**, **Firebase Realtime Database**, and a **React-based web dashboard**. It collects sensor data (temperature, humidity, motion, gas level) and allows remote control of relays via a web interface.  

## **🚀 Features**  
✅ **Live Sensor Data Monitoring:** Temperature, Humidity, Motion (PIR), and Gas Levels.  
✅ **Relay Control:** Control appliances remotely.  
✅ **Automated Relay Scheduling:** Relay 2 follows a **2 hours ON - 4 hours OFF** cycle.  
✅ **Manual Override:** A web button to manually switch relays on/off.  
✅ **Real-time Updates:** Uses Firebase for instant data sync between ESP8266 and React UI.  

## **🛠 Hardware Requirements**  
🔹 **ESP8266 NodeMCU**  
🔹 **DHT11** (Temperature & Humidity Sensor)  
🔹 **PIR Sensor** (Motion Detection)  
🔹 **MQ-2 Gas Sensor** (Smoke/Flammable Gas Detection)  
🔹 **Relays (x3)** (For switching appliances)  
🔹 **5V Power Supply**  

## **📦 Software & Libraries**  
### **ESP8266 (Arduino)**
- `ESP8266WiFi.h`
- `FirebaseESP8266.h`
- `DHT.h`  

### **React Frontend**
- `firebase`
- `react`  

## **🔧 Setup Instructions**  
### **1️⃣ ESP8266 Code Setup**  
1. Install **Arduino IDE** & ESP8266 Board Package.  
2. Add **FirebaseESP8266** library.  
3. Update `WiFi SSID`, `Password`, and `Firebase Config` in the Arduino code.  
4. Flash the code to **ESP8266**.  

### **2️⃣ Firebase Realtime Database Setup**  
1. Go to [Firebase Console](https://console.firebase.google.com/).  
2. Create a new project & enable **Realtime Database**.  
3. Set **Firebase Rules** to:  
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
4. Copy `databaseURL`, `apiKey`, and update in the **ESP8266 & React** code.  

### **3️⃣ React Web Dashboard Setup**  
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the app:
   ```bash
   npm start
   ```
4. Open in browser: **http://localhost:3000**  

---

## **📊 Live Data Preview (Example)**
```
🌡 Temperature: 28°C  
💧 Humidity: 65%  
🔥 Gas Level: 150  
🚶 PIR Motion: Detected  
🔌 Relay1: ON  
🔌 Relay2: ON (Automated 2hr ON - 4hr OFF)  
```

---

## **📸 Screenshots**
✅ ESP8266 Serial Monitor  
✅ Firebase Realtime Database View  ![image](https://github.com/user-attachments/assets/a0d875c9-f9fb-441a-8942-c080d2c1f11e)

✅ React Web Dashboard  ![image](https://github.com/user-attachments/assets/96506cae-e00c-4b29-a18c-ddaaa2998e20)


---

## **📌 Future Improvements**
- **🔗 MQTT Integration** for better scalability.  
- **📱 Mobile App** using React Native.  
- **🔐 Firebase Authentication** for secured access.  
- **⚡ AI-Based Power Optimization** using Machine Learning.  

---

## **🤝 Contributing**
Pull requests are welcome! 🚀 Feel free to improve and optimize the project.  

---

Let me know if you want to customize this further! 🚀
