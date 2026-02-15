import serial
import time
import threading

from flask_socketio import SocketIO
from flask import Flask, jsonify

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

try:
    # Ouvrez d'abord sans spécifier le baudrate
    ser = serial.Serial()
    ser.port = 'COM1'
    ser.baudrate = 9600
    ser.bytesize = serial.EIGHTBITS
    ser.parity = serial.PARITY_NONE
    ser.stopbits = serial.STOPBITS_ONE
    ser.timeout = 1

    # Fermez si déjà ouvert, puis réouvrez
    if ser.is_open:
        ser.close()
    time.sleep(0.5)

    ser.open()
    time.sleep(1)
    print("Connection successfully !✅ ")
    time.sleep(.2)
except Exception as e:
    print(f"Connection failed: ${e}")


data = {
    'temperature': None,
    'humidity': None,
    'pressure': None
}

# T:22.00 H:47.00 P:1080.00
def read_arduino():
    while True:
        if ser.in_waiting > 0:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            
            for part in line.split(' '):
                if(part.startswith('T')):
                    data['temperature'] = float(part.split(':')[1].strip())
                    
                elif(part.startswith('H')):
                    data['humidity'] = float(part.split(':')[1].strip())
                    
                elif(part.startswith('P')):
                    data['pressure'] = float(part.split(':')[1].strip())
            
            socketio.emit('sensor_update', data)
        time.sleep(3)
   

def send_command(command):
    ser.write(f"{command.upper()}\n".encode('utf-8'))
    print(f"Sent command: {command}")


@socketio.on('toggle_fan')
def toggleFan(data):
    """Permet de d'allumer ou d'éteindre le ventilateur une action reçue du client.

    Args:
        data (dict): Dictionnaire contenant 'command' ('ON' ou 'OFF')
    """
    command = data.get('action')
    send_command(command)


    
    
def show_data():
    """Fonction qui permet d'afficher les données les plus récentes provenant d'Arduino"""
    for key, value in data.items():
        print(f"{key}: {value}")


@app.route('/get_data')
def hello_world():
    return jsonify(data)


@app.route('/bob')
def bob():
    return jsonify(message="Hello BOB", status="success")


if __name__ == '__main__':
    port = 8000
    reader_thread = threading.Thread(target=read_arduino, daemon=True)
    reader_thread.start()
    print(f"Server launched on port: {port}")
    socketio.run(app, port=port, debug=False, allow_unsafe_werkzeug=False)