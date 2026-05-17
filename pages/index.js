import { useState, useEffect } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'read_articles';
const SEEN_KEY = 'seen_articles';

const GLOBAL_LANDSCAPES = [
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80',
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&q=80',
  'https://images.unsplash.com/photo-1617541086271-64d852077e6b?w=1200&q=80',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80',
  'https://images.unsplash.com/photo-149 Chester-85c8e12f0c0e?w=1200&q=80',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
  'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200&q=80',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80',
  'https://images.unsplash.com/photo-1547886596-4301beceb43e?w=1200&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80',
  'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=1200&q=80',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&q=80',
  'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=1200&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80',
  'https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?w=1200&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80'
];

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('all');
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');
  const [currentMenu, setCurrentMenu] = useState('news');
  const [showToTop, setShowToTop] = useState(false);

  useEffect(() => {
    loadNews();
    const handleScroll = () => {
      setShowToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    setMessage('Đang kết nối đến hệ thống máy chủ dữ liệu Ngoại Giao...');
    try {
      const res = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' }
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`✅ Cập nhật hoàn tất! Đồng bộ thành công ${json.total} cổng thông tin.`);
        await loadNews();
      } else {
        setMessage('❌ Lỗi: ' + json.error);
      }
    } catch (e) {
      setMessage('❌ Không thể kết nối API Gateway');
    }
    setFetching(false);
    setTimeout(() => setMessage(''), 4000);
  }

  const filteredSources = data?.sources || [];

  return (
    <>
      <Head>
        <title>Kênh Thông Tin Thị Thực Quốc Tế</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f7fafc; color: #2d3748; -webkit-font-smoothing: antialiased; }
        
        .main-navigation-header { background: #ffffff; border-bottom: 1px solid #edf2f7; position: sticky; top: 0; z-index: 100; }
        .nav-inner-container { max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; }
        .branding-logo-zone { display: flex; align-items: center; gap: 0.75rem; }
        .branding-icon { font-size: 1.8rem; background: #ebf8ff; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .branding-text h1 { font-family: 'Playfair Display', serif; font-size: 1.35rem; color: #1a202c; font-weight: 600; }
        .branding-text p { font-size: 0.75rem; color: #718096; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 0.1rem; }
        
        .menu-tabs-navigation { display: flex; gap: 0.5rem; }
        .menu-nav-btn { background: transparent; border: none; padding: 0.6rem 1.1rem; font-size: 0.9rem; font-weight: 500; color: #4a5568; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
        .menu-nav-btn:hover { background: #f7fafc; color: #1a202c; }
        .menu-nav-btn.active { background: #2b6cb0; color: #ffffff; font-weight: 600; }

        .action-button-group { display: flex; align-items: center; gap: 0.75rem; }
        .btn-sync-action { background: #1a202c; color: #ffffff; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; }
        .btn-sync-action:hover { background: #2d3748; }

        .country-filter-bar { background: #ffffff; border-bottom: 1px solid #edf2f7; padding: 0.75rem 2rem; }
        .filter-scroll-wrapper { max-width: 1280px; margin: 0 auto; display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 2px; }
        .filter-scroll-wrapper::-webkit-scrollbar { height: 4px; }
        .filter-scroll-wrapper::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .country-pill-btn { background: #f7fafc; border: 1px solid #e2e8f0; padding: 0.45rem 1rem; border-radius: 20px; font-size: 0.82rem; font-weight: 500; color: #4a5568; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
        .country-pill-btn:hover { background: #edf2f7; border-color: #cbd5e0; }
        .country-pill-btn.active { background: #1a202c; color: #ffffff; border-color: #1a202c; }

        .app-workspace-content { max-width: 1280px; margin: 2rem auto; padding: 0 2rem; }
        .section-headline { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #1a202c; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.7rem; }
        .section-headline span { font-size: 0.9rem; font-family: 'Plus Jakarta Sans', sans-serif; color: #718096; font-weight: normal; margin-left: auto; }

        .grid-layout-stream { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 1.75rem; margin-bottom: 3.5rem; }
        .news-item-card { background: #ffffff; border-radius: 14px; border: 1px solid #edf2f7; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; color: inherit; transition: transform 0.25s, box-shadow 0.25s; }
        .news-item-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.04); }
        .card-visual-header { height: 7px; width: 100%; }
        .card-inner-padding { padding: 1.25rem; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .meta-source-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #718096; font-weight: 500; margin-bottom: 0.75rem; }
        .source-indicator-dot { width: 6px; height: 6px; border-radius: 50%; }
        .article-title { font-size: 0.92rem; font-weight: 600; color: #1a202c; line-height: 1.5; margin-bottom: 1.25rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .card-bottom-meta { display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid #f7fafc; font-size: 0.78rem; color: #a0aec0; }

        .static-page-wrapper { background: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 2.5rem; min-height: 400px; }
        .static-grid-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; margin-top: 2rem; }
        .gallery-photo-item { height: 180px; border-radius: 10px; background-size: cover; background-position: center; transition: transform 0.2s; border: 1px solid #edf2f7; }
        .gallery-photo-item:hover { transform: scale(1.02); }

        .footer-credits-bar { text-align: center; padding: 2rem; background: #ffffff; border-top: 1px solid #edf2f7; margin-top: 5rem; font-size: 0.82rem; color: #718096; }
        .toast-notify-alert { position: fixed; bottom: 2rem; left: 2rem; background: #1a202c; color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 10px; font-size: 0.85rem; font-weight: 500; z-index: 1000; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .scroll-to-top-btn { position: fixed; bottom: 2rem; right: 2rem; width: 44px; height: 44px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 50%; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.2s; opacity: 0; visibility: hidden; z-index: 90; }
        .scroll-to-top-btn.visible { opacity: 1; visibility: visible; }
        .scroll-to-top-btn:hover { background: #f7fafc; transform: translateY(-2px); }
        
        .empty { text-align: center; padding: 4rem 2rem; background: #ffffff; border-radius: 16px; border: 1px solid #edf2f7; }
        .empty h2 { font-family: 'Playfair Display', serif; font-size: 1.4rem; margin-bottom: 0.5rem; }
        .empty p { color: #718096; font-size: 0.9rem; }
      `}</style>

      {/* Main Bar Navigation */}
      <div className="main-navigation-header">
        <div className="nav-inner-container">
          <div className="branding-logo-zone">
            <div className="branding-icon">🌍</div>
            <div className="branding-text">
              <h1>Kênh Thông Tin Thị Thực</h1>
              <p>Hệ Thống Phân Tích Lãnh Sự</p>
            </div>
          </div>

          <div className="menu-tabs-navigation">
            <button className={`menu-nav-btn ${currentMenu === 'news' ? 'active' : ''}`} onClick={() => setCurrentMenu('news')}>📰 Luồng Tin Tức</button>
            <button className={`menu-nav-btn ${currentMenu === 'maps' ? 'active' : ''}`} onClick={() => setCurrentMenu('maps')}>📍 Chỉ Đường Lãnh Sự</button>
            <button className={`menu-nav-btn ${currentMenu === 'gallery' ? 'active' : ''}`} onClick={() => setCurrentMenu('gallery')}>🖼️ Thư Viện Không Gian</button>
          </div>

          <div className="action-button-group">
            <button className="btn-sync-action" onClick={triggerFetch}>
              {fetching ? '⏳ Đang đồng bộ...' : '🔄 Đồng bộ đám mây'}
            </button>
          </div>
        </div>
      </div>

      {/* Country Filter Pill Zone */}
      {currentMenu === 'news' && (
        <div className="country-filter-bar">
          <div className="filter-scroll-wrapper">
            <button className={`country-pill-btn ${activeCountry === 'all' ? 'active' : ''}`} onClick={() => setActiveCountry('all')}>Tất cả quốc gia</button>
            {filteredSources.map(s => (
              <button key={s.country} className={`country-pill-btn ${activeCountry === s.country ? 'active' : ''}`} onClick={() => setActiveCountry(s.country)}>
                {s.flag} {s.name.replace('Lãnh sự quán ', '').replace('Tổng lãnh sự quán ', '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Application Workspace Main Container */}
      <div className="app-workspace-content">
        
        {/* MENU 1: LUỒNG TIN TỨC CHÍNH */}
        {currentMenu === 'news' && (
          loading ? (
            <div className="empty"><p>Đang tải cấu trúc luồng tin tức quốc tế...</p></div>
          ) : !filteredSources.length ? (
            <div className="empty">
              <h2>Cơ sở dữ liệu trống</h2>
              <p>Vui lòng chọn nút "Đồng bộ đám mây" ở góc trên để nạp dữ liệu từ RSS.</p>
            </div>
          ) : (
            filteredSources.map(source => {
              if (activeCountry !== 'all' && source.country !== activeCountry) return null;
              if (!source.articles || source.articles.length === 0) return null;

              return (
                <div key={source.country} style={{ marginBottom: '2.5rem' }}>
                  <h2 className="section-headline">
                    {source.flag} {source.name}
                    <span>Cập nhật mới nhất: {new Date(source.updatedAt).toLocaleDateString('vi-VN')}</span>
                  </h2>

                  <div className="grid-layout-stream">
                    {source.articles.map((article, idx) => (
                      <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer" className="news-item-card">
                        <div className="card-visual-header" style={{ background: source.color }}></div>
                        <div className="card-inner-padding">
                          <div>
                            <div className="meta-source-row">
                              <span className="source-indicator-dot" style={{ background: source.color }}></span>
                              {source.name.replace('Tổng lãnh sự quán ', '').replace('Lãnh sự quán ', '')}
                            </div>
                            <div className="article-title">{article.title}</div>
                          </div>
                          <div className="card-bottom-meta">
                            <span>📅 {article.date ? new Date(article.date).toLocaleDateString('vi-VN') : 'Mới cập nhật'}</span>
                            <span style={{ color: '#3182ce', fontWeight: '500' }}>Chi tiết ↗</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })
          )
        )}

        {/* MENU 2: BẢN ĐỒ CHỈ ĐƯỜNG LÃNH SỰ */}
        {currentMenu === 'maps' && (
          <div className="static-page-wrapper">
            <h2 style={{ color: '#2b6cb0', fontFamily: 'Playfair Display', fontSize: '1.8rem' }}>📍 Bản Đồ Hành Chính Các Lãnh Sự Quán Tại TP.HCM</h2>
            <p style={{ color: '#718096', marginTop: '0.5rem', fontSize: '0.9rem' }}>Tra cứu vị trí và sơ đồ tuyến đường di chuyển nộp hồ sơ xin visa thực tế.</p>
            <div style={{ marginTop: '2rem', background: '#f7fafc', border: '1px dashed #cbd5e0', height: '300px', display: 'flex', alignItems: 'center', justifyText: 'center', borderRadius: '12px', textAlign: 'center', padding: '2rem' }}>
              <div>
                <p style={{ fontWeight: '600', color: '#4a5568' }}>Hệ thống bản đồ tích hợp vệ tinh</p>
                <p style={{ fontSize: '0.82rem', color: '#718096', marginTop: '0.4rem' }}>Vị trí trung tâm các Quận 1, Quận 3 sẵn sàng kết nối dữ liệu địa chỉ.</p>
              </div>
            </div>
          </div>
        )}

        {/* MENU 3: ALBUM THƯ VIỆN KHÔNG GIAN HÌNH ẢNH */}
        {currentMenu === 'gallery' && (
          <div className="static-page-wrapper">
            <h2 style={{ color: '#dd6b20', fontFamily: 'Playfair Display', fontSize: '1.8rem' }}>🖼️ Không Gian Tư Liệu Hình Ảnh Quốc Tế</h2>
            <p style={{ color: '#718096', marginTop: '0.5rem', fontSize: '0.9rem' }}>Thư viện ảnh Landscape thực tế phục vụ thiết kế nội dung truyền thông tư vấn.</p>
            <div className="static-grid-gallery">
              {GLOBAL_LANDSCAPES.slice(0, 12).map((imgUrl, i) => (
                <div key={i} className="gallery-photo-item" style={{ backgroundImage: `url('${imgUrl}')` }} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Scroll Trôi Về Đầu Trang */}
      <button className={`scroll-to-top-btn ${showToTop ? 'visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Lên đầu trang">
        ↑
      </button>

      {/* Footer Credits Bar */}
      <div className="footer-credits-bar">
        <span>Kênh Thông Tin Thị Thực Quốc Tế</span> · Hệ thống tự động cập nhật tin tức định kỳ hàng ngày · © 2026
      </div>

      {message && <div className="toast-notify-alert">{message}</div>}
    </>
  );
}
