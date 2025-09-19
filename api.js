// api.js
import { CLIENT_ID} from './clientconfig.js';
import { REDIRECT_URI, SCOPES} from './appconfig.js';

// -------------------- PKCE Helpers --------------------
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// -------------------- Login Flow --------------------
export async function loginWithSpotify() {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
    });

    window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// -------------------- Exchange Code for Access Token --------------------
export async function getAccessToken(code) {
    const codeVerifier = localStorage.getItem('code_verifier');
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });

    const data = await response.json();
    if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
    } else {
        throw new Error('Failed to get access token');
    }
    return data.access_token;
}

// -------------------- Refresh Access Token --------------------
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });

    const data = await response.json();
    if (data.access_token) localStorage.setItem('access_token', data.access_token);
    return data.access_token;
}

// -------------------- Spotify API Request Helper --------------------
async function spotifyFetch(url, options = {}) {
    let accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('No access token available');

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
    };

    let response = await fetch(url, options);

    // If token expired, refresh and retry once
    if (response.status === 401) {
        try {
            accessToken = await refreshAccessToken();
            options.headers['Authorization'] = `Bearer ${accessToken}`;
            response = await fetch(url, options);
        } catch (err) {
            console.error('Error refreshing token:', err);
            throw err;
        }
    }

    if (!response.ok) throw new Error(`Spotify API error: ${response.status}`);
    return response.json();
}

// -------------------- Search Tracks --------------------
export async function searchSongs(query) {
    const data = await spotifyFetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`);
    return data.tracks?.items || [];
}

