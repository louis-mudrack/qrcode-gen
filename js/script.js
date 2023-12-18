document.addEventListener('DOMContentLoaded', function () {
    const qrcodeContainer = document.getElementById('qrcode');
    const qrCodeGenerator = new QRCodeGenerator(qrcodeContainer);
    let currentTabUrl = '';

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        currentTabUrl = tab.url;
        qrCodeGenerator.generate(currentTabUrl);
    });

    document.getElementById('generate').addEventListener('click', function () {
        const mainColor = document.getElementById('main').value;
        const backgroundColor = document.getElementById('background').value;
        qrCodeGenerator.updateColors(mainColor, backgroundColor);

        const width = document.getElementById('width').value;
        const height = document.getElementById('height').value;
        qrCodeGenerator.updateDimensions(width, height);
    });

    document.getElementById('download').addEventListener('click', function () {
        qrCodeGenerator.download('qrcodes');
    });
});
