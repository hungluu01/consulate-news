import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('all');
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    setLoading(true);
    try {
      const res = await fetch('/api/get-news');
      const json = await res.json();
      console.log('Data nhận được:', json);
      if (json?.sources?.length > 0) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function triggerFetch() {
    setFetching(true);
    setMessage('Đang fetch tin tức từ các đại sứ quán...');
    try {
      const res = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' }
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`✅ Cập nhật thành công ${json.total} bài viết!`);
        await loadNews();
      } else {
        setMessage('❌ Lỗi: ' + json.error);
      }
    } catch (e) {
      setMessage('❌ Lỗi kết nối');
    }
    setFetching(false);
    setTimeout(() => setMessage(''), 5000);
  }

  const filteredSources = data?.sources?.filter(s => 
    activeCountry === 'all' || s.country === activeCountry
  ) || [];

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <>
      <Head>
        <title>Consulate News Monitor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          font-family: 'Be Vietnam Pro', sans-serif;
          background: #0a0f1e;
          color: #e2e8f0;
          min-height: 100vh;
        }

        .hero {
          background: linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a0f1e 100%);
          border-bottom: 1px solid rgba(99,179,237,0.15);
          padding: 2.5rem 2rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -10%;
          width: 50%;
          height: 200%;
          background: radial-gradient(ellipse, rgba(66,153,225,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          color: #fff;
          letter-spacing: -0.02em;
        }

        .hero-title span {
          color: #63b3ed;
        }

        .hero-sub {
          font-size: 0.82rem;
          color: #718096;
          margin-top: 0.3rem;
          font-weight: 300;
        }

        .last-updated {
          font-size: 0.78rem;
          color: #4a5568;
          margin-top: 0.5rem;
        }

        .last-updated b { color: #63b3ed; }

        .btn-refresh {
          background: linear-gradient(135deg, #2b6cb0, #2c5282);
          color: #fff;
          border: none;
          padding: 0.65rem 1.4rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        .btn-refresh:hover:not(:disabled) {
          background: linear-gradient(135deg, #3182ce, #2b6cb0);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(49,130,206,0.3);
        }

        .btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }

        .toast {
          max-width: 1200px;
          margin: 0.8rem auto 0;
          padding: 0.7rem 1rem;
          background: rgba(49,130,206,0.1);
          border: 1px solid rgba(49,130,206,0.25);
          border-radius: 8px;
          font-size: 0.83rem;
          color: #90cdf4;
        }

        .tabs {
          max-width: 1200px;
          margin: 1.8rem auto 0;
          padding: 0 2rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tab {
          padding: 0.45rem 1.1rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: #718096;
          font-size: 0.82rem;
          font-family: 'Be Vietnam Pro', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover { border-color: rgba(99,179,237,0.3); color: #a0aec0; }

        .tab.active {
          background: rgba(49,130,206,0.15);
          border-color: rgba(99,179,237,0.4);
          color: #63b3ed;
          font-weight: 600;
        }

        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .source-block {
          margin-bottom: 2.5rem;
        }

        .source-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .source-flag { font-size: 1.6rem; }

        .source-name {
          font-size: 1rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .source-count {
          margin-left: auto;
          font-size: 0.75rem;
          color: #4a5568;
          background: rgba(255,255,255,0.04);
          padding: 0.2rem 0.6rem;
          border-radius: 10px;
        }

        .source-updated {
          font-size: 0.72rem;
          color: #4a5568;
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 0.85rem;
        }

        .article-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 1rem 1.1rem;
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
          display: block;
        }

        .article-card:hover {
          background: rgba(49,130,206,0.07);
          border-color: rgba(99,179,237,0.2);
          transform: translateY(-2px);
        }

        .article-url {
          font-size: 0.78rem;
          color: #63b3ed;
          word-break: break-all;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .article-date {
          font-size: 0.72rem;
          color: #4a5568;
          margin-top: 0.5rem;
        }

        .empty {
          text-align: center;
          padding: 4rem 2rem;
          color: #4a5568;
        }

        .empty h2 { font-size: 1.1rem; margin-bottom: 0.5rem; color: #718096; }
        .empty p { font-size: 0.85rem; }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 0.75rem;
          color: #4a5568;
          font-size: 0.9rem;
        }

        .spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(99,179,237,0.2);
          border-top-color: #63b3ed;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .dot-accent {
          display: inline-block;
          width: 8px; height: 8px;
          border-radius: 50%;
          margin-right: 0.4rem;
          flex-shrink: 0;
        }
      `}</style>

      <div className="hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">
              Consulate <span>News</span> Monitor
            </h1>
            <p className="hero-sub">Theo dõi tin tức từ Đại sứ quán Mỹ · Nhật · Hàn Quốc tại Việt Nam</p>
            {data?.lastUpdated && (
              <p className="last-updated">
                Cập nhật lần cuối: <b>{formatDate(data.lastUpdated)}</b>
              </p>
            )}
          </div>
          <button className="btn-refresh" onClick={triggerFetch} disabled={fetching}>
            {fetching ? '⏳ Đang fetch...' : '🔄 Cập nhật ngay'}
          </button>
        </div>
        {message && <div className="toast" style={{maxWidth:'1200px',margin:'0.8rem auto 0',padding:'0.7rem 1rem'}}>{message}</div>}
      </div>

      {data?.sources?.length > 0 && (
        <div className="tabs">
          <button className={`tab ${activeCountry === 'all' ? 'active' : ''}`} onClick={() => setActiveCountry('all')}>
            🌏 Tất cả
          </button>
          {data.sources.map(s => (
            <button key={s.country} className={`tab ${activeCountry === s.country ? 'active' : ''}`} onClick={() => setActiveCountry(s.country)}>
              {s.flag} {s.country}
            </button>
          ))}
        </div>
      )}

      <div className="main">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Đang tải...
          </div>
        ) : !data?.sources?.length ? (
          <div className="empty">
            <h2>Chưa có dữ liệu</h2>
            <p>Click <b>"Cập nhật ngay"</b> ở trên để fetch tin tức lần đầu tiên</p>
          </div>
        ) : (
          filteredSources.map(source => (
            <div key={source.country} className="source-block">
              <div className="source-header">
                <span className="source-flag">{source.flag}</span>
                <div>
                  <div className="source-name">{source.name}</div>
                  <div className="source-updated">Cập nhật: {formatDate(source.updatedAt)}</div>
                </div>
                <span className="source-count">{source.articles.length} bài</span>
              </div>
              <div className="articles-grid">
                {source.articles.map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="article-card">
                    <div style={{display:'flex',alignItems:'flex-start',gap:'0.5rem'}}>
                      <span className="dot-accent" style={{background: source.color, marginTop:'0.3rem'}}></span>
                      <span className="article-url">{article.title || article.url}</span>
                    </div>
                    <div className="article-date">📅 {formatDate(article.lastmod)}</div>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
