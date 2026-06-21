'use client'

import { useState, useRef } from 'react'

interface Props { isAdmin: boolean }

export function CSVTools({ isAdmin }: Props) {
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)

    const text = await file.text()
    const res = await fetch('/api/import', {
      method: 'POST',
      body: text,
      headers: { 'Content-Type': 'text/plain' },
    })
    const data = await res.json()
    setImportResult(res.ok ? `Imported ${data.inserted} rows.` : data.error ?? 'Failed')
    setImporting(false)
  }

  return (
    <div className="space-y-4">
      {/* Export */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-2">Export CSV</h2>
        <p className="text-sm text-gray-500 mb-3">Download all entries as a CSV file.</p>
        <a
          href="/api/export"
          className="inline-block bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark transition"
        >
          Download CSV
        </a>
      </div>

      {/* Import (admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-2">Import CSV</h2>
          <p className="text-sm text-gray-500 mb-1">
            Upload a CSV with columns: <code className="bg-gray-100 px-1 rounded text-xs">entry_date, project, men, hours, points, notes</code>
          </p>
          <p className="text-xs text-gray-400 mb-3">Project must match an existing project name exactly.</p>
          <form onSubmit={handleImport} className="flex gap-3 items-end flex-wrap">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              required
              className="text-sm text-gray-600"
            />
            <button
              type="submit"
              disabled={importing}
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {importing ? 'Importing…' : 'Import'}
            </button>
          </form>
          {importResult && (
            <p className={`mt-2 text-sm ${importResult.startsWith('Imported') ? 'text-green-600' : 'text-red-500'}`}>
              {importResult}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
