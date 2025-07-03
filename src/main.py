from flask import Flask
import subprocess
import os

app = Flask(__name__)

@app.route('/')
def index():
    return "Armonía está desplegándose..."

if __name__ == '__main__':
    # Iniciar Next.js en background
    subprocess.Popen(['npm', 'start'], cwd='/app')
    app.run(host='0.0.0.0', port=5000)

