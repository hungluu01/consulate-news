import axios from 'axios';
import xml2js from 'xml2js';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SOURCES = [
  {
    country: 'Mỹ',
    flag: '🇺🇸',
    name: 'Đại sứ quán Hoa Kỳ tại Việt Nam',
    color: '#B22234',
    feeds: [
      'https://news.google.com/rss/search?q=%22%C4%91%E1%BA%A1i+s%E1%BB%A9+qu%C3%A1n+m%E1%BB%B9%22+vi%E1%BB%87t+nam&hl=vi&gl=VN&ceid=VN:vi',
      'https://news.google.com/rss/search?q=us+embassy+vietnam+visa&hl=en&gl=VN&ceid=VN:en',
    ]
  },
  {
    country: 'Nhật',
    flag: '🇯🇵',
    name: 'Đại sứ quán Nhật Bản tại Việt Nam',
    color: '#BC002D',
    feeds: [
      'https://news.google.com/rss/search?q=%22%C4%91%E1%BA%A1i+s%E1%BB%A9+qu%C3%A1n+nh%E1%BA%ADt%22+vi%E1%BB%87t+nam&hl=vi&gl=VN&ceid=VN:vi',
      'https://news.google.com/rss/search?q=japan+embassy+vietnam&hl=en&gl=VN&ceid=VN:en',
    ]
  },
  {
    country: 'Hàn Quốc',
    flag: '🇰🇷',
    name: 'Đại sứ quán Hàn Quốc tại Việt Nam',
    color: '#003478',
    feeds: [
      'https://news.google.com/rss/search?q=%22%C4%91%E1%BA%A1i+s%E1%BB%A9+qu%C3%A1n+h%C3%A0n+qu%E1%BB%91c%22+vi%E1%BB%87t+nam&hl=vi&gl=VN&ceid=VN:vi',
      'https://news.google.com/rss/search?q=korea+embassy+vietnam&hl=en&gl=VN&ceid=VN:en',
    ]
  }
];

async function parseFeed(url) {
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      }
    });
    const parsed = await xml2js.parseStringPromise(res.data, { explicitArray: false });
    const items = parsed?.rss?.channel?.item || [];
    const list = Array.isArray(items) ? items : [items];
    return list.map(item => ({
      title: item.title || 'Không có tiêu đề',
      url: item.link || item.guid?._ || item.guid || '',
      date: item.pubDate || new Date().toISOString(),
      source: item.source?._ || item.source || '',
    })).filter(i => i.url && i.title);
  } catch (e) {
    console.error(`Feed error ${url}:`, e.message);
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
      const seen = new Set();
      articles = articles.filter(a => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      });
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));
      articles = articles.slice(0, 20);
      results.push({
        country: source.country,
        flag: source.flag,
        name: source.name,
        color: source.color,
        articles,
        updatedAt: new Date().toISOString()
      });
    }

    const data = { lastUpdated: new Date().toISOString(), sources: results };
    await redis.set('news-data', JSON.stringify(data));

    const total = results.reduce((sum, s) => sum + s.articles.length, 0);
    return res.status(200).json({ success: true, total });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
