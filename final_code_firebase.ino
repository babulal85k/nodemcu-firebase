#include <ESP8266WiFi.h> 
#include <FirebaseESP8266.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <DHT.h>

// Configuration (Move to a separate config.h file for better security)
const char* ssid = "Shyam_Nivas_AirFiber";       // WiFi SSID
const char* password = "12345678@Jio";           // WiFi Password
const char* firebaseHost = "nodemcudata-e91f1-default-rtdb.firebaseio.com"; // Firebase Host
const char* firebaseApiKey = "AIzaSyAwU3aap1IiiQUniNeW-p-wTurAgGSGzxc";     // Firebase API Key
const char* firebaseEmail = "babulalmandal85k@gmail.com";                   // Firebase Email
const char* firebasePassword = "516273@aD";                                // Firebase Password

// Pin Definitions
#define RELAY1 5      // PIR-controlled relay (GPIO5 - D1)
#define RELAY2 4      // Firebase-controlled relay (GPIO4 - D2)
#define RELAY3 0      // Firebase-controlled relay (GPIO0 - D3)
#define PIR_SENSOR 14 // PIR motion sensor (GPIO14 - D5)
#define MQ2_SENSOR A0 // MQ-2 gas sensor (Analog pin)
#define DHTPIN 2      // DHT11 sensor (GPIO2 - D4)
#define DHTTYPE DHT11

// Initialize Objects
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 19800, 60000); // NTP client for time synchronization
FirebaseConfig firebaseConfig;
FirebaseAuth firebaseAuth;
FirebaseData firebaseData;
DHT dht(DHTPIN, DHTTYPE);

// Global Variables
unsigned long lastFirebaseUpdate = 0;
unsigned long lastSensorRead = 0;
unsigned long lastPirTrigger = 0;
bool isOnlineSet = false;
bool relay1State = false;
bool relay2State = false;
bool relay3State = false;

// Constants
const unsigned long debounceDelay = 200;  // Debounce delay for PIR sensor (200ms)
const unsigned long firebaseUpdateInterval = 30000; // Firebase update interval (30s)
const unsigned long sensorReadInterval = 10000;    // Sensor read interval (10s)
const unsigned long loopInterval = 5000;           // Main loop interval (5s)

// Function Prototypes
void connectToWiFi();
void initializeFirebase();
void handlePirSensor();
void handleFirebaseRelays();
void handleScheduledRelay2();
void readSensorData();
void updateFirebaseStatus();

void setup() {
    Serial.begin(115200);

    // Initialize GPIOs
    pinMode(RELAY1, OUTPUT);
    pinMode(RELAY2, OUTPUT);
    pinMode(RELAY3, OUTPUT);
    pinMode(PIR_SENSOR, INPUT);
    digitalWrite(RELAY1, LOW);
    digitalWrite(RELAY2, LOW);
    digitalWrite(RELAY3, LOW);

    // Connect to WiFi
    connectToWiFi();

    // Initialize Firebase
    initializeFirebase();

    // Initialize Time Client
    timeClient.begin();

    // Initialize DHT Sensor
    dht.begin();
}

void loop() {
    timeClient.update();

    // Handle PIR Sensor
    handlePirSensor();

    // Handle Firebase Relay Control
    handleFirebaseRelays();

    // Handle Scheduled Relay2 Control
    handleScheduledRelay2();

    // Read Sensor Data
    if (millis() - lastSensorRead >= sensorReadInterval) {
        readSensorData();
        lastSensorRead = millis();
    }

    // Update Firebase Online Status
    if (millis() - lastFirebaseUpdate >= firebaseUpdateInterval) {
        updateFirebaseStatus();
        lastFirebaseUpdate = millis();
    }

    // Non-blocking delay
    delay(loopInterval);
}

// Connect to WiFi
void connectToWiFi() {
    Serial.print("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    WiFi.setAutoReconnect(true);
    WiFi.persistent(true);

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println(" Connected!");
}

// Initialize Firebase
void initializeFirebase() {
    firebaseConfig.host = firebaseHost;
    firebaseConfig.api_key = firebaseApiKey;
    firebaseAuth.user.email = firebaseEmail;
    firebaseAuth.user.password = firebasePassword;

    // Initialize Firebase
    Firebase.begin(&firebaseConfig, &firebaseAuth);
    Firebase.reconnectWiFi(true);
    firebaseData.setBSSLBufferSize(1024, 1024);

    // Check Firebase connection status
    if (Firebase.ready()) {
        Serial.println("Firebase initialized successfully!");
    } else {
        Serial.println("Firebase initialization failed!");
    }
}

// Handle PIR Sensor
void handlePirSensor() {
    int pirState = digitalRead(PIR_SENSOR);
    if (pirState == HIGH && !relay1State && millis() - lastPirTrigger > debounceDelay) {
        relay1State = true;
        digitalWrite(RELAY1, HIGH);
        Firebase.setInt(firebaseData, "/SensorData/Relay1_Status", 1);
        Serial.println("Motion Detected! Relay1 ON.");
        lastPirTrigger = millis();
    } else if (pirState == LOW && relay1State && millis() - lastPirTrigger > debounceDelay) {
        relay1State = false;
        digitalWrite(RELAY1, LOW);
        Firebase.setInt(firebaseData, "/SensorData/Relay1_Status", 0);
        Serial.println("No Motion. Relay1 OFF.");
        lastPirTrigger = millis();
    }
}

// Handle Firebase Relay Control
void handleFirebaseRelays() {
    if (Firebase.getInt(firebaseData, "/SensorData/Relay2")) {
        if (firebaseData.dataType() == "int") {
            int relayState = firebaseData.to<int>();
            if (relayState != relay2State) {
                relay2State = relayState;
                digitalWrite(RELAY2, relayState);
                Firebase.setInt(firebaseData, "/SensorData/Relay2_Status", relayState);
                Serial.println(relayState ? "Relay2 ON" : "Relay2 OFF");
            }
        } else {
            Serial.println("Failed to read Relay2 state from Firebase!");
        }
    }

    if (Firebase.getInt(firebaseData, "/SensorData/Relay3")) {
        if (firebaseData.dataType() == "int") {
            int relayState = firebaseData.to<int>();
            if (relayState != relay3State) {
                relay3State = relayState;
                digitalWrite(RELAY3, relayState);
                Firebase.setInt(firebaseData, "/SensorData/Relay3_Status", relayState);
                Serial.println(relayState ? "Relay3 ON" : "Relay3 OFF");
            }
        } else {
            Serial.println("Failed to read Relay3 state from Firebase!");
        }
    }
}

// Handle Scheduled Relay2 Control
void handleScheduledRelay2() {
    int currentHour = timeClient.getHours();
    int currentMinute = timeClient.getMinutes();

    if ((currentHour == 2 || currentHour == 8 || currentHour == 14 || currentHour == 20) && currentMinute == 0) {
        if (!relay2State) {
            relay2State = true;
            digitalWrite(RELAY2, HIGH);
            Firebase.setInt(firebaseData, "/SensorData/Relay2_Status", 1);
            Serial.println("Relay2 ON (Scheduled)");
        }
    } else if ((currentHour == 4 || currentHour == 10 || currentHour == 16 || currentHour == 22) && currentMinute == 0) {
        if (relay2State) {
            relay2State = false;
            digitalWrite(RELAY2, LOW);
            Firebase.setInt(firebaseData, "/SensorData/Relay2_Status", 0);
            Serial.println("Relay2 OFF (Scheduled)");
        }
    }
}

// Read Sensor Data
void readSensorData() {
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (!isnan(temperature) && !isnan(humidity)) {
        Firebase.setFloat(firebaseData, "/SensorData/Temperature", temperature);
        Firebase.setFloat(firebaseData, "/SensorData/Humidity", humidity);
        Serial.printf("Temp: %.1f°C, Humidity: %.1f%%\n", temperature, humidity);
    } else {
        Serial.println("Failed to read DHT11 sensor!");
    }

    int gasLevel = analogRead(MQ2_SENSOR);
    Firebase.setInt(firebaseData, "/SensorData/GasLevel", gasLevel);
    Serial.print("Gas Level: ");
    Serial.println(gasLevel);
}

// Update Firebase Online Status
void updateFirebaseStatus() {
    if (!isOnlineSet) {
        Firebase.setInt(firebaseData, "/SensorData/Online", 1);
        isOnlineSet = true;
    }
}
