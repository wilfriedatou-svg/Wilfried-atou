from flask import Flask, request
import requests
import os

app = Flask(__name__)

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"

def send_message(chat_id, text):
    url = f"{TELEGRAM_API_URL}/sendMessage"
    data = {"chat_id": chat_id, "text": text}
    requests.post(url, json=data)

@app.route("/", methods=["GET"])
def home():
    return "Bot is running!", 200

@app.route("/", methods=["POST"])
def webhook():
    data = request.get_json()
    
    if "message" in data:
        chat_id = data["message"]["chat"]["id"]
        text = data["message"].get("text", "")

        if text == "/start":
            reply = "Salut ! Je suis Wilfried Bot 🔥\n\nJe suis en ligne 24/7 sur Render.\nEnvoie-moi n'importe quel message."
        else:
            reply = f"Tu as dit : {text}"
        
        send_message(chat_id, reply)
    
    return "ok", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)