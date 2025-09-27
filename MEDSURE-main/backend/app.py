from flask import Flask, render_template, request, send_file, redirect, url_for, jsonify
import qrcode
import pyotp
import uuid
import os
import cv2
import numpy as np
from pyzbar.pyzbar import decode
from werkzeug.utils import secure_filename
import re

app = Flask(__name__)

data_store = {}

app.config['UPLOAD_FOLDER'] = './uploads'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/manulogin')
def manulogin():
    return render_template('manulogin.html')


@app.route('/manufacturer')
def manufacturer():
    return render_template('manudash.html')


@app.route('/pharma')
def pharma():
    return render_template('pharma.html')


@app.route('/pharmalogin')
def pharmalogin():
    return render_template('pharmalogin.html')


@app.route('/generate', methods=['POST'])
def generate():
    name = request.form['name']
    batch_number = request.form['batch_number']
    expiry_date = request.form['expiry_date']
    barcode = request.form['barcode']

    unique_id = str(uuid.uuid4())
    verification_url = f'http://127.0.0.1:5005/verify/{unique_id}'  

    data_store[unique_id] = {
        'name': name,
        'batch_number': batch_number,
        'expiry_date': expiry_date,
        'barcode': barcode,
        'verified': False,
        'otp': None 
    }

    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
    qr.add_data(verification_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    filename = f'static/qr_code_{unique_id}.png'
    img.save(filename)

    return render_template('manudash.html', qr_image=filename,
                           qr_download_url=url_for('download_qr', filename=filename))

@app.route('/download_qr/<path:filename>', methods=['GET'])
def download_qr(filename):
    return send_file(filename, as_attachment=True)


@app.route('/verify/<unique_id>', methods=['GET', 'POST'])
def verify(unique_id):
    if request.method == 'POST':
        password_input = request.form['password']

        if unique_id in data_store:
            data = data_store[unique_id]
            if password_input == data['otp']:
                data_store.pop(unique_id)
                return render_template('success.html', name=data['name'], batch_number=data['batch_number'],
                                       expiry_date=data['expiry_date'], barcode=data['barcode'])
            else:
                return "Invalid password! Please try again."
        else:
            return "No data found or QR code already verified!"
    else:
        if unique_id in data_store and not data_store[unique_id]['verified']:
            otp = pyotp.random_base32()
            data_store[unique_id]['otp'] = otp
            data_store[unique_id]['verified'] = True

            # Print OTP to terminal
            print(f'Generated OTP for {unique_id}: {otp}')

            return render_template('verify.html', unique_id=unique_id, otp=otp)
        else:
            return "Invalid or already verified QR code!"


def read_qr_code_from_image(image_path):
    img = cv2.imread(image_path)
    qr_codes = decode(img)
    for qr_code in qr_codes:
        return qr_code.data.decode("utf-8")
    return None


def is_url(data):
    url_regex = re.compile(r'^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$', re.IGNORECASE)
    return re.match(url_regex, data) is not None


@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return redirect(request.url)

    file = request.files['file']

    if file.filename == '':
        return redirect(request.url)

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        qr_data = read_qr_code_from_image(file_path)

        if qr_data:
            if is_url(qr_data):
                return redirect(qr_data)
            else:
                return f"QR code data: {qr_data}"
        else:
            return "No QR code detected!"


@app.route('/scan', methods=['POST'])
def scan():
    cap = cv2.VideoCapture(0)
    qr_data = None

    while True:
        ret, frame = cap.read()
        qr_codes = decode(frame)

        for qr_code in qr_codes:
            qr_data = qr_code.data.decode("utf-8")
            break

        if qr_data:
            break

        cv2.imshow('Scanning QR Code...', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    if qr_data:
        if is_url(qr_data):
            return redirect(qr_data)
        else:
            return jsonify({"qr_data": qr_data})
    else:
        return "No QR code detected!"


@app.route('/submit_barcode', methods=['POST'])
def submit_barcode():
    barcode = request.form.get('barcode')
    if barcode:
        return jsonify({"status": "success", "barcode_data": barcode})
    else:
        return jsonify({"status": "failed", "message": "Invalid barcode"})


@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    unique_id = request.form.get('unique_id')
    return jsonify({"status": "success", "unique_id": unique_id})


@app.route('/history')
def history():
    """Displays the scan history (mock implementation)."""
    return "This is the scan history page."


if __name__ == '__main__':
    app.run(debug=True, port=5005)
