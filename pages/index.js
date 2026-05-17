import { useState, useEffect } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'read_articles';
const SEEN_KEY = 'seen_articles';

// Cấu hình hình ảnh phong cảnh thực tế, múi giờ và thương hiệu đồng hồ xa xỉ của từng quốc gia
var COUNTRY_CONFIG = {
  all: {
    bg: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&q=80', // Toàn cảnh sân bay, hành trình quốc tế
    tz: 'Asia/Ho_Chi_Minh',
    city: 'Hồ Chí Minh',
    brand: 'LONGINES',
    label: { vi: 'Toàn cầu', en: 'Global' }
  },
  my: {
    bg: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600&q=80', // Cầu Brooklyn & New York Skyline
    tz: 'America/New_York',
    city: 'Washington D.C.',
    brand: 'ROLEX',
    label: { vi: 'Mỹ', en: 'USA' }
  },
  nhat: {
    bg: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=80', // Núi Phú Sĩ kì vĩ ngày nắng đẹp
    tz: 'Asia/Tokyo',
    city: 'Tokyo',
    brand: 'SEIKO',
    label: { vi: 'Nhật Bản', en: 'Japan' }
  },
  han: {
    bg: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&q=80', // Thành phố Seoul hiện đại về đêm
    tz: 'Asia/Seoul',
    city: 'Seoul',
    brand: 'CARTIER',
    label: { vi: 'Hàn Quốc', en: 'Korea' }
  },
  kvac: {
    bg: 'https://images.unsplash.com/photo-1617541086271-64d852077e6b?w=1600&q=80', // Cung điện Gyeongbokgung cổ kính cổ kính
    tz: 'Asia/Seoul',
    city: 'KVAC HCM',
    brand: 'CARTIER',
    label: { vi: 'Trung tâm KVAC', en: 'KVAC Center' }
  },
  uc: {
    bg: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&q=80', // Nhà hát Opera Sydney biểu tượng bên bờ vịnh
    tz: 'Australia/Sydney',
    city: 'Canberra',
    brand: 'OMEGA',
    label: { vi: 'Úc', en: 'Australia' }
  },
  canada: {
    bg: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?w=1600&q=80', // Hồ núi đá Moraine xanh ngọc của Canada
    tz: 'America/Toronto',
    city: 'Ottawa',
    brand: 'JACOB & CO',
    label: { vi: 'Canada', en: 'Canada' }
  },
  daiLoan: {
    bg: 'https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=1600&q=80', // Tòa tháp biểu tượng Taipei 101 kiêu hãnh
    tz: 'Asia/Taipei',
    city: 'Taipei',
    brand: 'PATEK PHILIPPE',
    label: { vi: 'Đài Loan', en: 'Taiwan' }
  }
};

var TRANSLATIONS = {
  vi: {
    title: 'Hệ thống Giám sát Tin tức Thị thực & Lãnh sự',
    subtitle: 'Cập nhật tin tức chính thống từ Cơ quan ngoại giao các nước tại TP.HCM',
    btnUpdate: 'Cập nhật ngay', btnUpdating: 'Đang đồng bộ...',
    searchPlaceholder: 'Tìm kiếm tiêu đề tin tức, thông báo visa...',
    tabAll: '🌏 Tất cả quốc gia',
    badgeNew: 'MỚI', badgeRead: 'Đã đọc',
    noData: 'Chưa có dữ liệu thông báo',
    noDataSub: 'Vui lòng nhấn nút cập nhật để tải tin tức mới nhất từ cổng thông tin.',
    lastFetched: 'Đồng bộ hệ thống lúc', totalArticles: 'Tổng số bài viết',
    btnMarkAll: '✓ Đánh dấu đã xem toàn bộ', clockTitle: 'MÚI GIỜ',
    loading: 'Đang tải dữ liệu tin tức...', footerText: 'Hệ thống cập nhật tự động định kỳ lúc 7:00 SA mỗi ngày'
  },
  en: {
    title: 'Consular & Visa News Monitor System',
    subtitle: 'Real-time official updates from consulates and embassies in HCMC',
    btnUpdate: 'Sync Now', btnUpdating: 'Syncing...',
    searchPlaceholder: 'Search article titles, visa updates...',
    tabAll: '🌏 All Countries',
    badgeNew: 'NEW', badgeRead: 'Read',
    noData: 'No announcements found',
    noDataSub: 'Please click Sync Now to load the latest consular updates.',
    lastFetched: 'System synced at', totalArticles: 'Total articles',
    btnMarkAll: '✓ Mark all as seen', clockTitle: 'TIMEZONE',
    loading: 'Loading news data...', footerText: 'System auto-updates periodically every day at 7:00 AM'
  }
};

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');
  const [lang, setLang] = useState('vi');

  // Quản lý trạng thái đọc bài viết
  const [readUrls, setReadUrls] = useState([]);
  const [seenUrls, setSeenUrls] = useState([]);
  
  // Real-time Clock cho đồng hồ Analog kim trôi
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Đọc cài đặt ngôn ngữ và trạng thái đọc từ localStorage
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('consulate_lang');
      if (savedLang) setLang(savedLang);

      try {
        setReadUrls(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
        setSeenUrls(JSON.parse(localStorage.getItem(SEEN_KEY)) || []);
      } catch(e) { console.error(e); }
    }
    
    loadNews();

    // Chạy xung nhịp đồng hồ kim tích tắc mượt mà
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
    setMessage(lang === 'vi' ? '⏳ Đang thiết lập kết nối an toàn đến các Cổng thông tin ngoại giao...' : '⏳ Securing links to diplomatic portals...');
    try {
      const res = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' }
      });
      const json = await res.json();
      if (json.success) {
        setMessage(lang === 'vi' ? `✅ Đồng bộ hoàn tất! Tải thành công ${json.total} thông báo.` : `✅ Sync successful! Loaded ${json.total} updates.`);
        await loadNews();
      } else {
        setMessage('❌ Error: ' + json.error);
      }
    } catch (e) {
      setMessage(lang === 'vi' ? '❌ Thất bại: Lỗi kết nối đến máy chủ API' : '❌ Sync failed: Connection timeout');
    }
    setFetching(false);
    setTimeout(() => setMessage(''), 5000);
  }

  function changeLang(l) {
    setLang(l);
    localStorage.setItem('consulate_lang', l);
  }

  function markRead(url) {
    if (!readUrls.includes(url)) {
      const updated = [...readUrls, url];
      setReadUrls(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    // Đồng thời thêm vào danh sách đã nhìn thấy để giảm bớt số lượng đếm thông báo mới
    if (!seenUrls.includes(url)) {
      const updatedSeen = [...seenUrls, url];
      setSeenUrls(updatedSeen);
      localStorage.setItem(SEEN_KEY, JSON.stringify(updatedSeen));
    }
  }

  function markAllAsSeen() {
    if (!data) return;
    const allUrls = [];
    data.sources.forEach(s => {
      s.articles.forEach(a => {
        allUrls.push(a.url);
      });
    });
    setSeenUrls(allUrls);
    localStorage.setItem(SEEN_KEY, JSON.stringify(allUrls));
    setMessage(lang === 'vi' ? '✓ Đã đánh dấu tất cả các thông báo hiện tại là đã xem.' : '✓ Marked all current updates as seen.');
    setTimeout(() => setMessage(''), 4000);
  }

  // Thuật toán tính góc quay kim đồng hồ theo múi giờ quốc gia đang kích hoạt
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

  const t = TRANSLATIONS[lang];
  const angles = getClockAngles();
  const activeConfig = COUNTRY_CONFIG[activeCountry] || COUNTRY_CONFIG.all;

  // Lọc dữ liệu hiển thị theo Tìm kiếm và Quốc gia
  const filteredSources = data?.sources?.map(source => {
    if (activeCountry !== 'all' && source.country !== activeCountry) return null;
    
    const matchedArticles = source.articles.filter(article => {
      if (!searchQuery) return true;
      return article.title?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (activeCountry === 'all' && matchedArticles.length === 0 && searchQuery) return null;

    return { ...source, articles: matchedArticles };
  }).filter(Boolean) || [];

  // Tính số bài viết chưa đọc (Chưa có trong seenUrls) để hiển thị huy hiệu thông báo
  const getUnreadCountBySource = (source) => {
    return source.articles.filter(a => !seenUrls.includes(a.url)).length;
  };

  const totalUnreadAll = data?.sources?.reduce((acc, s) => acc + s.articles.filter(a => !seenUrls.includes(a.url)).length, 0) || 0;

  return (
    <>
      <Head>
        <title>Consulate & Visa News Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Be Vietnam Pro', sans-serif;
          background-color: #fcfcfd;
          color: #2d3748;
          min-height: 100vh;
        }

        /* Top Utilities Bar: Chuyển ngôn ngữ và Reset */
        .top-navbar {
          background: #ffffff;
          border-bottom: 1px solid #edf2f7;
          padding: 0.6rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .brand-logo-text {
          font-weight: 800;
          font-size: 1.1rem;
          color: #dd6b20; /* Màu cam chủ đạo */
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .lang-switch-box {
          display: flex;
          gap: 0.3rem;
          background: #f7fafc;
          padding: 0.25rem;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }
        .lang-btn {
          padding: 0.35rem 0.9rem;
          border-radius: 16px;
          border: none;
          background: transparent;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          color: #718096;
          transition: all 0.2s ease;
        }
        .lang-btn.active {
          background: #dd6b20;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(221, 107, 32, 0.3);
        }

        /* Premium Dynamic Hero Section với ảnh thật và tông cam */
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
          transition: opacity 0.8s ease-in-out, transform 1.2s ease-in-out;
          opacity: 0;
          transform: scale(1.03);
        }
        .hero-bg-photo.active {
          opacity: 1;
          transform: scale(1);
        }
        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(221, 107, 32, 0.94) 0%, rgba(246, 173, 85, 0.88) 55%, rgba(255, 255, 255, 0.98) 100%);
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
        .hero-text-block { max-width: 680px; color: #ffffff; }
        .hero-main-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.1rem, 4vw, 3.2rem);
          font-weight: 800;
          line-height: 1.15;
          color: #ffffff;
          text-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .hero-sub-title {
          font-size: 0.98rem;
          color: rgba(255,255,255,0.9);
          margin-top: 1rem;
          font-weight: 400;
          line-height: 1.6;
          max-width: 580px;
        }
        .hero-meta-wrapper {
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
          padding: 0.75rem 1.6rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
        }
        .sync-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.18);
          background: #fff8f5;
        }
        .sync-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .time-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 0.45rem 1rem;
          border-radius: 30px;
          font-size: 0.8rem;
          color: #ffffff;
          font-weight: 500;
        }

        /* Đồng hồ Analog Đẳng cấp */
        .analog-clock-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          background: rgba(255, 255, 255, 0.12);
          padding: 1.2rem;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        .luxury-clock {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: #ffffff;
          border: 5px solid #dd6b20;
          position: relative;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.06), 0 10px 20px rgba(0,0,0,0.1);
        }
        .clock-brand-name {
          position: absolute;
          top: 32px; left: 0; right: 0;
          text-align: center;
          font-size: 0.55rem;
          font-weight: 800;
          color: #2d3748;
          letter-spacing: 0.15em;
        }
        .clock-core-dot {
          position: absolute;
          width: 8px; height: 8px;
          background: #e65c00;
          border-radius: 50%;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }
        .clock-needle {
          position: absolute;
          bottom: 50%; left: 50%;
          transform-origin: bottom center;
          border-radius: 4px;
        }
        .needle-hour { width: 4.5px; height: 35px; background: #2d3748; margin-left: -2.25px; }
        .needle-min { width: 3px; height: 50px; background: #718096; margin-left: -1.5px; }
        .needle-sec { 
          width: 1.5px; height: 55px; background: #dd6b20; margin-left: -0.75px;
          transition: transform 1s linear; /* Kim trôi tích tắc mượt mà */
        }
        .clock-city-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* Trực quan Bộ lọc Tìm kiếm và Phân loại */
        .controls-section {
          max-width: 1240px;
          margin: -2.2rem auto 0;
          padding: 0 2rem;
          position: relative;
          z-index: 20;
        }
        .search-filter-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 1.2rem;
          box-shadow: 0 10px 30px rgba(160, 174, 192, 0.15);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .search-bar-inner {
          position: relative;
          width: 100%;
        }
        .search-input {
          width: 100%;
          padding: 0.9rem 1.2rem 0.9rem 3rem;
          border-radius: 12px;
          border: 1px solid #cbd5e0;
          background: #f7fafc;
          font-size: 0.92rem;
          font-family: 'Be Vietnam Pro', sans-serif;
          color: #2d3748;
          transition: all 0.25s ease;
        }
        .search-input:focus {
          border-color: #dd6b20;
          background: #ffffff;
          outline: none;
          box-shadow: 0 0 0 4px rgba(221, 107, 32, 0.1);
        }
        .search-icon-svg {
          position: absolute;
          left: 1.1rem; top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
          width: 18px; height: 18px;
        }
        
        /* Menu chọn quốc gia cuộn trượt mượt mà */
        .countries-tabs-flow {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 0.2rem;
        }
        .countries-tabs-flow::-webkit-scrollbar { display: none; }
        .country-tab-item {
          padding: 0.6rem 1.2rem;
          border-radius: 25px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .country-tab-item:hover {
          background: #e2e8f0;
          color: #1a202c;
        }
        .country-tab-item.active {
          background: #fffaf0;
          border-color: #fbd38d;
          color: #dd6b20;
          box-shadow: inset 0 1px 2px rgba(221,107,32,0.05);
        }
        .count-badge-orange {
          font-size: 0.72rem;
          background: #feebc8;
          color: #c05621;
          padding: 0.1rem 0.45rem;
          border-radius: 10px;
          font-weight: 700;
        }
        .count-badge-orange.alert {
          background: #fed7d7;
          color: #c53030;
        }

        /* Tiện ích Đánh dấu xem toàn bộ */
        .actions-row {
          display: flex;
          justify-content: flex-end;
          max-width: 1240px;
          margin: 1.5rem auto 0;
          padding: 0 2rem;
        }
        .mark-all-btn {
          background: transparent;
          border: none;
          color: #718096;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          transition: all 0.2s;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .mark-all-btn:hover { background: #edf2f7; color: #2d3748; }

        /* Toast thông báo hệ thống */
        .system-toast-container {
          max-width: 1240px;
          margin: 1rem auto 0;
          padding: 0 2rem;
        }
        .alert-toast-body {
          background: #fffaf0;
          border: 1px solid #feebc8;
          border-left: 4px solid #dd6b20;
          padding: 0.8rem 1.2rem;
          border-radius: 8px;
          color: #c05621;
          font-size: 0.88rem;
          font-weight: 500;
          animation: slideIn 0.3s ease;
        }

        /* Khối hiển thị dữ liệu mạng lưới tin tức */
        .content-container {
          max-width: 1240px;
          margin: 1.5rem auto 4rem;
          padding: 0 2rem;
        }
        .source-group-wrapper {
          margin-bottom: 3.5rem;
          animation: fadeInUp 0.5s ease-in-out;
        }
        .source-group-title-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.2rem;
          border-bottom: 2px solid #edf2f7;
          padding-bottom: 0.6rem;
        }
        .source-group-flag { font-size: 1.6rem; }
        .source-group-name { font-size: 1.15rem; font-weight: 700; color: #1a202c; }
        .source-group-time-ago { font-size: 0.75rem; color: #a0aec0; margin-top: 0.15rem; }
        .source-total-indicator {
          margin-left: auto;
          font-size: 0.78rem;
          background: #edf2f7;
          color: #4a5568;
          padding: 0.25rem 0.65rem;
          border-radius: 8px;
          font-weight: 600;
        }

        /* Thẻ Bài viết Kính Mờ Sáng Cực Đẹp */
        .news-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.2rem;
        }
        .article-card-anchor {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.3rem;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 6px rgba(160, 174, 192, 0.02);
        }
        .article-card-anchor:hover {
          transform: translateY(-4px);
          border-color: #fbd38d;
          box-shadow: 0 12px 24px rgba(221, 107, 32, 0.08);
          background: #fffdfb;
        }
        .article-headline-container {
          display: flex;
          gap: 0.7rem;
          align-items: flex-start;
        }
        .state-dot-orange {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #dd6b20;
          margin-top: 0.4rem;
          flex-shrink: 0;
          box-shadow: 0 0 6px #dd6b20;
        }
        .article-title-text {
          font-size: 0.92rem;
          font-weight: 600;
          color: #2d3748;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s ease;
        }
        .article-card-anchor:hover .article-title-text { color: #dd6b20; }
        
        .article-footer-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.2rem;
          padding-top: 0.75rem;
          border-top: 1px dashed #edf2f7;
        }
        .article-date-stamp { font-size: 0.76rem; color: #718096; display: flex; align-items: center; gap: 0.25rem; }
        .read-status-tag {
          font-size: 0.72rem;
          background: #e2e8f0;
          color: #4a5568;
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          font-weight: 600;
        }

        /* Trạng thái trống hoặc đang tải */
        .loading-screen-box, .empty-screen-box {
          text-align: center;
          padding: 5rem 2rem;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          color: #718096;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .loading-spinner-element {
          width: 28px; height: 28px;
          border: 3px solid rgba(221,107,32,0.1);
          border-top-color: #dd6b20;
          border-radius: 50%;
          margin: 0 auto 1rem;
          animation: rotateSpin 0.8s linear infinite;
        }

        /* Footer phong cách tối giản nhã nhặn */
        .footer-credits-bar {
          background: #ffffff;
          border-top: 1px solid #edf2f7;
          text-align: center;
          padding: 1.5rem 2rem;
          color: #718096;
          font-size: 0.82rem;
          font-weight: 500;
        }

        @keyframes rotateSpin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* Tối ưu hóa cực mạnh cho hiển thị Responsive trên Mobile */
        @media (max-width: 991px) {
          .hero-banner { height: auto; padding: 3.5rem 0; }
          .hero-inner-content { flex-direction: column-reverse; text-align: center; gap: 2.5rem; }
          .hero-text-block { display: flex; flex-direction: column; align-items: center; }
          .hero-meta-wrapper { justify-content: center; }
          .analog-clock-wrapper { width: 100%; max-width: 240px; }
          .search-filter-card { padding: 1rem; }
        }
        @media (max-width: 600px) {
          .top-navbar { padding: 0.6rem 1rem; }
          .controls-section { padding: 0 1rem; margin-top: -1.5rem; }
          .content-container { padding: 0 1rem; }
          .news-grid-layout { grid-template-columns: 1fr; gap: 0.9rem; }
          .actions-row { padding: 0 1rem; }
        }
      `}</style>

      {/* Utilities Top Menu */}
      <div className="top-navbar">
        <div className="brand-logo-text">
          🍊 <span>ConsulateNews</span>
        </div>
        <div className="lang-switch-box">
          <button className={`lang-btn ${lang === 'vi' ? 'active' : ''}`} onClick={() => changeLang('vi')}>VI</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => changeLang('en')}>EN</button>
        </div>
      </div>

      {/* Hero Container tích hợp mượt mà ảnh phong cảnh thực tế */}
      <div className="hero-banner">
        <div className="hero-bg-layer-container">
          {Object.keys(COUNTRY_CONFIG).map((key) => (
            <div
              key={key}
              className={`hero-bg-photo ${activeCountry === key ? 'active' : ''}`}
              style={{ backgroundImage: `url('${COUNTRY_CONFIG[key].bg}')` }}
            />
          ))}
        </div>
        <div className="hero-gradient-overlay"></div>
        
        <div className="hero-inner-content">
          <div className="hero-text-block">
            <h1 className="hero-main-title">{t.title}</h1>
            <p className="hero-sub-title">{t.subtitle}</p>
            
            <div className="hero-meta-wrapper">
              <button className="sync-btn" onClick={triggerFetch} disabled={fetching}>
                {fetching ? t.btnUpdating : `🔄 ${t.btnUpdate}`}
              </button>
              {data?.lastUpdated && (
                <div className="time-badge">
                  ⏳ {t.lastFetched}: <b>{new Date(data.lastUpdated).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US')} {new Date(data.lastUpdated).toLocaleDateString('vi-VN')}</b>
                </div>
              )}
            </div>
          </div>

          {/* Thiết kế Đồng hồ kim Analog Luxury */}
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

      {/* Bảng điều khiển, tìm kiếm, lọc danh mục */}
      <div className="controls-section">
        <div className="search-filter-card">
          <div className="search-bar-inner">
            <svg className="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {data?.sources?.length > 0 && (
            <div className="countries-tabs-flow">
              <button className={`country-tab-item ${activeCountry === 'all' ? 'active' : ''}`} onClick={() => setActiveCountry('all')}>
                {t.tabAll}
                {totalUnreadAll > 0 && <span className="count-badge-orange alert">{totalUnreadAll}</span>}
              </button>
              {data.sources.map(s => {
                const unreadCount = getUnreadCountBySource(s);
                return (
                  <button key={s.country} className={`country-tab-item ${activeCountry === s.country ? 'active' : ''}`} onClick={() => setActiveCountry(s.country)}>
                    <span>{s.flag}</span>
                    <span>{lang === 'vi' ? s.name.replace('Tổng lãnh sự quan ', '').replace('Lãnh sự quán ', '') : COUNTRY_CONFIG[s.country]?.label.en}</span>
                    {unreadCount > 0 ? (
                      <span className="count-badge-orange alert">{unreadCount}</span>
                    ) : (
                      <span className="count-badge-orange">{s.articles.length}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Thông báo từ hệ thống */}
      {message && <div className="system-toast-container"><div className="alert-toast-body">{message}</div></div>}

      {/* Button Đánh dấu xem toàn bộ */}
      {data?.sources?.length > 0 && (
        <div className="actions-row">
          <button className="mark-all-btn" onClick={markAllAsSeen}>{t.btnMarkAll}</button>
        </div>
      )}

      {/* Danh sách lưới thông báo thị thực */}
      <div className="content-container">
        {loading ? (
          <div className="loading-screen-box">
            <div className="loading-spinner-element"></div>
            <p>{t.loading}</p>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="empty-screen-box">
            <h2>{t.noData}</h2>
            <p style={{marginTop:'0.5rem'}}>{t.noDataSub}</p>
          </div>
        ) : (
          filteredSources.map(source => (
            <div key={source.country} className="source-group-wrapper">
              <div className="source-group-title-bar">
                <span className="source-group-flag">{source.flag}</span>
                <div>
                  <h3 className="source-group-name">{lang === 'vi' ? source.name : `${COUNTRY_CONFIG[source.country]?.label.en} Consular Announcements`}</h3>
                  <div className="source-group-time-ago">
                    {lang === 'vi' ? 'Đồng bộ nguồn:' : 'Source updated:'} {new Date(source.updatedAt).toLocaleDateString('vi-VN')} {new Date(source.updatedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <span className="source-total-indicator">{source.articles.length} {lang === 'vi' ? 'bài viết' : 'posts'}</span>
              </div>

              <div className="news-grid-layout">
                {source.articles.map((article, i) => {
                  const isRead = readUrls.includes(article.url);
                  const isNew = !seenUrls.includes(article.url);
                  
                  return (
                    <a
                      key={i}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-card-anchor"
                      onClick={() => markRead(article.url)}
                    >
                      <div className="article-headline-container">
                        {isNew && !isRead ? (
                          <span className="state-dot-orange" title="Thông báo mới"></span>
                        ) : (
                          <span className="state-dot-orange" style={{ background: '#cbd5e0', boxShadow: 'none' }}></span>
                        )}
                        <span className="article-title-text">{article.title || article.url}</span>
                      </div>

                      <div className="article-footer-meta">
                        {/* Đã đồng bộ sửa lỗi hiển thị ngày tháng chuẩn xác bằng article.date */}
                        <span className="article-date-stamp">
                          📅 {article.date ? new Date(article.date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'}) : '---'}
                        </span>
                        {isNew && !isRead && (
                          <span className="read-status-tag" style={{ background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7' }}>
                            {t.badgeNew}
                          </span>
                        )}
                        {isRead && (
                          <span className="read-status-tag">✓ {t.badgeRead}</span>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer bản quyền */}
      <div className="footer-credits-bar">
        <div>🍊 Consulate News Dashboard · © 2026</div>
        <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: '#a0aec0', fontWeight: '400' }}>{t.footerText}</div>
      </div>
    </>
  );
}
