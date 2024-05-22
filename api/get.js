const fetch = require('node-fetch');
const GuideBuilder = require('./GuideBuilder.js');

const CHANNEL_REPOSITORY_URL = 'https://polychroma.tv/wp-json/tv/channels/';

async function fetchChannelPlaylists() {
  const response = await fetch(CHANNEL_REPOSITORY_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch channels: ${response.statusText}`);
  }
  const data = await response.json();
  const channelUrls = data.defaultPlaylists;

  const playlists = await Promise.all(channelUrls.map(async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch playlist: ${res.statusText}`);
    }
    return res.json();
  }));

  return playlists;
}

module.exports = async (req, res) => {
  try {
    const playlists = await fetchChannelPlaylists();
    const database = GuideBuilder.buildDatabase(playlists);
    const guide = GuideBuilder.getGuide(database);

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    res.json({
      body: guide
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}