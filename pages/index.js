import { useState, useEffect } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'read_articles';
const SEEN_KEY = 'seen_articles';

// Kho hình ảnh Landscape siêu rộng (32 hình ảnh thực tế chất lượng cao) di chuyển liên tục
const GLOBAL_LANDSCAPES = [
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80',
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&q=80',
  'https://images.unsplash.com/photo-1617541086271-64d852077e6b?w=1200&q=80',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80',
  'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?w=1200&q=80',
  'https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=1200&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80',
  'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=1200&q=80',
  'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&q=80',
  'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=80',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
  'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200&q=80',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80',
  'https://images.unsplash.com/photo-1472214222541-d510753a4707?w=1200&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=80',
  'https://images.unsplash.com/photo-1433832597046-4f10e10ac764?w=1200&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
  'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?w=1200&q=80',
  'https://images.unsplash.com/photo-1439853949127-fa647821ebd0?w=1200&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
  'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=80'
];

const COUNTRY_CONFIG = {
  all: {
    tz: 'Asia/Ho_Chi_Minh',
    city: 'Hồ Chí Minh',
    brand: 'LONGINES',
    shortName: 'Tất cả',
    fullName: 'Hệ thống Giám sát Tin tức Thị thực & Lãnh sự Toàn cầu'
  },
  my: {
    bg: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80',
    tz: 'America/New_York',
    city: 'Washington D.C.',
    brand: 'ROLEX',
    shortName: 'Mỹ',
    fullName: 'Tổng lãnh sự quán Hoa Kỳ tại TP.Hồ Chí Minh'
  },
  nhat: {
    bg: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
    tz: 'Asia/Tokyo',
    city: 'Tokyo',
    brand: 'SEIKO',
    shortName: 'Nhật Bản',
    fullName: 'Tổng lãnh sự quán Nhật Bản tại TP.Hồ Chí Minh'
  },
  han: {
    bg: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&q=80',
    tz: 'Asia/Seoul',
    city: 'Seoul',
    brand: 'CARTIER',
    shortName: 'Hàn Quốc',
    fullName: 'Tổng lãnh sự quán Đại Hàn Dân Quốc tại TP.Hồ Chí Minh'
  },
  kvac: {
    bg: 'https://images.unsplash.com/photo-1617541086271-64d852077e6b?w=1200&q=80',
    tz: 'Asia/Seoul',
    city: 'KVAC HCM',
    brand: 'CARTIER',
    shortName: 'KVAC',
    fullName: 'Trung tâm Đăng ký Thị thực Hàn Quốc tại TP.Hồ Chí Minh'
  },
  uc: {
    bg: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80',
    tz: 'Australia/Sydney',
    city: 'Canberra',
    brand: 'OMEGA',
    shortName: 'Úc',
    fullName: 'Tổng lãnh sự quán Úc tại TP.Hồ Chí Minh'
  },
  canada: {
    bg: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?w=1200&q=80',
    tz: 'America/Toronto',
    city: 'Ottawa',
    brand: 'JACOB & CO',
    shortName: 'Canada',
    fullName: 'Tổng lãnh sự quán Canada tại TP.Hồ Chí Minh'
  },
  daiLoan: {
    bg: 'https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=1200&q=80',
    tz: 'Asia/Taipei',
    city: 'Taipei',
    brand: 'PATEK PHILIPPE',
    shortName: 'Đài Loan',
    fullName: 'Văn phòng Kinh tế và Văn hóa Đài Bắc tại TP.Hồ Chí Minh'
  }
};

export default function Home() {
  // Quản lý Tab menu góc chính: 'home' | 'visa_news' | 'visa_procedure' | 'gallery'
  const [currentMenu, setCurrentMenu] = useState('home');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');

  // Quản lý số lượng bài viết hiển thị mở rộng của từng quốc gia
  const [expandedSources, setExpandedSources] = useState({});

  // Lưu trữ trạng thái đọc bài viết
  const [readUrls, setReadUrls] = useState([]);
  const [seenUrls, setSeenUrls] = useState([]);
  
  // Real-time Clock & Auto Transition Background index
  const [time, setTime] = useState(new Date());
  const [globalImgIdx, setGlobalImgIdx] = useState(0);
  const [showToTop, setShowToTop] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setReadUrls(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
        setSeenUrls(JSON.parse(localStorage.getItem(SEEN_KEY)) || []);
      } catch(e) { console.error(e); }

      // Theo dõi sự kiện cuộn trang để hiện nút To Top
      const handleScroll = () => {
        setShowToTop(window.scrollY > 300);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    loadNews();
    
    // Timer chạy đồng hồ tích tắc và đổi ảnh nền tự động cho mục "Tất cả"
    const timer = setInterval(() => setTime(new Date()), 1000);
    const bgTimer = setInterval(() => {
      setGlobalImgIdx((prev) => (prev + 1) % GLOBAL_LANDSCAPES.length);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(bgTimer);
    };
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
    setMessage('⏳ Đang thiết lập kết nối đồng bộ an toàn đến các Cổng Ngoại Giao...');
    try {
      const res = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' }
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`✅ Đồng bộ hoàn tất! Cập nhật thành công ${json.total} thông báo thị thực mới.`);
        await loadNews();
      } else {
        setMessage('❌ Lỗi: ' + json.error);
      }
    } catch (e) {
      setMessage('❌ Thất bại: Lỗi thời gian kết nối API');
    }
    setFetching(false);
    setTimeout(() => setMessage(''), 5000);
  }

  function markRead(url) {
    if (!readUrls.includes(url)) {
      const updated = [...readUrls, url];
      setReadUrls(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    if (!seenUrls.includes(url)) {
      const updatedSeen = [...seenUrls, url];
      setSeenUrls(updatedSeen);
      localStorage.setItem(SEEN_KEY, JSON.stringify(updatedSeen));
    }
  }

  function markAllAsSeen() {
    if (!data) return;
    const allUrls = [];
    data.sources.forEach(s => s.articles.forEach(a => allUrls.push(a.url)));
    setSeenUrls(allUrls);
    localStorage.setItem(SEEN_KEY, JSON.stringify(allUrls));
    setMessage('✓ Đã đánh dấu tất cả các thông báo hiện tại là đã xem.');
    setTimeout(() => setMessage(''), 3000);
  }

  const toggleExpandSource = (country) => {
    setExpandedSources(prev => ({ ...prev, [country]: !prev[country] }));
  };

  const getClockAngles = () => {
    const config = COUNTRY_CONFIG[activeCountry] || COUNTRY_CONFIG.all;
    const targetTimeStr = time.toLocaleString('en-US', { timeZone: config.tz });
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
  const activeConfig = COUNTRY_CONFIG[activeCountry] || COUNTRY_CONFIG.all;

  // Xử lý Filter bài viết theo từ khóa tìm kiếm và sitemap
  const filteredSources = data?.sources?.map(source => {
    if (activeCountry !== 'all' && source.country !== activeCountry) return null;
    const matched = source.articles.filter(article => {
      if (!searchQuery) return true;
      return article.title?.toLowerCase().includes(searchQuery.toLowerCase());
    });
    if (activeCountry === 'all' && matched.length === 0 && searchQuery) return null;
    return { ...source, articles: matched };
  }).filter(Boolean) || [];

  const totalUnreadAll = data?.sources?.reduce((acc, s) => acc + s.articles.filter(a => !seenUrls.includes(a.url)).length, 0) || 0;

  return (
    <>
      <Head>
        <title>Consulate News Portal | Premium Cam-Trắng Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Be Vietnam Pro', sans-serif;
          background-color: #fafafa;
          color: #2d3748;
          min-height: 100vh;
        }

        /* Top Navbar - Menu Góc */
        .top-navbar {
          background: #ffffff;
          border-bottom: 1px solid #eaeaea;
          padding: 0.8rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .brand-logo-text {
          font-weight: 800;
          font-size: 1.3rem;
          color: #dd6b20; /* Màu Cam Chủ Đạo */
          cursor: pointer;
          user-select: none;
          transition: transform 0.2s;
        }
        .brand-logo-text:hover { transform: scale(1.02); }
        
        .main-navigation-menu {
          display: flex;
          gap: 0.5rem;
        }
        .nav-menu-item {
          padding: 0.5rem 1.1rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #4a5568;
          background: transparent;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.25s ease;
        }
        .nav-menu-item:hover {
          background: #f7fafc;
          color: #dd6b20;
        }
        .nav-menu-item.active {
          background: #fffaf0;
          color: #dd6b20;
          font-weight: 700;
        }

        /* Hero Banner Premium */
        .hero-banner {
          position: relative;
          height: 380px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .hero-bg-layer-container {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .hero-bg-photo {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 1s ease-in-out, transform 1.5s ease-in-out;
          opacity: 0;
          transform: scale(1.04);
        }
        .hero-bg-photo.active {
          opacity: 1;
          transform: scale(1);
        }
        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(221, 107, 32, 0.95) 0%, rgba(246, 173, 85, 0.88) 60%, rgba(255, 255, 255, 0.98) 100%);
          z-index: 2;
        }
        .hero-inner-content {
          position: relative;
          z-index: 3;
          max-width: 1240px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        .hero-text-block { max-width: 700px; color: #ffffff; }
        .hero-main-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 3.8vw, 3rem);
          font-weight: 800;
          line-height: 1.2;
          text-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .hero-sub-title {
          font-size: 0.98rem;
          color: rgba(255,255,255,0.92);
          margin-top: 0.8rem;
          line-height: 1.5;
        }
        
        .sync-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        .sync-btn {
          background: #ffffff;
          color: #dd6b20;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          padding: 0.7rem 1.5rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          font-size: 0.88rem;
        }
        .sync-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        }
        .time-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.45rem 1rem;
          border-radius: 30px;
          font-size: 0.8rem;
        }

        /* Analog Clock Elite */
        .analog-clock-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.12);
          padding: 1rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(6px);
        }
        .luxury-clock {
          width: 125px; height: 125px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid #dd6b20;
          position: relative;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.05), 0 8px 16px rgba(0,0,0,0.08);
        }
        .clock-brand-name {
          position: absolute;
          top: 28px; left: 0; right: 0;
          text-align: center;
          font-size: 0.52rem;
          font-weight: 800;
          color: #1a202c;
          letter-spacing: 0.12em;
        }
        .clock-core-dot {
          position: absolute;
          width: 6px; height: 6px;
          background: #e65c00;
          border-radius: 50%;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }
        .clock-needle { position: absolute; bottom: 50%; left: 50%; transform-origin: bottom center; }
        .needle-hour { width: 4px; height: 32px; background: #2d3748; margin-left: -2px; }
        .needle-min { width: 2.5px; height: 44px; background: #718096; margin-left: -1.25px; }
        .needle-sec { width: 1.2px; height: 48px; background: #dd6b20; margin-left: -0.6px; transition: transform 1s linear; }
        
        .clock-city-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: uppercase;
        }

        /* Controls Section & Sitemap (No Scroll, Wrap fully) */
        .controls-section {
          max-width: 1240px;
          margin: -2.2rem auto 0;
          padding: 0 2rem;
          position: relative;
          z-index: 20;
        }
        .search-filter-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 1.2rem;
          box-shadow: 0 10px 25px rgba(160, 174, 192, 0.1);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .search-bar-inner { position: relative; width: 100%; }
        .search-input {
          width: 100%; padding: 0.85rem 1.2rem 0.85rem 2.8rem;
          border-radius: 10px; border: 1px solid #cbd5e0;
          background: #f7fafc; font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .search-input:focus { border-color: #dd6b20; background: #ffffff; outline: none; }
        .search-icon-svg { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #a0aec0; width: 16px; height: 16px; }
        
        /* Sitemap chỉnh sửa: Hiển thị dạng lưới bọc đầy đủ, không cuộn ngang khuất nút */
        .sitemap-grid-flow {
          display: flex;
          flex-wrap: wrap; /* Tự động xuống dòng linh hoạt */
          gap: 0.5rem;
          width: 100%;
        }
        .sitemap-btn-item {
          padding: 0.55rem 1.1rem;
          border-radius: 20px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 0.84rem;
          font-weight: 600;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .sitemap-btn-item:hover { background: #e2e8f0; color: #1a202c; }
        .sitemap-btn-item.active {
          background: #fffaf0;
          border-color: #fbd38d;
          color: #dd6b20;
        }
        .badge-count { font-size: 0.7rem; background: #feebc8; color: #c05621; padding: 0.1rem 0.4rem; border-radius: 8px; font-weight: 700; }
        .badge-count.alert { background: #fed7d7; color: #c53030; }

        /* Khối Nội dung chính / Lưới bài viết */
        .content-container { max-width: 1240px; margin: 1.5rem auto 4rem; padding: 0 2rem; }
        .source-group-wrapper { margin-bottom: 3rem; animation: fadeInUp 0.4s ease-out; }
        .source-group-title-bar { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1rem; border-bottom: 2px solid #edf2f7; padding-bottom: 0.5rem; }
        .source-group-name { font-size: 1.1rem; font-weight: 700; color: #1a202c; }
        .source-group-time-ago { font-size: 0.75rem; color: #a0aec0; }
        
        .news-grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; }
        .article-card-anchor {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 1.1rem; text-decoration: none; display: flex; flex-direction: column;
          justify-content: space-between; height: 100%; transition: all 0.25s ease;
        }
        .article-card-anchor:hover {
          transform: translateY(-3px); border-color: #fbd38d; box-shadow: 0 10px 20px rgba(221, 107, 32, 0.05);
        }
        .article-title-text { font-size: 0.9rem; font-weight: 600; color: #2d3748; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .article-card-anchor:hover .article-title-text { color: #dd6b20; }
        
        .article-footer-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.6rem; border-top: 1px dashed #edf2f7; font-size: 0.75rem; color: #718096; }
        .state-dot { width: 7px; height: 7px; border-radius: 50%; background: #dd6b20; display: inline-block; flex-shrink: 0; margin-top: 0.35rem; }

        /* Nút Xem Tất Cả Cho Từng Quốc Gia */
        .view-all-block-btn {
          display: block; width: 100%; text-align: center; margin-top: 1.2rem;
          padding: 0.65rem; background: #ffffff; border: 1px dashed #cbd5e0;
          color: #4a5568; border-radius: 10px; font-weight: 600; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
        }
        .view-all-block-btn:hover {
          background: #fffaf0; border-color: #dd6b20; color: #dd6b20;
        }

        /* Giao diện TRANG CHỦ MỚI (Category Grid View) */
        .home-categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .category-card-portal {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          height: 280px;
        }
        .category-card-portal:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(221, 107, 32, 0.1);
          border-color: #fbd38d;
        }
        .category-img-cover {
          height: 170px;
          position: relative;
          background-size: cover;
          background-position: center;
          transition: transform 1s ease;
        }
        .category-card-portal:hover .category-img-cover { transform: scale(1.03); }
        .category-info-body {
          padding: 1.2rem;
          background: #ffffff;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .category-title-main { font-size: 1.1rem; font-weight: 700; color: #1a202c; }
        .category-desc-sub { font-size: 0.82rem; color: #718096; margin-top: 0.3rem; line-height: 1.4; }

        /* Thống nhất các trang tĩnh khác */
        .static-page-wrapper {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.5rem; min-height: 400px;
        }
        .static-grid-gallery {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; margin-top: 1.5rem;
        }
        .gallery-photo-item {
          height: 180px; border-radius: 10px; background-size: cover; background-position: center;
          border: 1px solid #edf2f7; transition: transform 0.3s;
        }
        .gallery-photo-item:hover { transform: scale(1.04); }

        /* Nút Cuộn về đầu trang (To Top) */
        .scroll-to-top-btn {
          position: fixed; bottom: 2.5rem; right: 2.5rem;
          width: 45px; height: 45px; border-radius: 50%;
          background: #dd6b20; color: #ffffff; border: none;
          font-size: 1.2rem; font-weight: bold; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 15px rgba(221, 107, 32, 0.4);
          z-index: 99; opacity: 0; transform: scale(0.8);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .scroll-to-top-btn.visible { opacity: 1; transform: scale(1); pointer-events: auto; }
        .scroll-to-top-btn:hover { background: #c05621; transform: scale(1.08); }

        .toast-body { background: #fffaf0; border-left: 4px solid #dd6b20; padding: 0.8rem 1.2rem; border-radius: 8px; color: #c05621; font-size: 0.88rem; margin: 1rem auto 0; max-width: 1240px; }
        .spinner-icon { width: 26px; height: 26px; border: 3px solid rgba(221,107,32,0.1); border-top-color: #dd6b20; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 991px) {
          .hero-banner { height: auto; padding: 3rem 0; }
          .hero-inner-content { flex-direction: column-reverse; text-align: center; gap: 2rem; }
          .analog-clock-wrapper { max-width: 200px; }
          .search-filter-card { padding: 1rem; }
        }
        @media (max-width: 600px) {
          .top-navbar { padding: 0.8rem 1rem; flex-direction: column; gap: 0.8rem; }
          .controls-section { padding: 0 1rem; margin-top: -1.5rem; }
          .content-container { padding: 0 1rem; }
          .news-grid-layout { grid-template-columns: 1fr; }
          .scroll-to-top-btn { bottom: 1.5rem; right: 1.5rem; width: 40px; height: 40px; }
        }
      `}</style>

      {/* Top Navbar */}
      <div className="top-navbar">
        {/* YÊU CẦU 2: Nhấp vô chữ Logo sẽ lập tức quay về trang chủ */}
        <div className="brand-logo-text" onClick={() => setCurrentMenu('home')}>
          🍊 ConsulateNews
        </div>
        <div className="main-navigation-menu">
          <button className={`nav-menu-item ${currentMenu === 'home' ? 'active' : ''}`} onClick={() => setCurrentMenu('home')}>Trang Chủ</button>
          <button className={`nav-menu-item ${currentMenu === 'visa_news' ? 'active' : ''}`} onClick={() => setCurrentMenu('visa_news')}>Tin tức Lãnh sự</button>
          <button className={`nav-menu-item ${currentMenu === 'visa_procedure' ? 'active' : ''}`} onClick={() => setCurrentMenu('visa_procedure')}>Thủ tục Visa</button>
          <button className={`nav-menu-item ${currentMenu === 'gallery' ? 'active' : ''}`} onClick={() => setCurrentMenu('gallery')}>Album Hình Ảnh</button>
        </div>
      </div>

      {/* Premium Hero Banner Section */}
      <div className="hero-banner">
        <div className="hero-bg-layer-container">
          {/* YÊU CẦU 2: Ở mục "Tất cả" ảnh sẽ đổi liên tục trong kho 32 tấm */}
          {activeCountry === 'all' ? (
            GLOBAL_LANDSCAPES.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`hero-bg-photo ${globalImgIdx === idx ? 'active' : ''}`}
                style={{ backgroundImage: `url('${imgUrl}')` }}
              />
            ))
          ) : (
            Object.keys(COUNTRY_CONFIG).map((key) => (
              <div
                key={key}
                className={`hero-bg-photo ${activeCountry === key ? 'active' : ''}`}
                style={{ backgroundImage: `url('${COUNTRY_CONFIG[key].bg || GLOBAL_LANDSCAPES[0]}')` }}
              />
            ))
          )}
        </div>
        <div className="hero-gradient-overlay"></div>
        
        <div className="hero-inner-content">
          <div className="hero-text-block">
            {/* YÊU CẦU 4: Nhấn vào sitemap ngắn gọn sẽ hiển thị Tên Đầy Đủ chính thức tại đây */}
            <h1 className="hero-main-title">{activeConfig.fullName}</h1>
            <p className="hero-sub-title">Hệ thống tổng hợp và phân tích thông báo từ cơ quan ngoại giao ngoại bang</p>
            
            <div className="sync-row">
              <button className="sync-btn" onClick={triggerFetch} disabled={fetching}>
                {fetching ? 'Đang đồng bộ...' : '🔄 Cập nhật ngay'}
              </button>
              {data?.lastUpdated && (
                <div className="time-badge">
                  Đồng bộ: <b>{new Date(data.lastUpdated).toLocaleTimeString('vi-VN')}</b>
                </div>
              )}
            </div>
          </div>

          {/* Luxury Analog Clock Dashboard */}
          <div className="analog-clock-wrapper">
            <div className="luxury-clock">
              <div className="clock-brand-name">{activeConfig.brand}</div>
              <div className="clock-core-dot"></div>
              <div className="clock-needle needle-hour" style={{ transform: `rotate(${angles.hour}deg)` }}></div>
              <div className="clock-needle needle-min" style={{ transform: `rotate(${angles.minute}deg)` }}></div>
              <div className="clock-needle needle-sec" style={{ transform: `rotate(${angles.second}deg)` }}></div>
            </div>
            <div className="clock-city-label">{activeConfig.city} TIME</div>
          </div>
        </div>
      </div>

      {message && <div className="toast-body">{message}</div>}

      {/* Main Container Render Dynamic theo Menu */}
      <div className="content-container">
        
        {/* DANH MỤC 1: TRANG CHỦ (Hiển thị các ô danh mục Grid lớn) */}
        {currentMenu === 'home' && (
          <div>
            <h2 style={{fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', color: '#1a202c'}}>Danh Mục Quản Trị Hệ Thống</h2>
            <div className="home-categories-grid">
              
              {/* Ô Danh mục 1: Tin tức Thị thực & Lãnh sự (Có ảnh landscape chạy liên tục) */}
              <div className="category-card-portal" onClick={() => setCurrentMenu('visa_news')}>
                <div className="category-img-cover" style={{ backgroundImage: `url('${GLOBAL_LANDSCAPES[globalImgIdx]}')` }}></div>
                <div className="category-info-body">
                  <div className="category-title-main">🍊 Tin Tức Thị Thực & Lãnh Sự</div>
                  <div className="category-desc-sub">Báo cáo trực tiếp tình hình cấp phát visa, lịch hẹn trống và thông tư mới từ Lãnh sự quán các nước.</div>
                </div>
              </div>

              {/* Ô Danh mục 2: Thủ tục Visa */}
              <div className="category-card-portal" onClick={() => setCurrentMenu('visa_procedure')}>
                <div className="category-img-cover" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80')` }}></div>
                <div className="category-info-body">
                  <div className="category-title-main">📝 Quy Trình & Thủ Tục Hồ Sơ</div>
                  <div className="category-desc-sub">Hướng dẫn chi tiết quy chuẩn chuẩn bị hồ sơ xin visa du lịch, công tác, thăm thân nhân chuẩn xác.</div>
                </div>
              </div>

              {/* Ô Danh mục 3: Album hình ảnh các nước */}
              <div className="category-card-portal" onClick={() => setCurrentMenu('gallery')}>
                <div className="category-img-cover" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80')` }}></div>
                <div className="category-info-body">
                  <div className="category-title-main">🖼️ Album Hình Ảnh Quốc Tế</div>
                  <div className="category-desc-sub">Bộ sưu tập hình ảnh phong cảnh thực tế, kiến trúc đô thị đặc trưng sắc nét tại các quốc gia.</div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* DANH MỤC 2: TOÀN BỘ PHẦN CẬP NHẬT TIN TỨC VISA HIỆN TẠI */}
        {currentMenu === 'visa_news' && (
          <div>
            {/* Thanh tìm kiếm và Sitemap thiết kế No-Scroll thân thiện PC/Mobile */}
            <div className="search-filter-card" style={{marginBottom: '2rem'}}>
              <div className="search-bar-inner">
                <svg className="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Tìm kiếm tiêu đề tin tức, thông báo visa khẩn cấp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* YÊU CẦU 4: Sitemap ghi ngắn gọn (Mỹ, Nhật Bản,...), tự động xuống hàng không bị tràn màn hình */}
              {data?.sources?.length > 0 && (
                <div className="sitemap-grid-flow">
                  <button className={`sitemap-btn-item ${activeCountry === 'all' ? 'active' : ''}`} onClick={() => setActiveCountry('all')}>
                    🌏 Toàn bộ khu vực {totalUnreadAll > 0 && <span className="badge-count alert">{totalUnreadAll}</span>}
                  </button>
                  {data.sources.map(s => {
                    const unread = s.articles.filter(a => !seenUrls.includes(a.url)).length;
                    return (
                      <button key={s.country} className={`sitemap-btn-item ${activeCountry === s.country ? 'active' : ''}`} onClick={() => setActiveCountry(s.country)}>
                        <span>{s.flag}</span>
                        <span>{COUNTRY_CONFIG[s.country]?.shortName || s.name}</span>
                        {unread > 0 ? <span className="badge-count alert">{unread}</span> : <span className="badge-count">{s.articles.length}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'1rem'}}>
              <button style={{background:'none', border:'none', color:'#718096', fontSize:'0.82rem', fontWeight:600, cursor:'pointer'}} onClick={markAllAsSeen}>✓ Đánh dấu đã xem toàn bộ bài viết</button>
            </div>

            {loading ? (
              <div className="loading-screen-box">
                <div className="spinner-icon"></div>
                <p>Đang tải cổng thông tin thị thực...</p>
              </div>
            ) : filteredSources.length === 0 ? (
              <div className="loading-screen-box"><h2>Không tìm thấy thông báo phù hợp</h2></div>
            ) : (
              filteredSources.map(source => {
                const isExpanded = expandedSources[source.country];
                // YÊU CẦU 3: Mỗi lần chỉ hiển thị tối đa 10 bài mới nhất, bài sau ẩn đi
                const displayedArticles = isExpanded ? source.articles : source.articles.slice(0, 10);
                const hasMoreThanTen = source.articles.length > 10;

                return (
                  <div key={source.country} className="source-group-wrapper">
                    <div className="source-group-title-bar">
                      <span style={{fontSize:'1.5rem'}}>{source.flag}</span>
                      <div>
                        <h3 className="source-group-name">{source.name}</h3>
                        <div className="source-group-time-ago">Quét dữ liệu: {new Date(source.updatedAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                      <span className="source-total-indicator">{source.articles.length} bài tổng số</span>
                    </div>

                    <div className="news-grid-layout">
                      {displayedArticles.map((article, i) => {
                        const isRead = readUrls.includes(article.url);
                        const isNew = !seenUrls.includes(article.url);
                        return (
                          <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="article-card-anchor" onClick={() => markRead(article.url)}>
                            <div style={{display:'flex', gap:'0.6rem', alignItems:'flex-start'}}>
                              {isNew && !isRead ? <span className="state-dot"></span> : <span className="state-dot" style={{background:'#cbd5e0', boxHighlight:'none'}}></span>}
                              <span className="article-title-text">{article.title || article.url}</span>
                            </div>
                            <div className="article-footer-meta">
                              <span>📅 {article.date ? new Date(article.date).toLocaleDateString('vi-VN') : '---'}</span>
                              {isNew && !isRead && <span style={{background:'#fff5f5', color:'#e53e3e', padding:'0.15rem 0.4rem', borderRadius:'4px', fontWeight:700, fontSize:'0.7rem'}}>MỚI</span>}
                              {isRead && <span style={{color:'#718096'}}>✓ Đã đọc</span>}
                            </div>
                          </a>
                        );
                      })}
                    </div>

                    {/* YÊU CẦU 3: Nút bấm Xem tất cả nếu quốc gia đó có hơn 10 bài viết */}
                    {hasMoreThanTen && (
                      <button className="view-all-block-btn" onClick={() => toggleExpandSource(source.country)}>
                        {isExpanded ? '▲ Thu gọn danh sách bài viết' : `▼ Xem tất cả bài viết (+${source.articles.length - 10} bài viết cũ hơn)`}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* DANH MỤC 3: THỦ TỤC VISA (Trang tĩnh mở rộng tương lai) */}
        {currentMenu === 'visa_procedure' && (
          <div className="static-page-wrapper">
            <h2 style={{color: '#dd6b20', fontFamily: 'Playfair Display', fontSize: '1.8rem'}}>📚 Hướng Dẫn Hồ Sơ Thủ Tục Visa</h2>
            <p style={{color: '#718096', marginTop: '0.5rem', fontSize:'0.9rem'}}>Cơ sở dữ liệu đang cấu trúc hóa các bước chuẩn bị hồ sơ cho các thị trường chính ngạch...</p>
            <div style={{marginTop: '2rem', borderLeft: '3px solid #dd6b20', paddingLeft: '1rem', color: '#4a5568', lineHeight: '1.6'}}>
              <p><b>1. Nhóm hồ sơ nhân thân:</b> Hộ chiếu gốc hạn trên 6 tháng, căn cước công dân, tờ khai xin thị thực quốc gia chỉ định.</p>
              <p style={{marginTop:'0.8rem'}}><b>2. Nhóm chứng minh tài chính:</b> Sổ tiết kiệm kỳ hạn ổn định, sao kê tài khoản ngân hàng biến động 3 tháng gần nhất.</p>
              <p style={{marginTop:'0.8rem'}}><b>3. Nhóm chứng minh công việc:</b> Hợp đồng lao động hợp pháp, quyết định bổ nhiệm nhân sự kèm đơn xin nghỉ phép trùng khớp lịch trình.</p>
            </div>
          </div>
        )}

        {/* DANH MỤC 4: ALBUM HÌNH ẢNH CÁC NƯỚC */}
        {currentMenu === 'gallery' && (
          <div className="static-page-wrapper">
            <h2 style={{color: '#dd6b20', fontFamily: 'Playfair Display', fontSize: '1.8rem'}}>🖼️ Không Gian Tư Liệu Hình Ảnh Quốc Tế</h2>
            <p style={{color: '#718096', marginTop: '0.5rem', fontSize:'0.9rem'}}>Thư viện ảnh Landscape thực tế phục vụ thiết kế nội dung truyền thông tư vấn.</p>
            <div className="static-grid-gallery">
              {GLOBAL_LANDSCAPES.slice(0, 12).map((imgUrl, i) => (
                <div key={i} className="gallery-photo-item" style={{backgroundImage: `url('${imgUrl}')`}} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* YÊU CẦU 1: Thanh/Nút cuộn trôi về đầu trang mượt mà */}
      <button className={`scroll-to-top-btn ${showToTop ? 'visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Lên đầu trang">
        ↑
      </button>

      {/* Footer */}
      <div className="footer-credits-bar" style={{background:'#ffffff', borderTop:'1px solid #edf2f7', textText:'center', padding:'1.5rem 2rem', color:'#718096', fontSize:'0.82rem', textAlign:'center'}}>
        <div>🍊 Consulate News Dashboard Portal · © 2026</div>
        <div style={{fontSize:'0.75rem', color:'#a0aec0', marginTop:'0.3rem'}}>Hệ thống đồng bộ dữ liệu tự động hoàn toàn lúc 7:00 SA mỗi ngày</div>
      </div>
    </>
  );
}
