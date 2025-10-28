import React, { useState } from "react";
import { extractTextFromPDF } from "../api/pdfToText";
import { extractTextFromDocx } from "../api/docxToText";
import { extractEntities } from "../api/extractEntities";

export default function FileNER() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    let text = "";

    try {
      if (file.name.endsWith(".pdf")) text = await extractTextFromPDF(file);
      else if (file.name.endsWith(".docx")) text = await extractTextFromDocx(file);
      else {
        alert("❌ Unsupported file type");
        setLoading(false);
        return;
      }

      const entities = await extractEntities(text);
      setResult(entities);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📄 Upload a Resume to Extract Info</h2>
      <input type="file" accept=".pdf,.docx" onChange={handleFile} />
      {loading && <p>⏳ Processing...</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
