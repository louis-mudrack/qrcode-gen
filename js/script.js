// This function is called when the DOM content is fully loaded.
document.addEventListener('DOMContentLoaded', function () {
    const qrcodeContainer = document.getElementById('qrcode');
    const qrCodeGenerator = new QRCodeGenerator(qrcodeContainer);

    initializeQRCode(qrCodeGenerator);
    setupGenerateButton(qrCodeGenerator);
    setupDownloadButton(qrCodeGenerator);
});

// Initializes the QR code with the URL of the current active tab.
function initializeQRCode(qrCodeGenerator) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        qrCodeGenerator.generate(activeTab.url);
    });
}

// Sets up the event listener for the 'Generate' button.
function setupGenerateButton(qrCodeGenerator) {
    const generateButton = document.getElementById('generate');
    generateButton.addEventListener('click', function () {
        const logoInput = document.getElementById('logo');
        const logo = logoInput.files[0]; // Get the first file if a logo was uploaded.

        // Retrieve color and size values from the form inputs.
        const mainColor = document.getElementById('mainColor').value;
        const backgroundColor = document.getElementById('backgroundColor').value;
        const size = parseInt(document.getElementById('size').value, 10); // Assuming a square QR code for simplicity.

        // Update the QR code generator configuration with the new values.
        qrCodeGenerator.updateConfig({
            mainColor,
            backgroundColor,
            size,
            logo,
        });
    });
}

// Sets up the event listener for the 'Download' button.
function setupDownloadButton(qrCodeGenerator) {
    const downloadButton = document.getElementById('download');
    downloadButton.addEventListener('click', function () {
        qrCodeGenerator.download('qrcodes');
    });
}
