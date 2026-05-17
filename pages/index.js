import { useState, useEffect } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'read_articles';
const SEEN_KEY = 'seen_articles';

var COUNTRY_CONFIG = {
  my:      { label: { vi: 'Mỹ', en: 'USA' },         tz: 'America/New_York', city: 'Washington D.C.', brand: 'ROLEX',    gradients: ['linear-gradient(135deg,#B22234,#3C3B6E)','linear-gradient(135deg,#3C3B6E,#B22234)','linear-gradient(135deg,#c0392b,#2980b9)'], icon: '🗽' },
  nhat:    { label: { vi: 'Nhật', en: 'Japan' },      tz: 'Asia/Tokyo',       city: 'Tokyo',          brand: 'SEIKO',    gradients: ['linear-gradient(135deg,#BC002D,#fff)','linear-gradient(135deg,#e74c3c,#fadbd8)','linear-gradient(135deg,#c0392b,#f9ebea)'],  icon: '🗼' },
  han:     { label: { vi: 'Hàn Quốc', en: 'Korea' }, tz: 'Asia/Seoul',       city: 'Seoul',          brand: 'CARTIER',  gradients: ['linear-gradient(135deg,#003478,#CD2E3A)','linear-gradient(135deg,#1a5276,#e74c3c)','linear-gradient(135deg,#154360,#c0392b)'], icon: '🏯' },
  kvac:    { label: { vi: 'KVAC', en: 'KVAC' },       tz: 'Asia/Seoul',       city: 'Seoul',          brand: 'HAMILTON', gradients: ['linear-gradient(135deg,#0047AB,#CD2E3A)','linear-gradient(135deg,#1a5276,#e74c3c)','linear-gradient(135deg,#1f618d,#cb4335)'], icon: '🎭' },
  uc:      { label: { vi: 'Úc', en: 'Australia' },    tz: 'Australia/Sydney', city: 'Sydney',         brand: 'OMEGA',    gradients: ['linear-gradient(135deg,#00008B,#FF0000)','linear-gradient(135deg,#1a237e,#b71c1c)','linear-gradient(135deg,#283593,#c62828)'],  icon: '🦘' },
  canada:  { label: { vi: 'Canada', en: 'Canada' },   tz: 'America/Toronto',  city: 'Ottawa',         brand: 'TISSOT',   gradients: ['linear-gradient(135deg,#FF0000,#fff)','linear-gradient(135deg,#e53935,#ffcdd2)','linear-gradient(135deg,#c62828,#ef9a9a)'],   icon: '🍁' },
  daiLoan: { label: { vi: 'Đài Loan', en: 'Taiwan' }, tz: 'Asia/Taipei',      city: 'Taipei',         brand: 'LONGINES', gradients: ['linear-gradient(135deg,#003F87,#FE0000)','linear-gradient(135deg,#1565c0,#f44336)','linear-gradient(135deg,#0d47a1,#e53935)'], icon: '🏔' },
};

function getReadSet() { try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); } }
function getSeenSet() { try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); } catch { return new Set(); } }
function saveReadSet(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify([...s])); }
function saveSeenSet(s) { localStorage.setItem(SEEN_KEY, JSON.stringify([...s])); }

function isToday(iso) {
  if (!iso) return false;
  try {
    var d = new Date(iso); var n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  } catch (e) { return false; }
}

function AnalogClock(props) {
  var tz = props.tz; var label = props.label; var brand = props.brand; var flag = props.flag;
  var [angles, setAngles] = useState({ h: 0, m: 0, s: 0 });
  useEffect(function() {
    function tick() {
      var now = new Date();
      var str = now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      var parts = str.split(':');
      var h = parseInt(parts[0]) % 12;
      var m = parseInt(parts[1]);
      var s = parseInt(parts[2]);
      setAngles({ h: h * 30 + m * 0.5, m: m * 6, s: s * 6 });
    }
    tick();
    var id = setInterval(tick, 1000);
    return function() { clearInterval(id); };
  }, [tz]);

  var sz = 68; var cx = sz / 2; var cy = sz / 2; var r = sz / 2 - 3;
  function handCoords(angle, len) {
    var rad = (angle - 90) * Math.PI / 180;
    return { x2: cx + len * Math.cos(rad), y2: cy + len * Math.sin(rad) };
  }
  var ticks = [];
  for (var i = 0; i < 60; i++) {
    var ang = (i * 6 - 90) * Math.PI / 180;
    var isH = i % 5 === 0;
    var r1 = r - (isH ? 9 : 4);
    ticks.push({ x1: cx + r1 * Math.cos(ang), y1: cy + r1 * Math.sin(ang), x2: cx + r * Math.cos(ang), y2: cy + r * Math.sin(ang), isH: isH });
  }
  var hc = handCoords(angles.h, r * 0.48); var mc = handCoords(angles.m, r * 0.68); var sc = handCoords(angles.s, r * 0.82);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 10px', borderRight: '1px solid #fff0ea', minWidth: 82, flexShrink: 0 }}>
      <div style={{ fontSize: 8, fontWeight: 900, color: '#ff6b35', letterSpacing: 1.5, marginBottom: 4, fontFamily: 'Georgia,serif' }}>{brand}</div>
      <svg width={sz} height={sz}>
        <circle cx={cx} cy={cy} r={r} fill="#fffaf8" stroke="#ffd5c0" strokeWidth="1.5"/>
        <circle cx={cx} cy={cy} r={r - 4} fill="#fffaf8" stroke="#fff0ea" strokeWidth="0.5"/>
        {ticks.map(function(t, i) {
          return <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.isH ? '#ff6b35' : '#ffcfbb'} strokeWidth={t.isH ? 2 : 0.8} strokeLinecap="round"/>;
        })}
        <line x1={cx} y1={cy} x2={hc.x2} y2={hc.y2} stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1={cx} y1={cy} x2={mc.x2} y2={mc.y2} stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1={cx} y1={cy} x2={sc.x2} y2={sc.y2} stroke="#ff6b35" strokeWidth="1" strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r="3" fill="#ff6b35"/>
        <circle cx={cx} cy={cy} r="1.5" fill="white"/>
      </svg>
      <div style={{ fontSize: 10, color: '#ff6b35', fontWeight: 800, marginTop: 3, textAlign: 'center' }}>{flag} {label}</div>
    </div>
  );
}

function GradientCard(props) {
  var gradients = props.gradients; var icon = props.icon;
  var [idx, setIdx] = useState(0);
  var [fade, setFade] = useState(true);
  useEffect(function() {
    if (!gradients || gradients.length <= 1) return;
    var id = setInterval(function() {
      setFade(false);
      setTimeout(function() { setIdx(function(i) { return (i + 1) % gradients.length; }); setFade(true); }, 300);
    }, 3000);
    return function() { clearInterval(id); };
  }, [gradients]);
  return (
    <div style={{ position: 'relative', width: '100%', height: 130, borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: gradients[idx], opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
        {icon}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.25) 100%)' }}></div>
      <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
        {gradients.map(function(_, i) {
          return <div key={i} style={{ width: i === idx ? 20 : 6, height: 5, borderRadius: 3, background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s' }}></div>;
        })}
      </div>
    </div>
  );
}

export default function Home() {
  var [data, setData] = useState(null);
  var [loading, setLoading] = useState(true);
  var [activeTab, setActiveTab] = useState('home');
  var [fetching, setFetching] = useState(false);
  var [message, setMessage] = useState('');
  var [readSet, setReadSet] = useState(new Set());
  var [seenSet, setSeenSet] = useState(new Set());
  var [newCount, setNewCount] = useState(0);
  var [lang, setLang] = useState('vi');
  var [search, setSearch] = useState('');
  var [showTop, setShowTop] = useState(false);
  var [nameIn, setNameIn] = useState(false);

  useEffect(function() {
    setReadSet(getReadSet()); setSeenSet(getSeenSet());
    var sl = localStorage.getItem('lang'); if (sl) setLang(sl);
    loadNews();
    function onScroll() { setShowTop(window.scrollY > 300); }
    window.addEventListener('scroll', onScroll);
    setTimeout(function() { setNameIn(true); }, 200);
    return function() { window.removeEventListener('scroll', onScroll); };
  }, []);

  function switchLang(l) { setLang(l); localStorage.setItem('lang', l); }

  async function loadNews() {
    setLoading(true);
    try {
      var res = await fetch('/api/get-news');
      var json = await res.json();
      if (json && json.sources && json.sources.length > 0) {
        setData(json);
        var seen = getSeenSet(); var count = 0;
        json.sources.forEach(function(s) { s.articles.forEach(function(a) { if (!seen.has(a.url)) count++; }); });
        setNewCount(count);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function triggerFetch() {
    setFetching(true); setMessage('⏳ ' + (lang === 'vi' ? 'Đang cập nhật...' : 'Updating...'));
    try {
      var res = await fetch('/api/fetch-news', { method: 'POST', headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' } });
      var json = await res.json();
      if (json.success) { setMessage('✅ ' + json.total + (lang === 'vi' ? ' bài mới!' : ' articles!')); await loadNews(); }
      else { setMessage('❌ ' + json.error); }
    } catch (e) { setMessage('❌ Lỗi kết nối'); }
    setFetching(false); setTimeout(function() { setMessage(''); }, 4000);
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
  var todayCount = data && data.sources ? data.sources.reduce(function(s, x) { return s + x.articles.filter(function(a) { return isToday(a.date); }).length; }, 0) : 0;

  var displaySources = [];
  if (data && data.sources) {
    if (activeTab === 'home') {
      displaySources = data.sources.map(function(s) {
        return Object.assign({}, s, { articles: s.articles.filter(function(a) { return isToday(a.date); }) });
      }).filter(function(s) { return s.articles.length > 0; });
    } else {
      displaySources = data.sources.filter(function(s) { return s.country === activeTab; }).map(function(s) {
        var sorted = s.articles.slice().sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        return Object.assign({}, s, { articles: sorted });
      });
    }
    if (search.trim()) {
      displaySources = displaySources.map(function(s) {
        return Object.assign({}, s, { articles: s.articles.filter(function(a) { return a.title && a.title.toLowerCase().indexOf(search.toLowerCase()) >= 0; }) });
      }).filter(function(s) { return s.articles.length > 0; });
    }
  }

  function fmtDate(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch (e) { return ''; }
  }
  function getLabel(key) { var c = COUNTRY_CONFIG[key]; return c ? (c.label[lang] || c.label.vi) : key; }

  return (
    <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", background: '#fff8f5', minHeight: '100vh' }}>
      <Head>
        <title>Kênh Cập Nhật Tin Tức Visa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0} html{scroll-behavior:smooth} body{background:#fff8f5;overflow-x:hidden}
        a{text-decoration:none;color:inherit} button{cursor:pointer;font-family:'Nunito',sans-serif;border:none;outline:none} input{font-family:'Nunito',sans-serif}

        .nav{background:#fff;box-shadow:0 2px 16px rgba(255,107,53,0.1);position:sticky;top:0;z-index:200;border-bottom:2px solid #fff0ea}
        .nav-in{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 14px;height:56px;gap:8px}
        .logo{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .logo-ico{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#ff6b35,#f7941d);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 10px rgba(255,107,53,0.3)}
        .logo-txt{font-size:14px;font-weight:900;color:#1a1a2e;line-height:1.1} .logo-txt span{color:#ff6b35}
        .logo-sub{font-size:9px;color:#ffb380;font-weight:700}
        .nav-mid{flex:1;max-width:320px;margin:0 8px}
        .sw{background:#fff0ea;border-radius:20px;display:flex;align-items:center;padding:7px 13px;gap:6px;border:1.5px solid #ffd5c0;transition:border-color 0.2s}
        .sw:focus-within{border-color:#ff6b35;background:#fff}
        .sw input{border:none;outline:none;background:transparent;font-size:12px;color:#333;flex:1;min-width:0}
        .nav-r{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .lsw{display:flex;background:#fff0ea;border-radius:16px;padding:2px;border:1px solid #ffd5c0}
        .lb{padding:4px 9px;border-radius:12px;font-size:11px;font-weight:800;background:transparent;color:#ff9970;transition:all 0.2s}
        .lb.on{background:#ff6b35;color:#fff;box-shadow:0 2px 6px rgba(255,107,53,0.3)}
        .bell{position:relative;width:34px;height:34px;border-radius:50%;border:1.5px solid #ffd5c0;background:#fff0ea;display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;transition:all 0.2s}
        .bell:hover{border-color:#ff6b35}
        .bdot{position:absolute;top:1px;right:1px;width:9px;height:9px;background:#ff3b30;border-radius:50%;border:2px solid #fff;animation:pd 2s infinite}
        @keyframes pd{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
        .upd{display:flex;align-items:center;gap:5px;padding:7px 13px;border-radius:18px;background:#1a1a2e;color:#fff;font-size:12px;font-weight:800;box-shadow:0 3px 10px rgba(26,26,46,0.2);transition:all 0.2s}
        .upd:hover:not(:disabled){background:#2d2d5e} .upd:disabled{opacity:0.6;cursor:not-allowed}
        .spin{animation:sp 1s linear infinite;display:inline-block}
        @keyframes sp{to{transform:rotate(360deg)}}

        .clocks-bar{background:#fff;border-bottom:2px solid #fff0ea;overflow-x:auto;-webkit-overflow-scrolling:touch}
        .clocks-bar::-webkit-scrollbar{height:3px} .clocks-bar::-webkit-scrollbar-thumb{background:#ffd0bb;border-radius:3px}
        .clocks-in{display:flex;min-width:max-content;padding:8px 14px;max-width:1280px;margin:0 auto}

        .hero{background:linear-gradient(135deg,#ff6b35 0%,#f7941d 55%,#ffb347 100%);padding:38px 16px 92px;text-align:center;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;top:-80px;right:-80px;width:320px;height:320px;background:radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%);pointer-events:none}
        .hero::after{content:'';position:absolute;bottom:-50px;left:-50px;width:200px;height:200px;background:radial-gradient(circle,rgba(255,255,255,0.07) 0%,transparent 70%);pointer-events:none}

        .name-tag{font-size:clamp(11px,2.5vw,15px);font-weight:900;color:rgba(255,255,255,0.95);letter-spacing:4px;text-transform:uppercase;margin-bottom:10px;position:relative;z-index:1;display:inline-block;transition:transform 0.9s cubic-bezier(0.34,1.56,0.64,1),opacity 0.9s ease}
        .name-tag.in{transform:translateY(0);opacity:1} .name-tag.out{transform:translateY(-50px);opacity:0}

        .hero h1{font-size:clamp(20px,4.5vw,36px);font-weight:900;color:#fff;margin-bottom:8px;line-height:1.25;position:relative;z-index:1;text-shadow:0 2px 12px rgba(0,0,0,0.1)}
        .hero h1 em{font-style:normal;color:#fff3e0;border-bottom:2.5px solid rgba(255,255,255,0.5);padding-bottom:1px}
        .hero-sub{font-size:13px;color:rgba(255,255,255,0.85);margin-bottom:22px;position:relative;z-index:1;max-width:500px;margin-left:auto;margin-right:auto}
        .hstats{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;position:relative;z-index:1}
        .sc{background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:14px;padding:12px 18px;text-align:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
        .sn{font-size:26px;font-weight:900;color:#fff} .sl{font-size:9px;color:rgba(255,255,255,0.85);font-weight:800;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px}

        .fl{max-width:520px;margin:-24px auto 0;position:relative;z-index:10;padding:0 14px}
        .fl-in{background:#fff;border-radius:50px;display:flex;align-items:center;gap:10px;padding:12px 20px;box-shadow:0 8px 28px rgba(255,107,53,0.2);border:2px solid #fff0ea;transition:border-color 0.2s}
        .fl-in:focus-within{border-color:#ff6b35}
        .fl-in input{border:none;outline:none;flex:1;font-size:13px;color:#333;font-family:'Nunito',sans-serif;min-width:0}

        .main{max-width:1280px;margin:0 auto;padding:22px 14px 90px}
        .ibar{background:#fff;border-radius:14px;padding:11px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #fff0ea;flex-wrap:wrap;gap:8px;box-shadow:0 2px 8px rgba(255,107,53,0.06)}
        .itxt{font-size:12px;color:#bbb;font-weight:600} .itxt b{color:#ff6b35}
        .mbtn{background:none;border:1.5px solid #ff6b35;color:#ff6b35;padding:5px 13px;border-radius:14px;font-size:11px;font-weight:800;transition:all 0.2s} .mbtn:hover{background:#ff6b35;color:#fff}

        .chips{display:flex;gap:7px;flex-wrap:nowrap;overflow-x:auto;margin-bottom:20px;-webkit-overflow-scrolling:touch;padding-bottom:4px}
        .chips::-webkit-scrollbar{height:3px} .chips::-webkit-scrollbar-thumb{background:#ffd0bb;border-radius:3px}
        .chip{display:flex;align-items:center;gap:5px;padding:8px 14px;border-radius:22px;border:1.5px solid #ffd5c0;background:#fff;color:#ff9970;font-size:12px;font-weight:800;white-space:nowrap;flex-shrink:0;transition:all 0.2s;box-shadow:0 1px 4px rgba(255,107,53,0.06)}
        .chip:hover{border-color:#ff6b35;color:#ff6b35;background:#fff5f0}
        .chip.on{background:linear-gradient(135deg,#ff6b35,#f7941d);border-color:transparent;color:#fff;box-shadow:0 4px 14px rgba(255,107,53,0.3)}
        .ccnt{font-size:10px;background:rgba(0,0,0,0.1);padding:2px 7px;border-radius:9px} .chip.on .ccnt{background:rgba(255,255,255,0.25)}

        .notice{background:linear-gradient(135deg,#fff5f0,#fff0ea);border:1.5px solid #ffd5c0;border-radius:14px;padding:13px 16px;margin-bottom:18px;display:flex;align-items:center;gap:10px}
        .notice-txt{font-size:12px;color:#ff9970;font-weight:700;line-height:1.5} .notice-txt b{color:#ff6b35}

        .src{margin-bottom:30px}
        .src-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px}
        .src-l{display:flex;align-items:center;gap:10px}
        .src-bar{width:4px;height:28px;border-radius:4px;flex-shrink:0}
        .src-nm{font-size:15px;font-weight:900;color:#1a1a2e} .src-sb{font-size:11px;color:#bbb;font-weight:600;margin-top:2px}
        .src-bdg{background:#fff0ea;border:1px solid #ffd5c0;padding:4px 11px;border-radius:10px;font-size:11px;font-weight:800;color:#ff9970}

        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
        @media(max-width:600px){.grid{grid-template-columns:1fr}}

        .card{background:#fff;border-radius:18px;border:1.5px solid #ffeee6;overflow:hidden;text-decoration:none;display:block;transition:transform 0.22s ease,box-shadow 0.22s ease,border-color 0.22s ease;box-shadow:0 2px 10px rgba(255,107,53,0.06);position:relative}
        .card:hover{transform:translateY(-4px);box-shadow:0 14px 36px rgba(255,107,53,0.14);border-color:#ffb380}
        .card.rd{opacity:0.5} .card.rd:hover{opacity:0.85}
        .ndot{position:absolute;top:138px;right:12px;z-index:5;width:10px;height:10px;background:#ff3b30;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(255,59,48,0.6);animation:pd 2s infinite}
        .cbody{padding:12px 14px 8px}
        .cbar{height:3px;width:100%;border-radius:3px;margin-bottom:9px}
        .nbadge{display:inline-block;background:linear-gradient(135deg,#ff6b35,#f7941d);color:#fff;font-size:9px;font-weight:900;padding:3px 8px;border-radius:6px;margin-bottom:6px;letter-spacing:0.5px}
        .ctitle{font-size:13px;font-weight:700;color:#1a1a2e;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        .card.rd .ctitle{color:#ccc}
        .cfoot{padding:8px 14px 12px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #fff5f0}
        .cdate{font-size:11px;color:#ddd;font-weight:700} .rtag{font-size:10px;font-weight:800;color:#ff6b35;background:#fff5f0;padding:3px 8px;border-radius:6px}

        .empty{text-align:center;padding:60px 20px;color:#ffb380}
        .empty-ico{font-size:48px;margin-bottom:12px;opacity:0.45}
        .empty h2{font-size:16px;color:#ff9970;margin-bottom:8px;font-weight:900} .empty p{font-size:13px}

        .ldg{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;gap:16px}
        .loader{width:40px;height:40px;border:3px solid #ffd5c0;border-top-color:#ff6b35;border-radius:50%;animation:sp 0.7s linear infinite}
        .ldg-txt{font-size:14px;font-weight:700;color:#ffb380}

        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:12px 24px;border-radius:26px;font-size:13px;font-weight:800;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,0.2);white-space:nowrap;animation:su 0.3s ease}
        @keyframes su{from{transform:translateX(-50%) translateY(14px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}

        .totop{position:fixed;bottom:24px;right:16px;width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#ff6b35,#f7941d);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;box-shadow:0 4px 18px rgba(255,107,53,0.4);cursor:pointer;z-index:100;transition:all 0.25s}
        .totop:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(255,107,53,0.5)}

        .footer{background:linear-gradient(135deg,#1a1a2e,#2d2d5e);color:rgba(255,255,255,0.45);text-align:center;padding:22px 16px;font-size:12px;font-weight:700}
        .footer span{color:#ff6b35}

        @media(max-width:640px){.nav-mid{display:none} .logo-sub{display:none} .main{padding:16px 12px 80px} .hero{padding:30px 12px 84px}}
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
            <div className="lsw">
              <button className={'lb' + (lang === 'vi' ? ' on' : '')} onClick={function() { switchLang('vi'); }}>VI</button>
              <button className={'lb' + (lang === 'en' ? ' on' : '')} onClick={function() { switchLang('en'); }}>EN</button>
            </div>
            <button className="bell" onClick={markAllSeen}>🔔{newCount > 0 && <span className="bdot"></span>}</button>
            <button className="upd" onClick={triggerFetch} disabled={fetching}>
              <span className={fetching ? 'spin' : ''}>↻</span>
              {fetching ? '...' : (lang === 'vi' ? 'Cập nhật' : 'Update')}
            </button>
          </div>
        </div>
      </nav>

      {/* ANALOG CLOCKS */}
      <div className="clocks-bar">
        <div className="clocks-in">
          {Object.entries(COUNTRY_CONFIG).filter(function(e) { return e[0] !== 'kvac'; }).map(function(entry) {
            var key = entry[0]; var cfg = entry[1];
            var src = data && data.sources ? data.sources.find(function(s) { return s.country === key; }) : null;
            return <AnalogClock key={key} tz={cfg.tz} label={cfg.city} brand={cfg.brand} flag={src ? src.flag : cfg.icon} />;
          })}
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        <div className={'name-tag' + (nameIn ? ' in' : ' out')}>✦ Lưu Chánh Hưng ✦</div>
        <h1>Kênh Cập Nhật <em>Tin Tức Visa</em></h1>
        <p className="hero-sub">{lang === 'vi' ? 'Cập nhật tin tức chính thống từ Lãnh sự quán các nước tại TP.HCM' : 'Official visa news from Consulates in Ho Chi Minh City'}</p>
        <div className="hstats">
          <div className="sc"><div className="sn">{todayCount}</div><div className="sl">{lang === 'vi' ? 'Tin hôm nay' : 'Today'}</div></div>
          <div className="sc"><div className="sn">{totalArticles}</div><div className="sl">{lang === 'vi' ? 'Tổng bài' : 'Total'}</div></div>
          <div className="sc"><div className="sn">{data && data.sources ? data.sources.length : 0}</div><div className="sl">{lang === 'vi' ? 'Nguồn' : 'Sources'}</div></div>
          <div className="sc"><div className="sn">{newCount}</div><div className="sl">{lang === 'vi' ? 'Chưa đọc' : 'Unread'}</div></div>
        </div>
      </div>

      {/* FLOATING SEARCH */}
      <div className="fl">
        <div className="fl-in">
          <span style={{ color: '#ff6b35', fontSize: 18 }}>🔍</span>
          <input placeholder={lang === 'vi' ? 'Tìm kiếm tin tức...' : 'Search news...'} value={search} onChange={function(e) { setSearch(e.target.value); }} />
          {search && <span style={{ cursor: 'pointer', color: '#ffb380', fontSize: 15 }} onClick={function() { setSearch(''); }}>✕</span>}
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {data && data.lastUpdated && (
          <div className="ibar" style={{ marginTop: 24 }}>
            <div className="itxt">{lang === 'vi' ? 'Cập nhật lần cuối' : 'Last updated'}: <b>{fmtDate(data.lastUpdated)}</b> · {totalArticles} {lang === 'vi' ? 'bài' : 'articles'}</div>
            {newCount > 0 && <button className="mbtn" onClick={markAllSeen}>✓ {lang === 'vi' ? 'Đánh dấu đã xem' : 'Mark all read'} ({newCount})</button>}
          </div>
        )}

        {data && data.sources && data.sources.length > 0 && (
          <div className="chips" style={{ marginTop: data && data.lastUpdated ? 0 : 24 }}>
            <button className={'chip' + (activeTab === 'home' ? ' on' : '')} onClick={function() { setActiveTab('home'); }}>
              🏠 {lang === 'vi' ? 'Hôm nay' : 'Today'} <span className="ccnt">{todayCount}</span>
            </button>
            {data.sources.map(function(s) {
              return (
                <button key={s.country} className={'chip' + (activeTab === s.country ? ' on' : '')} onClick={function() { setActiveTab(s.country); }}>
                  {s.flag} {getLabel(s.country)} <span className="ccnt">{s.articles.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="ldg"><div className="loader"></div><div className="ldg-txt">{lang === 'vi' ? 'Đang tải...' : 'Loading...'}</div></div>
        ) : (!data || !data.sources || data.sources.length === 0) ? (
          <div className="empty"><div className="empty-ico">📭</div><h2>{lang === 'vi' ? 'Chưa có dữ liệu' : 'No data yet'}</h2><p>{lang === 'vi' ? 'Click Cập nhật để fetch tin tức' : 'Click Update to fetch news'}</p></div>
        ) : (
          <div>
            {activeTab === 'home' && (
              <div className="notice">
                <span style={{ fontSize: 20 }}>📅</span>
                <div className="notice-txt">
                  {lang === 'vi'
                    ? <span>Trang chủ chỉ hiển thị <b>tin cập nhật hôm nay</b>. Nhấn vào tên quốc gia để xem toàn bộ tin theo thứ tự mới nhất.</span>
                    : <span>Homepage shows <b>today's news only</b>. Tap a country name to view all articles sorted by latest.</span>}
                </div>
              </div>
            )}
            {displaySources.length === 0 ? (
              <div className="empty">
                <div className="empty-ico">🌅</div>
                <h2>{lang === 'vi' ? 'Chưa có tin mới hôm nay' : 'No news today yet'}</h2>
                <p>{lang === 'vi' ? 'Nhấn Cập nhật để fetch tin mới nhất' : 'Click Update to fetch latest news'}</p>
              </div>
            ) : (
              displaySources.map(function(source) {
                var cfg = COUNTRY_CONFIG[source.country] || {};
                var grads = cfg.gradients || ['linear-gradient(135deg,#ff6b35,#f7941d)'];
                var icon = cfg.icon || '🌏';
                return (
                  <div key={source.country} className="src">
                    <div className="src-head">
                      <div className="src-l">
                        <div className="src-bar" style={{ background: source.color }}></div>
                        <div>
                          <div className="src-nm">{source.flag} {source.name}</div>
                          <div className="src-sb">{fmtDate(source.updatedAt)}</div>
                        </div>
                      </div>
                      <span className="src-bdg">{source.articles.length} {lang === 'vi' ? 'bài' : 'art.'}</span>
                    </div>
                    <div className="grid">
                      {source.articles.map(function(article, i) {
                        var isRead = readSet.has(article.url);
                        var isNew = !seenSet.has(article.url);
                        return (
                          <a key={i} href={article.url ? article.url : '#'} target="_blank" rel="noopener noreferrer"
                            className={'card' + (isRead ? ' rd' : '')}
                            onClick={function() { markRead(article.url); }}>
                            {isNew && !isRead && <span className="ndot"></span>}
                            <GradientCard gradients={grads} icon={icon} />
                            <div className="cbody">
                              <div className="cbar" style={{ background: source.color }}></div>
                              {isNew && !isRead && <span className="nbadge">{lang === 'vi' ? 'MỚI' : 'NEW'}</span>}
                              <div className="ctitle">{article.title}</div>
                            </div>
                            <div className="cfoot">
                              <span className="cdate">📅 {fmtDate(article.date)}</span>
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
          </div>
        )}
      </div>

      <div className="footer">
        <span>Kênh Cập Nhật Tin Tức Visa</span> · {lang === 'vi' ? 'Tự động lúc 7:00 SA mỗi ngày' : 'Auto-updates at 7:00 AM'} · © 2026
      </div>

      {message && <div className="toast">{message}</div>}
      {showTop && <button className="totop" onClick={function() { window.scrollTo({ top: 0, behavior: 'smooth' }); }}>↑</button>}
    </div>
  );
}
