# 🌡️ Weather Station Dashboard

**Auteur :** Hermès KONGO
**Version :** 1.0.0

---

## Description du projet

Ce projet est une **station météo connectée** permettant de **surveiller la température, l'humidité, la pression atmosphérique et la luminosité** en temps réel. Il inclut également la **gestion automatique et manuelle d’un ventilateur** en fonction de la température mesurée.
Il a été réalisé dans le cadre d'une compétition d'électronique à l'université de [IGA Maroc](https://iga.ac.ma/)

Le projet est composé de trois parties principales :

1. **Arduino / Capteurs**

   * **BME280** : Température, humidité et pression atmosphérique.
   * **LDR** : Mesure de la luminosité.
   * **Ventilateur** : Pilotage automatique et manuel via un relais connecté à une broche Arduino.


2. **Backend Python / Flask-SocketIO**

   * Communication en temps réel avec l’Arduino via Bluetooth (HC-05) et le port série.
   * Envoi des données vers le frontend via **Socket.IO**.
   * Gestion des commandes pour allumer ou éteindre le ventilateur depuis le dashboard web.


3. **Frontend HTML / CSS / JS**

   * Interface graphique responsive avec **Bootstrap Icons**.
   * Affichage des valeurs en temps réel : température, humidité, pression, luminosité.
   * Contrôle manuel du ventilateur avec notifications et animations.
   * Indicateur visuel météo basé sur luminosité, température et humidité.

---

## Features principales

* 📊 **Dashboard temps réel** : Affichage de toutes les données toutes les 15 secondes.
* 🌡️ **Ventilateur automatique** : Activation/désactivation basée sur seuil de température configurable.
* 🕹️ **Contrôle manuel** : Possibilité d’allumer/éteindre le ventilateur via l’interface web.
* 🔔 **Notifications push** : Alertes sur le mode automatique et changement d’état du ventilateur.
* 🌙 **Icônes météo dynamiques** : Changement automatique des icônes selon les conditions mesurées.
* 💻 **Simulation possible** : Compatible avec **Proteus** pour tester le circuit et les capteurs.

---

## Installation et configuration en local

### Prérequis

* **Python 3.10+**
* **Arduino IDE**
* **Node.js 18+** (pour le frontend et Vite)
* Bibliothèques Python :

  ```bash
  pip install flask flask-socketio pyserial
  ```
* Bibliothèques Arduino :

  * Adafruit BME280
  * RTClib
  * LiquidCrystal_I2C

---

### Étapes d’installation

1. **Cloner le projet depuis GitHub**

   ```bash
   git clone https://github.com/hermeskongo/IoT_weather_project.git
   cd IoT_weather_project
   ```

2. **Installer les dépendances frontend**

   ```bash
   npm install
   ```

3. **Uploader le code Arduino**

   * Ouvrir le fichier `.ino` dans l’Arduino IDE.
   * Vérifier le type de carte.
   * Uploader sur l’Arduino.

4. **Lancer le serveur Python**

   ```bash
   python app.py
   ```

   * Le serveur communiquera avec l’Arduino et émettra les données via **Socket.IO** sur le port `8000`.

5. **Lancer le frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   * Ouvrir le navigateur sur `http://localhost:5173` (Vite fournit le port).

6. **Tester la simulation (optionnel)**

   * Ouvrir le fichier Proteus fourni.
   * Lancer la simulation et vérifier les valeurs des capteurs et le ventilateur.

---

## Structure du projet

```
/weather
│
├─ /frontend
│   ├─ index.html
│   ├─ style.css
│   └─ script.js
│
├─ /arduino
│   └─ weather_station.ino
│
├─ /proteus
│   └─ simulation.pdsprj
│
├─ app.py        # Backend Flask + Socket.IO
├─ package.json  # Frontend Node/Vite
└─ README.md
```

---

## Usage

* **Lecture en temps réel** : Les données s’affichent automatiquement dès qu’Arduino transmet les mesures.
* **Ventilateur automatique** : S’allume si la température dépasse le seuil de `25°C` (configurable dans le code Arduino).
* **Ventilateur manuel** : Cliquer sur le switch dans le dashboard. Une notification confirme l’action.
* **Icônes météo dynamiques** : Changement automatique selon les conditions mesurées (luminosité, humidité, température).

---

## Notes importantes

* Assurez-vous que l’Arduino est connecté au bon port série.
* Les notifications push nécessitent l’autorisation du navigateur.
* Si le ventilateur est activé manuellement, le contrôle automatique est temporairement désactivé pour 5 secondes.

---

## License

MIT License – libre pour usage personnel et éducatif.

