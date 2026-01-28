   
from flask import Flask, jsonify
from app import data, off, on, show_data

app = Flask(__name__)


app.run(port=8000)

if __name__ == '__main__':
    app.run(debug=True)