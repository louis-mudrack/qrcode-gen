document.addEventListener('DOMContentLoaded', function () {
    const qrcodeContainer = document.getElementById('qrcode');
    const qrCodeGenerator = new QRCodeGenerator(qrcodeContainer);

    initializeQRCode(qrCodeGenerator);
    setupGenerateButton(qrCodeGenerator);
    setupDownloadButton(qrCodeGenerator);
});

function initializeQRCode(qrCodeGenerator) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length === 0) {
            console.error('No active tab found.');
            return;
        }
        const activeTab = tabs[0];
        qrCodeGenerator.generate(activeTab.url);
    });
}

function setupGenerateButton(qrCodeGenerator) {
    const generateButton = document.getElementById('generate');
    generateButton.addEventListener('click', function () {
        const logoInput = document.getElementById('logo');
        const logo = logoInput.files[0];
        qrCodeGenerator.updateConfig({ logo });

        const mainColor = document.getElementById('mainColor').value;
        const backgroundColor =
            document.getElementById('backgroundColor').value;
        qrCodeGenerator.updateConfig({ mainColor, backgroundColor });

        const width = parseInt(document.getElementById('width').value, 10);
        const height = parseInt(document.getElementById('height').value, 10);
        qrCodeGenerator.updateConfig({ width, height });
    });
}

function setupDownloadButton(qrCodeGenerator) {
    const downloadButton = document.getElementById('download');
    downloadButton.addEventListener('click', function () {
        qrCodeGenerator.download('qrcodes');
    });
}
