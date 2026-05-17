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

var COUNTRY_IMAGES = {
  my: [
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800&q=80',
    'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80',
  ],
  nhat: [
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&q=80',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80',
  ],
  han: [
    'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
    'https://images.unsplash.com/photo-1538669715516-b2358f3db0dc?w=800&q=80',
    'https://images.unsplash.com/photo-1524147041285-d8aa1315901d?w=800&q=80'
  ]
};

var VFS_GLOBAL_DATA = {
  uk: {
    name: { vi: "VFS Global Vương Quốc Anh (UK)", en: "VFS Global United Kingdom" },
    summary: { vi: "Trung tâm tiếp nhận hồ sơ xin thị thực Vương Quốc Anh, phụ trách thu thập dữ liệu sinh trắc học và kiểm tra hồ sơ chính ngạch.", en: "Official visa application centre for the UK, collecting biometrics and documentation." },
    address: { vi: "Tầng 5, Tòa nhà Resco, 94-96 Nguyễn Du, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh", en: "5th Floor, Resco Building, 94-96 Nguyen Du Street, Ben Nghe Ward, District 1, HCMC" },
    hotline: "+84 28 3521 2000",
    email: "ukinfo.vn@vfshelpline.com",
    workingHours: "08:00 – 15:00 (Thứ 2 - Thứ 6)",
    link: "https://visa.vfsglobal.com/vnm/vi/gbr/book-an-appointment",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447936166827!2d106.69748687586548!3d10.77700518937172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4625b1b463%3A0x6bda190fc6a44bf0!2sResco%20Building!5e0!3m2!1svi!2svn!4v1710000000000"
  },
  france: {
    name: { vi: "VFS Global Pháp & Khối Schengen", en: "VFS Global France & Schengen" },
    summary: { vi: "Trung tâm được ủy quyền tiếp nhận diện thị thực ngắn hạn và dài hạn cho Cộng hòa Pháp.", en: "Authorized center processing short-stay and long-stay visa applications for France." },
    address: { vi: "Tầng 3, Tòa nhà Resco, 94-96 Nguyễn Du, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh", en: "3th Floor, Resco Building, 94-96 Nguyen Du Street, Ben Nghe Ward, District 1, HCMC" },
    hotline: "+84 28 3939 0849",
    email: "info.frvn@vfshelpline.com",
    workingHours: "08:00 – 16:00 (Thứ 2 - Thứ 6)",
    link: "https://visa.vfsglobal.com/vnm/vi/fra/book-an-appointment",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447936166827!2d106.69748687586548!3d10.77700518937172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4625b1b463%3A0x6bda190fc6a44bf0!2sResco%20Building!5e0!3m2!1svi!2svn!4v1710000000000"
  },
  australia: {
    name: { vi: "VFS Global Úc (Australia)", en: "VFS Global Australia" },
    summary: { vi: "Trung tâm cung cấp dịch vụ lấy dữ liệu sinh trắc học (vân tay và chụp hình) diện hồ sơ nộp trực tuyến qua Bộ Di Trú Úc.", en: "Biometric collection center for Australian visa applications submitted via ImmiAccount." },
    address: { vi: "Tầng 5, Tòa nhà Resco, 94-96 Nguyễn Du, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh", en: "5th Floor, Resco Building, 94-96 Nguyen Du Street, Ben Nghe Ward, District 1, HCMC" },
    hotline: "+84 28 3521 2000",
    email: "info.auvn@vfshelpline.com",
    workingHours: "08:30 – 15:00 (Thứ 2 - Thứ 6)",
    link: "https://visa.vfsglobal.com/vnm/vi/aus/book-an-appointment",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447936166827!2d106.69748687586548!3d10.77700518937172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4625b1b463%3A0x6bda190fc6a44bf0!2sResco%20Building!5e0!3m2!1svi!2svn!4v1710000000000"
  },
  canada: {
    name: { vi: "VFS Global Canada (CVAC)", en: "VFS Global Canada CVAC" },
    summary: { vi: "Trung tâm tiếp nhận hồ sơ xin thị thực và lấy sinh trắc học chính thức được Chính phủ Canada ủy thác.", en: "The exclusive service provider for the Government of Canada for visa applications." },
    address: { vi: "Tầng 9, Tòa nhà Cienco 4, 180 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh", en: "9th Floor, Cienco 4 Building, 180 Nguyen Thi Minh Khai Street, Vo Thi Sau Ward, District 3, HCMC" },
    hotline: "+84 28 3829 6350",
    email: "info.canvn@vfshelpline.com",
    workingHours: "09:00 – 16:00 (Thứ 2 - Thứ 6)",
    link: "https://visa.vfsglobal.com/vnm/vi/can/book-an-appointment",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4182991053153!2d106.6917631758655!3d10.779268389370003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f36111ed6b9%3A0x95973d4ec74a9db9!2zVMOyYSBuaMOgIENpZW5jbyA0!5e0!3m2!1svi!2svn!4v1710000000000"
  }
};

function GradientCard({ gradients, icon }) {
  var grad = gradients && gradients.length ? gradients[0] : 'linear-gradient(135deg,#ccc,#999)';
  return (
    <div className="gcard" style={{ background: grad }}>
      <div className="gicon">{icon || '🌐'}</div>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState('vi');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('all');
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');
  
  const [readUrls, setReadUrls] = useState([]);
  const [seenUrls, setSeenUrls] = useState([]);
  const [time, setTime] = useState(new Date());
  const [imgIdx, setImgIdx] = useState(0);
  const [showTop, setShowTop] = useState(false);

  // States quản lý VFS Global và Trình tùy biến nội dung WordPress CMS mới thêm
  const [activeVfsCountry, setActiveVfsCountry] = useState('uk');
  const [activeVfsTab, setActiveVfsTab] = useState('general');
  const [wpAdminEnabled, setWpAdminEnabled] = useState(false);
  const [wpEditedTitles, setWpEditedTitles] = useState({});
  const [wpAlignments, setWpAlignments] = useState({});
  const [wpFontSizes, setWpFontSizes] = useState({});

  useEffect(() => {
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
    var iInterval = setInterval(() => setImgIdx(p => (p + 1) % 3), 5000);
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

  // Các hàm điều khiển bộ CMS
  function handleWpTitleChange(url, text) { setWpEditedTitles(prev => ({ ...prev, [url]: text })); }
  function handleWpAlignChange(url, align) { setWpAlignments(prev => ({ ...prev, [url]: align })); }
  function handleWpFontSizeChange(url, change) {
    var currentSize = wpFontSizes[url] || 15;
    setWpFontSizes(prev => ({ ...prev, [url]: Math.max(12, Math.min(24, currentSize + change)) }));
  }

  function fmtDate(d) { if(!d) return ''; var date = new Date(d); return isNaN(date.getTime()) ? d : date.toLocaleDateString('vi-VN'); }
  function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  // Hàm tính giờ LED điện tử bóc tách chữ thừa
  function getDigitalTimeStr() {
    var cfg = COUNTRY_CONFIG[activeCountry] || { tz: 'Asia/Ho_Chi_Minh' };
    return time.toLocaleTimeString('vi-VN', { timeZone: cfg.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  var filteredSources = data && data.sources ? data.sources : [];
  var currentVfsObj = VFS_GLOBAL_DATA[activeVfsCountry];

  return (
    <div className="app-container">
      <Head>
        <title>Kênh Cập Nhật Tin Tức Visa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f4f6f9; color: #333; }
        .header { background: #fff; border-bottom: 1px solid #e1e4e8; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .h-left h1 { font-size: 1.5rem; font-weight: 700; color: #111; }
        .h-left p { font-size: 0.9rem; color: #666; margin-top: 0.25rem; }
        .h-right { display: flex; align-items: center; gap: 1rem; }
        
        /* Thiết kế đồng hồ LED số */
        .led-clock { background: #111; padding: 0.6rem 1.2rem; border-radius: 8px; text-align: center; border: 1px solid #222; }
        .led-time { font-family: monospace; font-size: 1.4rem; color: #ff9f43; font-weight: bold; letter-spacing: 1px; }
        .led-city { font-size: 0.68rem; color: #888; text-transform: uppercase; margin-top: 0.2rem; font-weight: 600; }

        .btn-update { background: #0070f3; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
        .btn-update:hover { background: #0051ba; }
        .btn-wp-toggle { background: #24292e; color: #fff; border: none; padding: 0.6rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
        .btn-wp-toggle.active { background: #e056fd; }

        .nav-tabs { display: flex; gap: 0.5rem; padding: 1rem 2rem; background: #fff; border-bottom: 1px solid #e1e4e8; overflow-x: auto; }
        .nav-btn { background: #f1f3f5; border: none; padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; font-size: 0.85rem; font-weight: 600; color: #495057; white-space: nowrap; transition: all 0.2s; }
        .nav-btn.active { background: #111; color: #fff; }

        .main-content { padding: 2rem; max-width: 1400px; margin: 0 auto; }
        .source-block { margin-bottom: 2.5rem; }
        .source-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.2rem; }
        .source-flag { font-size: 1.5rem; }
        .source-name { font-size: 1.15rem; font-weight: 700; color: #222; }
        .source-updated { font-size: 0.75rem; color: #888; margin-top: 0.15rem; }
        .source-count { background: #e9ecef; padding: 0.2rem 0.6rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600; margin-left: auto; }

        .articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        
        /* Giữ nguyên cấu trúc Card gốc của anh */
        .article-card { background: #fff; border-radius: 12px; border: 1px solid #e1e4e8; overflow: hidden; text-decoration: none; color: inherit; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; position: relative; }
        .article-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
        .gcard { height: 60px; display: flex; align-items: center; padding-left: 1rem; }
        .gicon { font-size: 1.4rem; }
        .card-img-wrap { height: 130px; overflow: hidden; position: relative; }
        .card-img { width: 100%; height: 100%; object-fit: cover; }
        .card-body { padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; gap: 0.5rem; }
        .cbar { width: 30px; height: 4px; border-radius: 2px; }
        .ctitle { font-size: 0.92rem; font-weight: 600; color: #1a1a1a; line-height: 1.4; }
        .cfoot { padding: 0.75rem 1rem; border-top: 1px solid #f1f3f5; display: flex; justify-content: space-between; align-items: center; }
        .cdate { font-size: 0.78rem; color: #777; }
        .rtag { font-size: 0.75rem; color: #2ecc71; font-weight: bold; }
        .nbadge { position: absolute; top: 10px; right: 10px; background: #e74c3c; color: #fff; font-size: 0.65rem; font-weight: bold; padding: 0.2rem 0.5rem; border-radius: 4px; z-index: 5; }
        .ndot { position: absolute; top: 12px; left: 12px; width: 8px; height: 8px; background: #e74c3c; border-radius: 50%; z-index: 6; border: 1px solid #fff; }

        /* Khối soạn thảo WordPress CMS nội bộ Card */
        .wp-editor-box { width: 100%; border: 1px dashed #e056fd; background: #fbf0ff; padding: 4px; border-radius: 4px; outline: none; font-family: inherit; resize: none; }
        .wp-bar { display: flex; gap: 2px; margin-top: 4px; background: #f1f3f5; padding: 2px; border-radius: 4px; }
        .wp-btn { font-size: 0.65rem; padding: 2px 4px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-weight: bold; }

        /* Khối giao diện VFS Global thiết lập biệt lập phía dưới */
        .vfs-container { margin-top: 4rem; border-top: 2px solid #e1e4e8; padding-top: 2rem; }
        .vfs-title { font-size: 1.3rem; font-weight: 800; color: #111; margin-bottom: 1rem; }
        .vfs-layout { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; }
        .vfs-sidebar { background: #fff; border: 1px solid #e1e4e8; border-radius: 8px; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.2rem; height: fit-content; }
        .vfs-side-btn { padding: 0.6rem 1rem; text-align: left; background: transparent; border: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: #495057; cursor: pointer; }
        .vfs-side-btn.active { background: #f1f3f5; color: #0070f3; }
        .vfs-content-box { background: #fff; border: 1px solid #e1e4e8; border-radius: 8px; padding: 1.5rem; display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; }
        .vfs-tabs { display: flex; gap: 1rem; border-bottom: 2px solid #f1f3f5; margin-bottom: 1rem; }
        .vfs-tab-trigger { padding: 0.5rem 0; background: transparent; border: none; font-size: 0.85rem; font-weight: 700; color: #777; cursor: pointer; position: relative; }
        .vfs-tab-trigger.active { color: #111; }
        .vfs-tab-trigger.active::after { content:''; position: absolute; bottom: -2px; left:0; right:0; height: 2px; background: #111; }
        .vfs-pane { font-size: 0.88rem; color: #444; line-height: 1.6; }
        .vfs-map { border: 1px solid #e1e4e8; border-radius: 6px; overflow: hidden; height: 220px; }
        .vfs-link { display: inline-block; margin-top: 1rem; background: #111; color: #fff; text-decoration: none; padding: 0.5rem 1rem; font-size: 0.82rem; font-weight: bold; border-radius: 4px; }

        .footer { border-top: 1px solid #e1e4e8; background: #fff; padding: 1.5rem; text-align: center; font-size: 0.8rem; color: #666; margin-top: 4rem; }
        .brand-signature { margin-top: 0.4rem; font-size: 0.82rem; font-weight: bold; }
        .brand-name { background: linear-gradient(90deg, #ff9f43, #ff5252); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }

        .toast { position: fixed; bottom: 2rem; left: 2rem; background: #222; color: #fff; padding: 0.6rem 1.2rem; border-radius: 6px; font-size: 0.8rem; z-index: 999; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .to-top { position: fixed; bottom: 2rem; right: 2rem; width: 36px; height: 36px; background: #fff; border: 1px solid #ccc; border-radius: 50%; cursor: pointer; font-weight: bold; }
        .empty { text-align: center; padding: 3rem; background: #fff; border-radius: 8px; border: 1px solid #e1e4e8; }
        @media(max-width: 768px) { .header { flex-direction: column; align-items: flex-start; } .vfs-layout, .vfs-content-box { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header Gốc */}
      <div className="header">
        <div className="h-left">
          <h1>Kênh Cập Nhật Tin Tức Visa</h1>
          <p>{lang === 'vi' ? 'Tự động cập nhật lúc 7:00 SA mỗi ngày' : 'Auto-updates at 7:00 AM'}</p>
        </div>
        <div className="h-right">
          <button className={`btn-wp-toggle ${wpAdminEnabled ? 'active' : ''}`} onClick={() => setWpAdminEnabled(!wpAdminEnabled)}>
            {wpAdminEnabled ? '🔒 Đóng WP-CMS' : '⚙️ Mở WP-CMS'}
          </button>
          <button className="btn-update" onClick={triggerFetch}>{fetching ? '...' : (lang === 'vi' ? 'Cập nhật ngay' : 'Update')}</button>
          
          {/* Đồng hồ số LED độc lập không có chữ "time" thừa */}
          <div className="led-clock">
            <div className="led-time">{getDigitalTimeStr()}</div>
            <div className="led-city">{(COUNTRY_CONFIG[activeCountry] || { city: 'Hồ Chí Minh' }).city}</div>
          </div>
        </div>
      </div>

      {/* Điều hướng tabs cũ */}
      <div className="nav-tabs">
        <button className={`nav-btn ${activeCountry === 'all' ? 'active' : ''}`} onClick={() => setActiveCountry('all')}>
          {lang === 'vi' ? 'Tất cả' : 'All'}
        </button>
        {filteredSources.map(s => (
          <button key={s.country} className={`nav-btn ${activeCountry === s.country ? 'active' : ''}`} onClick={() => setActiveCountry(s.country)}>
            {s.flag} {COUNTRY_CONFIG[s.country]?.label[lang] || s.name}
          </button>
        ))}
      </div>

      <div className="main-content">
        {loading ? (
          <div className="empty"><p>{lang === 'vi' ? 'Đang tải tin tức...' : 'Loading news feeds...'}</p></div>
        ) : !data || !data.sources || !data.sources.length ? (
          <div className="empty">
            <h2>Chưa có dữ liệu</h2>
            <p>Click <b>"Cập nhật ngay"</b> ở trên để fetch tin tức lần đầu tiên</p>
          </div>
        ) : (
          filteredSources.map(source => {
            if (activeCountry !== 'all' && source.country !== activeCountry) return null;
            var imgs = COUNTRY_IMAGES[source.country];
            var cfg = COUNTRY_CONFIG[source.country] || {};
            
            return (
              <div key={source.country} className="source-block">
                <div className="source-header">
                  <span className="source-flag">{source.flag}</span>
                  <div>
                    <div className="source-name">{source.name}</div>
                    <div className="source-updated">Cập nhật: {fmtDate(source.updatedAt)}</div>
                  </div>
                  <span className="source-count">{source.articles.length} bài</span>
                </div>

                <div className="articles-grid">
                  {source.articles.map((article, i) => {
                    var isRead = readUrls.includes(article.url);
                    var isNew = seenUrls.includes(article.url);
                    
                    // State WP xử lý chuỗi chữ và căn lề
                    var displayTitle = wpEditedTitles[article.url] || article.title || '';
                    var textAlign = wpAlignments[article.url] || 'left';
                    var fSize = wpFontSizes[article.url] || 15;

                    return (
                      <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="article-card" onClick={() => markRead(article.url)}>
                        {isNew && !isRead && <span className="ndot"></span>}
                        {(!imgs || imgs.length === 0) ? (
                          <GradientCard gradients={cfg.gradients} icon={cfg.icon} />
                        ) : (
                          <div className="card-img-wrap">
                            <img className="card-img" src={imgs[imgIdx]} alt="" onError={function(e) { e.target.parentNode.style.display = 'none'; }} />
                          </div>
                        )}
                        
                        <div className="card-body">
                          <div className="cbar" style={{ background: source.color }}></div>
                          {isNew && !isRead && <span className="nbadge">{lang === 'vi' ? 'MỚI' : 'NEW'}</span>}
                          
                          {/* Khối quản trị nội dung WordPress tích hợp trực diện */}
                          {wpAdminEnabled ? (
                            <div onClick={e => e.preventDefault()}>
                              <textarea 
                                className="wp-editor-box"
                                value={displayTitle}
                                style={{ textAlign: textAlign, fontSize: fSize + 'px' }}
                                onChange={e => handleWpTitleChange(article.url, e.target.value)}
                                rows={2}
                              />
                              <div className="wp-bar">
                                <button className="wp-btn" onClick={() => handleWpAlignChange(article.url, 'left')}>⬅️</button>
                                <button className="wp-btn" onClick={() => handleWpAlignChange(article.url, 'center')}>🔲</button>
                                <button className="wp-btn" onClick={() => handleWpAlignChange(article.url, 'right')}>➡️</button>
                                <button className="wp-btn" onClick={() => handleWpFontSizeChange(article.url, 1)}>A+</button>
                                <button className="wp-btn" onClick={() => handleWpFontSizeChange(article.url, -1)}>A-</button>
                              </div>
                            </div>
                          ) : (
                            <div className="ctitle" style={{ textAlign: textAlign, fontSize: fSize + 'px' }}>
                              {displayTitle}
                            </div>
                          )}
                        </div>

                        <div className="cfoot">
                          <span className="cdate">📅 {fmtDate(article.date || article.lastmod)}</span>
                          {isRead && <span className="rtag">✓ {lang === 'vi' ? 'Đã đọc' : 'Read'}</span>}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Khối VFS Global Hồ Chí Minh thêm mới hạ tầng riêng biệt bên dưới */}
        <div className="vfs-container">
          <div className="vfs-title">🏢 Nghiệp Vụ Trung Tâm Thị Thực VFS Global TP.HCM</div>
          <div className="vfs-layout">
            <div className="vfs-sidebar">
              <button className={`vfs-side-btn ${activeVfsCountry === 'uk' ? 'active' : ''}`} onClick={() => setActiveVfsCountry('uk')}>🇬🇧 Vương Quốc Anh (UK)</button>
              <button className={`vfs-side-btn ${activeVfsCountry === 'france' ? 'active' : ''}`} onClick={() => setActiveVfsCountry('france')}>🇫🇷 Pháp & Schengen</button>
              <button className={`vfs-side-btn ${activeVfsCountry === 'australia' ? 'active' : ''}`} onClick={() => setActiveVfsCountry('australia')}>🇦🇺 Nước Úc (Australia)</button>
              <button className={`vfs-side-btn ${activeVfsCountry === 'canada' ? 'active' : ''}`} onClick={() => setActiveVfsCountry('canada')}>🇨🇦 Quốc gia Canada</button>
            </div>
            <div className="vfs-content-box">
              <div>
                <div className="vfs-tabs">
                  <button className={`vfs-tab-trigger ${activeVfsTab === 'general' ? 'active' : ''}`} onClick={() => setActiveVfsTab('general')}>Tổng quát</button>
                  <button className={`vfs-tab-trigger ${activeVfsTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveVfsTab('contact')}>Địa chỉ & SĐT</button>
                  <button className={`vfs-tab-trigger ${activeVfsTab === 'procedure' ? 'active' : ''}`} onClick={() => setActiveVfsTab('procedure')}>Đặt lịch hẹn</button>
                </div>
                <div className="vfs-pane">
                  {activeVfsTab === 'general' && (
                    <div>
                      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{currentVfsObj.name.vi}</p>
                      <p>{currentVfsObj.summary.vi}</p>
                      <p style={{ marginTop: '0.5rem' }}>🕒 <b>Giờ làm việc:</b> {currentVfsObj.workingHours}</p>
                    </div>
                  )}
                  {activeVfsTab === 'contact' && (
                    <div>
                      <p>📍 <b>Địa chỉ:</b> {currentVfsObj.address.vi}</p>
                      <p style={{ marginTop: '0.4rem' }}>📞 <b>Hotline:</b> {currentVfsObj.hotline}</p>
                      <p style={{ marginTop: '0.4rem' }}>✉️ <b>Email:</b> {currentVfsObj.email}</p>
                    </div>
                  )}
                  {activeVfsTab === 'procedure' && (
                    <div>
                      <p>Vui lòng chuẩn bị hộ chiếu gốc, tờ khai in sẵn và lịch hẹn trước khi đến nộp dữ liệu sinh trắc học tại trung tâm.</p>
                      <a href={currentVfsObj.link} target="_blank" rel="noopener noreferrer" className="vfs-link">Cổng đặt hẹn trực tuyến ↗</a>
                    </div>
                  )}
                </div>
              </div>
              <div className="vfs-map">
                <iframe src={currentVfsObj.mapIframe} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
              </div>
            </div>
          </div>
        </div>

      </div>

      {showTop && <button className="to-top" onClick={scrollToTop}>↑</button>}
      {message && <div className="toast">{message}</div>}

      {/* Footer gốc sửa thông tin và nhúng Signature dải màu mượt chuyển động */}
      <div className="footer">
        <span>Consulate News Dashboard Portal</span> · {lang === 'vi' ? 'Hệ thống giám sát dữ liệu Lãnh sự' : 'Consular Data Monitor'} · © 2026
        <div className="brand-signature">
          <span style={{ color: '#999', fontWeight: 'normal' }}>Designed by</span> <span className="brand-name">Hungluu</span>
        </div>
      </div>
    </div>
  );
}
