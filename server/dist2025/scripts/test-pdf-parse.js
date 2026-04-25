import { createRequire } from 'module';
const require = createRequire(import.meta.url);
async function test() {
    try {
        const pdfLib = require('pdf-parse');
        console.log('pdfLib keys:', Object.keys(pdfLib));
        console.log('typeof pdfLib:', typeof pdfLib);
        let parseFunc = pdfLib;
        if (typeof parseFunc !== 'function') {
            if (typeof pdfLib.default === 'function')
                parseFunc = pdfLib.default;
            else if (typeof pdfLib.PDFParse === 'function')
                parseFunc = pdfLib.PDFParse;
        }
        console.log('Selected function:', typeof parseFunc);
        if (typeof parseFunc === 'function') {
            try {
                // pdf-parse expects a buffer. If we pass a string buffer it might fail or return empty text, 
                // but at least it shouldn't throw "is not a function".
                const buffer = Buffer.from('Dummy PDF content');
                const data = await parseFunc(buffer);
                console.log('Parse success! Data:', data);
            }
            catch (err) {
                console.log('Parse threw error (expected for dummy content):', err.message);
                if (err.message.includes('not a function')) {
                    console.error('CRITICAL: It is NOT a function!');
                }
            }
        }
        else {
            console.error('Could not find a function in pdf-parse export!');
        }
    }
    catch (e) {
        console.error('Require failed:', e);
    }
}
test();
