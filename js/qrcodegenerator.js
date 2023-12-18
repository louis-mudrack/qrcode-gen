class QRCodeGenerator {
    constructor(containerElement) {
        this.containerElement = containerElement;
        this.config = {
            mainColor: '#000000',
            backgroundColor: '#ffffff',
            width: 1000,
            height: 1000,
            logo: null,
            qrCode: null,
        };
    }

    generate(url) {
        this.clearQRCode();
        this.config.qrCode = new QRCode(this.containerElement, {
            text: url,
            width: this.config.width,
            height: this.config.height,
            colorDark: this.config.mainColor,
            colorLight: this.config.backgroundColor,
        });
        this.addLogo();
    }

    clearQRCode() {
        this.containerElement.innerHTML = '';
    }

    addLogo() {
        if (this.config.logo) {
            const qrCanvas = this.containerElement.querySelector('canvas');
            const qrContext = qrCanvas.getContext('2d');
            const logoImage = new Image();
            logoImage.src = URL.createObjectURL(this.config.logo);
            logoImage.onload = () => {
                const logoSize =
                    Math.min(this.config.width, this.config.height) * 0.2;
                const logoX = (this.config.width - logoSize) / 2;
                const logoY = (this.config.height - logoSize) / 2;
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

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        if (this.config.qrCode) {
            this.generate(this.getCurrentQRText());
        }
    }

    getCurrentQRText() {
        // Accessing the text in a safer way
        return this.config.qrCode?._oDrawing?._htOption?.text || '';
    }

    download(filename) {
        const qrCanvas = this.containerElement.querySelector('canvas');
        if (!qrCanvas) return;

        const zip = new JSZip();
        const fileFormats = this.getFileFormats();

        fileFormats.forEach(({ type, extension }) => {
            const imageData = this.getCanvasData(qrCanvas, type);
            zip.file(`qrcode.${extension}`, imageData, { base64: true });
        });

        zip.generateAsync({ type: 'blob' }).then((content) => {
            this.triggerDownload(`${filename}.zip`, content);
        });
    }

    getFileFormats() {
        const checkboxElements = document.querySelectorAll(
            '.file-format-checkbox',
        );
        return Array.from(checkboxElements)
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => {
                const fileType = checkbox.value;
                return {
                    type: fileType === 'jpg' ? 'image/jpeg' : 'image/png',
                    extension: fileType === 'jpg' ? 'jpg' : 'png',
                };
            });
    }

    getCanvasData(canvas, type) {
        return canvas.toDataURL(type).split(',')[1];
    }

    getCanvasDataWithLogo(canvas, type) {
        const logoCanvas = document.createElement('canvas');
        logoCanvas.width = canvas.width;
        logoCanvas.height = canvas.height;
        const context = logoCanvas.getContext('2d');
        context.drawImage(canvas, 0, 0);
        this.drawLogoOnCanvas(context, canvas.width, canvas.height);
        return logoCanvas.toDataURL(type).split(',')[1];
    }

    drawLogoOnCanvas(context, width, height) {
        const logoImage = new Image();
        logoImage.src = URL.createObjectURL(this.config.logo);
        logoImage.onload = () => {
            const logoSize = Math.min(width, height) * 0.2;
            const logoX = (width - logoSize) / 2;
            const logoY = (height - logoSize) / 2;
            context.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        };
    }

    triggerDownload(filename, content) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(content);
        link.click();
    }
}
