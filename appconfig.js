export const REDIRECT_URI = window.location.hostname.includes('vercel.app')
  ? 'https://audiohaven-playlist-manager.vercel.app/'
  : 'http://127.0.0.1:5500/audiohaven-playlist-manager/index.html?user=s';
export const SCOPES = 'user-read-private user-read-email playlist-read-private playlist-modify-private';

