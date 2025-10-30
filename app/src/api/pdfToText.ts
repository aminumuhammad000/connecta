import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure PDF.js worker (ES module worker for Vite + pdfjs-dist v5)
const pdfWorker = new Worker(pdfWorkerUrl, { type: 'module' });
(pdfjsLib as any).GlobalWorkerOptions.workerPort = pdfWorker as any;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }

  return text;
}
