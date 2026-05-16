import { useState, useEffect } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'read_articles';
const SEEN_KEY = 'seen_articles';
const ADMIN_KEY = 'admin_logged_in';

var T = {
  vi: {
    siteName: 'Kênh Tin Tức Cập Nhật',
    tagline: 'Cập nhật tin tức chính thống từ Đại sứ quán các nước tại Việt Nam',
    update: 'Cập nhật', updating: 'Đang cập nhật...',
    allSources: 'Tất cả', articles: 'bài',
    today: 'Hôm nay', sources: 'Nguồn', unread: 'Chưa đọc',
    lastUpdated: 'Cập nhật lần cuối', markAllRead: 'Đánh dấu tất cả đã xem',
    noData: 'Chưa có dữ liệu', noDataSub: 'Click Cập nhật để fetch tin tức lần đầu tiên',
    loading: 'Đang tải tin tức...', read: 'Đã đọc', search: 'Tìm kiếm tin tức...',
    admin: 'Quản trị', adminTitle: 'Đăng nhập quản trị',
    adminUser: 'Tài khoản', adminPass: 'Mật khẩu',
    adminLogin: 'Đăng nhập', adminLogout: 'Đăng xuất',
    adminWrong: 'Sai tài khoản hoặc mật khẩu',
    adminPanel: 'Bảng điều khiển', adminNotSet: 'Chưa thiết lập tài khoản admin.',
    viewAll: 'Xem tất cả', autoUpdate: 'Tự động cập nhật lúc 7:00 SA mỗi ngày',
    newBadge: 'MỚI', close: 'Đóng', run: 'Chạy', stats: 'Thống kê',
    schedule: 'Lịch tự động', exitAdmin: 'Thoát chế độ quản trị', adminOnly: 'Chỉ dành cho quản trị viên',
    manageNews: 'Quản lý hệ thống tin tức', fetchAll: 'Fetch tin mới từ tất cả nguồn',
  },
  en: {
    siteName: 'Embassy News Channel',
    tagline: 'Official news updates from Embassies & Consulates in Vietnam',
    update: 'Update', updating: 'Updating...',
    allSources: 'All', articles: 'articles',
    today: 'Today', sources: 'Sources', unread: 'Unread',
    lastUpdated: 'Last updated', markAllRead: 'Mark all as read',
    noData: 'No data yet', noDataSub: 'Click Update to fetch news for the first time',
    loading: 'Loading news...', read: 'Read', search: 'Search news...',
    admin: 'Admin', adminTitle: 'Admin Login',
    adminUser: 'Username', adminPass: 'Password',
    adminLogin: 'Login', adminLogout: 'Logout',
    adminWrong: 'Wrong username or password',
    adminPanel: 'Control Panel', adminNotSet: 'Admin account not configured.',
    viewAll: 'View all', autoUpdate: 'Auto-updates at 7:00 AM daily',
    newBadge: 'NEW', close: 'Close', run: 'Run', stats: 'Statistics',
    schedule: 'Auto schedule', exitAdmin: 'Exit admin mode', adminOnly: 'Authorized personnel only',
    manageNews: 'Manage the news system', fetchAll: 'Fetch latest from all sources',
  }
};

function getReadSet() { try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); } }
function getSeenSet() { try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); } catch { return new Set(); } }
function saveReadSet(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify([...s])); }
function saveSeenSet(s) { localStorage.setItem(SEEN_KEY, JSON.stringify([...s])); }

export default function Home() {
  var [data, setData] = useState(null);
  var [loading, setLoading] = useState(true);
  var [activeCountry, setActiveCountry] = useState('all');
  var [fetching, setFetching] = useState(false);
  var [message, setMessage] = useState('');
  var [readSet, setReadSet] = useState(new Set());
  var [seenSet, setSeenSet] = useState(new Set());
  var [newCount, setNewCount] = useState(0);
  var [lang, setLang] = useState('vi');
  var [search, setSearch] = useState('');
  var [showAdmin, setShowAdmin] = useState(false);
  var [isAdmin, setIsAdmin] = useState(false);
  var [adminUser, setAdminUser] = useState('');
  var [adminPass, setAdminPass] = useState('');
  var [adminErr, setAdminErr] = useState('');
  var [showPanel, setShowPanel] = useState(false);
  var t = T[lang];

  useEffect(function() {
    setReadSet(getReadSet());
    setSeenSet(getSeenSet());
    if (localStorage.getItem(ADMIN_KEY) === 'yes') setIsAdmin(true);
    var savedLang = localStorage.getItem('lang');
    if (savedLang) setLang(savedLang);
    loadNews();
  }, []);

  function switchLang(l) { setLang(l); localStorage.setItem('lang', l); }

  async function loadNews() {
    setLoading(true);
    try {
      var res = await fetch('/api/get-news');
      var json = await res.json();
      if (json && json.sources && json.sources.length > 0) {
        setData(json);
        var seen = getSeenSet();
        var count = 0;
        json.sources.forEach(function(s) { s.articles.forEach(function(a) { if (!seen.has(a.url)) count++; }); });
        setNewCount(count);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function triggerFetch() {
    setFetching(true); setMessage(t.updating);
    try {
      var res = await fetch('/api/fetch-news', { method: 'POST', headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' } });
      var json = await res.json();
      if (json.success) { setMessage('✅ ' + json.total + ' ' + t.articles + '!'); await loadNews(); }
      else { setMessage('❌ ' + json.error); }
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
    data.sources.forEach(function(s) { s.articles.forEach(function(a) { se.add(a.url); }); });
    setSeenSet(se); saveSeenSet(se); setNewCount(0);
  }

  function handleAdminLogin() {
    var U = process.env.NEXT_PUBLIC_ADMIN_USER || '';
    var P = process.env.NEXT_PUBLIC_ADMIN_PASS || '';
    if (!U) { setAdminErr(t.adminNotSet); return; }
    if (adminUser === U && adminPass === P) {
      setIsAdmin(true); localStorage.setItem(ADMIN_KEY, 'yes');
      setShowAdmin(false); setAdminErr(''); setAdminUser(''); setAdminPass('');
    } else { setAdminErr(t.adminWrong); }
  }

  function handleAdminLogout() { setIsAdmin(false); localStorage.removeItem(ADMIN_KEY); setShowPanel(false); }

  var totalArticles = data && data.sources ? data.sources.reduce(function(s, x) { return s + x.articles.length; }, 0) : 0;
  var filteredSources = (data && data.sources ? data.sources : []).filter(function(s) { return activeCountry === 'all' || s.country === activeCountry; });
  if (search.trim()) {
    filteredSources = filteredSources.map(function(s) {
      return Object.assign({}, s, { articles: s.articles.filter(function(a) { return a.title && a.title.toLowerCase().indexOf(search.toLowerCase()) !== -1; }) });
    }).filter(function(s) { return s.articles.length > 0; });
  }

  function formatDate(iso) {
    if (!iso) return '';
    try { var d = new Date(iso); return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch (e) { return ''; }
  }

  return (
    <div style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif", background: '#f5f6fa', minHeight: '100vh' }}>
      <Head>
        <title>{t.siteName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0} body{background:#f5f6fa} a{text-decoration:none;color:inherit} button{cursor:pointer;font-family:'Nunito',sans-serif} input{font-family:'Nunito',sans-serif}
        .navbar{background:#fff;box-shadow:0 2px 16px rgba(0,0,0,0.08);position:sticky;top:0;z-index:200}
        .navbar-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:64px;gap:12px}
        .logo-wrap{display:flex;align-items:center;gap:10px;flex-shrink:0}
        .logo-icon{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#ff6b35,#f7941d);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 3px 12px rgba(255,107,53,0.35)}
        .logo-text{font-size:17px;font-weight:900;color:#1a1a2e;line-height:1.2}
        .logo-text span{color:#ff6b35}
        .logo-sub{font-size:10px;color:#bbb;font-weight:600;letter-spacing:0.5px}
        .nav-center{flex:1;max-width:400px;margin:0 12px}
        .search-wrap{background:#f5f6fa;border-radius:24px;display:flex;align-items:center;padding:9px 16px;gap:8px;border:1.5px solid #ebebeb;transition:border-color 0.2s}
        .search-wrap:focus-within{border-color:#ff6b35;background:#fff}
        .search-wrap input{border:none;outline:none;background:transparent;font-size:13px;color:#333;flex:1}
        .nav-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .lang-sw{display:flex;background:#f5f6fa;border-radius:20px;padding:3px;border:1px solid #ebebeb}
        .lang-btn{padding:5px 11px;border-radius:16px;border:none;font-size:12px;font-weight:800;background:transparent;color:#bbb;transition:all 0.2s}
        .lang-btn.on{background:#ff6b35;color:#fff;box-shadow:0 2px 8px rgba(255,107,53,0.3)}
        .bell-btn{position:relative;width:38px;height:38px;border-radius:50%;border:1.5px solid #ebebeb;background:#f5f6fa;display:flex;align-items:center;justify-content:center;font-size:18px;transition:all 0.2s}
        .bell-btn:hover{border-color:#ff6b35;background:#fff5f0}
        .bell-dot{position:absolute;top:2px;right:2px;width:10px;height:10px;background:#ff3b30;border-radius:50%;border:2px solid #fff;animation:pd 2s infinite}
        @keyframes pd{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
        .upd-btn{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:22px;border:none;background:#1a1a2e;color:#fff;font-size:13px;font-weight:800;box-shadow:0 3px 12px rgba(26,26,46,0.2);transition:all 0.2s}
        .upd-btn:hover:not(:disabled){background:#2d2d5e;transform:translateY(-1px)}
        .upd-btn:disabled{opacity:0.6;cursor:not-allowed}
        .adm-btn{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:22px;border:none;background:linear-gradient(135deg,#ff6b35,#f7941d);color:#fff;font-size:13px;font-weight:800;box-shadow:0 3px 12px rgba(255,107,53,0.3);transition:all 0.2s}
        .adm-btn:hover{transform:translateY(-1px);box-shadow:0 5px 18px rgba(255,107,53,0.4)}
        .adm-btn-out{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:22px;border:1.5px solid #ff6b35;background:#fff5f0;color:#ff6b35;font-size:13px;font-weight:800;transition:all 0.2s}
        .adm-btn-out:hover{background:#ff6b35;color:#fff}
        .spin{animation:sp 1s linear infinite;display:inline-block}
        @keyframes sp{to{transform:rotate(360deg)}}
        .hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 45%,#0f3460 100%);padding:48px 24px 100px;text-align:center;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;top:-80px;right:-80px;width:320px;height:320px;background:radial-gradient(circle,rgba(255,107,53,0.12) 0%,transparent 70%);pointer-events:none}
        .hero-tag{display:inline-block;background:rgba(255,107,53,0.18);color:#f7c59f;font-size:11px;font-weight:800;letter-spacing:1.5px;padding:5px 14px;border-radius:20px;border:1px solid rgba(255,107,53,0.3);margin-bottom:16px;text-transform:uppercase}
        .hero h1{font-size:clamp(22px,4vw,36px);font-weight:900;color:#fff;margin-bottom:10px;line-height:1.3;position:relative;z-index:1}
        .hero h1 span{color:#ff6b35}
        .hero-p{font-size:14px;color:rgba(255,255,255,0.6);margin-bottom:28px;position:relative;z-index:1}
        .hero-stats{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;position:relative;z-index:1}
        .stat-card{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:14px 24px;text-align:center;backdrop-filter:blur(10px)}
        .stat-num{font-size:28px;font-weight:900;color:#ff6b35}
        .stat-lbl{font-size:11px;color:rgba(255,255,255,0.55);font-weight:700;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px}
        .fl-search{max-width:580px;margin:-28px auto 0;position:relative;z-index:10;padding:0 16px}
        .fl-inner{background:#fff;border-radius:50px;display:flex;align-items:center;gap:10px;padding:13px 22px;box-shadow:0 8px 32px rgba(0,0,0,0.14);border:2px solid #fff;transition:border-color 0.2s}
        .fl-inner:focus-within{border-color:#ff6b35}
        .fl-inner input{border:none;outline:none;flex:1;font-size:14px;color:#333;font-family:'Nunito',sans-serif}
        .fl-icon{color:#ff6b35;font-size:20px}
        .main{max-width:1280px;margin:0 auto;padding:28px 24px 64px}
        .info-bar{background:#fff;border-radius:14px;padding:12px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;border:1px solid #f0f0f0;flex-wrap:wrap;gap:8px;box-shadow:0 1px 6px rgba(0,0,0,0.04)}
        .info-txt{font-size:13px;color:#999;font-weight:600}
        .info-txt b{color:#ff6b35}
        .mark-btn{background:none;border:1.5px solid #ff6b35;color:#ff6b35;padding:6px 16px;border-radius:16px;font-size:12px;font-weight:800;transition:all 0.2s}
        .mark-btn:hover{background:#ff6b35;color:#fff}
        .chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}
        .chip{display:flex;align-items:center;gap:6px;padding:9px 18px;border-radius:24px;border:1.5px solid #e0e0e0;background:#fff;color:#666;font-size:13px;font-weight:800;transition:all 0.2s;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.04)}
        .chip:hover{border-color:#ff6b35;color:#ff6b35;background:#fff5f0}
        .chip.on{background:linear-gradient(135deg,#ff6b35,#f7941d);border-color:transparent;color:#fff;box-shadow:0 4px 14px rgba(255,107,53,0.3)}
        .chip-cnt{font-size:11px;background:rgba(0,0,0,0.1);padding:2px 8px;border-radius:10px}
        .chip.on .chip-cnt{background:rgba(255,255,255,0.25)}
        .src-sec{margin-bottom:36px}
        .src-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .src-left{display:flex;align-items:center;gap:10px}
        .src-bar{width:4px;height:30px;border-radius:4px;flex-shrink:0}
        .src-name{font-size:16px;font-weight:900;color:#1a1a2e}
        .src-sub{font-size:11px;color:#bbb;font-weight:600;margin-top:2px}
        .src-badge{background:#f5f6fa;border:1px solid #e8e8e8;padding:5px 12px;border-radius:12px;font-size:12px;font-weight:800;color:#999}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
        .card{background:#fff;border-radius:18px;border:1.5px solid #f0f0f0;overflow:hidden;text-decoration:none;display:block;transition:all 0.22s ease;box-shadow:0 2px 8px rgba(0,0,0,0.04);position:relative}
        .card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.1);border-color:#ffd0bb}
        .card.rd{opacity:0.58}
        .card.rd:hover{opacity:0.95}
        .card-top{padding:15px 15px 10px}
        .card-bar{height:3px;width:100%;border-radius:3px;margin-bottom:12px}
        .new-dot{position:absolute;top:13px;right:13px;width:10px;height:10px;background:#ff3b30;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(255,59,48,0.5);animation:pd 2s infinite}
        .new-badge{display:inline-block;background:linear-gradient(135deg,#ff6b35,#f7941d);color:#fff;font-size:9px;font-weight:900;padding:3px 8px;border-radius:6px;margin-bottom:8px;letter-spacing:0.5px}
        .card-title{font-size:13.5px;font-weight:700;color:#1a1a2e;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        .card.rd .card-title{color:#bbb}
        .card-bot{padding:8px 15px 13px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f8f8f8;margin-top:10px}
        .card-date{font-size:11px;color:#ccc;font-weight:700}
        .rd-tag{font-size:10px;font-weight:800;color:#ff6b35;background:#fff5f0;padding:3px 9px;border-radius:6px}
        .empty{text-align:center;padding:72px 24px;color:#ccc}
        .empty-ico{font-size:52px;margin-bottom:14px;opacity:0.4}
        .empty h2{font-size:16px;color:#bbb;margin-bottom:8px;font-weight:800}
        .empty p{font-size:13px}
        .ldg{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;gap:16px}
        .loader{width:40px;height:40px;border:3px solid #fde8de;border-top-color:#ff6b35;border-radius:50%;animation:sp 0.7s linear infinite}
        .ldg-txt{font-size:14px;font-weight:700;color:#ccc}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:13px 26px;border-radius:28px;font-size:13px;font-weight:800;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,0.2);white-space:nowrap;animation:su 0.3s ease}
        @keyframes su{from{transform:translateX(-50%) translateY(14px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)}
        .modal{background:#fff;border-radius:28px;padding:36px;width:100%;max-width:400px;margin:16px;box-shadow:0 28px 72px rgba(0,0,0,0.22);animation:pi 0.25s ease}
        @keyframes pi{from{transform:scale(0.94);opacity:0}to{transform:scale(1);opacity:1}}
        .modal-ico{width:60px;height:60px;border-radius:18px;background:linear-gradient(135deg,#ff6b35,#f7941d);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 18px;box-shadow:0 6px 22px rgba(255,107,53,0.3)}
        .modal h2{font-size:22px;font-weight:900;color:#1a1a2e;text-align:center;margin-bottom:6px}
        .modal-sub{font-size:13px;color:#bbb;text-align:center;margin-bottom:24px}
        .mf{margin-bottom:16px}
        .mf label{font-size:11px;font-weight:800;color:#aaa;display:block;margin-bottom:7px;letter-spacing:0.8px}
        .mf input{width:100%;padding:13px 18px;border:1.5px solid #ebebeb;border-radius:14px;font-size:14px;outline:none;transition:border-color 0.2s;font-family:'Nunito',sans-serif;color:#1a1a2e}
        .mf input:focus{border-color:#ff6b35}
        .merr{font-size:12px;color:#ff3b30;font-weight:700;margin-bottom:16px;text-align:center}
        .mlogin{width:100%;padding:14px;background:linear-gradient(135deg,#ff6b35,#f7941d);color:#fff;border:none;border-radius:16px;font-size:16px;font-weight:900;box-shadow:0 4px 18px rgba(255,107,53,0.35);transition:all 0.2s}
        .mlogin:hover{transform:translateY(-1px);box-shadow:0 7px 24px rgba(255,107,53,0.45)}
        .mclose{display:block;text-align:center;margin-top:16px;font-size:13px;color:#ccc;cursor:pointer;font-weight:700;transition:color 0.2s}
        .mclose:hover{color:#ff6b35}
        .prow{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #f8f8f8}
        .prow:last-child{border-bottom:none}
        .plbl{font-size:14px;font-weight:800;color:#1a1a2e}
        .psub{font-size:12px;color:#bbb;margin-top:3px}
        .pact{padding:8px 18px;border-radius:14px;border:1.5px solid #ff6b35;color:#ff6b35;background:#fff5f0;font-size:13px;font-weight:800;transition:all 0.2s}
        .pact:hover{background:#ff6b35;color:#fff}
        .pdng{border-color:#ff3b30;color:#ff3b30;background:#fff0f0}
        .pdng:hover{background:#ff3b30;color:#fff}
        .footer{background:#1a1a2e;color:rgba(255,255,255,0.45);text-align:center;padding:22px;font-size:12px;font-weight:700}
        .footer span{color:#ff6b35}
        @media(max-width:640px){.nav-center{display:none}.logo-sub{display:none}.main{padding:16px 12px 40px}.grid{grid-template-columns:1fr}.hero{padding:32px 16px 84px}}
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="logo-wrap">
            <div className="logo-icon">📰</div>
            <div>
              <div className="logo-text">Kênh Tin Tức <span>Cập Nhật</span></div>
              <div className="logo-sub">{t.autoUpdate}</div>
            </div>
          </div>
          <div className="nav-center">
            <div className="search-wrap">
              <span style={{ color: '#ddd', fontSize: 15 }}>🔍</span>
              <input placeholder={t.search} value={search} onChange={function(e) { setSearch(e.target.value); }} />
            </div>
          </div>
          <div className="nav-right">
            <div className="lang-sw">
              <button className={'lang-btn' + (lang === 'vi' ? ' on' : '')} onClick={function() { switchLang('vi'); }}>VI</button>
              <button className={'lang-btn' + (lang === 'en' ? ' on' : '')} onClick={function() { switchLang('en'); }}>EN</button>
            </div>
            <button className="bell-btn" onClick={markAllSeen} title={t.markAllRead}>
              🔔{newCount > 0 && <span className="bell-dot"></span>}
            </button>
            <button className="upd-btn" onClick={triggerFetch} disabled={fetching}>
              <span className={fetching ? 'spin' : ''}>↻</span>{fetching ? t.updating : t.update}
            </button>
            {isAdmin
              ? <button className="adm-btn-out" onClick={function() { setShowPanel(true); }}>⚙ {t.adminPanel}</button>
              : <button className="adm-btn" onClick={function() { setShowAdmin(true); }}>🔐 {t.admin}</button>
            }
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-tag">🌐 OFFICIAL SOURCES ONLY</div>
        <h1>Kênh Tin Tức <span>Đại Sứ Quán</span></h1>
        <p className="hero-p">{t.tagline}</p>
        <div className="hero-stats">
          <div className="stat-card"><div className="stat-num">{totalArticles}</div><div className="stat-lbl">{t.today}</div></div>
          <div className="stat-card"><div className="stat-num">{data && data.sources ? data.sources.length : 0}</div><div className="stat-lbl">{t.sources}</div></div>
          <div className="stat-card"><div className="stat-num">{newCount}</div><div className="stat-lbl">{t.unread}</div></div>
        </div>
      </div>

      {/* FLOATING SEARCH */}
      <div className="fl-search">
        <div className="fl-inner">
          <span className="fl-icon">🔍</span>
          <input placeholder={t.search} value={search} onChange={function(e) { setSearch(e.target.value); }} />
          {search && <span style={{ cursor: 'pointer', color: '#ccc', fontSize: 16 }} onClick={function() { setSearch(''); }}>✕</span>}
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {data && data.lastUpdated && (
          <div className="info-bar" style={{ marginTop: 28 }}>
            <div className="info-txt">{t.lastUpdated}: <b>{formatDate(data.lastUpdated)}</b> · {totalArticles} {t.articles}</div>
            {newCount > 0 && <button className="mark-btn" onClick={markAllSeen}>✓ {t.markAllRead} ({newCount})</button>}
          </div>
        )}

        {data && data.sources && data.sources.length > 0 && (
          <div className="chips" style={{ marginTop: data && data.lastUpdated ? 0 : 28 }}>
            <button className={'chip' + (activeCountry === 'all' ? ' on' : '')} onClick={function() { setActiveCountry('all'); }}>
              🌏 {t.allSources} <span className="chip-cnt">{totalArticles}</span>
            </button>
            {data.sources.map(function(s) {
              return (
                <button key={s.country} className={'chip' + (activeCountry === s.country ? ' on' : '')} onClick={function() { setActiveCountry(s.country); }}>
                  {s.flag} {s.country} <span className="chip-cnt">{s.articles.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="ldg"><div className="loader"></div><div className="ldg-txt">{t.loading}</div></div>
        ) : (!data || !data.sources || data.sources.length === 0) ? (
          <div className="empty"><div className="empty-ico">📭</div><h2>{t.noData}</h2><p>{t.noDataSub}</p></div>
        ) : (
          <div>
            {filteredSources.map(function(source, si) {
              return (
                <div key={source.country} className="src-sec">
                  <div className="src-head">
                    <div className="src-left">
                      <div className="src-bar" style={{ background: source.color }}></div>
                      <div>
                        <div className="src-name">{source.flag} {source.name}</div>
                        <div className="src-sub">{formatDate(source.updatedAt)}</div>
                      </div>
                    </div>
                    <span className="src-badge">{source.articles.length} {t.articles}</span>
                  </div>
                  <div className="grid">
                    {source.articles.map(function(article, i) {
                      var isRead = readSet.has(article.url);
                      var isNew = !seenSet.has(article.url);
                      return (
                        <a key={i} href={article.url ? article.url : '#'} target="_blank" rel="noopener noreferrer"
                          className={'card' + (isRead ? ' rd' : '')}
                          onClick={function() { markRead(article.url); }}>
                          {isNew && !isRead && <span className="new-dot"></span>}
                          <div className="card-top">
                            <div className="card-bar" style={{ background: source.color }}></div>
                            {isNew && !isRead && <span className="new-badge">{t.newBadge}</span>}
                            <div className="card-title">{article.title}</div>
                          </div>
                          <div className="card-bot">
                            <span className="card-date">📅 {formatDate(article.date)}</span>
                            {isRead && <span className="rd-tag">✓ {t.read}</span>}
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
      </div>

      <div className="footer"><span>{t.siteName}</span> · {t.autoUpdate} · © 2026</div>

      {message && <div className="toast">{message}</div>}

      {/* LOGIN MODAL */}
      {showAdmin && (
        <div className="overlay" onClick={function(e) { if (e.target === e.currentTarget) setShowAdmin(false); }}>
          <div className="modal">
            <div className="modal-ico">🔐</div>
            <h2>{t.adminTitle}</h2>
            <p className="modal-sub">{t.adminOnly}</p>
            <div className="mf">
              <label>{t.adminUser.toUpperCase()}</label>
              <input type="text" placeholder="admin@example.com" value={adminUser}
                onChange={function(e) { setAdminUser(e.target.value); }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleAdminLogin(); }} />
            </div>
            <div className="mf">
              <label>{t.adminPass.toUpperCase()}</label>
              <input type="password" placeholder="••••••••" value={adminPass}
                onChange={function(e) { setAdminPass(e.target.value); }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleAdminLogin(); }} />
            </div>
            {adminErr && <div className="merr">⚠ {adminErr}</div>}
            <button className="mlogin" onClick={handleAdminLogin}>{t.adminLogin}</button>
            <span className="mclose" onClick={function() { setShowAdmin(false); setAdminErr(''); }}>✕ {t.close}</span>
          </div>
        </div>
      )}

      {/* ADMIN PANEL */}
      {showPanel && isAdmin && (
        <div className="overlay" onClick={function(e) { if (e.target === e.currentTarget) setShowPanel(false); }}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-ico">⚙️</div>
            <h2>{t.adminPanel}</h2>
            <p className="modal-sub">{t.manageNews}</p>
            <div className="prow">
              <div><div className="plbl">🔄 {t.update}</div><div className="psub">{t.fetchAll}</div></div>
              <button className="pact" onClick={function() { setShowPanel(false); triggerFetch(); }}>{t.run}</button>
            </div>
            <div className="prow">
              <div><div className="plbl">📊 {t.stats}</div><div className="psub">{totalArticles} {t.articles} · {data && data.sources ? data.sources.length : 0} {t.sources}</div></div>
              <span style={{ fontSize: 24 }}>📈</span>
            </div>
            <div className="prow">
              <div><div className="plbl">🕐 {t.schedule}</div><div className="psub">{t.autoUpdate}</div></div>
              <span style={{ fontSize: 12, color: '#27ae60', fontWeight: 800, background: '#eafaf1', padding: '5px 12px', borderRadius: 10 }}>✓ ON</span>
            </div>
            <div className="prow">
              <div><div className="plbl" style={{ color: '#ff3b30' }}>🚪 {t.adminLogout}</div><div className="psub">{t.exitAdmin}</div></div>
              <button className="pact pdng" onClick={handleAdminLogout}>{t.adminLogout}</button>
            </div>
            <span className="mclose" onClick={function() { setShowPanel(false); }}>✕ {t.close}</span>
          </div>
        </div>
      )}
    </div>
  );
}
