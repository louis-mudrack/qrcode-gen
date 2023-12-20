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
            useSVG: true,
            correctLevel: QRCode.CorrectLevel.H,
        });
        this.addLogo();
    }

    clearQRCode() {
        this.containerElement.innerHTML = '';
    }

    addLogo() {
        if (!this.config.logo) return;

        const logoReader = new FileReader();
        logoReader.onload = (e) => {
            const logoDataURL = e.target.result;
            const image = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'image',
            );

            image.setAttributeNS(null, 'href', logoDataURL);
            image.setAttributeNS(null, 'width', '30%');
            image.setAttributeNS(null, 'height', '30%');
            image.setAttributeNS(null, 'x', 15.5);
            image.setAttributeNS(null, 'y', 15.5);
            image.setAttributeNS(null, 'preserveAspectRatio', 'xMidYMid meet');
            image.setAttributeNS(null, 'visibility', 'visible');

            this.containerElement.querySelector('svg').appendChild(image);
        };
        logoReader.readAsDataURL(this.config.logo);
    }

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        if (this.config.qrCode) {
            this.generate(this.getCurrentQRText());
        }
    }

    getCurrentQRText() {
        return this.config.qrCode?._oDrawing?._htOption?.text || '';
    }

    download(filename) {
        const svgElement = this.containerElement.querySelector('svg');
        if (!svgElement) return;
    
        const fileFormats = this.getFileFormats();
    
        if (fileFormats.length > 1) {
            const zip = new JSZip();
            const promises = [];
    
            // Add PDF to ZIP
            promises.push(
                this.addPDFToZip(svgElement, `${filename}.pdf`, zip)
            );
    
            // Add other file formats to ZIP
            fileFormats.forEach(({ type, extension }) => {
                if (type === 'image/svg+xml') {
                    const svgData = new XMLSerializer().serializeToString(svgElement);
                    zip.file(`${filename}.${extension}`, svgData);
                } else if (type === 'application/pdf') {
                    // Already added to promises
                } else {
                    promises.push(
                        this.addRasterImageToZip(svgElement, type, `${filename}.${extension}`, zip),
                    );
                }
            });
    
            Promise.all(promises).then(() => {
                zip.generateAsync({ type: 'blob' }).then((content) => {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(content);
                    downloadLink.download = `${filename}.zip`;
                    downloadLink.click();
                });
            }).catch((error) => {
                console.error('Error adding files to ZIP:', error);
            });
        } else if (fileFormats.length === 1) {
            const { type, extension } = fileFormats[0];
            if (type === 'application/pdf') {
                this.downloadPDF(svgElement, type, `${filename}.${extension}`);
            } else if (type === 'image/svg+xml') {
                this.downloadSVG(svgElement, `${filename}.${extension}`);
            } else {
                this.downloadRasterImage(svgElement, type, `${filename}.${extension}`);
            }
        }
    }
    

    addPDFToZip(svgElement, filename, zip) {
        return new Promise((resolve, reject) => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [this.config.width, this.config.height]
            });
    
            const canvas = document.createElement('canvas');
            canvas.width = this.config.width;
            canvas.height = this.config.height;
            const ctx = canvas.getContext('2d');
            const DOMURL = window.URL || window.webkitURL || window;
            const img = new Image();
            const svgBlob = new Blob(
                [new XMLSerializer().serializeToString(svgElement)],
                { type: 'image/svg+xml' }
            );
            const url = DOMURL.createObjectURL(svgBlob);
    
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                DOMURL.revokeObjectURL(url);
    
                const addLogoAndGeneratePDF = () => {
                    if (this.config.logo) {
                        const logoImage = new Image();
                        logoImage.onload = () => {
                            const logoSize = Math.min(this.config.width, this.config.height) * 0.3;
                            const logoX = (this.config.width - logoSize) / 2;
                            const logoY = (this.config.height - logoSize) / 2;
                            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
                            generatePDF();
                        };
                        logoImage.onerror = () => {
                            reject(new Error('Failed to load the logo image for PDF creation.'));
                        };
                        logoImage.src = URL.createObjectURL(this.config.logo);
                    } else {
                        generatePDF();
                    }
                };
    
                const generatePDF = () => {
                    canvas.toBlob((blob) => {
                        pdf.addImage(canvas, 'SVG', 0, 0, this.config.width, this.config.height);
                        const pdfBlob = pdf.output('blob');
                        zip.file(filename, pdfBlob);
                        resolve();
                    }, 'image/svg+xml');
                };
    
                addLogoAndGeneratePDF();
            };
    
            img.onerror = () => {
                reject(new Error('Failed to load the image for PDF creation.'));
                DOMURL.revokeObjectURL(url);
            };
    
            img.src = url;
        });
    }
    

    downloadPDF(svgElement, type, filename) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [this.config.width, this.config.height]
        });
    
        // Convert SVG element to a data URL
        const canvas = document.createElement('canvas');
        canvas.width = this.config.width;
        canvas.height = this.config.height;
        const ctx = canvas.getContext('2d');
        const DOMURL = window.URL || window.webkitURL || window;
        const img = new Image();
        const svgBlob = new Blob(
            [new XMLSerializer().serializeToString(svgElement)],
            { type: 'image/svg+xml' },
        );
        const url = DOMURL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(url);
            
            // If there is a logo, draw it onto the PDF
            if (this.config.logo) {
                const logoImage = new Image();
                logoImage.onload = () => {
                    const logoSize =
                    Math.min(this.config.width, this.config.height) *
                    0.3;
                    const logoX = (this.config.width - logoSize) / 2;
                    const logoY = (this.config.height - logoSize) / 2;
                    ctx.drawImage(
                        logoImage,
                        logoX,
                        logoY,
                        logoSize,
                        logoSize,
                        );
                    };
                    canvas.toBlob((blob) => {
                        pdf.addImage(canvas, 'SVG', 0, 0, this.config.width, this.config.height);
                        pdf.save(filename);
                        URL.revokeObjectURL(url);
                    }, type);
                } else {
                    canvas.toBlob((blob) => {
                    pdf.addImage(canvas, 'SVG', 0, 0, this.config.width, this.config.height);
                    pdf.save(filename);
                    URL.revokeObjectURL(url);
                }, type);
            }
        };
        img.onerror = () => {
            console.error('Failed to load the image for PDF creation.');
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }
    

    addRasterImageToZip(svgElement, type, filename, zip) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = this.config.width;
            canvas.height = this.config.height;
            const ctx = canvas.getContext('2d');
            const DOMURL = window.URL || window.webkitURL || window;
            const img = new Image();
            const svgBlob = new Blob(
                [new XMLSerializer().serializeToString(svgElement)],
                { type: 'image/svg+xml' },
            );
            const url = DOMURL.createObjectURL(svgBlob);

            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                DOMURL.revokeObjectURL(url);

                if (this.config.logo) {
                    const logoImage = new Image();
                    logoImage.onload = () => {
                        const logoSize =
                            Math.min(this.config.width, this.config.height) *
                            0.3;
                        const logoX = (this.config.width - logoSize) / 2;
                        const logoY = (this.config.height - logoSize) / 2;
                        ctx.drawImage(
                            logoImage,
                            logoX,
                            logoY,
                            logoSize,
                            logoSize,
                        );
                    };
                    canvas.toBlob((blob) => {
                        zip.file(filename, blob);
                        resolve();
                    }, type);
                } else {
                    canvas.toBlob((blob) => {
                        zip.file(filename, blob);
                        resolve();
                    }, type);
                }
                img.onerror = () => {
                    reject(
                        new Error('Failed to load the image onto the canvas.'),
                    );
                };
            };
            img.src = url;
        });
    }

    downloadSVG(svgElement, filename) {
        const serializer = new XMLSerializer();
        const svgBlob = new Blob([serializer.serializeToString(svgElement)], {
            type: 'image/svg+xml',
        });
        this.triggerDownload(filename, svgBlob);
    }

    downloadRasterImage(svgElement, type, filename) {
        const canvas = document.createElement('canvas');
        canvas.width = this.config.width;
        canvas.height = this.config.height;
        const ctx = canvas.getContext('2d');
        const DOMURL = window.URL || window.webkitURL || window;
        const img = new Image();
        const svgBlob = new Blob(
            [new XMLSerializer().serializeToString(svgElement)],
            { type: 'image/svg+xml' },
        );
        const url = DOMURL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(url);

            if (this.config.logo) {
                const logoImage = new Image();
                logoImage.onload = () => {
                    const logoSize =
                        Math.min(this.config.width, this.config.height) * 0.3;
                    const logoX = (this.config.width - logoSize) / 2;
                    const logoY = (this.config.height - logoSize) / 2;
                    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
                };

                canvas.toBlob((blob) => {
                    this.triggerDownload(filename, blob);
                }, type);
                logoImage.src = URL.createObjectURL(this.config.logo);
            } else {
                canvas.toBlob((blob) => {
                    this.triggerDownload(filename, blob);
                }, type);
            }
        };
        img.src = url;
    }

    getFileFormats() {
        const checkboxElements = document.querySelectorAll('.file-format-checkbox');
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
    

    triggerDownload(filename, content) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(content);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
