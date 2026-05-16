import axios from 'axios';
import xml2js from 'xml2js';

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;

const SOURCES = [
  {
    country: 'Mỹ',
    flag: '🇺🇸',
    name: 'Đại sứ quán Hoa Kỳ tại Việt Nam',
    feeds: [
      'https://vn.usembassy.gov/feed/',
      'https://vn.usembassy.gov/category/news/feed/',
    ],
    baseUrl: 'https://vn.usembassy.gov',
    color: '#B22234'
  },
  {
    country: 'Nhật',
    flag: '🇯🇵',
    name: 'Đại sứ quán Nhật Bản tại Việt Nam',
    feeds: [
      'https://www.vn.emb-japan.go.jp/itpr_vi/rss.xml',
      'https://www.mofa.go.jp/rss/rss_en.xml',
    ],
    baseUrl: 'https://www.vn.emb-japan.go.jp',
    color: '#BC002D'
  },
  {
    country: 'Hàn Quốc',
    flag: '🇰🇷',
    name: 'Đại sứ quán Hàn Quốc tại Việt Nam',
    feeds: [
      'https://overseas.mofa.go.kr/vn-vi/brd/m_2203/rss.do',
      'https://overseas.mofa.go.kr/vn-vi/brd/m_2205/rss.do',
    ],
    baseUrl: 'https://overseas.mofa.go.kr',
    color: '#003478'
  }
];

async function parseFeed(url) {
  try {
    const res = await axios.get(url, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });

    const parsed = await xml2js.parseStringPromise(res.data, { explicitArray: false });
    const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
    const list = Array.isArray(items) ? items : [items];

    return list.slice(0, 15).map(item => ({
      title: item.title?._ || item.title || 'Không có tiêu đề',
      url: item.link?.href || item.link || item.guid || '',
      date: item.pubDate || item.published || item.updated || new Date().toISOString(),
      description: item.description || item.summary || ''
    })).filter(i => i.url);
  } catch (e) {
    console.error(`Feed error ${url}:`, e.message);
    return [];
  }
}

async function saveToJsonBin(data) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Master-Key': JSONBIN_API_KEY
  };

  if (!JSONBIN_BIN_ID) {
    const res = await axios.post('https://api.jsonbin.io/v3/b', data, {
      headers: { ...headers, 'X-Bin-Name': 'consulate-news' }
    });
    return res.data.metadata.id;
  } else {
    await axios.put(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, data, { headers });
    return JSONBIN_BIN_ID;
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
        if (articles.length >= 15) break;
      }

      // Dedupe theo URL
      const seen = new Set();
      articles = articles.filter(a => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      }).slice(0, 20);

      results.push({
        country: source.country,
        flag: source.flag,
        name: source.name,
        color: source.color,
        baseUrl: source.baseUrl,
        articles,
        updatedAt: new Date().toISOString()
      });
    }

    const total = results.reduce((sum, s) => sum + s.articles.length, 0);
    const binId = await saveToJsonBin({ lastUpdated: new Date().toISOString(), sources: results });

    return res.status(200).json({ success: true, binId, total });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
