class QRCodeGenerator {
    // Constructor initializes the QR code generator with a target container element.
    constructor(containerElement) {
        this.containerElement = containerElement;
        this.config = {
            mainColor: '#000000',
            backgroundColor: '#ffffff',
            size: 1000,
            logo: null,
            qrCode: null,
        };
    }

    // Generates a QR code with the provided URL and updates the container element.
    generate(url) {
        this.clearQRCode();
        this.config.qrCode = new QRCode(this.containerElement, {
            text: url,
            width: this.config.size,
            height: this.config.size,
            colorDark: this.config.mainColor,
            colorLight: this.config.backgroundColor,
            useSVG: true,
            correctLevel: QRCode.CorrectLevel.H,
        });
        this.addLogo();
    }

    // Clears the QR code from the container element.
    clearQRCode() {
        this.containerElement.innerHTML = '';
    }

    // Adds a logo to the center of the QR code if a logo is configured.
    addLogo() {
        if (!this.config.logo) return;

        const logoSize = this.config.size * 0.3;
        const logoPosition = (this.config.size - logoSize) / 2;
        const logoReader = new FileReader();

        logoReader.onload = (e) => {
            const logoDataURL = e.target.result;
            const image = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'image',
            );
            image.setAttributeNS(null, 'href', logoDataURL);
            image.setAttributeNS(null, 'width', logoSize);
            image.setAttributeNS(null, 'height', logoSize);
            image.setAttributeNS(null, 'x', logoPosition);
            image.setAttributeNS(null, 'y', logoPosition);
            image.setAttributeNS(null, 'preserveAspectRatio', 'xMidYMid meet');
            image.setAttributeNS(null, 'visibility', 'visible');

            this.containerElement.querySelector('svg').appendChild(image);
        };

        logoReader.readAsDataURL(this.config.logo);
    }

    // Updates the configuration of the QR code generator and regenerates the QR code if necessary.
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        if (this.config.qrCode) {
            this.generate(this.getCurrentQRText());
        }
    }

    // Retrieves the current QR code text.
    getCurrentQRText() {
        return this.config.qrCode?._oDrawing?._htOption?.text || '';
    }

    // Initiates the download process for the QR code in various formats.
    download(filename) {
        const svgElement = this.containerElement.querySelector('svg');
        if (!svgElement) return;

        const fileFormats = this.getSelectedFileFormats();

        if (fileFormats.length > 1) {
            this.downloadMultipleFormats(svgElement, filename, fileFormats);
        } else if (fileFormats.length === 1) {
            this.downloadSingleFormat(svgElement, filename, fileFormats[0]);
        }
    }

    // Downloads multiple file formats by creating a ZIP file.
    downloadMultipleFormats(svgElement, filename, fileFormats) {
        const zip = new JSZip();
        const promises = fileFormats.map((format) =>
            this.addFileToZip(
                svgElement,
                format,
                `${filename}.${format.extension}`,
                zip,
            ),
        );

        Promise.all(promises)
            .then(() => {
                zip.generateAsync({ type: 'blob' }).then((content) => {
                    this.triggerDownload(`${filename}.zip`, content);
                });
            })
            .catch((error) => {
                console.error('Error adding files to ZIP:', error);
            });
    }

    // Downloads a single file format.
    downloadSingleFormat(svgElement, filename, format) {
        if (format.type === 'application/pdf') {
            this.downloadPDF(svgElement, filename);
        } else if (format.type === 'image/svg+xml') {
            this.downloadSVG(svgElement, filename);
        } else {
            this.downloadRasterImage(svgElement, format.type, filename);
        }
    }

    // Adds a file to the ZIP archive.
    addFileToZip(svgElement, format, filename, zip) {
        if (format.type === 'image/svg+xml') {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            zip.file(filename, svgData);
            return Promise.resolve();
        } else if (format.type === 'application/pdf') {
            return this.addPDFToZip(svgElement, filename, zip);
        } else {
            return this.addRasterImageToZip(
                svgElement,
                format.type,
                filename,
                zip,
            );
        }
    }

    // Adds a PDF file to the ZIP archive.
    addPDFToZip(svgElement, filename, zip) {
        return new Promise((resolve, reject) => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [this.config.size, this.config.size],
            });

            this.svgElementToCanvas(
                svgElement,
                this.config.size,
                this.config.size,
            )
                .then((canvas) => {
                    pdf.addImage(
                        canvas.toDataURL('image/png'),
                        'PNG',
                        0,
                        0,
                        this.config.size,
                        this.config.size,
                    );
                    const pdfBlob = pdf.output('blob');
                    zip.file(filename, pdfBlob);
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    // Adds a raster image file (PNG, JPG, etc.) to the ZIP archive.
    addRasterImageToZip(svgElement, type, filename, zip) {
        return new Promise((resolve, reject) => {
            this.svgElementToCanvas(
                svgElement,
                this.config.size,
                this.config.size,
            )
                .then((canvas) => {
                    canvas.toBlob((blob) => {
                        zip.file(filename, blob);
                        resolve();
                    }, type);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    // Downloads the QR code as a PDF file.
    downloadPDF(svgElement, filename) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [this.config.size, this.config.size],
        });

        this.svgElementToCanvas(
            svgElement,
            this.config.size,
            this.config.size,
        ).then((canvas) => {
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                0,
                0,
                this.config.size,
                this.config.size,
            );
            pdf.save(filename);
        });
    }

    // Downloads the QR code as an SVG file.
    downloadSVG(svgElement, filename) {
        const serializer = new XMLSerializer();
        const svgBlob = new Blob([serializer.serializeToString(svgElement)], {
            type: 'image/svg+xml',
        });
        this.triggerDownload(filename, svgBlob);
    }

    // Downloads the QR code as a raster image (PNG, JPG, etc.).
    downloadRasterImage(svgElement, type, filename) {
        this.svgElementToCanvas(
            svgElement,
            this.config.size,
            this.config.size,
        ).then((canvas) => {
            canvas.toBlob((blob) => {
                this.triggerDownload(filename, blob);
            }, type);
        });
    }

    // Retrieves the selected file formats from the UI.
    getSelectedFileFormats() {
        const checkboxElements = document.querySelectorAll(
            '.file-format-checkbox',
        );
        return Array.from(checkboxElements)
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => {
                const fileType = checkbox.value;
                let type;
                let extension;

                switch (fileType) {
                    case 'jpg':
                        type = 'image/jpeg';
                        extension = 'jpg';
                        break;
                    case 'png':
                        type = 'image/png';
                        extension = 'png';
                        break;
                    case 'svg':
                        type = 'image/svg+xml';
                        extension = 'svg';
                        break;
                    case 'pdf':
                        type = 'application/pdf';
                        extension = 'pdf';
                        break;
                    default:
                        throw new Error('Unsupported file type selected.');
                }

                return { type, extension };
            });
    }

    // Helper method to convert an SVG element to a canvas
    svgElementToCanvas(svgElement, width, height) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            const data = new XMLSerializer().serializeToString(svgElement);
            const DOMURL = window.URL || window.webkitURL || window;
            const img = new Image();

            const svgBlob = new Blob([data], {
                type: 'image/svg+xml;charset=utf-8',
            });
            const url = DOMURL.createObjectURL(svgBlob);

            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                DOMURL.revokeObjectURL(url);
                resolve(canvas);
            };

            img.onerror = (e) => {
                reject(new Error('Error loading SVG'));
                DOMURL.revokeObjectURL(url);
            };

            img.src = url;
        });
    }

    // Triggers the download of a file with the given filename and content.
    triggerDownload(filename, content) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(content);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
