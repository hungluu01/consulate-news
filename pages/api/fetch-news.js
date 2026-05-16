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
      'https://vn.usembassy.gov/feed/',
      'https://vn.usembassy.gov/category/press-releases/feed/',
      'https://vn.usembassy.gov/category/announcements/feed/',
    ],
    fallback: [
      'https://www.usembassy.gov/feed/',
    ]
  },
  {
    country: 'Nhật',
    flag: '🇯🇵',
    name: 'Đại sứ quán Nhật Bản tại Việt Nam',
    color: '#BC002D',
    feeds: [
      'https://www.vn.emb-japan.go.jp/itpr_vi/rss.xml',
      'https://www.mofa.go.jp/rss/rss_policy.xml',
    ],
    fallback: [
      'https://news.google.com/rss/search?q=site:vn.emb-japan.go.jp&hl=vi&gl=VN&ceid=VN:vi',
    ]
  },
  {
    country: 'Hàn Quốc',
    flag: '🇰🇷',
    name: 'Đại sứ quán & Lãnh sự quán Hàn Quốc',
    color: '#003478',
    feeds: [
      'https://overseas.mofa.go.kr/vn-vi/brd/m_2203/rss.do',
      'https://overseas.mofa.go.kr/vn-vi/brd/m_2205/rss.do',
      'https://overseas.mofa.go.kr/vn-vi/brd/m_2207/rss.do',
    ],
    fallback: [
      'https://news.google.com/rss/search?q=site:overseas.mofa.go.kr+vietnam&hl=vi&gl=VN&ceid=VN:vi',
    ]
  },
  {
    country: 'Hàn Quốc (KVAC)',
    flag: '🇰🇷',
    name: 'Trung tâm Văn hóa Hàn Quốc (KVAC)',
    color: '#0047AB',
    feeds: [
      'https://www.kvachanoi.or.kr/rss/rss.do',
      'https://www.kvachcm.or.kr/rss/rss.do',
    ],
    fallback: [
      'https://news.google.com/rss/search?q=kvac+hanoi+OR+%22trung+tam+van+hoa+han+quoc%22&hl=vi&gl=VN&ceid=VN:vi',
    ]
  }
];

async function parseFeed(url) {
  try {
    const res = await axios.get(url, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0; +https://consulate-news.vercel.app)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      }
    });
    const parsed = await xml2js.parseStringPromise(res.data, { explicitArray: false });
    const channel = parsed?.rss?.channel;
    if (!channel) return [];
    const items = channel.item || [];
    const list = Array.isArray(items) ? items : [items];
    return list.map(item => ({
      title: item.title?._ || item.title || '',
      url: item.link || item.guid?._ || item.guid || '',
      date: item.pubDate || item.date || new Date().toISOString(),
      description: item.description?._ || item.description || '',
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

      // Thử feeds chính trước
      for (const feedUrl of source.feeds) {
        const items = await parseFeed(feedUrl);
        articles = [...articles, ...items];
      }

      // Nếu không có gì, dùng fallback
      if (articles.length === 0 && source.fallback) {
        for (const feedUrl of source.fallback) {
          const items = await parseFeed(feedUrl);
          articles = [...articles, ...items];
        }
      }

      // Dedupe + sort
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
    return res.status(500).json({ error: e.message });
  }
}
