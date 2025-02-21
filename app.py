
from flask import Flask, render_template, send_from_directory

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def home():
    return render_template('index.html')  # Loads your HTML file

if __name__ == '__main__':
    app.run(debug=False)
