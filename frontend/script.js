import { io } from "socket.io-client";

const socket = io("http://localhost:8000");
let fanOn = false;
let fan_state = false;
let remote_state;
let manualOverride = false;


const permission = requestNotificationPermission()


socket.on('sensor_update', (data) => {
    // Récupération des éléments de data par destructuration
    let {temperature, humidity, pressure, luminosity, remote, fan_state: fanServerState} = data
    remote_state = remote

    // Mise à jour les données affichées
    document.getElementById('heroTemp').innerHTML = temperature + '<sup>°C</sup>';
    document.getElementById('cardHumidity').innerHTML = humidity + '<span class="unit">%</span>';
    document.getElementById('cardPressure').innerHTML = pressure + '<span class="unit">hPa</span>';
    document.getElementById('cardLDR').innerHTML = luminosity + '<span class="unit">lux</span>';

    updateMeteoIcon(luminosity, temperature, humidity);

    let isOn = data.fan_state == 1 ? true : false

    fan_state = Boolean(fanServerState)
    if(!manualOverride) {
        fanGestion(fan_state, "remote", isOn)
    }
});



// ─── TOGGLE VENTILATEUR ───
const fanToogle = document.getElementById("fanToggle")

fanToogle.addEventListener('change', (e) => {
    if(fan_state && !remote_state) {
        toast("error", "Veuillez patientez le temps que le système régule température", 5000)
        fanToogle.checked = fan_state
        e.preventDefault();
        return;
    }

    manualOverride = true;
    toggleFan(fanToogle);
    setTimeout(() => {
        manualOverride = false;
    }, 5000);
})


function toggleFan(el) {
    fanOn = el.checked;
    fanGestion(fanOn, "manual")
}

/**
 * Fonction permettant gérer l'état du DOM et les animations autour du ventilateur en fonction
 * de l'état du ventilateur
 * @param {boolean} fanStatus l'état du ventilateur.
 */
function fanGestion(fanStatus, mode = "remote") {
    const spinner = document.getElementById('fanSpinner');
    const label = document.getElementById('toggleLabel');
    const modeLabel = document.getElementById('modeLabel');
    if (fanStatus) {
        spinner.classList.remove('off');
        label.textContent = 'ON';
        modeLabel.textContent = mode === "manual" ? 'Manuel' : "Automatique";
        modeLabel.className = mode === "manual" ? 'mode-manual' : "mode-auto";

        if (mode === "manual") {
            socket.emit('toggle_fan', { action: 'ON' });
            toast("success", "Activation du ventilateur réussi réussi !", 1500)
        } else {
            fanToogle.checked = true;
            sendPushNotif("Alert grave", permission)
        }

        // Handle de l'animation d'accélaration du ventilateur lors de son activation manuel
        setTimeout(() => {
            spinner.classList.add('second-speed');
            setTimeout(() => {
                spinner.classList.add('third-speed');
            }, 2500);
        }, 1500);

    } else {

        label.textContent = 'OFF';
        modeLabel.textContent = mode === "manual" ? 'Manuel' : "Automatique";
        modeLabel.className = mode === "manual" ? 'mode-manual' : "mode-auto";
        
        fanToogle.checked =false;
        
        if (mode === "manual") {
            socket.emit('toggle_fan', { action: 'OFF' });
            toast("success", "Désaction du ventilateur réussi !", 1500)
        } 
        
        // Handle de l'Animation de deccélaration (en reverse à l'accélération).
        spinner.classList.remove('third-speed');
        setTimeout(() => {
            spinner.classList.remove('second-speed');
            setTimeout(() => {
                spinner.classList.add('off');
            }, 2500);
        }, 1500);
    }
}


// ─── TOAST NOTIFICATION ───

function toast(type = "success", message = "", duration = 3000) {
    const toastContainer = document.getElementById("toast-container")
    const toast = document.createElement('span')
    toast.classList.add('toast')
    toast.textContent = message
    switch (type) {
        case "success":
            toast.classList.add('success')
            break;
        case "error":
            toast.classList.add('error')

        default:
            break;
    }
    toastContainer.appendChild(toast)
    requestAnimationFrame(() => toast.classList.add('visible'))

    let removeTimeout = null

    const cancelRemove = () => {
        if (removeTimeout) {
            clearTimeout(removeTimeout);
            removeTimeout = null;
        }
    }
    const scheduleRemove = () => {
        cancelRemove();
        removeTimeout = setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, duration);
    }

    scheduleRemove()

    toast.addEventListener('mouseenter', () => {
        cancelRemove()
    })
    toast.addEventListener('mouseleave', () => {
        scheduleRemove()
    })

}

// PUSH NOTIFICATION

function sendPushNotif(message = "", permission, title = "Info station") {
    if (!("Notification" in window)) {
        alert("Les notifications ne sont pas disponible sur ce navigateur; vous ne pourrez donc pas être tenu au courant du mode automatique")
        return;
    }

    if (permission === "granted") {
        console.log("Notification permission granted.");
        new Notification(title, {
            body: message,
            icon: "https://developers.google.com/static/maps/images/landing/hero_weather2.png?hl=fr"
        })
    } else if (permission === "denied") {
        alert("Nous vous recommandons d'accepter les notifications pour un bon fonctionnement de notre application.")
    }


}

function requestNotificationPermission() {
    return Notification.requestPermission()
}

/**
 * 
 * @param {Number} luminosity 
 * @param {Number} temperature 
 * @param {Number} humidity 
 */
function updateMeteoIcon(luminosity, temperature, humidity) {
  let icon = '☀️'

  if (temperature <= 2) {
    icon = '❄️'
  } 
  else if (humidity > 90 && luminosity < 200) {
    icon = '🌫️'
  }
  else if (humidity > 85 && temperature > 15 && luminosity < 300) {
    icon = '⛈️'
  }
  else if (humidity > 80 && luminosity < 300) {
    icon = '🌧️'
  }
  else if (humidity > 70 && luminosity < 400) {
    icon = '☁️'
  }
  else if (luminosity < 150) {
    icon = '🌙'
  }
  else if (luminosity >= 150 && luminosity < 600) {
    icon = '☀️'
  }
  else if (luminosity >= 300 && humidity < 60 && temperature > 22) {
    icon = '☀️'
  }

  document.getElementById('meteo-icon').textContent = icon
}