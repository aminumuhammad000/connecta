
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
    const pdf = require('pdf-parse');
    console.log('typeof pdf.PDFParse:', typeof pdf.PDFParse);
    // try invoking it if function
    // const res = await pdf.PDFParse(Buffer.from('test'));
} catch (e) {
    console.error(e);
}
