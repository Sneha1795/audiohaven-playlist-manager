import { loginWithSpotify, searchSongs, getAccessToken } from './api.js';  // 🔹 added getAccessToken

// -------------------- Playlist --------------------
class Node {
    constructor(song) {
        this.song = song;
        this.next = null;
    }
}

class CircularLinkedList {
    constructor() { this.head = null; }
    add(song) {
        const newNode = new Node(song);
        if (!this.head) { this.head = newNode; newNode.next = this.head; }
        else { 
            let temp = this.head; 
            while (temp.next !== this.head) temp = temp.next; 
            temp.next = newNode; 
            newNode.next = this.head; 
        }
    }
    remove(songName) {
        if (!this.head) return;
        let curr = this.head, prev = null;
        do {
            if (curr.song.name === songName) {
                if (curr === this.head) {
                    if (curr.next === this.head) this.head = null;
                    else {
                        let temp = this.head;
                        while (temp.next !== this.head) temp = temp.next;
                        temp.next = this.head.next;
                        this.head = this.head.next;
                    }
                } else prev.next = curr.next;
                return;
            }
            prev = curr;
            curr = curr.next;
        } while (curr !== this.head);
    }
    getSongs() {
        const songs = [];
        if (!this.head) return songs;
        let temp = this.head;
        do {
            songs.push(temp.song);
            temp = temp.next;
        } while (temp !== this.head);
        return songs;
    }
    toJSON() { return this.getSongs(); }
    loadFromJSON(jsonArray) { jsonArray.forEach(song => this.add(song)); }
}

const playlist = new CircularLinkedList();
let currentIndex = null;   // 🔹 track index in playlist
const audio = document.getElementById("audioPlayer"); // 🔹 use audio element in HTML

// Load from localStorage
const stored = localStorage.getItem('audiohaven-playlist');
if (stored) playlist.loadFromJSON(JSON.parse(stored));

// -------------------- Render Playlist --------------------
function renderPlaylist() {
    const ul = document.getElementById('playlist'); 
    ul.innerHTML = '';
    playlist.getSongs().forEach(song => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${song.name} - ${song.artist || 'Unknown Artist'}
            <div class="actions">
                <button class="playBtn">▶</button>
                <button class="deleteBtn">❌</button>
            </div>`;
        ul.appendChild(li);

        // 🔹 play button always works (alert if no preview)
        li.querySelector('.playBtn').addEventListener('click', () => playSong(song));
        li.querySelector('.deleteBtn').addEventListener('click', () => { playlist.remove(song.name); renderPlaylist(); });
    });
    localStorage.setItem('audiohaven-playlist', JSON.stringify(playlist.toJSON()));
}

// -------------------- Play / Pause --------------------
function playSong(song) {
    updateNowPlaying(song);
    if (song.preview_url) {
        audio.src = song.preview_url;
        audio.play();
    } else {
        audio.pause();
        audio.src = "";
        alert(`⚠ No preview available for "${song.name}", but it's still in your playlist.`);
    }
    currentIndex = playlist.getSongs().findIndex(s => s.name === song.name);
}

function updateNowPlaying(song) {
    document.getElementById('trackTitleHome').innerText = song.name;
    document.getElementById('trackArtistHome').innerText = song.artist || 'Unknown Artist';
    document.getElementById('coverArtHome').src = song.cover || "https://via.placeholder.com/100";
}

// -------------------- Next / Prev --------------------
function nextSong() {
    const songs = playlist.getSongs();
    if (!songs.length) return;
    currentIndex = currentIndex === null ? 0 : (currentIndex + 1) % songs.length;
    playSong(songs[currentIndex]);
}

function prevSong() {
    const songs = playlist.getSongs();
    if (!songs.length) return;
    currentIndex = currentIndex === null ? 0 : (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[currentIndex]);
}

// -------------------- 🔹 Import Top Tracks After Login --------------------
async function importTopTracks() {
    try {
        const token = getAccessToken();
        const res = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (!data.items) return alert("No top tracks found!");

        data.items.forEach(track => {
            playlist.add({
                name: track.name,
                artist: track.artists.map(a => a.name).join(', '),
                preview_url: track.preview_url,
                cover: track.album.images[0]?.url
            });
        });

        renderPlaylist();
    } catch (err) {
        console.error("Error fetching top tracks:", err);
    }
}

// -------------------- Login --------------------
document.getElementById('loginBtn').addEventListener('click', async () => {
    await loginWithSpotify();
    await importTopTracks();  // 🔹 auto-load Spotify top tracks
});

// -------------------- Add Song using Spotify API --------------------
document.getElementById('addSongBtn').addEventListener('click', async () => {
    const input = document.getElementById('songInput').value.trim();
    if (!input) return alert('Enter a song name!');
    try {
        const tracks = await searchSongs(input);
        if (!tracks.length) return alert('No songs found!');
        const track = tracks[0]; // pick first track
        playlist.add({
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            preview_url: track.preview_url || null,
            cover: track.album.images[0]?.url || null
        });
        renderPlaylist();
        document.getElementById('songInput').value = '';
    } catch (err) {
        console.error(err);
        alert('Error searching Spotify');
    }
});

// -------------------- Tabs --------------------
document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-content').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
        document.getElementById(tab.dataset.tab).style.display = 'block';
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// -------------------- Playlist Search --------------------
document.getElementById('searchPlaylist').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    document.querySelectorAll('#playlist li').forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(query) ? 'flex' : 'none';
    });
});

// -------------------- Chatbot --------------------
function addMessageToChat(role, text) {
    const chat = document.getElementById('chatlog');
    const div = document.createElement('div');
    div.className = role === 'user' ? 'user-msg' : 'bot-msg';
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

document.getElementById('chatSendBtn').addEventListener('click', () => {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    addMessageToChat('user', msg);
    input.value = '';
    addMessageToChat('bot', '🤖 I am still learning to respond to moods!');
});

document.getElementById('chatbot-widget').addEventListener('click', () => {
    document.getElementById('chatbot-widget').classList.add('active');
});
document.getElementById('close-chat').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('chatbot-widget').classList.remove('active');
});

// -------------------- Now Playing Controls --------------------
document.getElementById('nextSongBtn').addEventListener('click', nextSong);
document.getElementById('prevSongBtn').addEventListener('click', prevSong);
document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (audio.paused) audio.play(); else audio.pause();
});

// -------------------- Initial Render --------------------
window.onload = () => { renderPlaylist(); };

