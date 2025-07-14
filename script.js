class Node {
  constructor(song) {
    this.song = song;
    this.next = null;
  }
}

class CircularLinkedList {
  constructor() {
    this.head = null;
  }

  add(song) {
    const newNode = new Node(song);
    if (!this.head) {
      this.head = newNode;
      newNode.next = this.head;
    } else {
      let temp = this.head;
      while (temp.next !== this.head) {
        temp = temp.next;
      }
      temp.next = newNode;
      newNode.next = this.head;
    }
  }

  remove(songName) {
    if (!this.head) return;

    let curr = this.head;
    let prev = null;

    do {
      if (curr.song.name === songName) {
        if (curr === this.head) {
          if (curr.next === this.head) {
            this.head = null;
          } else {
            let temp = this.head;
            while (temp.next !== this.head) {
              temp = temp.next;
            }
            temp.next = this.head.next;
            this.head = this.head.next;
          }
        } else {
          prev.next = curr.next;
        }
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

  toJSON() {
    return this.getSongs();
  }

  loadFromJSON(jsonArray) {
    jsonArray.forEach(song => this.add(song));
  }
}

const playlist = new CircularLinkedList();
let currentSongNode = null;

const stored = localStorage.getItem('audiohaven-playlist');
if (stored) {
  playlist.loadFromJSON(JSON.parse(stored));
}

function renderPlaylist() {
  const ul = document.getElementById('playlist');
  ul.innerHTML = '';
  const songs = playlist.getSongs();

  songs.forEach(song => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${song.name}
      <div class="actions">
        <button onclick="playSong('${song.link}')" title="Play ▶️">▶️</button>
        <button onclick="deleteSong('${song.name}')" title="Remove ❌">❌</button>
      </div>`;
    ul.appendChild(li);
  });

  localStorage.setItem('audiohaven-playlist', JSON.stringify(playlist.toJSON()));
}

function addSong() {
  const input = document.getElementById('songInput');
  const songName = input.value.trim();
  if (songName) {
    const fakeLink = `https://youtube.com/results?search_query=${encodeURIComponent(songName)}`;
    playlist.add({ name: songName, link: fakeLink });
    renderPlaylist();
    input.value = '';
  }
}

function deleteSong(name) {
  playlist.remove(name);
  renderPlaylist();
}

function playSong(link) {
  window.open(link, '_blank');
}

function nextSong() {
  if (!playlist.head) return;
  if (!currentSongNode) {
    currentSongNode = playlist.head;
  } else {
    currentSongNode = currentSongNode.next;
  }
  document.getElementById('nowPlaying').innerText = `Now Playing: ${currentSongNode.song.name}`;
}

function addMessageToChat(role, text) {
  const chat = document.getElementById('chatlog');
  const div = document.createElement('div');
  div.className = role === 'user' ? 'user-msg' : 'bot-msg';
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function handleChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  addMessageToChat('user', msg);
  input.value = '';

  const lower = msg.toLowerCase();

  const responses = {
    'happy+pop': '🎉 Playlist: Happy Pop\n1. Firework - Katy Perry\n2. Uptown Funk - Bruno Mars',
    'sad+indie': '🌧 Playlist: Indie Sad\n1. Skinny Love - Bon Iver\n2. I See Fire - Ed Sheeran',
    'focus+lofi': '📚 Playlist: Study Lofi\n1. Lofi Rain - ChillHop\n2. Homework Beats - Lofi Cafe',
    'relaxed+jazz': '🍷 Playlist: Chill Jazz\n1. Autumn Leaves - Chet Baker\n2. So What - Miles Davis'
  };

  let found = false;
  for (const key in responses) {
    const [mood, genre] = key.split('+');
    if (lower.includes(mood) && lower.includes(genre)) {
      addMessageToChat('bot', responses[key]);
      found = true;
      break;
    }
  }

  if (!found) {
    addMessageToChat('bot', '🤖 Try: "I feel happy and like pop", or "I want to focus and listen to lofi".');
  }
}

function toggleChatbot() {
  const widget = document.getElementById('chatbot-widget');
  widget.classList.toggle('active');
}

window.onload = () => {
  document.getElementById('addSongBtn').addEventListener('click', addSong);
  document.getElementById('chatSendBtn').addEventListener('click', handleChat);
  document.getElementById('chatbot-toggle').addEventListener('click', toggleChatbot);
  document.getElementById('close-chat').addEventListener('click', toggleChatbot);
  document.getElementById('nextSongBtn').addEventListener('click', nextSong);
  renderPlaylist();
};

