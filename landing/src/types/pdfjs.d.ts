declare module 'pdfjs-dist/legacy/build/pdf' {
  const pdfjs: any;
  export = pdfjs;
}

declare module 'pdfjs-dist/build/pdf.worker.min.js?url' {
  const url: string;
  export default url;
}

declare module 'pdfjs-dist/build/pdf.worker.entry' {
  const entry: any;
  export default entry;
}
