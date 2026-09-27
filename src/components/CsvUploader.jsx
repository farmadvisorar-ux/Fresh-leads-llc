import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'

const REQUIRED_COLUMNS = ['client_email', 'homeowner_name', 'address', 'phone']

export default function CsvUploader({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [errors, setErrors] = useState([])
  const [fileName, setFileName] = useState('')

  function parseFile(file) {
    setFileName(file.name)
    setParsed(null)
    setErrors([])

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const cols = result.meta.fields || []
        const missing = REQUIRED_COLUMNS.filter(c => !cols.includes(c))

        if (missing.length > 0) {
          setErrors([`Missing required columns: ${missing.join(', ')}`])
          return
        }

        const rowErrors = []
        result.data.forEach((row, i) => {
          if (!row.client_email) rowErrors.push(`Row ${i + 2}: missing client_email`)
          if (!row.homeowner_name) rowErrors.push(`Row ${i + 2}: missing homeowner_name`)
        })

        if (rowErrors.length > 0) {
          setErrors(rowErrors)
          return
        }

        setParsed(result.data)
      },
      error: (err) => {
        setErrors([`Parse error: ${err.message}`])
      },
    })
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) parseFile(file)
    else setErrors(['Please upload a CSV file'])
  }, [])

  function handleFileInput(e) {
    const file = e.target.files[0]
    if (file) parseFile(file)
  }

  function handleUpload() {
    if (parsed) {
      onUpload(parsed)
      setParsed(null)
      setFileName('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-fresh-orange bg-fresh-orange/5'
            : 'border-fresh-border hover:border-fresh-orange/40 hover:bg-fresh-border/20'
        }`}
      >
        <Upload className="w-10 h-10 text-fresh-muted mx-auto mb-3" />
        <p className="text-slate-300 font-medium mb-1">Drag & drop your CSV file</p>
        <p className="text-fresh-muted text-sm mb-4">or click to browse</p>
        <label className="btn-primary cursor-pointer">
          <FileText className="w-4 h-4" />
          Choose File
          <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
        </label>
      </div>

      {/* Required columns hint */}
      <div className="bg-fresh-border/40 rounded-lg p-3">
        <p className="text-xs text-fresh-muted font-semibold mb-1">Required CSV columns:</p>
        <code className="text-xs text-slate-300">
          client_email, homeowner_name, address, phone, storm_date, audio_url
        </code>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-300 font-medium text-sm">Validation Errors</p>
          </div>
          <ul className="space-y-1">
            {errors.map((e, i) => (
              <li key={i} className="text-red-300 text-sm">• {e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {parsed && (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-fresh-border flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              {fileName} — {parsed.length} rows ready to upload
            </span>
            <button onClick={() => { setParsed(null); setFileName('') }} className="ml-auto text-fresh-muted hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto max-h-48">
            <table className="w-full text-xs">
              <thead className="bg-fresh-border">
                <tr>
                  {Object.keys(parsed[0]).map(k => (
                    <th key={k} className="px-3 py-2 text-left text-fresh-muted font-semibold uppercase tracking-wide">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fresh-border">
                {parsed.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-fresh-border/30">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-3 py-2 text-slate-300 max-w-[120px] truncate">{v}</td>
                    ))}
                  </tr>
                ))}
                {parsed.length > 5 && (
                  <tr>
                    <td colSpan={99} className="px-3 py-2 text-fresh-muted text-center">
                      … and {parsed.length - 5} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-fresh-border">
            <button onClick={handleUpload} className="btn-primary">
              <Upload className="w-4 h-4" />
              Upload {parsed.length} Leads
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
