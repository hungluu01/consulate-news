import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'read_articles';
const SEEN_KEY = 'seen_articles';

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
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
    'https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&q=80',
  ],
  kvac: [
    'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
    'https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&q=80',
  ],
  uc: [
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
    'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80',
    'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=800&q=80',
  ],
  canada: [
    'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&q=80',
    'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&q=80',
    'https://images.unsplash.com/photo-1609954584977-747e9ce78b78?w=800&q=80',
  ],
  daiLoan: [
    'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1596422846543-75c6fc197f11?w=800&q=80',
  ],
};

var TIMEZONES = {
  my: { label: 'Washington D.C.', tz: 'America/New_York' },
  nhat: { label: 'Tokyo', tz: 'Asia/Tokyo' },
  han: { label: 'Seoul', tz: 'Asia/Seoul' },
  kvac: { label: 'Seoul', tz: 'Asia/Seoul' },
  uc: { label: 'Sydney', tz: 'Australia/Sydney' },
  canada: { label: 'Ottawa', tz: 'America/Toronto' },
  daiLoan: { label: 'Taipei', tz: 'Asia/Taipei' },
};

function getReadSet() { try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); } }
function getSeenSet() { try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); } catch { return new Set(); } }
function saveReadSet(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify([...s])); }
function saveSeenSet(s) { localStorage.setItem(SEEN_KEY, JSON.stringify([...s])); }

function Clock({ tz, label }) {
  var [time, setTime] = useState('');
  var [date, setDate] = useState('');
  useEffect(function() {
    function tick() {
      var now = new Date();
      var t = now.toLocaleTimeString('vi-VN', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      var d = now.toLocaleDateString('vi-VN', { timeZone: tz, day: '2-digit', month: '2-digit' });
      setTime(t); setDate(d);
    }
    tick();
    var id = setInterval(tick, 1000);
    return function() { clearInterval(id); };
  }, [tz]);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#ff6b35', fontWeight: 800, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 900, color: '#1a1a2e', letterSpacing: 1 }}>{time}</div>
      <div style={{ fontSize: 10, color: '#bbb', fontWeight: 600 }}>{date}</div>
    </div>
  );
}

function ImageSlider({ images }) {
  var [idx, setIdx] = useState(0);
  var [fade, setFade] = useState(true);
  useEffect(function() {
    if (!images || images.length <= 1) return;
    var id = setInterval(function() {
      setFade(false);
      setTimeout(function() {
        setIdx(function(i) { return (i + 1) % images.length; });
        setFade(true);
      }, 400);
    }, 4000);
    return function() { clearInterval(id); };
  }, [images]);
  if (!images || images.length === 0) return null;
  return (
    <div style={{ position: 'relative', width: '100%', height: 180, borderRadius: '14px 14px 0 0', overflow: 'hidden', background: '#eee' }}>
      <img
        src={images[idx]}
        alt=""
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
        onError={function(e) { e.target.style.display = 'none'; }}
      />
      <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
        {images.map(function(_, i) {
          return <div key={i} style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? '#ff6b35' : 'rgba(255,255,255,0.6)', transition: 'all 0.3s' }}></div>;
        })}
      </div>
    </div>
  );
}

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
  var [showTop, setShowTop] = useState(false);
  var topRef = useRef(null);

  useEffect(function() {
    setReadSet(getReadSet());
    setSeenSet(getSeenSet());
    var savedLang = localStorage.getItem('lang');
    if (savedLang) setLang(savedLang);
    loadNews();
    function onScroll() { setShowTop(window.scrollY > 400); }
    window.addEventListener('scroll', onScroll);
    return function() { window.removeEventListener('scroll', onScroll); };
  }, []);

  function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
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
    setFetching(true); setMessage(lang === 'vi' ? 'Đang cập nhật...' : 'Updating...');
    try {
      var res = await fetch('/api/fetch-news', { method: 'POST', headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' } });
      var json = await res.json();
      if (json.success) { setMessage('✅ ' + json.total + (lang === 'vi' ? ' bài mới!' : ' articles!')); await loadNews(); }
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

  var totalArticles = data && data.sources ? data.sources.reduce(function(s, x) { return s + x.articles.length; }, 0) : 0;
  var filteredSources = (data && data.sources ? data.sources : []).filter(function(s) { return activeCountry === 'all' || s.country === activeCountry; });
  if (search.trim()) {
    filteredSources = filteredSources.map(function(s) {
      return Object.assign({}, s, { articles: s.articles.filter(function(a) { return a.title && a.title.toLowerCase().indexOf(search.toLowerCase()) !== -1; }) });
    }).filter(function(s) { return s.articles.length > 0; });
  }

  function formatDate(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch (e) { return ''; }
  }

  return (
    <div ref={topRef} style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", background: '#fff8f5', minHeight: '100vh' }}>
      <Head>
        <title>Kênh Cập Nhật Tin Tức Visa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Cập nhật tin tức visa, lãnh sự quán từ Mỹ, Nhật, Hàn, Úc, Canada, Đài Loan" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#fff8f5;overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        button{cursor:pointer;font-family:'Nunito',sans-serif;border:none}
        input{font-family:'Nunito',sans-serif}

        /* NAVBAR */
        .nav{background:#fff;box-shadow:0 2px 20px rgba(255,107,53,0.1);position:sticky;top:0;z-index:200;border-bottom:2px solid #fff0ea}
        .nav-in{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 16px;height:58px;gap:10px}
        .logo{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .logo-ico{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#ff6b35,#f7941d);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 3px 10px rgba(255,107,53,0.3)}
        .logo-txt{font-size:15px;font-weight:900;color:#1a1a2e;line-height:1.1}
        .logo-txt span{color:#ff6b35}
        .logo-sub{font-size:9px;color:#ffb380;font-weight:700;letter-spacing:0.5px}
        .nav-mid{flex:1;max-width:380px;margin:0 10px}
        .sw{background:#fff0ea;border-radius:22px;display:flex;align-items:center;padding:8px 14px;gap:7px;border:1.5px solid #ffd5c0}
        .sw:focus-within{border-color:#ff6b35;background:#fff}
        .sw input{border:none;outline:none;background:transparent;font-size:13px;color:#333;flex:1}
        .nav-r{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .lang-sw{display:flex;background:#fff0ea;border-radius:18px;padding:3px;border:1px solid #ffd5c0}
        .lb{padding:4px 10px;border-radius:14px;border:none;font-size:11px;font-weight:800;background:transparent;color:#ff9970;transition:all 0.2s}
        .lb.on{background:#ff6b35;color:#fff;box-shadow:0 2px 8px rgba(255,107,53,0.3)}
        .bell{position:relative;width:36px;height:36px;border-radius:50%;border:1.5px solid #ffd5c0;background:#fff0ea;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;transition:all 0.2s}
        .bell:hover{border-color:#ff6b35;background:#fff5f0}
        .bdot{position:absolute;top:1px;right:1px;width:10px;height:10px;background:#ff3b30;border-radius:50%;border:2px solid #fff;animation:pd 2s infinite}
        @keyframes pd{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
        .upd{display:flex;align-items:center;gap:5px;padding:8px 14px;border-radius:20px;background:#1a1a2e;color:#fff;font-size:12px;font-weight:800;box-shadow:0 3px 10px rgba(26,26,46,0.2);transition:all 0.2s}
        .upd:hover:not(:disabled){background:#2d2d5e;transform:translateY(-1px)}
        .upd:disabled{opacity:0.6;cursor:not-allowed}
        .spin{animation:sp 1s linear infinite;display:inline-block}
        @keyframes sp{to{transform:rotate(360deg)}}

        /* HERO */
        .hero{background:linear-gradient(135deg,#ff6b35 0%,#f7941d 40%,#ff6b35 100%);padding:40px 16px 90px;text-align:center;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%);pointer-events:none}
        .hero::after{content:'';position:absolute;bottom:-60px;left:-60px;width:250px;height:250px;background:radial-gradient(circle,rgba(255,255,255,0.06) 0%,transparent 70%);pointer-events:none}

        .name-slide{font-size:clamp(13px,3vw,18px);font-weight:900;color:rgba(255,255,255,0.9);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;animation:slideDown 0.8s ease both}
        @keyframes slideDown{from{transform:translateY(-30px);opacity:0}to{transform:translateY(0);opacity:1}}

        .hero h1{font-size:clamp(20px,4vw,34px);font-weight:900;color:#fff;margin-bottom:8px;line-height:1.25;position:relative;z-index:1;text-shadow:0 2px 10px rgba(0,0,0,0.1)}
        .hero h1 span{color:#fff3e0;text-decoration:underline;text-decoration-color:rgba(255,255,255,0.4)}
        .hero-sub{font-size:13px;color:rgba(255,255,255,0.8);margin-bottom:24px;position:relative;z-index:1}
        .hero-stats{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;position:relative;z-index:1}
        .scard{background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.25);border-radius:14px;padding:12px 20px;text-align:center;backdrop-filter:blur(8px)}
        .snum{font-size:26px;font-weight:900;color:#fff}
        .slbl{font-size:10px;color:rgba(255,255,255,0.8);font-weight:800;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px}

        /* CLOCKS */
        .clocks-wrap{background:#fff;border-bottom:2px solid #fff0ea;overflow-x:auto;-webkit-overflow-scrolling:touch}
        .clocks-in{display:flex;gap:0;min-width:max-content;padding:10px 16px;max-width:1280px;margin:0 auto}
        .clock-item{display:flex;flex-direction:column;align-items:center;padding:8px 16px;border-right:1px solid #fff0ea;min-width:90px}
        .clock-item:last-child{border-right:none}
        .clock-flag{font-size:18px;margin-bottom:4px}

        /* FLOATING SEARCH */
        .fl{max-width:560px;margin:-26px auto 0;position:relative;z-index:10;padding:0 16px}
        .fl-in{background:#fff;border-radius:50px;display:flex;align-items:center;gap:10px;padding:12px 20px;box-shadow:0 8px 32px rgba(255,107,53,0.2);border:2px solid #fff0ea;transition:border-color 0.2s}
        .fl-in:focus-within{border-color:#ff6b35}
        .fl-in input{border:none;outline:none;flex:1;font-size:14px;color:#333;font-family:'Nunito',sans-serif}
        .fl-ico{color:#ff6b35;font-size:20px}

        /* MAIN */
        .main{max-width:1280px;margin:0 auto;padding:24px 16px 80px}

        /* INFO BAR */
        .ibar{background:#fff;border-radius:14px;padding:12px 18px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #fff0ea;flex-wrap:wrap;gap:8px;box-shadow:0 2px 10px rgba(255,107,53,0.06)}
        .itxt{font-size:13px;color:#aaa;font-weight:600}
        .itxt b{color:#ff6b35}
        .mbtn{background:none;border:1.5px solid #ff6b35;color:#ff6b35;padding:6px 14px;border-radius:16px;font-size:12px;font-weight:800;transition:all 0.2s}
        .mbtn:hover{background:#ff6b35;color:#fff}

        /* CHIPS */
        .chips{display:flex;gap:7px;flex-wrap:nowrap;overflow-x:auto;margin-bottom:22px;-webkit-overflow-scrolling:touch;padding-bottom:4px}
        .chips::-webkit-scrollbar{height:3px}
        .chips::-webkit-scrollbar-thumb{background:#ffd0bb;border-radius:3px}
        .chip{display:flex;align-items:center;gap:5px;padding:8px 15px;border-radius:22px;border:1.5px solid #ffd5c0;background:#fff;color:#ff9970;font-size:12px;font-weight:800;transition:all 0.2s;white-space:nowrap;flex-shrink:0;box-shadow:0 1px 4px rgba(255,107,53,0.06)}
        .chip:hover{border-color:#ff6b35;color:#ff6b35;background:#fff5f0}
        .chip.on{background:linear-gradient(135deg,#ff6b35,#f7941d);border-color:transparent;color:#fff;box-shadow:0 4px 14px rgba(255,107,53,0.3)}
        .ccnt{font-size:10px;background:rgba(0,0,0,0.1);padding:2px 7px;border-radius:9px}
        .chip.on .ccnt{background:rgba(255,255,255,0.25)}

        /* SOURCE SECTION */
        .src{margin-bottom:32px}
        .src-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px}
        .src-left{display:flex;align-items:center;gap:10px}
        .src-bar{width:4px;height:30px;border-radius:4px;flex-shrink:0}
        .src-nm{font-size:15px;font-weight:900;color:#1a1a2e}
        .src-sb{font-size:11px;color:#bbb;font-weight:600;margin-top:2px}
        .src-bdg{background:#fff0ea;border:1px solid #ffd5c0;padding:5px 12px;border-radius:12px;font-size:11px;font-weight:800;color:#ff9970}

        /* GRID */
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
        @media(max-width:640px){.grid{grid-template-columns:1fr}}

        /* CARD */
        .card{background:#fff;border-radius:18px;border:1.5px solid #ffeee6;overflow:hidden;text-decoration:none;display:block;transition:all 0.22s ease;box-shadow:0 2px 10px rgba(255,107,53,0.06);position:relative}
        .card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(255,107,53,0.15);border-color:#ffb380}
        .card.rd{opacity:0.55}
        .card.rd:hover{opacity:0.9}
        .card-img-wrap{position:relative;width:100%;height:160px;overflow:hidden;background:#f5f5f5}
        .card-img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease}
        .card:hover .card-img{transform:scale(1.05)}
        .img-dots{position:absolute;bottom:7px;left:0;right:0;display:flex;justify-content:center;gap:4px}
        .img-dot{height:5px;border-radius:3px;background:rgba(255,255,255,0.7);transition:all 0.3s}
        .img-dot.on{background:#ff6b35}
        .ndot{position:absolute;top:12px;right:12px;width:10px;height:10px;background:#ff3b30;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(255,59,48,0.5);animation:pd 2s infinite}
        .card-body{padding:13px 14px 10px}
        .cbar{height:3px;width:100%;border-radius:3px;margin-bottom:10px}
        .nbadge{display:inline-block;background:linear-gradient(135deg,#ff6b35,#f7941d);color:#fff;font-size:9px;font-weight:900;padding:3px 8px;border-radius:6px;margin-bottom:7px;letter-spacing:0.5px}
        .ctitle{font-size:13px;font-weight:700;color:#1a1a2e;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        .card.rd .ctitle{color:#ccc}
        .cfoot{padding:8px 14px 12px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #fff5f0}
        .cdate{font-size:11px;color:#ddd;font-weight:700}
        .rtag{font-size:10px;font-weight:800;color:#ff6b35;background:#fff5f0;padding:3px 8px;border-radius:6px}

        /* EMPTY / LOADING */
        .empty{text-align:center;padding:64px 24px;color:#ffb380}
        .empty-ico{font-size:48px;margin-bottom:12px;opacity:0.5}
        .empty h2{font-size:16px;color:#ff9970;margin-bottom:8px;font-weight:900}
        .empty p{font-size:13px}
        .ldg{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;gap:16px}
        .loader{width:40px;height:40px;border:3px solid #ffd5c0;border-top-color:#ff6b35;border-radius:50%;animation:sp 0.7s linear infinite}
        .ldg-txt{font-size:14px;font-weight:700;color:#ffb380}

        /* TOAST */
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:13px 26px;border-radius:28px;font-size:13px;font-weight:800;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,0.2);white-space:nowrap;animation:su 0.3s ease}
        @keyframes su{from{transform:translateX(-50%) translateY(14px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}

        /* SCROLL TO TOP */
        .to-top{position:fixed;bottom:80px;right:20px;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#ff6b35,#f7941d);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 16px rgba(255,107,53,0.4);cursor:pointer;z-index:100;transition:all 0.3s;border:none}
        .to-top:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(255,107,53,0.5)}

        /* FOOTER */
        .footer{background:linear-gradient(135deg,#1a1a2e,#2d2d5e);color:rgba(255,255,255,0.5);text-align:center;padding:24px 16px;font-size:12px;font-weight:700}
        .footer span{color:#ff6b35}

        /* MOBILE FIXES */
        @media(max-width:640px){
          .nav-mid{display:none}
          .logo-sub{display:none}
          .main{padding:16px 12px 80px}
          .hero{padding:32px 12px 84px}
          .scard{padding:10px 14px}
          .snum{font-size:22px}
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="nav">
        <div className="nav-in">
          <div className="logo">
            <div className="logo-ico">📰</div>
            <div>
              <div className="logo-txt">Tin Tức <span>Visa</span></div>
              <div className="logo-sub">Cập nhật 7:00 SA · Chính thống</div>
            </div>
          </div>
          <div className="nav-mid">
            <div className="sw">
              <span style={{ color: '#ffb380', fontSize: 14 }}>🔍</span>
              <input placeholder={lang === 'vi' ? 'Tìm kiếm tin tức...' : 'Search news...'} value={search} onChange={function(e) { setSearch(e.target.value); }} />
            </div>
          </div>
          <div className="nav-r">
            <div className="lang-sw">
              <button className={'lb' + (lang === 'vi' ? ' on' : '')} onClick={function() { switchLang('vi'); }}>VI</button>
              <button className={'lb' + (lang === 'en' ? ' on' : '')} onClick={function() { switchLang('en'); }}>EN</button>
            </div>
            <button className="bell" onClick={markAllSeen} title="Đánh dấu đã xem">
              🔔{newCount > 0 && <span className="bdot"></span>}
            </button>
            <button className="upd" onClick={triggerFetch} disabled={fetching}>
              <span className={fetching ? 'spin' : ''}>↻</span>
              {fetching ? (lang === 'vi' ? 'Đang cập nhật' : 'Updating') : (lang === 'vi' ? 'Cập nhật' : 'Update')}
            </button>
          </div>
        </div>
      </nav>

      {/* CLOCKS BAR */}
      <div className="clocks-wrap">
        <div className="clocks-in">
          {Object.entries(TIMEZONES).map(function(entry) {
            var key = entry[0]; var tz = entry[1];
            var src = data && data.sources ? data.sources.find(function(s) { return s.country === key; }) : null;
            return (
              <div key={key} className="clock-item">
                <div className="clock-flag">{src ? src.flag : ''}</div>
                <Clock tz={tz.tz} label={tz.label} />
              </div>
            );
          })}
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        <div className="name-slide">✦ Lưu Chánh Hưng ✦</div>
        <h1>Kênh Cập Nhật <span>Tin Tức Visa</span></h1>
        <p className="hero-sub">{lang === 'vi' ? 'Cập nhật tin tức chính thống từ Lãnh sự quán các nước tại TP.HCM' : 'Official visa news from Consulates in Ho Chi Minh City'}</p>
        <div className="hero-stats">
          <div className="scard"><div className="snum">{totalArticles}</div><div className="slbl">{lang === 'vi' ? 'Bài hôm nay' : 'Today'}</div></div>
          <div className="scard"><div className="snum">{data && data.sources ? data.sources.length : 0}</div><div className="slbl">{lang === 'vi' ? 'Nguồn' : 'Sources'}</div></div>
          <div className="scard"><div className="snum">{newCount}</div><div className="slbl">{lang === 'vi' ? 'Chưa đọc' : 'Unread'}</div></div>
        </div>
      </div>

      {/* FLOATING SEARCH */}
      <div className="fl">
        <div className="fl-in">
          <span className="fl-ico">🔍</span>
          <input placeholder={lang === 'vi' ? 'Tìm kiếm tin tức...' : 'Search news...'} value={search} onChange={function(e) { setSearch(e.target.value); }} />
          {search && <span style={{ cursor: 'pointer', color: '#ffb380', fontSize: 16 }} onClick={function() { setSearch(''); }}>✕</span>}
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {data && data.lastUpdated && (
          <div className="ibar" style={{ marginTop: 28 }}>
            <div className="itxt">{lang === 'vi' ? 'Cập nhật lần cuối' : 'Last updated'}: <b>{formatDate(data.lastUpdated)}</b> · {totalArticles} {lang === 'vi' ? 'bài' : 'articles'}</div>
            {newCount > 0 && <button className="mbtn" onClick={markAllSeen}>✓ {lang === 'vi' ? 'Đánh dấu tất cả đã xem' : 'Mark all read'} ({newCount})</button>}
          </div>
        )}

        {data && data.sources && data.sources.length > 0 && (
          <div className="chips" style={{ marginTop: data && data.lastUpdated ? 0 : 28 }}>
            <button className={'chip' + (activeCountry === 'all' ? ' on' : '')} onClick={function() { setActiveCountry('all'); }}>
              🌏 {lang === 'vi' ? 'Tất cả' : 'All'} <span className="ccnt">{totalArticles}</span>
            </button>
            {data.sources.map(function(s) {
              return (
                <button key={s.country} className={'chip' + (activeCountry === s.country ? ' on' : '')} onClick={function() { setActiveCountry(s.country); }}>
                  {s.flag} {s.country === 'my' ? (lang === 'vi' ? 'Mỹ' : 'USA') : s.country === 'nhat' ? (lang === 'vi' ? 'Nhật' : 'Japan') : s.country === 'han' ? (lang === 'vi' ? 'Hàn Quốc' : 'Korea') : s.country === 'kvac' ? 'KVAC' : s.country === 'uc' ? (lang === 'vi' ? 'Úc' : 'Australia') : s.country === 'canada' ? 'Canada' : (lang === 'vi' ? 'Đài Loan' : 'Taiwan')}
                  <span className="ccnt">{s.articles.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="ldg"><div className="loader"></div><div className="ldg-txt">{lang === 'vi' ? 'Đang tải tin tức...' : 'Loading...'}</div></div>
        ) : (!data || !data.sources || data.sources.length === 0) ? (
          <div className="empty"><div className="empty-ico">📭</div><h2>{lang === 'vi' ? 'Chưa có dữ liệu' : 'No data yet'}</h2><p>{lang === 'vi' ? 'Click Cập nhật để fetch tin tức' : 'Click Update to fetch news'}</p></div>
        ) : (
          <div>
            {filteredSources.map(function(source) {
              var imgs = COUNTRY_IMAGES[source.country] || [];
              var tz = TIMEZONES[source.country];
              return (
                <div key={source.country} className="src">
                  <div className="src-head">
                    <div className="src-left">
                      <div className="src-bar" style={{ background: source.color }}></div>
                      <div>
                        <div className="src-nm">{source.flag} {source.name}</div>
                        <div className="src-sb">{formatDate(source.updatedAt)}{tz ? ' · ' + tz.label : ''}</div>
                      </div>
                    </div>
                    <span className="src-bdg">{source.articles.length} {lang === 'vi' ? 'bài' : 'articles'}</span>
                  </div>
                  <div className="grid">
                    {source.articles.map(function(article, i) {
                      var isRead = readSet.has(article.url);
                      var isNew = !seenSet.has(article.url);
                      var imgIdx = i % imgs.length;
                      return (
                        <a key={i} href={article.url ? article.url : '#'} target="_blank" rel="noopener noreferrer"
                          className={'card' + (isRead ? ' rd' : '')}
                          onClick={function() { markRead(article.url); }}>
                          {isNew && !isRead && <span className="ndot"></span>}
                          {imgs.length > 0 && (
                            <div className="card-img-wrap">
                              <img className="card-img" src={imgs[imgIdx]} alt="" onError={function(e) { e.target.parentNode.style.display = 'none'; }} />
                            </div>
                          )}
                          <div className="card-body">
                            <div className="cbar" style={{ background: source.color }}></div>
                            {isNew && !isRead && <span className="nbadge">{lang === 'vi' ? 'MỚI' : 'NEW'}</span>}
                            <div className="ctitle">{article.title}</div>
                          </div>
                          <div className="cfoot">
                            <span className="cdate">📅 {formatDate(article.date)}</span>
                            {isRead && <span className="rtag">✓ {lang === 'vi' ? 'Đã đọc' : 'Read'}</span>}
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

      <div className="footer">
        <span>Kênh Cập Nhật Tin Tức Visa</span> · {lang === 'vi' ? 'Tự động cập nhật lúc 7:00 SA mỗi ngày' : 'Auto-updates at 7:00 AM daily'} · © 2026
      </div>

      {message && <div className="toast">{message}</div>}

      {showTop && (
        <button className="to-top" onClick={scrollToTop} title="Lên đầu trang">↑</button>
      )}
    </div>
  );
}
