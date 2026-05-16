import { useState, useEffect } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'read_articles';
const SEEN_KEY = 'seen_articles';

function getReadSet() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); }
}
function getSeenSet() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); } catch { return new Set(); }
}
function saveReadSet(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify([...s])); }
function saveSeenSet(s) { localStorage.setItem(SEEN_KEY, JSON.stringify([...s])); }

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('all');
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');
  const [readSet, setReadSet] = useState(new Set());
  const [seenSet, setSeenSet] = useState(new Set());
  const [newCount, setNewCount] = useState(0);

  useEffect(function() {
    setReadSet(getReadSet());
    setSeenSet(getSeenSet());
    loadNews();
  }, []);

  async function loadNews() {
    setLoading(true);
    try {
      var res = await fetch('/api/get-news');
      var json = await res.json();
      if (json && json.sources && json.sources.length > 0) {
        setData(json);
        var seen = getSeenSet();
        var count = 0;
        json.sources.forEach(function(s) {
          s.articles.forEach(function(a) {
            if (!seen.has(a.url)) count++;
          });
        });
        setNewCount(count);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function triggerFetch() {
    setFetching(true);
    setMessage('Đang cập nhật từ các đại sứ quán...');
    try {
      var res = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' }
      });
      var json = await res.json();
      if (json.success) {
        setMessage('✅ Cập nhật thành công ' + json.total + ' bài viết!');
        await loadNews();
      } else {
        setMessage('❌ Lỗi: ' + json.error);
      }
    } catch (e) { setMessage('❌ Lỗi kết nối'); }
    setFetching(false);
    setTimeout(function() { setMessage(''); }, 4000);
  }

  function markRead(url) {
    var s = new Set(readSet); s.add(url); setReadSet(s); saveReadSet(s);
    var se = new Set(seenSet); se.add(url); setSeenSet(se); saveSeenSet(se);
  }

  function markAllSeen() {
    if (!data) return;
    var se = new Set(seenSet);
    data.sources.forEach(function(s) {
      s.articles.forEach(function(a) { se.add(a.url); });
    });
    setSeenSet(se); saveSeenSet(se); setNewCount(0);
  }

  var filteredSources = (data && data.sources ? data.sources : []).filter(function(s) {
    return activeCountry === 'all' || s.country === activeCountry;
  });

  function formatDate(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }

  var totalArticles = data && data.sources ? data.sources.reduce(function(s, x) { return s + x.articles.length; }, 0) : 0;

  return (
    <div>
      <Head>
        <title>Consulate News Monitor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #080c18;
          --surface: #0e1424;
          --surface2: #141c30;
          --border: rgba(255,255,255,0.07);
          --border-hover: rgba(99,179,237,0.25);
          --text: #e8edf5;
          --text-muted: #5a6a8a;
          --text-dim: #8899bb;
          --accent: #4e9eff;
          --accent-glow: rgba(78,158,255,0.1);
          --red: #ff4757;
          --radius: 12px;
          --transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }
        .header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(8,12,24,0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 0 2rem;
        }
        .header-inner {
          max-width: 1280px; margin: 0 auto;
          height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        }
        .logo {
          font-family: 'DM Serif Display', serif;
          font-size: 1.25rem; color: var(--text); letter-spacing: -0.02em;
        }
        .logo-dot { color: var(--accent); }
        .header-right { display: flex; align-items: center; gap: 0.75rem; }
        .bell-btn {
          position: relative; width: 38px; height: 38px;
          border-radius: 10px; border: 1px solid var(--border);
          background: var(--surface); color: var(--text-dim);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: var(--transition); font-size: 1rem;
        }
        .bell-btn:hover { border-color: var(--border-hover); color: var(--accent); }
        .bell-badge {
          position: absolute; top: -4px; right: -4px;
          min-width: 18px; height: 18px;
          background: var(--red); border-radius: 9px;
          font-size: 0.6rem; font-weight: 700; color: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px; border: 2px solid var(--bg);
          animation: pulse-badge 2s infinite;
        }
        @keyframes pulse-badge { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        .btn-refresh {
          height: 38px; padding: 0 1.1rem;
          border-radius: 10px; border: 1px solid rgba(78,158,255,0.3);
          background: rgba(78,158,255,0.1); color: var(--accent);
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: var(--transition); white-space: nowrap;
        }
        .btn-refresh:hover:not(:disabled) {
          background: rgba(78,158,255,0.18); border-color: rgba(78,158,255,0.5);
          transform: translateY(-1px); box-shadow: 0 4px 20px rgba(78,158,255,0.15);
        }
        .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
        .spin { animation: spinning 1s linear infinite; display: inline-block; }
        @keyframes spinning { to{transform:rotate(360deg)} }
        .toast {
          position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
          background: var(--surface2); border: 1px solid var(--border-hover);
          border-radius: var(--radius); padding: 0.7rem 1.2rem;
          font-size: 0.83rem; color: var(--text); z-index: 999;
          white-space: nowrap; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp { from{transform:translateX(-50%) translateY(10px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
        .updated-bar {
          max-width: 1280px; margin: 0 auto; padding: 0.6rem 2rem;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.75rem; color: var(--text-muted);
        }
        .updated-bar b { color: var(--accent); }
        .mark-all-btn {
          background: none; border: none; color: var(--text-muted);
          font-size: 0.75rem; font-family: 'DM Sans', sans-serif;
          cursor: pointer; padding: 3px 8px; border-radius: 5px; transition: var(--transition);
        }
        .mark-all-btn:hover { background: var(--surface); color: var(--accent); }
        .tabs-wrap {
          max-width: 1280px; margin: 0 auto; padding: 1rem 2rem 0;
          display: flex; gap: 0.4rem; flex-wrap: wrap;
        }
        .tab {
          height: 34px; padding: 0 0.9rem; border-radius: 8px;
          border: 1px solid var(--border); background: transparent;
          color: var(--text-muted); font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          cursor: pointer; transition: var(--transition);
          display: flex; align-items: center; gap: 0.3rem;
        }
        .tab:hover { border-color: var(--border-hover); color: var(--text-dim); }
        .tab.active { background: var(--accent-glow); border-color: rgba(78,158,255,0.4); color: var(--accent); }
        .tab-count { font-size: 0.7rem; background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 4px; }
        .main { max-width: 1280px; margin: 0 auto; padding: 1.5rem 2rem 3rem; }
        .source-block { margin-bottom: 2.5rem; animation: fadeIn 0.4s ease both; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .source-header {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 1rem; padding-bottom: 0.85rem; border-bottom: 1px solid var(--border);
        }
        .source-flag { font-size: 1.5rem; }
        .source-info { flex: 1; }
        .source-name { font-size: 0.95rem; font-weight: 600; color: var(--text); }
        .source-meta { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }
        .source-badge {
          font-size: 0.72rem; color: var(--text-muted);
          background: var(--surface); border: 1px solid var(--border);
          padding: 3px 8px; border-radius: 6px;
        }
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 0.75rem;
        }
        .article-card {
          position: relative; background: var(--surface);
          border: 1px solid var(--border); border-radius: var(--radius);
          padding: 1rem 1.1rem; text-decoration: none; display: block;
          cursor: pointer; transition: var(--transition); overflow: hidden;
        }
        .article-card:hover {
          border-color: var(--border-hover); transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
        .article-card.unread { background: rgba(78,158,255,0.06); border-color: rgba(78,158,255,0.1); }
        .article-card.read { opacity: 0.6; }
        .article-card.read:hover { opacity: 1; }
        .unread-dot {
          position: absolute; top: 10px; right: 10px;
          width: 8px; height: 8px; background: var(--red);
          border-radius: 50%; box-shadow: 0 0 6px var(--red);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.2)} }
        .card-accent {
          width: 3px; height: 100%; position: absolute;
          left: 0; top: 0; border-radius: 12px 0 0 12px; opacity: 0.7;
        }
        .article-title {
          font-size: 0.83rem; line-height: 1.55; color: var(--text);
          padding-left: 0.5rem;
          display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .article-card.read .article-title { color: var(--text-dim); }
        .article-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 0.6rem; padding-left: 0.5rem;
        }
        .article-date { font-size: 0.69rem; color: var(--text-muted); }
        .read-label {
          font-size: 0.68rem; color: var(--text-muted);
          background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius: 4px;
        }
        .empty { text-align: center; padding: 5rem 2rem; color: var(--text-muted); }
        .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4; }
        .empty h2 { font-size: 1rem; margin-bottom: 0.4rem; color: var(--text-dim); }
        .empty p { font-size: 0.83rem; }
        .loading {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; min-height: 50vh; gap: 1rem;
          color: var(--text-muted); font-size: 0.85rem;
        }
        .loader {
          width: 32px; height: 32px;
          border: 2px solid rgba(78,158,255,0.15);
          border-top-color: var(--accent);
          border-radius: 50%; animation: spinning 0.7s linear infinite;
        }
        @media (max-width: 640px) {
          .main { padding: 1rem; }
          .tabs-wrap { padding: 1rem 1rem 0; }
          .articles-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="header">
        <div className="header-inner">
          <div className="logo">
            🌐 Consulate<span className="logo-dot">.</span>Monitor
          </div>
          <div className="header-right">
            <button className="bell-btn" onClick={markAllSeen} title="Đánh dấu tất cả đã xem">
              🔔
              {newCount > 0 && (
                <span className="bell-badge">{newCount > 99 ? '99+' : newCount}</span>
              )}
            </button>
            <button className="btn-refresh" onClick={triggerFetch} disabled={fetching}>
              <span className={fetching ? 'spin' : ''}>↻</span>
              {' '}{fetching ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </div>
      </header>

      {data && data.lastUpdated && (
        <div className="updated-bar">
          <span>Cập nhật lần cuối: <b>{formatDate(data.lastUpdated)}</b> · {totalArticles} bài</span>
          {newCount > 0 && (
            <button className="mark-all-btn" onClick={markAllSeen}>
              ✓ Đánh dấu tất cả đã xem ({newCount})
            </button>
          )}
        </div>
      )}

      {data && data.sources && data.sources.length > 0 && (
        <div className="tabs-wrap">
          <button
            className={'tab' + (activeCountry === 'all' ? ' active' : '')}
            onClick={function() { setActiveCountry('all'); }}
          >
            🌏 Tất cả
            <span className="tab-count">{totalArticles}</span>
          </button>
          {data.sources.map(function(s) {
            return (
              <button
                key={s.country}
                className={'tab' + (activeCountry === s.country ? ' active' : '')}
                onClick={function() { setActiveCountry(s.country); }}
              >
                {s.flag} {s.country}
                <span className="tab-count">{s.articles.length}</span>
              </button>
            );
          })}
        </div>
      )}

      <main className="main">
        {loading ? (
          <div className="loading">
            <div className="loader"></div>
            <span>Đang tải tin tức...</span>
          </div>
        ) : (!data || !data.sources || data.sources.length === 0) ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <h2>Chưa có dữ liệu</h2>
            <p>Click <b>Cập nhật</b> để fetch tin tức lần đầu tiên</p>
          </div>
        ) : (
          <div>
            {filteredSources.map(function(source, si) {
              return (
                <div
                  key={source.country}
                  className="source-block"
                  style={{ animationDelay: (si * 0.08) + 's' }}
                >
                  <div className="source-header">
                    <span className="source-flag">{source.flag}</span>
                    <div className="source-info">
                      <div className="source-name">{source.name}</div>
                      <div className="source-meta">Cập nhật: {formatDate(source.updatedAt)}</div>
                    </div>
                    <span className="source-badge">{source.articles.length} bài</span>
                  </div>
                  <div className="articles-grid">
                    {source.articles.map(function(article, i) {
                      var isRead = readSet.has(article.url);
                      var isNew = !seenSet.has(article.url);
                      var cardClass = 'article-card ' + (isRead ? 'read' : 'unread');
                      return (
                        <a
                          key={i}
                          href={article.url ? article.url : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cardClass}
                          onClick={function() { markRead(article.url); }}
                        >
                          <span
                            className="card-accent"
                            style={{ background: source.color }}
                          ></span>
                          {isNew && !isRead && <span className="unread-dot"></span>}
                          <div className="article-title">{article.title}</div>
                          <div className="article-footer">
                            <span className="article-date">📅 {formatDate(article.date)}</span>
                            {isRead && <span className="read-label">✓ Đã đọc</span>}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {message && <div className="toast">{message}</div>}
    </div>
  );
}
