import axios from 'axios';
import xml2js from 'xml2js';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SOURCES = [
  {
    country: 'my', flag: '🇺🇸', name: 'Lãnh sự quán Hoa Kỳ tại TP.HCM', color: '#B22234',
    feeds: [
      'https://vn.usembassy.gov/feed/',
      'https://vn.usembassy.gov/category/press-releases/feed/',
    ],
    fallback: ['https://news.google.com/rss/search?q=%22lanh+su+quan+my%22+tphcm+OR+%22us+consulate%22+ho+chi+minh&hl=vi&gl=VN&ceid=VN:vi']
  },
  {
    country: 'nhat', flag: '🇯🇵', name: 'Tổng lãnh sự quán Nhật Bản tại TP.HCM', color: '#BC002D',
    feeds: [
      'https://www.hcmcgj.vn.emb-japan.go.jp/itpr_vi/rss.xml',
      'https://www.vn.emb-japan.go.jp/itpr_vi/rss.xml',
    ],
    fallback: ['https://news.google.com/rss/search?q=%22lanh+su+quan+nhat%22+tphcm&hl=vi&gl=VN&ceid=VN:vi']
  },
  {
    country: 'han', flag: '🇰🇷', name: 'Tổng lãnh sự quán Hàn Quốc tại TP.HCM', color: '#003478',
    feeds: [
      'https://overseas.mofa.go.kr/vn-hcm-vi/brd/m_22628/rss.do',
      'https://overseas.mofa.go.kr/vn-vi/brd/m_2203/rss.do',
    ],
    fallback: ['https://news.google.com/rss/search?q=%22lanh+su+quan+han+quoc%22+tphcm&hl=vi&gl=VN&ceid=VN:vi']
  },
  {
    country: 'kvac', flag: '🇰🇷', name: 'Trung tâm Văn hóa Hàn Quốc (KVAC HCM)', color: '#0047AB',
    feeds: [
      'https://www.kvachcm.or.kr/rss/rss.do',
    ],
    fallback: ['https://news.google.com/rss/search?q=kvac+%22ho+chi+minh%22+OR+%22trung+tam+van+hoa+han+quoc%22+tphcm&hl=vi&gl=VN&ceid=VN:vi']
  },
  {
    country: 'uc', flag: '🇦🇺', name: 'Tổng lãnh sự quán Úc tại TP.HCM', color: '#00008B',
    feeds: [
      'https://vietnam.embassy.gov.au/hnoi/rss.xml',
      'https://www.dfat.gov.au/feeds/news.xml',
    ],
    fallback: ['https://news.google.com/rss/search?q=%22lanh+su+quan+uc%22+tphcm+OR+%22australia+consulate%22+ho+chi+minh&hl=vi&gl=VN&ceid=VN:vi']
  },
  {
    country: 'canada', flag: '🇨🇦', name: 'Tổng lãnh sự quán Canada tại TP.HCM', color: '#FF0000',
    feeds: [
      'https://www.canada.ca/en/news.atom',
    ],
    fallback: ['https://news.google.com/rss/search?q=%22lanh+su+quan+canada%22+tphcm+OR+%22canada+consulate%22+ho+chi+minh&hl=vi&gl=VN&ceid=VN:vi']
  },
  {
    country: 'daiLoan', flag: '🇹🇼', name: 'Văn phòng Kinh tế Văn hóa Đài Bắc tại TP.HCM', color: '#003F87',
    feeds: [
      'https://www.roc-taiwan.org/vn_hcmc/rss/rss.xml',
    ],
    fallback: ['https://news.google.com/rss/search?q=%22van+phong+kinh+te+dai+bac%22+tphcm+OR+%22taiwan%22+%22ho+chi+minh%22+visa&hl=vi&gl=VN&ceid=VN:vi']
  }
];

async function parseFeed(url) {
  try {
    const res = await axios.get(url, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
      }
    });
    const parsed = await xml2js.parseStringPromise(res.data, { explicitArray: false });
    const channel = parsed?.rss?.channel;
    const feed = parsed?.feed;
    let items = [];
    if (channel) {
      items = channel.item || [];
    } else if (feed) {
      items = feed.entry || [];
    }
    const list = Array.isArray(items) ? items : [items];
    return list.map(item => ({
      title: item.title?._ || item.title || '',
      url: item.link?.href || item.link || item.guid?._ || item.guid || '',
      date: item.pubDate || item.published || item.updated || new Date().toISOString(),
      description: item.description?._ || item.description || item.summary || '',
    })).filter(i => i.url && i.title);
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const results = [];
    for (const source of SOURCES) {
      let articles = [];
      for (const feedUrl of source.feeds) {
        const items = await parseFeed(feedUrl);
        articles = [...articles, ...items];
      }
      if (articles.length === 0 && source.fallback) {
        for (const feedUrl of source.fallback) {
          const items = await parseFeed(feedUrl);
          articles = [...articles, ...items];
        }
      }
      const seen = new Set();
      articles = articles.filter(a => { if (seen.has(a.url)) return false; seen.add(a.url); return true; });
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));
      articles = articles.slice(0, 20);
      results.push({ country: source.country, flag: source.flag, name: source.name, color: source.color, articles, updatedAt: new Date().toISOString() });
    }
    const data = { lastUpdated: new Date().toISOString(), sources: results };
    await redis.set('news-data', JSON.stringify(data));
    const total = results.reduce((sum, s) => sum + s.articles.length, 0);
    return res.status(200).json({ success: true, total });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
