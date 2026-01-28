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

# Démarrage du thread de lecture ppour récupérer les données en continue en arrière-plan
reader_thread = threading.Thread(target=read_arduino, daemon=True)
reader_thread.start()
   

def send_command(command):
    ser.write(f"{command}\n".encode('utf-8'))
    print(f"Sent command: {command}")


def on():
    """Fonction qui permet d'alumer le ventilateur Arduino"""
    send_command("ON")
    
def off():
    """Fonction qui permet d'éteindre le ventilateur Arduino"""
    send_command("OFF")
    
    
def show_data():
    """Fonction qui permet d'afficher les données les plus récentes provenant d'Arduino"""
    for key, value in data.items():
        print(f"{key}: {value}")


if(__name__ == 'main'):
    def show_menu():
        print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Commandes disponibles:")
        print("  1 - Allumer ventilateur")
        print("  2 - Éteindre ventilateur")
        print("  3 - Afficher dernières données")
        print("  q - Quitter")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━\n")


    show_menu()

    try:
        while True:
            command = input("> ").strip()
            
            if(command == '1'):
                on()
            elif command == '2':
                off()
            elif command == '3':
                show_data()
            elif command == 'q':
                print("👋 Fermeture...")
                ser.close()
                break
            else:
                print("❌ Commande invalide")
                show_menu()
                
    except KeyboardInterrupt:
        print("Exciting by Keyboard interruption")
        exit()
        

