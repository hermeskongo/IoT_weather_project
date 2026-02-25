import { io } from "socket.io-client";

const socket = io("http://localhost:8000");
let fanOn = false;
let fan_state = false;

const permission = requestNotificationPermission()


socket.on('sensor_update', (data) => {
    // Mise à jour les données affichées
    document.getElementById('heroTemp').innerHTML = data.temperature + '<sup>°C</sup>';
    document.getElementById('cardHumidity').innerHTML = data.humidity + '<span class="unit">%</span>';
    document.getElementById('cardPressure').innerHTML = data.pressure + '<span class="unit">hPa</span>';
    document.getElementById('cardLDR').innerHTML = data.luminosity + '<span class="unit">lux</span>';

    let isOn = data.fan_state == 1 ? true : false

    fan_state = Boolean(data.fan_state)
    fanGestion(fan_state, "remote", isOn)
    console.log(data)
});



// ─── TOGGLE VENTILATEUR ───
const fanToogle = document.getElementById("fanToggle")


function toggleFan(el) {
    fanOn = el.checked;
    fanGestion(fanOn, "manual")
}

/**
 * Fonction permettant gérer l'état du DOM et les animations autrour du ventilateur en fonction
 * de l'état du ventilateur
 * @param {boolean} fanStatus l'état du ventilateur.
 */
function fanGestion(fanStatus, mode = "remote", isOn) {
    const spinner = document.getElementById('fanSpinner');
    const label = document.getElementById('toggleLabel');
    const modeLabel = document.getElementById('modeLabel');

    if (fanStatus) {
        spinner.classList.remove('off');
        label.textContent = 'ON';
        modeLabel.textContent = 'Manuel';
        modeLabel.className = 'mode-manual';
        if (mode === "manual") {
            socket.emit('toggle_fan', { action: 'ON' });
            toast("success", "Activation du ventilateur réussi réussi !", 1500)
        } else {
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

        // Handle de l'Animation de deccélaration (en reverse à l'accélération).
        spinner.classList.remove('third-speed');
        setTimeout(() => {
            spinner.classList.remove('second-speed');
            setTimeout(() => {
                spinner.classList.add('off');
            }, 2500);
        }, 1500);

        label.textContent = 'OFF';
        modeLabel.textContent = 'Automatique';
        modeLabel.className = 'mode-auto';
        if (mode === "manual") {
            socket.emit('toggle_fan', { action: 'OFF' });
            toast("success", "Désaction du ventilateur réussi !", 1500)
        }
    }
}

fanToogle.addEventListener('change', (e) => {
    toggleFan(fanToogle)
})

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
    if (!"Notification" in window) {
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
