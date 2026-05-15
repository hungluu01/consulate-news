import axios from 'axios';

export default async function handler(req, res) {
  try {
    const binId = process.env.JSONBIN_BIN_ID;
    const apiKey = process.env.JSONBIN_API_KEY;

    if (!binId) {
      return res.status(200).json({ 
        lastUpdated: null, 
        sources: [],
        message: 'Chưa có data, hãy chạy fetch lần đầu'
      });
    }

    const response = await axios.get(
      `https://api.jsonbin.io/v3/b/${binId}/latest`,
      { headers: { 'X-Master-Key': apiKey } }
    );

    return res.status(200).json(response.data.record);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
