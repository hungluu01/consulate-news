import axios from 'axios';
import xml2js from 'xml2js';

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;

const SOURCES = [
  {
    country: 'Mỹ',
    flag: '🇺🇸',
    name: 'Đại sứ quán Hoa Kỳ tại Việt Nam',
    sitemap: 'https://vn.usembassy.gov/sitemap.xml',
    baseUrl: 'https://vn.usembassy.gov',
    color: '#B22234'
  },
  {
    country: 'Nhật',
    flag: '🇯🇵',
    name: 'Đại sứ quán Nhật Bản tại Việt Nam',
    sitemap: 'https://www.vn.emb-japan.go.jp/itpr_vi/sitemap.xml',
    baseUrl: 'https://www.vn.emb-japan.go.jp',
    color: '#BC002D'
  },
  {
    country: 'Hàn Quốc',
    flag: '🇰🇷',
    name: 'Đại sứ quán Hàn Quốc tại Việt Nam',
    sitemap: 'https://overseas.mofa.go.kr/sitemap.xml',
    baseUrl: 'https://overseas.mofa.go.kr',
    color: '#003478'
  }
];

async function parseSitemap(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
    });
    const parsed = await xml2js.parseStringPromise(res.data);
    
    let urls = [];
    if (parsed.urlset?.url) {
      urls = parsed.urlset.url.map(u => ({
        url: u.loc?.[0] || '',
        lastmod: u.lastmod?.[0] || new Date().toISOString()
      }));
    } else if (parsed.sitemapindex?.sitemap) {
      // Sitemap index — lấy sitemap con đầu tiên
      const childUrl = parsed.sitemapindex.sitemap[0]?.loc?.[0];
      if (childUrl) return parseSitemap(childUrl);
    }
    
    // Lọc 20 bài mới nhất
    return urls
      .sort((a, b) => new Date(b.lastmod) - new Date(a.lastmod))
      .slice(0, 20);
  } catch (e) {
    console.error(`Sitemap error ${url}:`, e.message);
    return [];
  }
}

async function saveToJsonBin(data) {
  if (!JSONBIN_BIN_ID) {
    // Tạo bin mới lần đầu
    const res = await axios.post(
      'https://api.jsonbin.io/v3/b',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
          'X-Bin-Name': 'consulate-news'
        }
      }
    );
    return res.data.metadata.id;
  } else {
    await axios.put(
      `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY
        }
      }
    );
    return JSONBIN_BIN_ID;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Bảo vệ API
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const results = [];

    for (const source of SOURCES) {
      const urls = await parseSitemap(source.sitemap);
      results.push({
        country: source.country,
        flag: source.flag,
        name: source.name,
        color: source.color,
        baseUrl: source.baseUrl,
        articles: urls,
        updatedAt: new Date().toISOString()
      });
    }

    const binId = await saveToJsonBin({
      lastUpdated: new Date().toISOString(),
      sources: results
    });

    return res.status(200).json({ 
      success: true, 
      binId,
      total: results.reduce((sum, s) => sum + s.articles.length, 0)
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
