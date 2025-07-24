## audiohaven-playlist-manager
A web-based playlist manager built with HTML, CSS, and JavaScript, leveraging Circular Linked Lists for efficient song management. Includes a mood-based chatbot that recommends songs by mapping emotional keywords to predefined playlists.

# Features
Dynamic Playlist Management:
Add, remove, and reorder songs in real time using a circular linked list.

Smart Chatbot Sidebar:
Interprets user mood (via simple NLP keyword detection) to recommend playlists.

Simulated Listening Behavior:
Uses lightweight rule-based logic to autosuggest songs based on session history.

Persistent Playlist:
Songs are saved in localStorage so the playlist stays even after refreshing.

Quick Song Access:
Each song has a "play" button linking to its search page on Spotify.

# Tools & Technologies
Frontend: HTML, CSS, JavaScript
Data Structure: Circular Linked List (custom implementation)
Other: Basic NLP (keyword matching), Local Storage

# How It Works
Playlist Operations:

Songs are stored as nodes in a circular linked list.

The "Next Song" button cycles through the playlist endlessly.

Chatbot Logic:

User inputs mood + genre (e.g., "happy pop").

The bot matches keywords and suggests curated playlists.


