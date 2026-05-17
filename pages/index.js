import { useState, useEffect } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'read_articles';
const SEEN_KEY = 'seen_articles';

var COUNTRY_CONFIG = {
  my:      { label: { vi: 'Mỹ', en: 'USA' },         tz: 'America/New_York', city: 'Washington D.C.', brand: 'ROLEX',    gradients: ['linear-gradient(135deg,#B22234,#3C3B6E)','linear-gradient(135deg,#3C3B6E,#B22234)','linear-gradient(135deg,#c0392b,#2980b9)'], icon: '🗽' },
  nhat:    { label: { vi: 'Nhật', en: 'Japan' },      tz: 'Asia/Tokyo',       city: 'Tokyo',          brand: 'SEIKO',    gradients: ['linear-gradient(135deg,#BC002D,#fff)','linear-gradient(135deg,#e74c3c,#fadbd8)','linear-gradient(135deg,#c0392b,#f9ebea)'],  icon: '🗼' },
  han:     { label: { vi: 'Hàn Quốc', en: 'Korea' }, tz: 'Asia/Seoul',       city: 'Seoul',          brand: 'CARTIER',  gradients: ['linear-gradient(135deg,#003478,#CD2E3A)','linear-gradient(135deg,#1a5276,#e74c3c)','linear-gradient(135deg,#2471a3,#c0392b)'], icon: '🔮' },
  uc:      { label: { vi: 'Úc', en: 'Australia' },   tz: 'Australia/Sydney', city: 'Canberra',       brand: 'OMEGA',    gradients: ['linear-gradient(135deg,#00008B,#FF0000)','linear-gradient(135deg,#1f3a60,#e74c3c)','linear-gradient(135deg,#1a5276,#ecf0f1)'], icon: '🦘' },
  dailoan: { label: { vi: 'Đài Loan', en: 'Taiwan' }, tz: 'Asia/Taipei',      city: 'Taipei',         brand: 'LONGINES', gradients: ['linear-gradient(135deg,#FE8A71,#2575FC)','linear-gradient(135deg,#f39c12,#d35400)','linear-gradient(135deg,#e67e22,#2e4053)'], icon: '🏮' },
  trung:   { label: { vi: 'Trung Quốc', en: 'China' },tz: 'Asia/Shanghai',    city: 'Beijing',        brand: 'TISSOT',   gradients: ['linear-gradient(135deg,#DE2910,#FFDE00)','linear-gradient(135deg,#c0392b,#f1c40f)','linear-gradient(135deg,#9b59b6,#e74c3c)'], icon: '🐼' },
  Phap:    { label: { vi: 'Pháp', en: 'France' },    tz: 'Europe/Paris',     city: 'Paris',          brand: 'CHANEL',   gradients: ['linear-gradient(135deg,#002395,#ED2939)','linear-gradient(135deg,#2980b9,#ebedef)','linear-gradient(135deg,#2c3e50,#e74c3c)'], icon: '🥖' },
  Y:       { label: { vi: 'Ý', en: 'Italy' },        tz: 'Europe/Rome',      city: 'Rome',           brand: 'GUCCI',    gradients: ['linear-gradient(135deg,#009246,#CE2B37)','linear-gradient(135deg,#27ae60,#fbffff)','linear-gradient(135deg,#229954,#cb4335)'], icon: '🍕' },
  Duc:     { label: { vi: 'Đức', en: 'Germany' },    tz: 'Europe/Berlin',    city: 'Berlin',         brand: 'MONTBLANC',gradients: ['linear-gradient(135deg,#000000,#DD0000)','linear-gradient(135deg,#2c3e50,#f39c12)','linear-gradient(135deg,#111111,#cb4335)'], icon: '🍺' },
  ThuySy:  { label: { vi: 'Thụy Sỹ', en: 'Swiss' },  tz: 'Europe/Zurich',    city: 'Bern',           brand: 'PATEK',    gradients: ['linear-gradient(135deg,#D52B1E,#FFFFFF)','linear-gradient(135deg,#cb4335,#f4f6f7)','linear-gradient(135deg,#b03a2e,#ecf0f1)'], icon: '🏔️' },
  Anh:     { label: { vi: 'Anh', en: 'UK' },         tz: 'Europe/London',    city: 'London',         brand: 'BREITLING',gradients: ['linear-gradient(135deg,#00247D,#CF142B)','linear-gradient(135deg,#1b4f72,#cb4335)','linear-gradient(135deg,#2e4053,#f4f6f7)'], icon: '🏰' },
  AnDo:    { label: { vi: 'Ấn Độ', en: 'India' },    tz: 'Asia/Kolkata',     city: 'New Delhi',      brand: 'TITAN',    gradients: ['linear-gradient(135deg,#FF9933,#138808)','linear-gradient(135deg,#e67e22,#27ae60)','linear-gradient(135deg,#f39c12,#229954)'], icon: '🕌' }
};

// Dữ liệu VFS Global TP.HCM cấu trúc hóa theo yêu cầu số 4
var VFS_GLOBAL_DATA = {
  uk: {
    name: { vi: "VFS Global Vương Quốc Anh (UK)", en: "VFS Global United Kingdom" },
    summary: { vi: "Trung tâm tiếp nhận hồ sơ xin thị thực Vương Quốc Anh, phụ trách thu thập dữ liệu sinh trắc học và kiểm tra hồ sơ chính ngạch.", en: "Official visa application centre for the UK, collecting biometrics and documentation." },
    address: { vi: "Tầng 5, Tòa nhà Resco, 94-96 Nguyễn Du, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh", en: "5th Floor, Resco Building, 94-96 Nguyen Du Street, Ben Nghe Ward, District 1, HCMC" },
    hotline: "+84 28 3521 2000",
    email: "ukinfo.vn@vfshelpline.com",
    workingHours: "08:00 – 15:00 (Thứ 2 - Thứ 6)",
    link: "https://visa.vfsglobal.com/vnm/vi/gbr/book-an-appointment",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.418471410757!2d106.69830537573617!3d10.779227559141022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f131!3m3!1m2!1m4!2sVFS+Global+UK!3m2!1d10.7792222!2d106.7008803!5m2!1sfe!2svn"
  },
  france: {
    name: { vi: "VFS Global Pháp & Khối Schengen", en: "VFS Global France & Schengen" },
    summary: { vi: "Trung tâm được ủy quyền tiếp nhận diện thị thực ngắn hạn và dài hạn cho Cộng hòa Pháp.", en: "Authorized center processing short-stay and long-stay visa applications for France." },
    address: { vi: "Tầng 3, Tòa nhà Resco, 94-96 Nguyễn Du, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh", en: "3th Floor, Resco Building, 94-96 Nguyen Du Street, Ben Nghe Ward, District 1, HCMC" },
    hotline: "+84 28 3939 0849",
    email: "info.frvn@vfshelpline.com",
    workingHours: "08:00 – 16:00 (Thứ 2 - Thứ 6)",
    link: "https://visa.vfsglobal.com/vnm/vi/fra/book-an-appointment",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.418471410757!2d106.69830537573617!3d10.779227559141022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f131!3m3!1m2!1m4!2sVFS+Global+France!3m2!1d10.7792222!2d106.7008803!5m2!1sfe!2svn"
  },
  australia: {
    name: { vi: "VFS Global Úc (Australia)", en: "VFS Global Australia" },
    summary: { vi: "Trung tâm cung cấp dịch vụ lấy dữ liệu sinh trắc học (vân tay và chụp hình) diện hồ sơ nộp trực tuyến qua Bộ Di Trú Úc.", en: "Biometric collection center for Australian visa applications submitted via ImmiAccount." },
    address: { vi: "Tầng 5, Tòa nhà Resco, 94-96 Nguyễn Du, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh", en: "5th Floor, Resco Building, 94-96 Nguyen Du Street, Ben Nghe Ward, District 1, HCMC" },
    hotline: "+84 28 3521 2000",
    email: "info.auvn@vfshelpline.com",
    workingHours: "08:30 – 15:00 (Thứ 2 - Thứ 6)",
    link: "https://visa.vfsglobal.com/vnm/vi/aus/book-an-appointment",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.418471410757!2d106.69830537573617!3d10.779227559141022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f131!3m3!1m2!1m4!2sVFS+Global!3m2!1d10.7792222!2d106.7008803!5m2!1sfe!2svn"
  },
  canada: {
    name: { vi: "VFS Global Canada (CVAC)", en: "VFS Global Canada CVAC" },
    summary: { vi: "Trung tâm tiếp nhận hồ sơ xin thị thực và lấy sinh trắc học chính thức được Chính phủ Canada ủy thác.", en: "The exclusive service provider for the Government of Canada for visa applications." },
    address: { vi: "Tầng 9, Tòa nhà Cienco 4, 180 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh", en: "9th Floor, Cienco 4 Building, 180 Nguyen Thi Minh Khai Street, Vo Thi Sau Ward, District 3, HCMC" },
    hotline: "+84 28 3829 6350",
    email: "info.canvn@vfshelpline.com",
    workingHours: "09:00 – 16:00 (Thứ 2 - Thứ 6)",
    link: "https://visa.vfsglobal.com/vnm/vi/can/book-an-appointment",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.39709885834!2d106.69085697573622!3d10.780869659110682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f131!3m3!1m2!1m4!2sCienco+4+Building!3m2!1d10.7808643!2d106.6934318!5m2!1sfe!2svn"
  }
};

function GradientCard({ gradients, icon, currentIdx }) {
  var grad = gradients && gradients.length ? gradients[currentIdx % gradients.length] : 'linear-gradient(135deg,#ccc,#999)';
  return (
    <div className="gcard" style={{ background: grad }}>
      <div className="gicon">{icon || '🌐'}</div>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState('vi');
  const [activeMenu, setActiveMenu] = useState('portal_news'); // Điều hướng menu trang
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');
  
  const [readUrls, setReadUrls] = useState([]);
  const [seenUrls, setSeenUrls] = useState([]);
  const [time, setTime] = useState(new Date());
  const [imgIdx, setImgIdx] = useState(0);
  const [showTop, setShowTop] = useState(false);

  // States quản lý danh mục VFS Global (Yêu cầu số 4)
  const [activeVfsCountry, setActiveVfsCountry] = useState('uk');
  const [activeVfsTab, setActiveVfsTab] = useState('general');

  // States quản lý Hệ thống Quản trị Customizer kiểu WordPress (Yêu cầu số 3)
  const [wpAdminEnabled, setWpAdminEnabled] = useState(false);
  const [wpEditedTitles, setWpEditedTitles] = useState({});
  const [wpAlignments, setWpAlignments] = useState({});
  const [wpFontSizes, setWpFontSizes] = useState({});

  useEffect(() => {
    try { setLang(navigator.language.startsWith('vi') ? 'vi' : 'en'); } catch(e){}
    loadNews();
    if (typeof window !== 'undefined') {
      try {
        var r = localStorage.getItem(STORAGE_KEY);
        if(r) setReadUrls(JSON.parse(r));
        var s = localStorage.getItem(SEEN_KEY);
        if(s) setSeenUrls(JSON.parse(s));
      } catch(e){}
    }
    var tInterval = setInterval(() => setTime(new Date()), 1000);
    var iInterval = setInterval(() => setImgIdx(p => p + 1), 5000);
    var scrollEvt = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', scrollEvt);
    return () => {
      clearInterval(tInterval);
      clearInterval(iInterval);
      window.removeEventListener('scroll', scrollEvt);
    };
  }, []);

  async function loadNews() {
    setLoading(true);
    try {
      var res = await fetch('/api/get-news');
      var json = await res.json();
      setData(json);
      if (json && json.sources && typeof window !== 'undefined') {
        var currentUrls = [];
        json.sources.forEach(s => {
          if(s.articles) s.articles.forEach(a => currentUrls.push(a.url));
        });
        try {
          var s = localStorage.getItem(SEEN_KEY);
          var parsed = s ? JSON.parse(s) : [];
          var updated = Array.from(new Set([...parsed, ...currentUrls]));
          localStorage.setItem(SEEN_KEY, JSON.stringify(updated));
          setSeenUrls(updated);
        } catch(e){}
      }
    } catch(e){ console.error(e); }
    setLoading(false);
  }

  async function triggerFetch() {
    if (fetching) return;
    setFetching(true);
    setMessage(lang === 'vi' ? 'Đang fetch tin tức từ các đại sứ quán...' : 'Fetching embassy feeds...');
    try {
      var res = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' }
      });
      var json = await res.json();
      if (json.success) {
        setMessage(lang === 'vi' ? `✅ Cập nhật thành công ${json.total} bài viết!` : `✅ Updated ${json.total} articles successfully!`);
        await loadNews();
      } else {
        setMessage('❌ Lỗi: ' + json.error);
      }
    } catch(e){
      setMessage(lang === 'vi' ? '❌ Lỗi kết nối' : '❌ Connection error');
    }
    setFetching(false);
    setTimeout(() => setMessage(''), 5000);
  }

  function markRead(url) {
    if (!readUrls.includes(url)) {
      var u = [...readUrls, url];
      setReadUrls(u);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch(e){}
    }
  }

  // Các hàm tác động dữ liệu của bộ điều khiển WordPress CMS (Yêu cầu số 3)
  function handleWpTitleChange(url, text) {
    setWpEditedTitles(prev => ({ ...prev, [url]: text }));
  }
  function handleWpAlignChange(url, align) {
    setWpAlignments(prev => ({ ...prev, [url]: align }));
  }
  function handleWpFontSizeChange(url, change) {
    var currentSize = wpFontSizes[url] || 14;
    var newSize = Math.max(11, Math.min(22, currentSize + change));
    setWpFontSizes(prev => ({ ...prev, [url]: newSize }));
  }

  function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function formatDate(d) { if(!d) return ''; var date = new Date(d); return isNaN(date.getTime()) ? d : date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'}); }

  var filteredSources = data && data.sources ? data.sources.map(source => {
    if (activeCountry !== 'all' && source.country !== activeCountry) return null;
    var filteredArticles = source.articles ? source.articles.filter(article => {
      var finalTitle = wpEditedTitles[article.url] || article.title || '';
      return finalTitle.toLowerCase().includes(searchQuery.toLowerCase());
    }) : [];
    return { ...source, articles: filteredArticles };
  }).filter(Boolean) : [];

  // Yêu cầu số 1: Xây dựng hàm hiển thị đồng hồ LED điện tử, lọc bỏ từ "time" và chữ thừa
  function getDigitalTimeStr() {
    var cfg = COUNTRY_CONFIG[activeCountry] || { tz: 'Asia/Ho_Chi_Minh' };
    return time.toLocaleTimeString('vi-VN', { timeZone: cfg.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  var currentVfsObj = VFS_GLOBAL_DATA[activeVfsCountry];

  return (
    <>
      <Head>
        <title>Consulate News Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #0f172a; padding-bottom: 5rem; }
        
        .navbar { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; padding: 0.8rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top:0; z-index:999; }
        .nav-logo { font-size: 1.2rem; font-weight: 800; color: #ea580c; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
        .nav-actions { display: flex; align-items: center; gap: 0.8rem; }
        .menu-btn { background: transparent; border: 1px solid transparent; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s; }
        .menu-btn:hover, .menu-btn.active { background: #fff7ed; border-color: #ffedd5; color: #ea580c; }
        .wp-toggle-btn { background: #1e293b; color: #ffffff; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: none; cursor: pointer; margin-left: 0.5rem; }
        .wp-toggle-btn.active { background: #ea580c; }

        .banner { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 3rem 2rem; position: relative; overflow: hidden; display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
        .banner-main { max-width: 65%; }
        .banner-title { font-size: 1.8rem; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; line-height: 1.2; }
        .banner-sub { font-size: 0.9rem; color: #64748b; margin-top: 0.5rem; }
        
        /* Yêu cầu 1: Thiết kế giao diện đồng hồ số LED tinh xảo */
        .digital-clock-box { background: #0f172a; border: 1px solid #1e293b; padding: 1.2rem 1.8rem; border-radius: 14px; text-align: center; min-width: 210px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .digital-time-num { font-family: monospace; font-size: 1.9rem; font-weight: 700; letter-spacing: 2px; color: #fdba74; text-shadow: 0 0 8px rgba(253,186,116,0.3); }
        .digital-city-lbl { font-size: 0.72rem; font-weight: 700; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 0.4rem; }

        .container { max-width: 1300px; margin: 2rem auto; padding: 0 1.5rem; }
        
        /* Cấu trúc trang chủ tích hợp các Dashboard */
        .portal-home-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .portal-card-menu { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; pading: 1.5rem; padding: 1.5rem; cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; min-height: 180px; }
        .portal-card-menu:hover { transform: translateY(-4px); border-color: #fed7aa; box-shadow: 0 12px 24px rgba(234,88,12,0.05); }
        .portal-card-head { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .portal-card-desc { font-size: 0.85rem; color: #64748b; line-height: 1.5; }
        .portal-card-arrow { font-size: 0.8rem; font-weight: 700; color: #ea580c; margin-top: 1rem; text-align: right; }

        .filter-bar { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1rem; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1rem; }
        .search-box { width: 100%; padding: 0.7rem 1rem; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.85rem; outline: none; }
        .search-box:focus { border-color: #ea580c; box-shadow: 0 0 0 3px rgba(234,88,12,0.1); }
        
        .tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .tab-btn { padding: 0.45rem 0.9rem; border-radius: 20px; background: #f1f5f9; border: 1px solid #e2e8f0; font-size: 0.82rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; }
        .tab-btn:hover { background: #e2e8f0; }
        .tab-btn.active { background: #fff7ed; border-color: #ffedd5; color: #ea580c; }

        .source-block { margin-bottom: 3rem; }
        .source-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        .source-flag { font-size: 1.4rem; }
        .source-name { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
        .source-updated { font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; }
        .source-count { margin-left: auto; background: #f1f5f9; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; color: #64748b; }

        .articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.2rem; }
        
        /* Cấu trúc thẻ bài viết đa nhiệm tích hợp WordPress Customizer ENGINE */
        .article-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; color: inherit; transition: all 0.2s; position: relative; min-height: 230px; justify-content: space-between; }
        .article-card:hover { border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.02); }
        
        .gcard { height: 75px; width: 100%; position: relative; display: flex; align-items: center; padding-left: 1.2rem; }
        .gicon { font-size: 1.6rem; }
        .cbody { padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; gap: 0.5rem; }
        .cbar { width: 24px; height: 3px; border-radius: 2px; }
        
        /* WordPress Customizer CSS Rules */
        .wp-textarea-editor { width: 100%; border: 1px dashed #ea580c; background: #fff7ed; padding: 4px; font-family: inherit; font-weight: 600; color: #0f172a; resize: none; border-radius: 6px; outline: none; }
        .wp-inline-title { color: #1e293b; font-weight: 600; line-height: 1.4; }
        .wp-control-panel { display: flex; gap: 0.25rem; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.3rem; border-radius: 6px; margin-top: 0.4rem; align-items: center; flex-wrap: wrap; }
        .wp-action-tool-btn { padding: 0.2rem 0.4rem; font-size: 0.68rem; font-weight: 700; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; color: #475569; }
        .wp-action-tool-btn:hover { background: #ea580c; color: #ffffff; border-color: #ea580c; }

        .cfoot { padding: 0.8rem 1rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748b; background: #fafafa; }
        .nbadge { position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.4rem; border-radius: 4px; letter-spacing: 0.5px; z-index: 10; }
        .rtag { font-weight: 600; color: #10b981; }
        .ndot { position: absolute; top: 34px; left: 12px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; z-index: 11; border: 2px solid #fff; }

        /* Yêu cầu 4: Hệ thống Layout chuyên biệt danh mục VFS Global */
        .vfs-main-wrapper { display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; margin-top: 0.5rem; }
        .vfs-left-menu { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.6rem; display: flex; flex-direction: column; gap: 0.25rem; height: fit-content; }
        .vfs-menu-item { padding: 0.7rem 1rem; border-radius: 8px; border: none; background: transparent; text-align: left; font-size: 0.85rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; width: 100%; }
        .vfs-menu-item:hover { background: #f8fafc; color: #0f172a; }
        .vfs-menu-item.active { background: #fff7ed; color: #ea580c; }
        
        .vfs-right-content-board { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; min-height: 400px; }
        .vfs-tab-bar { display: flex; gap: 1.5rem; border-bottom: 2px solid #f1f5f9; margin-bottom: 1.2rem; }
        .vfs-tab-trigger { padding: 0.6rem 0.2rem; border: none; background: transparent; font-size: 0.85rem; font-weight: 700; color: #64748b; cursor: pointer; position: relative; }
        .vfs-tab-trigger.active { color: #ea580c; }
        .vfs-tab-trigger.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #ea580c; }
        .vfs-detail-pane { font-size: 0.9rem; color: #334155; line-height: 1.6; }
        .vfs-map-container { border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; height: 100%; min-height: 280px; background: #f8fafc; }

        .btn-action { background: #ea580c; color: #ffffff; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; text-decoration: none; }
        .btn-action:hover { background: #c2410c; }
        .btn-action:disabled { background: #cbd5e1; cursor: not-allowed; }

        /* Yêu cầu 2: Design by Hungluu tại Footer */
        .footer { border-top: 1px solid #e2e8f0; background: #ffffff; padding: 1.8rem 2rem; text-align: center; font-size: 0.8rem; color: #64748b; line-height: 1.5; margin-top: 5rem; }
        .brand-sig { margin-top: 0.5rem; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.5px; }
        .brand-sig-name { background: linear-gradient(90deg, #ea580c, #f97316); -webkit-background-clip: text; -webkit-text-fillColor: transparent; font-weight: 800; }

        .toast { position: fixed; bottom: 2rem; left: 2rem; background: #0f172a; color: #fff; padding: 0.8rem 1.2rem; border-radius: 8px; font-size: 0.82rem; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 9999; }
        .to-top { position: fixed; bottom: 2rem; right: 2rem; width: 40px; height: 40px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 50%; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); color: #475569; z-index: 99; }
        .to-top:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }
        .empty { text-align: center; padding: 4rem 2rem; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; }

        @media(max-width: 960px) {
          .banner { flex-direction: column; align-items: stretch; padding: 2rem 1.5rem; }
          .banner-main { max-width: 100%; }
          .vfs-right-content-board { grid-template-columns: 1fr; }
          .vfs-main-wrapper { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header điều hướng Menu Đa nhiệm */}
      <div className="navbar">
        <div className="nav-logo" onClick={() => setActiveMenu('portal_news')}>
          🍊 <span>Consulate News</span>
        </div>
        <div className="nav-actions">
          <button className={`menu-btn ${activeMenu === 'portal_news' ? 'active' : ''}`} onClick={() => setActiveMenu('portal_news')}>
            {lang === 'vi' ? 'Trang Chủ' : 'Dashboard'}
          </button>
          <button className={`menu-btn ${activeMenu === 'visa_articles' ? 'active' : ''}`} onClick={() => setActiveMenu('visa_articles')}>
            {lang === 'vi' ? 'Tin tức Thị thực' : 'Visa Feeds'}
          </button>
          <button className={`menu-btn ${activeMenu === 'vfs_section' ? 'active' : ''}`} onClick={() => setActiveMenu('vfs_section')}>
            🏢 VFS Global HCM
          </button>
          
          {/* Nút bật tắt chế độ tùy biến nội dung WordPress CMS (Yêu cầu 3) */}
          <button className={`wp-toggle-btn ${wpAdminEnabled ? 'active' : ''}`} onClick={() => setWpAdminEnabled(!wpAdminEnabled)}>
            {wpAdminEnabled ? '🔒 Đóng WP-CMS' : '⚙️ Mở WP-CMS'}
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="banner">
        <div className="banner-main">
          <h1 className="banner-title">
            {activeCountry === 'all' 
              ? (lang === 'vi' ? 'Hệ thống Giám sát Tin tức Thị thực & Lãnh sự' : 'Global Consulate News Monitor')
              : (COUNTRY_CONFIG[activeCountry]?.label[lang] + ' · ' + (lang === 'vi' ? 'Cập nhật Lãnh sự' : 'Consular Updates'))
            }
          </h1>
          <p className="banner-sub">
            {lang === 'vi' ? 'Dữ liệu thời gian thực hỗ trợ điều hành và quản lý nghiệp vụ thị thực du lịch quốc tế.' : 'Real-time corporate feed for travel operators and visa processing analysts.'}
          </p>
          <div style={{ marginTop: '1rem' }}>
            <button className="btn-action" onClick={triggerFetch} disabled={fetching}>
              {fetching ? (lang === 'vi' ? 'Đang cập nhật...' : 'Updating...') : (lang === 'vi' ? '🔄 Cập nhật khẩn cấp' : '🔄 Sync Feeds')}
            </button>
          </div>
        </div>

        {/* Yêu cầu số 1: Đồng hồ dạng số điện tử LED tinh giản độc lập, không có chữ "time" */}
        <div className="digital-clock-box">
          <div className="digital-time-num">{getDigitalTimeStr()}</div>
          <div className="digital-city-lbl">{(COUNTRY_CONFIG[activeCountry] || { city: 'Hồ Chí Minh' }).city}</div>
        </div>
      </div>

      {message && <div className="toast">{message}</div>}

      <div className="container">
        
        {/* VIEW 1: TRANG CHỦ DANH MỤC (Yêu cầu số 2: Loại bỏ từ Danh Mục Quản Trị Hệ Thống) */}
        {activeMenu === 'portal_news' && (
          <div className="portal-home-grid">
            <div className="portal-card-menu" onClick={() => setActiveMenu('visa_articles')}>
              <div>
                <div className="portal-card-head">🍊 {lang === 'vi' ? 'Tin tức Thị thực & Lãnh sự' : 'Embassy Noticeboard'}</div>
                <div className="portal-card-desc">Quản lý các nguồn dữ liệu cập nhật tự động từ các cơ quan ngoại giao chính ngạch quốc tế.</div>
              </div>
              <div className="portal-card-arrow">{lang === 'vi' ? 'Truy cập bảng tin →' : 'View feeds →'}</div>
            </div>

            <div className="portal-card-menu" onClick={() => setActiveMenu('vfs_section')}>
              <div>
                <div className="portal-card-head">🏢 Trung Tâm Thị Thực VFS Global</div>
                <div className="portal-card-desc">Hệ thống thông tin nghiệp vụ chi tiết của các nước Anh, Pháp, Úc, Canada... tại TP.HCM. Tích hợp định vị bản đồ và cổng lịch hẹn.</div>
              </div>
              <div className="portal-card-arrow">Mở danh mục VFS →</div>
            </div>
          </div>
        )}

        {/* VIEW 2: BẢNG TIN TỨC THỊ THỰC GỐC TÍCH HỢP BỘ CMS CHỈNH SỬA TỰA WORDPRESS */}
        {activeMenu === 'visa_articles' && (
          <>
            <div className="filter-bar">
              <input type="text" className="search-box" placeholder={lang === 'vi' ? '🔍 Tìm nhanh tiêu đề thông báo...' : '🔍 Search articles...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {data && data.sources && data.sources.length > 0 && (
                <div className="tabs">
                  <button className={`tab-btn ${activeCountry === 'all' ? 'active' : ''}`} onClick={() => setActiveCountry('all')}>
                    {lang === 'vi' ? 'Tất cả quốc gia' : 'All Regional'}
                  </button>
                  {data.sources.map(s => (
                    <button key={s.country} className={`tab-btn ${activeCountry === s.country ? 'active' : ''}`} onClick={() => setActiveCountry(s.country)}>
                      {s.flag} {COUNTRY_CONFIG[s.country]?.label[lang] || s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="empty"><h2>{lang === 'vi' ? 'Đang tải tin tức...' : 'Loading news feeds...'}</h2></div>
            ) : !data || !data.sources || !data.sources.length ? (
              <div className="empty">
                <h2>Chưa có dữ liệu</h2>
                <p>Vui lòng click nút <b>Cập nhật khẩn cấp</b> để nạp thông tin lần đầu.</p>
              </div>
            ) : (
              filteredSources.map(source => {
                if (!source.articles || source.articles.length === 0) return null;
                return (
                  <div key={source.country} className="source-block">
                    <div className="source-header">
                      <span className="source-flag">{source.flag}</span>
                      <div>
                        <div className="source-name">{source.name}</div>
                        <div className="source-updated">{lang === 'vi' ? 'Đồng bộ lúc:' : 'Synced:'} {formatDate(source.updatedAt || data.lastUpdated)}</div>
                      </div>
                      <span className="source-count">{source.articles.length} {lang === 'vi' ? 'bài viết' : 'posts'}</span>
                    </div>

                    <div className="articles-grid">
                      {source.articles.map((article, i) => {
                        var isRead = readUrls.includes(article.url);
                        var isNew = seenUrls.includes(article.url);
                        var cfg = COUNTRY_CONFIG[source.country] || {};
                        
                        // Xử lý dữ liệu văn bản theo cấu hình WordPress CMS (Yêu cầu số 3)
                        var displayTitle = wpEditedTitles[article.url] || article.title || article.url;
                        var textAlignment = wpAlignments[article.url] || 'left';
                        var currentFSize = wpFontSizes[article.url] || 14;

                        return (
                          <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="article-card" onClick={() => markRead(article.url)}>
                            <div>
                              {isNew && !isRead && <span className="nbadge">{lang === 'vi' ? 'MỚI' : 'NEW'}</span>}
                              <GradientCard gradients={cfg.gradients} icon={cfg.icon} currentIdx={imgIdx} />
                              
                              <div className="cbody">
                                <div className="cbar" style={{ background: source.color || '#ea580c' }}></div>
                                
                                {/* Yêu cầu số 3: Tích hợp Trình tùy biến nội dung WordPress Inline */}
                                {wpAdminEnabled ? (
                                  <div onClick={e => e.preventDefault()}>
                                    <textarea 
                                      className="wp-textarea-editor"
                                      value={displayTitle}
                                      style={{ textAlign: textAlignment, fontSize: currentFSize + 'px' }}
                                      onChange={e => handleWpTitleChange(article.url, e.target.value)}
                                      rows={3}
                                    />
                                    {/* Thanh công cụ định dạng tựa WordPress Mini-Bar */}
                                    <div className="wp-control-panel">
                                      <button className="wp-action-tool-btn" onClick={() => handleWpAlignChange(article.url, 'left')}>⬅️</button>
                                      <button className="wp-action-tool-btn" onClick={() => handleWpAlignChange(article.url, 'center')}>🔲</button>
                                      <button className="wp-action-tool-btn" onClick={() => handleWpAlignChange(article.url, 'right')}>➡️</button>
                                      <button className="wp-action-tool-btn" onClick={() => handleWpAlignChange(article.url, 'justify')}>Format</button>
                                      <button className="wp-action-tool-btn" style={{marginLeft:'auto'}} onClick={() => handleWpFontSizeChange(article.url, -1)}>A-</button>
                                      <button className="wp-action-tool-btn" onClick={() => handleWpFontSizeChange(article.url, 1)}>A+</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="wp-inline-title" style={{ textAlign: textAlignment, fontSize: currentFSize + 'px' }}>
                                    {displayTitle}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="cfoot">
                              <span>📅 {formatDate(article.date || article.lastmod)}</span>
                              {isRead && <span className="rtag">✓ {lang === 'vi' ? 'Đã xem' : 'Read'}</span>}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* VIEW 3: DANH MỤC KHÔNG GIAN BIỆT LẬP VFS GLOBAL HỒ CHÍ MINH (Yêu cầu số 4) */}
        {activeMenu === 'vfs_section' && (
          <div className="vfs-main-wrapper">
            {/* Thanh chọn nước VFS ở cột bên trái */}
            <div className="vfs-left-menu">
              <button className={`vfs-menu-item ${activeVfsCountry === 'uk' ? 'active' : ''}`} onClick={() => setActiveVfsCountry('uk')}>🇬🇧 Vương Quốc Anh (UK)</button>
              <button className={`vfs-menu-item ${activeVfsCountry === 'france' ? 'active' : ''}`} onClick={() => setActiveVfsCountry('france')}>🇫🇷 Pháp & Châu Âu</button>
              <button className={`vfs-menu-item ${activeVfsCountry === 'australia' ? 'active' : ''}`} onClick={() => setActiveVfsCountry('australia')}>🇦🇺 Nước Úc (Australia)</button>
              <button className={`vfs-menu-item ${activeVfsCountry === 'canada' ? 'active' : ''}`} onClick={() => setActiveVfsCountry('canada')}>🇨🇦 Quốc gia Canada</button>
            </div>

            {/* Bảng thông tin chi tiết và Bản đồ tích hợp nằm bên phải */}
            <div className="vfs-right-content-board">
              <div>
                <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, marginBottom: '1rem' }}>
                  {currentVfsObj.name[lang]}
                </h2>
                
                {/* Các Tab thông tin nội bộ của trung tâm VFS đang chọn */}
                <div className="vfs-tab-bar">
                  <button className={`vfs-tab-trigger ${activeVfsTab === 'general' ? 'active' : ''}`} onClick={() => setActiveVfsTab('general')}>
                    {lang === 'vi' ? 'Tổng quát' : 'Overview'}
                  </button>
                  <button className={`vfs-tab-trigger ${activeVfsTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveVfsTab('contact')}>
                    {lang === 'vi' ? 'Địa chỉ & SĐT' : 'Contact Details'}
                  </button>
                  <button className={`vfs-tab-trigger ${activeVfsTab === 'procedure' ? 'active' : ''}`} onClick={() => setActiveVfsTab('procedure')}>
                    {lang === 'vi' ? 'Thủ tục & Đặt lịch' : 'Appointment'}
                  </button>
                </div>

                {/* Nội dung kết xuất theo Tab tương ứng */}
                <div className="vfs-detail-pane">
                  {activeVfsTab === 'general' && (
                    <div>
                      <p style={{ marginBottom: '1rem' }}>{currentVfsObj.summary[lang]}</p>
                      <p>🕒 <b>Thời gian tiếp nhận:</b> {currentVfsObj.workingHours}</p>
                      <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem'}}>*Lưu ý: Trung tâm đóng cửa vào các ngày nghỉ lễ quốc gia theo quy định của cơ quan ngoại giao.</p>
                    </div>
                  )}

                  {activeVfsTab === 'contact' && (
                    <div>
                      <p style={{ marginBottom: '0.6rem' }}>📍 <b>Địa chỉ trung tâm:</b> {currentVfsObj.address[lang]}</p>
                      <p style={{ marginBottom: '0.6rem' }}>📞 <b>Số điện thoại Hotline:</b> {currentVfsObj.hotline}</p>
                      <p>✉️ <b>Email tiếp nhận hỗ trợ:</b> {currentVfsObj.email}</p>
                    </div>
                  )}

                  {activeVfsTab === 'procedure' && (
                    <div>
                      <p style={{ color: '#475569', marginBottom: '1.2rem' }}>
                        {lang === 'vi' 
                          ? 'Yêu cầu điền đầy đủ tờ khai trực tuyến, thanh toán lệ phí chính ngạch và in giấy xác nhận lịch hẹn kèm hộ chiếu gốc khi đến trung tâm.' 
                          : 'Online application form confirmation and payment receipt are mandatory before booking biometric slots.'}
                      </p>
                      <a href={currentVfsObj.link} target="_blank" rel="noopener noreferrer" className="btn-action">
                        🗓️ {lang === 'vi' ? 'Đặt lịch hẹn trực tuyến ngay' : 'Book VFS Appointment'}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Khung bản đồ Google Maps hiển thị song song bên cạnh (Yêu cầu số 4) */}
              <div className="vfs-map-container">
                <iframe src={currentVfsObj.mapIframe} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </div>
          </div>
        )}

      </div>

      {showTop && <button className="to-top" onClick={scrollToTop}>↑</button>}

      {/* Footer (Yêu cầu số 2: Design by Hungluu chuyên nghiệp) */}
      <div className="footer">
        <div>Consulate News Dashboard Portal · © 2026</div>
        <div className="brand-sig">
          <span style={{ color: '#94a3b8', fontWeight: 400 }}>Designed by</span> <span className="brand-sig-name">Hungluu</span>
        </div>
      </div>
    </>
  );
}
