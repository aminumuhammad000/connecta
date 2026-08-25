import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface ImportWorkersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportWorkersModal: React.FC<ImportWorkersModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.map((row: any) => ({
          name: row['Name'] || row['fullName'] || row['name'] || '',
          email: row['Email'] || row['email'] || '',
          phone: row['Phone'] || row['phone'] || '',
          role: row['Role'] || row['role'] || row['Job Title'] || '',
          paymentType: row['Payment Type'] || row['paymentType'] || 'monthly',
          paymentAmount: Number(row['Payment Amount'] || row['paymentAmount'] || row['salary'] || 0),
          employmentType: row['Employment Type'] || row['employmentType'] || 'contract',
          startDate: row['Start Date'] || row['startDate'] || '',
        })).filter((r: any) => r.name || r.email);

        setParsedData(rows);
        showToast(`Parsed ${rows.length} worker rows from file.`, 'info');
      },
      error: () => {
        showToast('Failed to parse CSV file', 'error');
      },
    });
  };

  const downloadSampleCSV = () => {
    const sample = `Name,Email,Phone,Role,Payment Type,Payment Amount,Employment Type,Start Date\nMusa Ibrahim,musa@example.com,+2348012345678,Site Electrician,monthly,150000,contract,2026-09-01\nGrace Okafor,grace@example.com,+2348023456789,Structural Engineer,monthly,250000,full_time,2026-09-01`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'connecta_workforce_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      showToast('No valid worker rows to import', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await workforceAPI.bulkImportWorkers(parsedData);
      if (res.success) {
        showToast(res.message || 'Workers imported successfully!', 'success');
        if (onSuccess) onSuccess();
        onClose();
        setParsedData([]);
        setFilename('');
      } else {
        showToast(res.message || 'Import failed', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to import workers', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const validRows = parsedData.filter((r) => r.name && r.email && r.role);
  const invalidRows = parsedData.length - validRows.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 border border-gray-200 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Bulk Import Workers (CSV)</h2>
              <p className="text-xs text-gray-500">Upload your CSV spreadsheet to add multiple workers at once.</p>
            </div>
          </div>

          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample Template</span>
          </button>
        </div>

        {/* Upload Zone */}
        {parsedData.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer my-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-gray-900">Click to upload CSV spreadsheet</h3>
            <p className="text-xs text-gray-500 mt-1">Supports standard CSV files with Name, Email, Phone, Role, Salary columns.</p>
          </div>
        ) : (
          <div className="space-y-4 my-4">
            <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <span>{filename}</span>
              </div>
              <label className="text-xs font-bold text-primary hover:underline cursor-pointer">
                Change File
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Validation Banner */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle className="w-4 h-4" />
                <span>{validRows.length} workers ready to import</span>
              </div>
              {invalidRows > 0 && (
                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <AlertCircle className="w-4 h-4" />
                  <span>{invalidRows} rows need attention</span>
                </div>
              )}
            </div>

            {/* Preview Table */}
            <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 sticky top-0 font-bold text-gray-700">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                  {parsedData.slice(0, 10).map((r, idx) => (
                    <tr key={idx} className={r.name && r.email && r.role ? '' : 'bg-red-50 text-red-700'}>
                      <td className="p-2.5 font-bold">{r.name || 'Missing Name'}</td>
                      <td className="p-2.5">{r.email || 'Missing Email'}</td>
                      <td className="p-2.5">{r.role || 'Missing Role'}</td>
                      <td className="p-2.5">₦{r.paymentAmount?.toLocaleString()} / {r.paymentType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-xs text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={submitting || validRows.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Confirm Import ({validRows.length} Workers)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
