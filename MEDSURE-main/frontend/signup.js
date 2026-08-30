import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAB65QloZDhtrfMU9JZ3XVpu1RfZixyjk4",
    authDomain: "medsure-69206.firebaseapp.com",
    projectId: "medsure-69206",
    storageBucket: "medsure-69206.appspot.com",
    messagingSenderId: "162048298825",
    appId: "1:162048298825:web:a44234e072ce155b09d498",
    measurementId: "G-BQFXKLQ1L1"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault(); 
    let isValid = true;

    
    clearErrorMessages();

    
    const name = document.getElementById('name').value.trim();
    if (name === '') {
        showError('name-error', 'Name is required');
        isValid = false;
    }

    
    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
        showError('email-error', 'Email is required');
        isValid = false;
    } else if (!emailPattern.test(email)) {
        showError('email-error', 'Please enter a valid email');
        isValid = false;
    }

    
    const password = document.getElementById('password').value.trim();
    if (password === '') {
        showError('password-error', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('password-error', 'Password must be at least 6 characters long');
        isValid = false;
    }

   
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    if (confirmPassword === '') {
        showError('confirm-password-error', 'Please confirm your password');
        isValid = false;
    } else if (confirmPassword !== password) {
        showError('confirm-password-error', 'Passwords do not match');
        isValid = false;
    }

    const role = document.querySelector('input[name="role"]:checked');
    if (!role) {
        showError('role-error', 'Please select a role');
        isValid = false;
    }

    
    const terms = document.getElementById('terms').checked;
    if (!terms) {
        showError('terms-error', 'You must agree to the Terms & Conditions');
        isValid = false;
    }

    
    if (isValid) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                
                set(ref(database, 'users/' + user.uid), {
                    name: name,
                    email: email,
                    role: role.value
                }).then(() => {
                    
                    alert('Account created successfully! You can now log in.');
                    window.location.href = 's.html'; 
                }).catch((error) => {
                    console.error("Error storing user data:", error.message);
                    showError('signup-error', 'Error storing user data');
                });
            })
            .catch((error) => {
                console.error("Error signing up:", error.message);
                showError('signup-error', error.message);
            });
    }
});


function showError(id, message) {
    const element = document.getElementById(id);
    element.textContent = message;
    element.style.display = 'block';
}

function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
}
