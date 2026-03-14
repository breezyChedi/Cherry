'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: 8, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box', outline: 'none',
};

const tagOptions = [
  { value: 'general', label: 'General' },
  { value: 'eligibility', label: 'Eligibility' },
  { value: 'coverage', label: 'Coverage' },
  { value: 'obligations', label: 'Obligations' },
  { value: 'application', label: 'Application' },
  { value: 'renewal', label: 'Renewal' },
];

export default function NewBursaryPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'paste' | 'url'>('paste');
  const [funderName, setFunderName] = useState('');
  const [bursaryName, setBursaryName] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>(['general', 'eligibility', 'coverage', 'application']);
  const [extractedText, setExtractedText] = useState('');
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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
        if (data.error === 'blocked') setError(data.message + ' Switch to paste mode.');
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
    if (!funderName || !bursaryName || !content) {
      setError('Please fill in funder name, bursary name, and content');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/parse/bursary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funderName, bursaryName, content, tags }),
        credentials: 'include',
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        // Handle both single and multi-bursary responses
        const data = result.data;
        if (data.bursaries && Array.isArray(data.bursaries)) {
          setExtractedData(data.bursaries[0]); // Take first, could show a selector
          if (data.bursaries.length > 1) {
            setMessage(`Extracted ${data.bursaries.length} bursaries. Showing the first one. Save and extract others separately.`);
          }
        } else {
          setExtractedData(data);
        }
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
      const res = await fetch('/api/admin/bursaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData),
        credentials: 'include',
      });
      if (res.ok) {
        const result = await res.json();
        const savedId = extractedData.id || result.data?.[0]?.id;
        router.push(savedId ? `/admin/bursaries/${savedId}` : '/admin/bursaries');
      } else {
        setError('Save failed: ' + (await res.json()).error);
      }
    } catch (e) {
      setError('Save failed: ' + (e instanceof Error ? e.message : 'Unknown'));
    }
    setSaving(false);
  };

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <button onClick={() => router.push('/admin/bursaries')} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>
        ← Back to Bursaries
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>New Bursary</h1>

      {error && <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: '#7f1d1d', color: '#fca5a5', fontSize: 14 }}>{error}</div>}
      {message && <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: '#713f12', color: '#fde047', fontSize: 14 }}>{message}</div>}

      {!extractedData ? (
        <>
          {/* Step 1: Input */}
          <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#c084fc', marginTop: 0, marginBottom: 16 }}>Step 1: Provide Information</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Funder Name *</label>
                <input style={inputStyle} value={funderName} onChange={e => setFunderName(e.target.value)} placeholder="e.g. Shoprite" />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Bursary Name *</label>
                <input style={inputStyle} value={bursaryName} onChange={e => setBursaryName(e.target.value)} placeholder="e.g. Shoprite Accounting Bursary" />
              </div>
            </div>

            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={() => setMode('paste')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: mode === 'paste' ? '#7c3aed' : '#334155', color: 'white', cursor: 'pointer', fontSize: 13 }}>Paste Text</button>
              <button onClick={() => setMode('url')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: mode === 'url' ? '#7c3aed' : '#334155', color: 'white', cursor: 'pointer', fontSize: 13 }}>From URL</button>
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
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Extracted text preview ({extractedText.length} chars)</label>
                    <textarea style={{ ...inputStyle, minHeight: 80, fontSize: 12, color: '#64748b' }} value={extractedText.slice(0, 500) + '...'} readOnly />
                  </div>
                )}
              </div>
            )}

            {mode === 'paste' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Paste bursary page content *</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 200 }}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Copy and paste the full text from the bursary website..."
                />
              </div>
            )}

            {/* Content Tags */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Content Tags (what to extract)</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tagOptions.map(tag => (
                  <button
                    key={tag.value}
                    onClick={() => toggleTag(tag.value)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 13, cursor: 'pointer',
                      background: tags.includes(tag.value) ? '#7c3aed' : '#334155',
                      color: tags.includes(tag.value) ? 'white' : '#94a3b8',
                    }}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExtract}
              disabled={loading}
              style={{ padding: '12px 32px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}
            >
              {loading ? 'Extracting with AI...' : 'Extract with AI'}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Step 2: Review extracted data */}
          <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#c084fc', marginTop: 0, marginBottom: 16 }}>Step 2: Review Extracted Data</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Review the extracted JSON below. Click Save to store in Neo4j, or edit the JSON directly.</p>

            <textarea
              style={{ ...inputStyle, minHeight: 400, fontFamily: 'monospace', fontSize: 12 }}
              value={JSON.stringify(extractedData, null, 2)}
              onChange={e => {
                try {
                  setExtractedData(JSON.parse(e.target.value));
                  setError('');
                } catch {
                  setError('Invalid JSON');
                }
              }}
            />

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={() => setExtractedData(null)} style={{ padding: '10px 20px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                ← Back to Extract
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                {saving ? 'Saving...' : 'Save to Neo4j'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
