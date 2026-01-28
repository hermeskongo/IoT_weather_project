import serial
import time
import threading
import json

try:
    ser = serial.Serial('COM1', 9600, timeout=1)
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


