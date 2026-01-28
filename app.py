import serial
import time
import threading

try:
    ser = serial.Serial('COM1', 9600, timeout=1)
    print("Connection successfully !✅ ")
    time.sleep(.2)
except Exception as e:
    print(f"Connection failed: ${e}")



