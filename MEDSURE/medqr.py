import qrcode
import random
import string
from flask import Flask, request, jsonify

app = Flask(__name__)

# Simulated database for OTPs
otp_db = {}

# Generate a random OTP
def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

# Generate a QR code with an OTP embedded in the URL
def generate_qr(otp):
    url = f"http://your-server.com/verify?otp={otp}"
    qr = qrcode.make(url)
    qr.save("otp_qr.png")
    return url

# Endpoint to verify OTP
@app.route('/verify', methods=['GET'])
def verify_otp():
    otp = request.args.get('otp')
    if otp in otp_db and not otp_db[otp]['used']:
        otp_db[otp]['used'] = True
        return jsonify({"status": "success", "message": "OTP verified successfully."})
    else:
        return jsonify({"status": "fail", "message": "OTP is invalid or has already been used."})

if __name__ == '__main__':
    # Generate and store OTP
    otp = generate_otp()
    otp_db[otp] = {'used': False}
    
    # Generate the QR code
    print("QR Code URL:", generate_qr(otp))
    
    # Start the Flask app
    app.run(debug=True)
