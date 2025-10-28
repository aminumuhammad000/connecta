// Use the legacy build of pdfjs for better browser compatibility under Vite.
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
// Import worker via Vite so the final worker path is resolved correctly.
// The `?url` suffix makes the worker file available as a URL string at runtime.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Configure the workerSrc to the URL provided by the bundler.
(pdfjsLib as any).GlobalWorkerOptions = (pdfjsLib as any).GlobalWorkerOptions || {};
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

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
