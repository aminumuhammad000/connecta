const pdfLib = require('pdf-parse');
console.log('Keys:', Object.keys(pdfLib));
const PDFParse = pdfLib.PDFParse;
console.log('PDFParse type:', typeof PDFParse);

// Mock buffer (empty or minimal valid PDF header if needed, but lets see if constructor works)
try {
    const parser = new PDFParse({ data: Buffer.from('%PDF-1.4\n...') });
    console.log('Parser instance created');
    console.log('Parser methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
} catch (e) {
    console.error('Constructor error:', e.message);
}
