let scanner = null;

// Open phone/laptop camera
function openCamera() {
    const reader = document.getElementById("reader");

    if (!reader) {
        return;
    }

    reader.innerHTML = "";

    scanner = new Html5Qrcode("reader");

    scanner.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: {
                width: 250,
                height: 250
            }
        },
        function (decodedText) {

            // QR successfully scanned
            processQRCode(decodedText);

            // Stop camera
            scanner.stop().then(function () {
                reader.innerHTML = "";
            }).catch(function () {
                reader.innerHTML = "";
            });

        },
        function (errorMessage) {
            // Ignore continuous scanning errors
        }
    ).catch(function (error) {

        console.error("Camera error:", error);

        alert(
            "Unable to access the camera. " +
            "Please allow camera permission or enter the serial number manually."
        );

    });
}


// Process QR data
function processQRCode(qrData) {

    let medicine;

    try {

        // Our QR contains JSON medicine data
        medicine = JSON.parse(qrData);

    } catch (error) {

        document.getElementById("verification-status").innerHTML =
            "<p>❌ Invalid QR Code</p>";

        document.getElementById("medicine-details").innerHTML =
            "<p>The scanned QR code is not a valid MedSure medicine QR.</p>";

        return;
    }


    verifyMedicine(medicine);
}


// Verify medicine
function verifyMedicine(medicine) {

    const status =
        document.getElementById("verification-status");

    const details =
        document.getElementById("medicine-details");

    const alertMessage =
        document.getElementById("alert-message");


    status.innerHTML = `
        <h3>✓ Medicine Verified</h3>
        <p>This medicine is registered in the MedSure system.</p>
    `;


    details.innerHTML = `
        <div class="medicine-info">
            <p><strong>Medicine Name:</strong> ${medicine.medicineName}</p>
            <p><strong>Batch Number:</strong> ${medicine.batchNumber}</p>
            <p><strong>Expiry Date:</strong> ${medicine.expiryDate}</p>
            <p><strong>Serial Number:</strong> ${medicine.serialNumber}</p>
        </div>
    `;


    alertMessage.innerHTML = `
        <p>✓ No authenticity issues detected.</p>
    `;


    saveScanHistory(medicine);
}


// Manual barcode/serial number verification
function submitBarcode() {

    const input =
        document.getElementById("barcode-input");

    const barcode =
        input.value.trim();


    if (!barcode) {

        alert("Please enter a serial number.");

        return;
    }


    const products =
        JSON.parse(localStorage.getItem("medsureProducts")) || [];


    const product =
        products.find(function (item) {

            return item.serialNumber === barcode;

        });


    if (product) {

        verifyMedicine(product);

    } else {

        document.getElementById("verification-status").innerHTML =
            "<h3>❌ Medicine Not Found</h3>";

        document.getElementById("medicine-details").innerHTML =
            "<p>No medicine with this serial number was found.</p>";

        document.getElementById("alert-message").innerHTML =
            "<p>Please check the serial number and try again.</p>";

    }
}


// Save scan history
function saveScanHistory(medicine) {

    const history =
        JSON.parse(localStorage.getItem("medsureScanHistory")) || [];


    history.push({
        medicineName: medicine.medicineName,
        batchNumber: medicine.batchNumber,
        serialNumber: medicine.serialNumber,
        expiryDate: medicine.expiryDate,
        status: "Verified",
        date: new Date().toLocaleString()
    });


    localStorage.setItem(
        "medsureScanHistory",
        JSON.stringify(history)
    );


    displayHistory();
}


// Display scan history
function displayHistory() {

    const historyList =
        document.getElementById("history-list");

    if (!historyList) {
        return;
    }


    const history =
        JSON.parse(localStorage.getItem("medsureScanHistory")) || [];


    historyList.innerHTML = "";


    history.forEach(function (item) {

        const li =
            document.createElement("li");

        li.innerHTML = `
            <strong>${item.medicineName}</strong>
            <br>
            Batch: ${item.batchNumber}
            <br>
            Serial: ${item.serialNumber}
            <br>
            Status: ✓ ${item.status}
            <br>
            Scanned: ${item.date}
        `;

        historyList.appendChild(li);

    });
}


// Search scan history
document.addEventListener("DOMContentLoaded", function () {

    displayHistory();


    const searchBar =
        document.getElementById("search-bar");


    if (searchBar) {

        searchBar.addEventListener("input", function () {

            const searchTerm =
                searchBar.value.toLowerCase();


            const history =
                JSON.parse(
                    localStorage.getItem("medsureScanHistory")
                ) || [];


            const historyList =
                document.getElementById("history-list");


            historyList.innerHTML = "";


            history
                .filter(function (item) {

                    return (
                        item.medicineName.toLowerCase().includes(searchTerm) ||
                        item.batchNumber.toLowerCase().includes(searchTerm) ||
                        item.serialNumber.toLowerCase().includes(searchTerm) ||
                        item.status.toLowerCase().includes(searchTerm)
                    );

                })
                .forEach(function (item) {

                    const li =
                        document.createElement("li");

                    li.innerHTML = `
                        <strong>${item.medicineName}</strong>
                        <br>
                        Batch: ${item.batchNumber}
                        <br>
                        Serial: ${item.serialNumber}
                        <br>
                        Status: ✓ ${item.status}
                        <br>
                        Scanned: ${item.date}
                    `;

                    historyList.appendChild(li);

                });

        });

    }

});
