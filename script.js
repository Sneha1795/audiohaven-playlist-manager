class Node {
  constructor(song) {
    this.song = song;
    this.next = null;
  }
}

class CircularLinkedList {
  constructor() {
    this.head = null;
    this.current = null;
  }

  add(song) {
    const newNode = new Node(song);
    if (!this.head) {
      this.head = newNode;
      newNode.next = this.head;
      this.current = newNode;
    } else {
      let temp = this.head;
      while (temp.next !== this.head) {
        temp = temp.next;
      }
      temp.next = newNode;
      newNode.next = this.head;
    }
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

  nextSong() {
    if (this.current) {
      this.current = this.current.next;
    }
  }

  getCurrentSong() {
    return this.current ? this.current.song : 'None';
  }
}

const playlist = new CircularLinkedList();

function renderPlaylist() {
  const ul = document.getElementById('playlist');
  ul.innerHTML = '';
  const songs = playlist.getSongs();
  songs.forEach(song => {
    const li = document.createElement('li');
    li.innerText = song;
    ul.appendChild(li);
  });
}

function updateNowPlaying() {
  const nowPlaying = document.getElementById('nowPlaying');
  nowPlaying.innerText = playlist.getCurrentSong();
}

function addSong() {
  const input = document.getElementById('songInput');
  const song = input.value.trim();
  if (song) {
    playlist.add(song);
    renderPlaylist();
    updateNowPlaying();
    input.value = '';
  }
}

// ========== Chatbot Logic ==========
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

  const mood = msg.toLowerCase();
  let response = '';

  if (mood.includes('happy')) {
    response = '🎶 Playlist: Happy Vibes\n1. Walking on Sunshine\n2. Can’t Stop the Feeling!';
  } else if (mood.includes('sad')) {
    response = '🌧 Playlist: Chill Moods\n1. Someone Like You\n2. Fix You';
  } else if (mood.includes('study') || mood.includes('focus')) {
    response = '📚 Playlist: Focus Flow\n1. Lofi Beats\n2. Study Chill';
  } else {
    response = '🤖 Try: "I feel happy", "I feel sad", or "I want to study".';
  }

  addMessageToChat('bot', response);
}

// ========== Chatbot Show/Hide ==========
function toggleChatbot() {
  const widget = document.getElementById('chatbot-widget');
  widget.classList.toggle('active');
}

// ========== Event Listeners ==========
window.onload = () => {
  document.getElementById('addSongBtn').addEventListener('click', addSong);
  document.getElementById('chatSendBtn').addEventListener('click', handleChat);
  document.getElementById('chatbot-toggle').addEventListener('click', toggleChatbot);
  document.getElementById('close-chat').addEventListener('click', toggleChatbot);
  document.getElementById('nextBtn').addEventListener('click', () => {
    playlist.nextSong();
    updateNowPlaying();
  });
};
