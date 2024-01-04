// This function is called when the DOM content is fully loaded.
document.addEventListener('DOMContentLoaded', function () {
    const qrcodeContainer = document.getElementById('qrcode');
    const qrCodeGenerator = new QRCodeGenerator(qrcodeContainer);

    initializeQRCode(qrCodeGenerator);
    setupGenerateButton(qrCodeGenerator);
    setupDownloadButton(qrCodeGenerator);
});

// Initializes the QR code with the URL from the input field or the current active tab.
function initializeQRCode(qrCodeGenerator) {
    const urlInput = document.getElementById('url');
    if (urlInput.value) {
        // If there's a URL in the input field, use it to generate the QR code.
        qrCodeGenerator.generate(urlInput.value);
    } else {
        // If the input field is empty, use the URL of the current active tab.
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            qrCodeGenerator.generate(activeTab.url);
            urlInput.value = activeTab.url; // Set the input field to the current tab's URL.
        });
    }
}

// Sets up the event listener for the 'Generate' button.
function setupGenerateButton(qrCodeGenerator) {
    const generateButton = document.getElementById('generate');
    generateButton.addEventListener('click', function () {
        const urlInput = document.getElementById('url');
        const logoInput = document.getElementById('logo');
        const logo = logoInput.files[0]; // Get the first file if a logo was uploaded.

        // Retrieve color, size, and URL values from the form inputs.
        const mainColor = document.getElementById('mainColor').value;
        const backgroundColor = document.getElementById('backgroundColor').value;
        const size = parseInt(document.getElementById('size').value, 10); // Assuming a square QR code for simplicity.
        const url = urlInput.value; // Use the URL from the input field.

        // Update the QR code generator configuration with the new values.
        qrCodeGenerator.updateConfig({
            mainColor,
            backgroundColor,
            size,
            logo,
        });

        // Generate the QR code with the new URL.
        qrCodeGenerator.generate(url);
    });
}

// Sets up the event listener for the 'Download' button.
function setupDownloadButton(qrCodeGenerator) {
    const downloadButton = document.getElementById('download');
    downloadButton.addEventListener('click', function () {
        qrCodeGenerator.download('qrcodes');
    });
}
