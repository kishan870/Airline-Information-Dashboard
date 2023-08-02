from flask import Flask, render_template, request, redirect
import json
import os
from datetime import datetime

app = Flask(__name__)

path = os.getcwd() + '\\static\\JSON\\Olympics.json'

@app.route('/',methods=['GET','POST'])
def index():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(host = '0.0.0.0',debug=True)
