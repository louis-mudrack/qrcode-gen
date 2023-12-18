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
            const checkboxElements = document.querySelectorAll('.file-format-checkbox');
            const zip = new JSZip();
    
            checkboxElements.forEach((checkboxElement) => {
                if (checkboxElement.checked) {
                    const fileType = checkboxElement.value;
                    let imageType = 'image/png';
                    let fileExtension = 'png';
    
                    if (fileType === 'pdf') {
                        imageType = 'application/pdf';
                        fileExtension = 'pdf';
                    } else if (fileType === 'jpg') {
                        imageType = 'image/jpeg';
                        fileExtension = 'jpg';
                    } else if (fileType === 'svg') {
                        imageType = 'image/svg+xml';
                        fileExtension = 'svg';
                    }
    
                    const image = qrCanvas
                        .toDataURL(imageType)
                        .replace(imageType, 'image/octet-stream');
                    const imageData = image.split(',')[1];
                    zip.file(`qrcode.${fileExtension}`, imageData, { base64: true });
                }
            });
    
            zip.generateAsync({ type: 'blob' }).then((content) => {
                const link = document.createElement('a');
                link.download = `${filename}.zip`;
                link.href = URL.createObjectURL(content);
                link.click();
            });
        }
    }    
}
