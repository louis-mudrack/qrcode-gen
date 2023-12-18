class QRCodeGenerator {
    constructor(containerElement) {
        this.containerElement = containerElement;
        this.mainColor = '#000000';
        this.backgroundColor = '#ffffff';
        this.standardWidth = 1000;
        this.standardHeight = 1000;
        this.logo = null;
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
        if (this.logo) {
            const qrCanvas = this.containerElement.querySelector('canvas');
            const qrContext = qrCanvas.getContext('2d');
            const logoImage = new Image();
            logoImage.src = URL.createObjectURL(this.logo);
            logoImage.onload = () => {
                const logoSize =
                    Math.min(this.standardWidth, this.standardHeight) * 0.2;
                const logoX = (this.standardWidth - logoSize) / 2;
                const logoY = (this.standardHeight - logoSize) / 2;
                qrContext.drawImage(
                    logoImage,
                    logoX,
                    logoY,
                    logoSize,
                    logoSize,
                );
            };
        }
    }

    updateLogo(logo) {
        this.logo = logo;
        if (this.qrCode) {
            this.generate(this.qrCode._oDrawing._htOption.text);
        }
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
            const checkboxElements = document.querySelectorAll(
                '.file-format-checkbox',
            );
            const zip = new JSZip();

            checkboxElements.forEach((checkboxElement) => {
                if (checkboxElement.checked) {
                    const fileType = checkboxElement.value;
                    let imageType = 'image/png';
                    let fileExtension = 'png';

                    if (fileType === 'jpg') {
                        imageType = 'image/jpeg';
                        fileExtension = 'jpg';
                    }

                    const image = qrCanvas.toDataURL(imageType);
                    const imageData = image.split(',')[1];
                    zip.file(`qrcode.${fileExtension}`, imageData, {
                        base64: true,
                    });

                    if (this.logo) {
                        const logoImage = new Image();
                        logoImage.src = URL.createObjectURL(this.logo);
                        logoImage.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = qrCanvas.width;
                            canvas.height = qrCanvas.height;
                            const context = canvas.getContext('2d');
                            context.drawImage(qrCanvas, 0, 0);
                            const logoSize =
                                Math.min(qrCanvas.width, qrCanvas.height) * 0.2;
                            const logoX = (qrCanvas.width - logoSize) / 2;
                            const logoY = (qrCanvas.height - logoSize) / 2;
                            context.drawImage(
                                logoImage,
                                logoX,
                                logoY,
                                logoSize,
                                logoSize,
                            );
                            const logoImageData = canvas
                                .toDataURL(imageType)
                                .split(',')[1];
                            zip.file(
                                `qrcode_with_logo.${fileExtension}`,
                                logoImageData,
                                { base64: true },
                            );
                        };
                    }
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
