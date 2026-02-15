import { io } from "socket.io-client";

const socket = io("http://localhost:8000");
socket.on('sensor_update', (data) => {
    // Mise à jour les données affichées
    document.getElementById('heroTemp').innerHTML = data.temperature + '<sup>°C</sup>';
    document.getElementById('cardHumidity').innerHTML = data.humidity + '<span class="unit">%</span>';
    document.getElementById('cardPressure').innerHTML = data.pressure + '<span class="unit">hPa</span>';
    document.getElementById('cardLDR').innerHTML = data.ldr + '<span class="unit">lux</span>';
});

let fanOn = false;

// ─── TOGGLE VENTILATEUR ───
const fanToogle = document.getElementById("fanToggle")

function toggleFan(el) {
    fanOn = el.checked;
    const spinner = document.getElementById('fanSpinner');
    const label = document.getElementById('toggleLabel');
    const modeLabel = document.getElementById('modeLabel');

    if (fanOn) {
        spinner.classList.remove('off');
        label.textContent = 'ON';
        modeLabel.textContent = 'Manuel';
        modeLabel.className = 'mode-manual';
        socket.emit('toggle_fan', { action: 'ON' });
        toast("success", "Activation du ventilateur réussi réussi !", 1500)

    } else {
        spinner.classList.add('off');
        label.textContent = 'OFF';
        modeLabel.textContent = 'Automatique';
        modeLabel.className = 'mode-auto';
        socket.emit('toggle_fan', { action: 'OFF' });
        toast("success", "Désaction du ventilateur réussi !", 1500)
    }
}

fanToogle.addEventListener('change', (e) => {
    toggleFan(fanToogle)
})

// ─── MISE À JOUR DE L'HEURE ───
function updateTime() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent =
        now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateTime, 1000);
updateTime();


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
