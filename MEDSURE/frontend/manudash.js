// Generate QR Code
function generateBarcode() {

    const medicineName =
        document.getElementById("medicine-name").value.trim();

    const batchNumber =
        document.getElementById("batch-number").value.trim();

    const expiryDate =
        document.getElementById("expiry-date").value;

    const serialNumber =
        document.getElementById("serial-number").value.trim();


    // Check that all fields are filled
    if (!medicineName || !batchNumber || !expiryDate || !serialNumber) {
        alert("Please fill in all medicine details before generating the QR code.");
        return;
    }


    // Remove previous QR code
    const barcodeArea =
        document.getElementById("barcode-area");

    barcodeArea.innerHTML = "";


    // Data stored inside the QR code
    const qrData = JSON.stringify({
        medicineName: medicineName,
        batchNumber: batchNumber,
        expiryDate: expiryDate,
        serialNumber: serialNumber
    });


    // Generate QR code
    new QRCode(barcodeArea, {
        text: qrData,
        width: 200,
        height: 200
    });


    // Add information below QR
    const message = document.createElement("p");

    message.textContent =
        "QR code generated successfully.";

    barcodeArea.appendChild(message);


    // Save product information for the demo
    saveProduct({
        medicineName: medicineName,
        batchNumber: batchNumber,
        expiryDate: expiryDate,
        serialNumber: serialNumber,
        qrData: qrData
    });
}


// Save product using browser localStorage
function saveProduct(product) {

    let products =
        JSON.parse(localStorage.getItem("medsureProducts")) || [];

    products.push(product);

    localStorage.setItem(
        "medsureProducts",
        JSON.stringify(products)
    );

    displayProducts();
}


// Display uploaded products
function displayProducts() {

    const productList =
        document.getElementById("product-list");

    if (!productList) {
        return;
    }

    productList.innerHTML = "";

    const products =
        JSON.parse(localStorage.getItem("medsureProducts")) || [];


    products.forEach(function (product) {

        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${product.medicineName}</strong>
            <br>
            Batch: ${product.batchNumber}
            <br>
            Expiry: ${product.expiryDate}
            <br>
            Serial: ${product.serialNumber}
        `;

        productList.appendChild(li);

    });
}


// Search products
document.addEventListener("DOMContentLoaded", function () {

    displayProducts();

    const searchBar =
        document.getElementById("search-bar");

    if (searchBar) {

        searchBar.addEventListener("input", function () {

            const searchTerm =
                searchBar.value.toLowerCase();

            const products =
                JSON.parse(localStorage.getItem("medsureProducts")) || [];

            const productList =
                document.getElementById("product-list");

            productList.innerHTML = "";


            products
                .filter(function (product) {

                    return (
                        product.medicineName.toLowerCase().includes(searchTerm) ||
                        product.batchNumber.toLowerCase().includes(searchTerm) ||
                        product.serialNumber.toLowerCase().includes(searchTerm) ||
                        product.expiryDate.includes(searchTerm)
                    );

                })
                .forEach(function (product) {

                    const li = document.createElement("li");

                    li.innerHTML = `
                        <strong>${product.medicineName}</strong>
                        <br>
                        Batch: ${product.batchNumber}
                        <br>
                        Expiry: ${product.expiryDate}
                        <br>
                        Serial: ${product.serialNumber}
                    `;

                    productList.appendChild(li);

                });

        });

    }

});


// Upload button
document.addEventListener("DOMContentLoaded", function () {

    const uploadForm =
        document.getElementById("upload-form");

    if (uploadForm) {

        uploadForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const medicineName =
                document.getElementById("medicine-name").value.trim();

            const batchNumber =
                document.getElementById("batch-number").value.trim();

            const expiryDate =
                document.getElementById("expiry-date").value;

            const serialNumber =
                document.getElementById("serial-number").value.trim();


            if (!medicineName || !batchNumber || !expiryDate || !serialNumber) {

                alert("Please fill in all fields.");

                return;
            }


            saveProduct({
                medicineName: medicineName,
                batchNumber: batchNumber,
                expiryDate: expiryDate,
                serialNumber: serialNumber
            });


            alert("Medicine uploaded successfully.");

        });

    }

});
