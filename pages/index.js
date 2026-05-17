import { useState, useEffect } from 'react';
import Head from 'next/head';

// Danh sách ảnh Landscape thực tế và Thương hiệu đồng hồ đặc trưng cho từng quốc gia
const COUNTRY_CONFIG = {
  all: {
    bg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80', // Trái đất nhìn từ vũ trụ
    brand: 'ROLEX',
    sub: 'Hệ thống giám sát tin tức Lãnh sự quán & Visa thời gian thực',
    timezone: 'Asia/Ho_Chi_Minh'
  },
  my: {
    bg: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=80', // New York Skyline
    brand: 'ROLEX',
    sub: 'Tin tức & Thông báo mới nhất từ Lãnh sự quán Hoa Kỳ tại TP.HCM',
    timezone: 'America/New_York'
  },
  nhat: {
    bg: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80', // Núi Phú Sĩ & Chùa
    brand: 'SEIKO',
    sub: 'Tin tức & Thông báo mới nhất từ Tổng lãnh sự quán Nhật Bản tại TP.HCM',
    timezone: 'Asia/Tokyo'
  },
  han: {
    bg: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1600&q=80', // Seoul ban đêm
    brand: 'CARTIER',
    sub: 'Tin tức & Thông báo mới nhất từ Tổng lãnh sự quán Hàn Quốc tại TP.HCM',
    timezone: 'Asia/Seoul'
  },
  kvac: {
    bg: 'https://images.unsplash.com/photo-1617541086271-64d852077e6b?auto=format&fit=crop&w=1600&q=80', // Cung điện Hàn Quốc
    brand: 'CARTIER',
    sub: 'Thông báo lịch hẹn và kết quả từ Trung tâm Văn hóa Hàn Quốc (KVAC HCM)',
    timezone: 'Asia/Seoul'
  },
  uc: {
    bg: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80', // Sydney Opera House
    brand: 'OMEGA',
    sub: 'Tin tức & Thông báo mới nhất từ Tổng lãnh sự quán Úc tại TP.HCM',
    timezone: 'Australia/Sydney'
  },
  canada: {
    bg: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=1600&q=80', // Hồ Moraine Canada kì vĩ
    brand: 'JACOB & CO',
    sub: 'Tin tức & Thông báo mới nhất từ Tổng lãnh sự quán Canada tại TP.HCM',
    timezone: 'America/Toronto'
  },
  daiLoan: {
    bg: 'https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?auto=format&fit=crop&w=1600&q=80', // Taipei 101
    brand: 'PATEK PHILIPPE',
    sub: 'Tin tức từ Văn phòng Kinh tế Văn hóa Đài Bắc tại TP.HCM',
    timezone: 'Asia/Taipei'
  }
};

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('all');
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');
  
  // State cho đồng hồ kim
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    loadNews();
    // Chạy đồng hồ tích tắc mỗi giây
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function loadNews() {
    setLoading(true);
    try {
      const res = await fetch('/api/get-news');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function triggerFetch() {
    setFetching(true);
    setMessage('⏳ Đang kết nối cổng Lãnh sự và cập nhật tin tức mới...');
    try {
      const res = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' }
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`✅ Hệ thống đã cập nhật thành công ${json.total} bài viết mới nhất!`);
        await loadNews();
      } else {
        setMessage('❌ Lỗi xác thực hoặc sự cố kết nối: ' + json.error);
      }
    } catch (e) {
      setMessage('❌ Thất bại: Lỗi kết nối đến máy chủ API');
    }
    setFetching(false);
    setTimeout(() => setMessage(''), 5000);
  }

  const filteredSources = data?.sources?.filter(s => 
    activeCountry === 'all' || s.country === activeCountry
  ) || [];

  const formatDate = (iso) => {
    if (!iso) return 'Không rõ ngày';
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Tính toán góc quay của kim đồng hồ dựa trên Múi giờ quốc gia được chọn
  const getClockAngles = () => {
    const targetZone = COUNTRY_CONFIG[activeCountry]?.timezone || 'Asia/Ho_Chi_Minh';
    // Chuyển đổi thời gian hiện tại của hệ thống sang múi giờ chỉ định
    const targetTimeStr = time.toLocaleString('en-US', { timeZone: targetZone });
    const targetDate = new Date(targetTimeStr);

    const hours = targetDate.getHours();
    const minutes = targetDate.getMinutes();
    const seconds = targetDate.getSeconds();

    return {
      hour: (hours % 12) * 30 + minutes * 0.5,
      minute: minutes * 6 + seconds * 0.1,
      second: seconds * 6
    };
  };

  const angles = getClockAngles();
  const currentConfig = COUNTRY_CONFIG[activeCountry] || COUNTRY_CONFIG.all;

  return (
    <>
      <Head>
        <title>Consulate News Monitor | Premium Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Be Vietnam Pro', sans-serif;
          background: #060913;
          color: #f1f5f9;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Hero Container hoành tráng với hình ảnh thực tế mượt mà */
        .hero {
          position: relative;
          height: 380px;
          display: flex;
          align-items: center;
          padding: 0 2rem;
          overflow: hidden;
        }

        .hero-bg-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 0.8s ease-in-out, transform 1.2s ease-in-out;
          opacity: 0;
          transform: scale(1.02);
        }

        .hero-bg.active {
          opacity: 1;
          transform: scale(1);
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(6, 9, 19, 0.92) 30%, rgba(6, 9, 19, 0.4) 70%, rgba(6, 9, 19, 0.85) 100%),
                      linear-gradient(to bottom, transparent 60%, #060913 100%);
          z-index: 2;
        }

        .hero-inner {
          position: relative;
          z-index: 3;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .hero-content {
          max-width: 650px;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          color: #fff;
          font-weight: 700;
          line-height: 1.2;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        .hero-title span {
          color: #38bdf8;
          position: relative;
        }

        .hero-sub {
          font-size: 0.95rem;
          color: #94a3b8;
          margin-top: 0.8rem;
          font-weight: 400;
          line-height: 1.5;
        }

        .last-updated {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 1rem;
          background: rgba(255,255,255,0.03);
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          display: inline-block;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .last-updated b { color: #38bdf8; font-weight: 600; }

        /* Widget Đồng hồ Analog xa xỉ */
        .clock-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .analog-clock {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: radial-gradient(circle, #1e293b 0%, #0f172a 100%);
          border: 4px solid #334155;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7), inset 0 2px 8px rgba(255,255,255,0.05);
          position: relative;
        }

        .clock-brand {
          position: absolute;
          top: 30px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 0.55rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.15em;
        }

        .clock-center {
          position: absolute;
          width: 8px; height: 8px;
          background: #38bdf8;
          border-radius: 50%;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          box-shadow: 0 0 5px rgba(56,189,248,0.8);
        }

        .hand {
          position: absolute;
          bottom: 50%;
          left: 50%;
          transform-origin: bottom center;
          border-radius: 4px;
          transition: transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 1);
        }

        .hour-hand {
          width: 4px; height: 32px;
          background: #fff;
          margin-left: -2px;
        }

        .min-hand {
          width: 3px; height: 45px;
          background: #cbd5e1;
          margin-left: -1.5px;
        }

        .sec-hand {
          width: 1.5px; height: 50px;
          background: #ef4444;
          margin-left: -0.75px;
          transition: transform 1s linear; /* Trôi mượt tích tắc */
        }

        .clock-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* Nút Tải lại cao cấp */
        .btn-refresh {
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #fff;
          border: none;
          padding: 0.75rem 1.6rem;
          border-radius: 12px;
          font-size: 0.88rem;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .btn-refresh:hover:not(:disabled) {
          background: linear-gradient(135deg, #38bdf8, #0284c7);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(56, 189, 248, 0.4);
        }

        .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Toast thông báo */
        .toast {
          max-width: 1200px;
          margin: 1rem auto 0;
          padding: 0.8rem 1.2rem;
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid rgba(14, 165, 233, 0.2);
          border-radius: 12px;
          font-size: 0.88rem;
          color: #7dd3fc;
          animation: fadeIn 0.3s ease;
        }

        /* Thanh cuộn ngang mượt cho Tabs trên Mobile */
        .tabs-container {
          max-width: 1200px;
          margin: 2rem auto 0;
          padding: 0 2rem;
        }

        .tabs {
          display: flex;
          gap: 0.6rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: none; /* Ẩn scrollbar trên Firefox */
        }

        .tabs::-webkit-scrollbar { display: none; } /* Ẩn trên Chrome/Safari */

        .tab {
          padding: 0.55rem 1.3rem;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
          color: #94a3b8;
          font-size: 0.85rem;
          font-family: 'Be Vietnam Pro', sans-serif;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .tab:hover { 
          border-color: rgba(56,189,248,0.3); 
          color: #cbd5e1;
          background: rgba(255,255,255,0.04);
        }

        .tab.active {
          background: rgba(14, 165, 233, 0.15);
          border-color: rgba(56, 189, 248, 0.5);
          color: #38bdf8;
          font-weight: 600;
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.05);
        }

        /* Khu vực hiển thị lưới bài viết bọc khung kính mờ */
        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .source-block {
          margin-bottom: 3.5rem;
          animation: fadeInUp 0.6s ease-in-out;
        }

        .source-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.2rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .source-flag { font-size: 1.8rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }

        .source-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .source-count {
          margin-left: auto;
          font-size: 0.78rem;
          color: #94a3b8;
          background: rgba(255,255,255,0.05);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .source-updated {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.1rem;
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        /* Thẻ bài viết nâng cấp cực sang trọng */
        .article-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 1.2rem;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          cursor: pointer;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }

        .article-card:hover {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0.02) 100%);
          border-color: rgba(56, 189, 248, 0.25);
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -10px rgba(0, 0, 0, 0.5);
        }

        .article-url {
          font-size: 0.85rem;
          color: #e2e8f0;
          word-break: break-all;
          line-height: 1.5;
          font-weight: 400;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s;
        }

        .article-card:hover .article-url {
          color: #38bdf8;
        }

        .article-date {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .dot-accent {
          display: inline-block;
          width: 8px; height: 8px;
          border-radius: 50%;
          margin-top: 0.3rem;
          flex-shrink: 0;
          box-shadow: 0 0 8px currentColor;
        }

        /* Các màn hình trạng thái */
        .empty, .loading {
          text-align: center;
          padding: 5rem 2rem;
          color: #64748b;
          background: rgba(255,255,255,0.01);
          border-radius: 20px;
          border: 1px dashed rgba(255,255,255,0.05);
        }
        .empty h2 { font-size: 1.2rem; margin-bottom: 0.5rem; color: #94a3b8; }
        .empty p { font-size: 0.9rem; }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          font-size: 0.95rem;
        }

        .spinner {
          width: 24px; height: 24px;
          border: 2px solid rgba(56,189,248,0.1);
          border-top-color: #38bdf8;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        /* Tối ưu hóa cực mạnh cho thiết bị di động (Mobile Responsive) */
        @media (max-width: 768px) {
          .hero { height: auto; padding: 3rem 1.5rem; }
          .hero-inner { flex-direction: column; text-align: center; gap: 2rem; }
          .hero-content { display: flex; flex-direction: column; align-items: center; }
          .btn-refresh { width: 100%; justify-content: center; }
          .tabs-container { padding: 0 1.5rem; margin-top: 1.5rem; }
          .main { padding: 1.5rem; }
          .articles-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Hero Section với cấu trúc ảnh đè mượt mà */}
      <div className="hero">
        <div className="hero-bg-wrapper">
          {Object.keys(COUNTRY_CONFIG).map((key) => (
            <div
              key={key}
              className={`hero-bg ${activeCountry === key ? 'active' : ''}`}
              style={{ backgroundImage: `url('${COUNTRY_CONFIG[key].bg}')` }}
            />
          ))}
        </div>
        <div className="hero-overlay"></div>
        
        <div className="hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">
              Consulate <span>News</span> Monitor
            </h1>
            <p className="hero-sub">{currentConfig.sub}</p>
            {data?.lastUpdated && (
              <p className="last-updated">
                Hệ thống đồng bộ lúc: <b>{formatDate(data.lastUpdated)}</b>
              </p>
            )}
            <button className="btn-refresh" onClick={triggerFetch} disabled={fetching}>
              {fetching ? '⏳ Đang đồng bộ...' : '🔄 Làm mới cổng thông tin'}
            </button>
          </div>

          {/* Khối đồng hồ cơ sang xịn */}
          <div className="clock-container">
            <div className="analog-clock">
              <div className="clock-brand">{currentConfig.brand}</div>
              <div className="clock-center"></div>
              <div className="hand hour-hand" style={{ transform: `rotate(${angles.hour}deg)` }}></div>
              <div className="hand min-hand" style={{ transform: `rotate(${angles.minute}deg)` }}></div>
              <div className="hand sec-hand" style={{ transform: `rotate(${angles.second}deg)` }}></div>
            </div>
            <div className="clock-label">
              {activeCountry === 'all' ? 'VIỆT NAM' : activeCountry.toUpperCase()} TIME
            </div>
          </div>
        </div>
      </div>

      {message && <div className="tabs-container"><div className="toast">{message}</div></div>}

      {/* Bộ lọc Tabs mượt mà hỗ trợ vuốt chạm trên mobile */}
      {data?.sources?.length > 0 && (
        <div className="tabs-container">
          <div className="tabs">
            <button className={`tab ${activeCountry === 'all' ? 'active' : ''}`} onClick={() => setActiveCountry('all')}>
              🌏 Toàn bộ khu vực
            </button>
            {data.sources.map(s => (
              <button key={s.country} className={`tab ${activeCountry === s.country ? 'active' : ''}`} onClick={() => setActiveCountry(s.country)}>
                {s.flag} {s.name.replace('Tổng lãnh sự quan ', '').replace('Lãnh sự quán ', '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="main">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Đang tải dữ liệu bộ nhớ đệm...
          </div>
        ) : !data?.sources?.length ? (
          <div className="empty">
            <h2>Hệ thống trống dữ liệu</h2>
            <p>Vui lòng click nút <b>"Làm mới cổng thông tin"</b> để nạp dữ liệu từ các Lãnh sự quán.</p>
          </div>
        ) : (
          filteredSources.map(source => (
            <div key={source.country} className="source-block">
              <div className="source-header">
                <span className="source-flag">{source.flag}</span>
                <div>
                  <div className="source-name">{source.name}</div>
                  <div className="source-updated">Lần quét cuối: {formatDate(source.updatedAt)}</div>
                </div>
                <span className="source-count">{source.articles.length} bài viết</span>
              </div>
              <div className="articles-grid">
                {source.articles.map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="article-card">
                    <div style={{display:'flex', alignItems:'flex-start', gap:'0.6rem'}}>
                      <span className="dot-accent" style={{color: source.color, background: source.color}}></span>
                      <span className="article-url">{article.title || article.url}</span>
                    </div>
                    {/* KHẮC PHỤC LỖI HIỂN THỊ NGÀY THÁNG: Thay thế hoàn toàn article.lastmod thành article.date */}
                    <div className="article-date">📅 {formatDate(article.date)}</div>
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
