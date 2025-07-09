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

function addSong() {
  const input = document.getElementById('songInput');
  const song = input.value.trim();
  if (song) {
    playlist.add(song);
    renderPlaylist();
    input.value = '';
  }
}

function analyzeMood() {
  const moodInput = document.getElementById('moodInput').value.toLowerCase();
  const suggestion = document.getElementById('suggestion');
  let result = '';
  if (moodInput.includes('happy')) {
    result = 'Suggested Playlist: Happy Vibes ✨\n1. Walking on Sunshine\n2. Can’t Stop the Feeling!';
  } else if (moodInput.includes('sad')) {
    result = 'Suggested Playlist: Chill & Calm 🌧\n1. Someone Like You\n2. Fix You';
  } else if (moodInput.includes('study') || moodInput.includes('focus')) {
    result = 'Suggested Playlist: Focus Flow 📚\n1. Lofi Beats\n2. Study Chill';
  } else {
    result = 'No playlist matched your mood. Try: happy, sad, or study.';
  }
  suggestion.innerText = result;
}