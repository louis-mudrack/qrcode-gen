class QRCodeGenerator {
    constructor(containerElement) {
        this.containerElement = containerElement;
        this.mainColor = '#000000';
        this.backgroundColor = '#ffffff';
        this.standardWidth = 128;
        this.standardHeight = 128;
        this.qrCode = null;
    }

    generate(url) {
        // Clear the previous QR code
        this.containerElement.innerHTML = '';
        // Generate the new QR code
        this.qrCode = new QRCode(this.containerElement, {
            text: url,
            width: this.standardWidth,
            height: this.standardHeight,
            colorDark: this.mainColor,
            colorLight: this.backgroundColor,
        });
    }

    updateColors(mainColor, backgroundColor) {
        this.mainColor = mainColor;
        this.backgroundColor = backgroundColor;
        if (this.qrCode) {
            this.generate(this.qrCode._oDrawing._htOption.text);
        }
    }

    updateDimensions(width, height) {
        this.standardWidth = width;
        this.standardHeight = height;
        if (this.qrCode) {
            this.generate(this.qrCode._oDrawing._htOption.text);
        }
    }

    download(filename) {
        const qrCanvas = this.containerElement.querySelector('canvas');
        if (qrCanvas) {
            const image = qrCanvas
                .toDataURL('image/png')
                .replace('image/png', 'image/octet-stream');
            const link = document.createElement('a');
            link.download = filename;
            link.href = image;
            link.click();
        }
    }
}
