#include <Wire.h>
#include <RTClib.h>
#include <Adafruit_BME280.h>
#include <LiquidCrystal_I2C.h>

void sendRemoteData();

Adafruit_BME280 bme;
RTC_DS1307 rtc;
LiquidCrystal_I2C lcd(0x3F, 16, 2);


// Broche Arduino
const int ventilatorPin = 8;
const int ldr = A0;

// Constante pour le bon déroulement du script
const float SEUIL_MAX = 25.0;

unsigned long prevServer = 0;
const long serverInterval = 0; // Interval d'envoi des données sur l'interface web/mobile
const long lcdInterval = 0;
unsigned long prevLcd = 0;

int remote = 0;
int fanState = 0;
String command = "";

float temperature, humidity, pressure, luminosity;

void setup() {
  Serial.begin(9600);

  pinMode(ventilatorPin, OUTPUT);

  // Initialisation de RTC
  rtc.begin();

  // Initialisation de LCD
  lcd.init();
  lcd.backlight();

  // BME test
  if (!bme.begin(0x76)) {
    Serial.println("Error BME sensor");
    while (1);
  }
}


// Fonction permettant de passer de la tension(V) à la luminosité (Lux)
float tensionToLux(float tension, float R_R1=10000.0) {
  float R_ldr = R_R1 * (5/tension -1);
  return 500.0 / pow(R_ldr / 1000.0, 1.4);
}



void loop() {
  DateTime now = rtc.now();
  temperature = bme.readTemperature();    // Température en Celsius
  humidity = bme.readHumidity();          // Humidité en %
  pressure = bme.readPressure() / 100.0;  // Pression atmosphérique en hPa

  int rawValue = analogRead(ldr);
  float tension = map(rawValue, 0, 1023, 0, 5000);// Tension en mV
  tension = tension/1000; // mV -> V
  
  luminosity = tensionToLux(tension);


  if (Serial.available() > 0) {
    command = Serial.readStringUntil('\n');
    command.trim();
    if (command == "ON") {
      remote = 1;
      fanState = 1;
    } else if (command == "OFF") {
      remote = 0;
      fanState = 0;
    }
    digitalWrite(ventilatorPin, fanState);
  }

  
  // Envoyer des données au serveur Distant via bluetooth toutes les 15 secondes
    unsigned long currentMillis = millis();
    if (currentMillis - prevServer >= serverInterval) {
        sendRemoteData();
        prevServer = currentMillis;
    }


  if (millis() - prevLcd > lcdInterval) {

    lcd.setCursor(0, 0);
    lcd.print(now.hour());
    lcd.print(":");
    lcd.print(now.minute());  // Affichage de Heure:Minutes
    lcd.print(" Lu: ");
    lcd.print(luminosity);
    lcd.print("Lux"); // Affichage de la température;

    lcd.setCursor(0, 1);
    lcd.print("H:");
    lcd.print(humidity);
    lcd.print("%");

    lcd.print(" T:");
    lcd.print(temperature);
    lcd.print("C"); 

    lcd.print(" P:");
    lcd.print(pressure);
    lcd.print("hpa");
    prevLcd = millis();
  }

  if (remote == 0) {
    if (temperature > SEUIL_MAX) {
      fanState = 1;
    } else if (temperature < (SEUIL_MAX - 1.00)) {
      fanState = 0;
    }
    digitalWrite(ventilatorPin, fanState);
  }
}


void sendRemoteData() {
  Serial.print("{");
  Serial.print("\"temperature\":");
  Serial.print(temperature);
  Serial.print(",");
  Serial.print("\"humidity\":");
  Serial.print(humidity);
  Serial.print(",");
  Serial.print("\"pressure\":");
  Serial.print(pressure);
  Serial.print(",");
  Serial.print("\"fanState\":");
  Serial.print(fanState);
  Serial.print(",");
  Serial.print("\"remote\":");
  Serial.print(remote);
  Serial.print(",");
  Serial.print("\"luminosite\":");
  Serial.print(luminosity);
  Serial.println("}");
}
