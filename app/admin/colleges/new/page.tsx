'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: 8, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box', outline: 'none',
};

interface UrlEntry {
  url: string;
  status: 'pending' | 'scraping' | 'done' | 'error';
  text: string;
  error?: string;
}

export default function NewCollegePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'paste' | 'url'>('paste');
  const [collegeName, setCollegeName] = useState('');
  const [content, setContent] = useState('');
  const [urls, setUrls] = useState<UrlEntry[]>([{ url: '', status: 'pending', text: '' }]);
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateUrl = (index: number, patch: Partial<UrlEntry>) => {
    setUrls(prev => prev.map((u, i) => i === index ? { ...u, ...patch } : u));
  };

  const addUrl = () => {
    setUrls(prev => [...prev, { url: '', status: 'pending', text: '' }]);
  };

  const removeUrl = (index: number) => {
    setUrls(prev => prev.filter((_, i) => i !== index));
  };

  const scrapeOne = async (index: number) => {
    const entry = urls[index];
    if (!entry.url.trim()) return;
    updateUrl(index, { status: 'scraping', error: undefined });
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: entry.url }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.error) {
        updateUrl(index, { status: 'error', error: data.message || data.error });
      } else {
        updateUrl(index, { status: 'done', text: data.text || '' });
      }
    } catch (e) {
      updateUrl(index, { status: 'error', error: e instanceof Error ? e.message : 'Failed' });
    }
  };

  const scrapeAll = async () => {
    setError('');
    const pending = urls.filter(u => u.url.trim() && u.status !== 'done');
    await Promise.all(pending.map((_, i) => {
      const realIdx = urls.findIndex(u => u === pending[i]);
      return scrapeOne(realIdx);
    }));
  };

  const buildContent = (): string => {
    if (mode === 'paste') return content;
    // Combine all scraped text with source headers
    return urls
      .filter(u => u.text)
      .map((u, i) => `--- Source ${i + 1}: ${u.url} ---\n${u.text}`)
      .join('\n\n');
  };

  const handleExtract = async () => {
    const combined = buildContent();
    if (!collegeName || !combined) {
      setError('Please fill in college name and provide content (paste text or scrape URLs)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/parse/college', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeName, content: combined }),
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

  const scrapedCount = urls.filter(u => u.status === 'done').length;
  const scrapingAny = urls.some(u => u.status === 'scraping');

  return (
    <div style={{ maxWidth: 900 }}>
      <button onClick={() => router.push('/admin/colleges')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>
        &larr; Back to Colleges
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
            <button onClick={() => setMode('url')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: mode === 'url' ? '#2563eb' : '#334155', color: 'white', cursor: 'pointer', fontSize: 13 }}>From URLs</button>
          </div>

          {mode === 'url' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
                URLs to scrape ({scrapedCount}/{urls.length} scraped)
              </label>

              {urls.map((entry, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      value={entry.url}
                      onChange={e => updateUrl(i, { url: e.target.value, status: 'pending', text: '', error: undefined })}
                      placeholder="https://..."
                    />
                    <button
                      onClick={() => scrapeOne(i)}
                      disabled={entry.status === 'scraping' || !entry.url.trim()}
                      style={{
                        padding: '10px 16px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
                        background: entry.status === 'done' ? '#065f46' : '#2563eb',
                        color: 'white',
                      }}
                    >
                      {entry.status === 'scraping' ? 'Scraping...' : entry.status === 'done' ? 'Done' : 'Scrape'}
                    </button>
                    {urls.length > 1 && (
                      <button onClick={() => removeUrl(i)} style={{
                        background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 16, padding: '0 4px',
                      }}>&times;</button>
                    )}
                  </div>
                  {entry.status === 'error' && (
                    <div style={{ color: '#fca5a5', fontSize: 11, marginTop: 4 }}>{entry.error}</div>
                  )}
                  {entry.status === 'done' && (
                    <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                      {entry.text.length.toLocaleString()} chars scraped
                    </div>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={addUrl} style={{
                  padding: '6px 14px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                }}>+ Add URL</button>
                {urls.filter(u => u.url.trim()).length > 1 && (
                  <button onClick={scrapeAll} disabled={scrapingAny} style={{
                    padding: '6px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                  }}>
                    {scrapingAny ? 'Scraping...' : 'Scrape All'}
                  </button>
                )}
              </div>
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
              &larr; Back
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
