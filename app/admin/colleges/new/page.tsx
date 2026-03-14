'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: 8, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box', outline: 'none',
};

export default function NewCollegePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'paste' | 'url'>('paste');
  const [collegeName, setCollegeName] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleScrape = async () => {
    if (!url) return;
    setScraping(true);
    setError('');
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.error) {
        setError(data.message || data.error);
      } else {
        setExtractedText(data.text);
        setContent(data.text);
      }
    } catch (e) {
      setError('Scrape failed: ' + (e instanceof Error ? e.message : 'Unknown'));
    }
    setScraping(false);
  };

  const handleExtract = async () => {
    if (!collegeName || !content) {
      setError('Please fill in college name and content');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/parse/college', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeName, content }),
        credentials: 'include',
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setExtractedData(result.data);
      }
    } catch (e) {
      setError('Extraction failed: ' + (e instanceof Error ? e.message : 'Unknown'));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!extractedData) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData),
        credentials: 'include',
      });
      if (res.ok) {
        const instName = (extractedData as { institution?: { name?: string } }).institution?.name || collegeName;
        router.push(`/admin/colleges/${encodeURIComponent(instName)}`);
      } else {
        setError('Save failed: ' + (await res.json()).error);
      }
    } catch (e) {
      setError('Save failed: ' + (e instanceof Error ? e.message : 'Unknown'));
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <button onClick={() => router.push('/admin/colleges')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>
        ← Back to Colleges
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>New College / Institution</h1>

      {error && <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: '#7f1d1d', color: '#fca5a5', fontSize: 14 }}>{error}</div>}

      {!extractedData ? (
        <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#60a5fa', marginTop: 0, marginBottom: 16 }}>Step 1: Provide Information</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>College Name *</label>
            <input style={inputStyle} value={collegeName} onChange={e => setCollegeName(e.target.value)} placeholder="e.g. Central Johannesburg TVET College" />
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={() => setMode('paste')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: mode === 'paste' ? '#2563eb' : '#334155', color: 'white', cursor: 'pointer', fontSize: 13 }}>Paste Text</button>
            <button onClick={() => setMode('url')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: mode === 'url' ? '#2563eb' : '#334155', color: 'white', cursor: 'pointer', fontSize: 13 }}>From URL</button>
          </div>

          {mode === 'url' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inputStyle, flex: 1 }} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                <button onClick={handleScrape} disabled={scraping} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
                  {scraping ? 'Scraping...' : 'Scrape'}
                </button>
              </div>
              {extractedText && (
                <div style={{ marginTop: 8 }}>
                  <textarea style={{ ...inputStyle, minHeight: 80, fontSize: 12, color: '#64748b' }} value={extractedText.slice(0, 500) + '...'} readOnly />
                </div>
              )}
            </div>
          )}

          {mode === 'paste' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Paste college page content *</label>
              <textarea style={{ ...inputStyle, minHeight: 200 }} value={content} onChange={e => setContent(e.target.value)} placeholder="Copy and paste from the college website..." />
            </div>
          )}

          <button onClick={handleExtract} disabled={loading} style={{ padding: '12px 32px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
            {loading ? 'Extracting with AI...' : 'Extract with AI'}
          </button>
        </div>
      ) : (
        <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#60a5fa', marginTop: 0, marginBottom: 16 }}>Step 2: Review Extracted Data</h2>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Review the JSON. Edit directly if needed, then save.</p>

          <textarea
            style={{ ...inputStyle, minHeight: 400, fontFamily: 'monospace', fontSize: 12 }}
            value={JSON.stringify(extractedData, null, 2)}
            onChange={e => {
              try { setExtractedData(JSON.parse(e.target.value)); setError(''); } catch { setError('Invalid JSON'); }
            }}
          />

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button onClick={() => setExtractedData(null)} style={{ padding: '10px 20px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
              ← Back
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              {saving ? 'Saving...' : 'Save to Neo4j'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
