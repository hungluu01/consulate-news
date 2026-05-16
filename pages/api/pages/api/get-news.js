import axios from 'axios';

export default async function handler(req, res) {
  try {
    const binId = process.env.JSONBIN_BIN_ID;
    const apiKey = process.env.JSONBIN_API_KEY;

    console.log('BIN_ID:', binId ? 'có' : 'TRỐNG');
    console.log('API_KEY:', apiKey ? 'có' : 'TRỐNG');

    if (!binId || !apiKey) {
      return res.status(200).json({
        lastUpdated: null,
        sources: [],
        message: 'Thiếu config'
      });
    }

    const response = await axios.get(
      `https://api.jsonbin.io/v3/b/${binId}/latest`,
      {
        headers: {
          'X-Master-Key': apiKey,
          'X-Bin-Meta': 'false'
        }
      }
    );

    // JSONBin trả về { record: {...} } hoặc trực tiếp data
    const data = response.data?.record || response.data;
    return res.status(200).json(data);

  } catch (e) {
    console.error('get-news error:', e.response?.data || e.message);
    return res.status(500).json({ 
      error: e.message,
      detail: e.response?.data 
    });
  }
}
