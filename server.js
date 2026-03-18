const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Gör mappen "media" tillgänglig för servern
app.use('/media', express.static('media'));

// ==========================================
//  SETTINGS
// ==========================================
const SECRET_PASSWORD = "ÅsnaHAHA3789";

const MEDIA_DATABASE = {
    "hemligt1": {
        type: "image",
        url: "/media/bildnamn.jpg" // Namnet på filen du laddat upp i mappen media
    },
    "video99": {
        type: "video",
        url: "/media/filmklipp.mp4",
        thumbnail: "/media/poster.jpg" // Frivillig thumbnail-bild
    }
};
// ==========================================

// API: Logga in
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === SECRET_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Fel lösenord." });
    }
});

// API: Hitta media baserat på ID
app.post('/api/identify', (req, res) => {
    const { password, id } = req.body;
    if (password !== SECRET_PASSWORD) return res.status(401).json({ success: false });

    const item = MEDIA_DATABASE[id];
    if (item) {
        res.json({ success: true, type: item.type, url: item.url, thumbnail: item.thumbnail });
    } else {
        res.json({ success: false, message: "Ogiltig ID. Var god och försök igen." });
    }
});

// HTML-GRÄNSSNITT
const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media Portal</title>
    <style>
        :root {
            --bg: #0f172a;
            --card: #1e293b;
            --primary: #38bdf8;
            --primary-dark: #0ea5e9;
            --text: #f8fafc;
            --text-dim: #94a3b8;
            --danger: #f43f5e;
        }
        body {
            font-family: 'Inter', system-ui, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .app-card {
            background-color: var(--card);
            padding: 2.5rem;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            width: 90%;
            max-width: 420px;
            text-align: center;
        }
        h1 { font-size: 1.5rem; margin-bottom: 2rem; font-weight: 700; }
        input {
            width: 100%;
            padding: 1rem;
            margin-bottom: 1rem;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 0.75rem;
            color: white;
            font-size: 1rem;
            box-sizing: border-box;
            outline: none;
        }
        input:focus { border-color: var(--primary); }
        button {
            width: 100%;
            padding: 1rem;
            background-color: var(--primary);
            color: #0f172a;
            border: none;
            border-radius: 0.75rem;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        button:hover { background-color: var(--primary-dark); transform: translateY(-1px); }
        .hidden { display: none !important; }
        .status-msg { color: var(--danger); margin-bottom: 1rem; font-size: 0.9rem; min-height: 1.2rem; }
        
        .result-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #334155;
            padding: 1rem;
            border-radius: 0.75rem;
            margin-top: 1.5rem;
        }
        .result-label { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
        .result-item button { width: auto; padding: 0.5rem 1rem; font-size: 0.85rem; }
        
        .media-viewer { margin-top: 1.5rem; border-radius: 1rem; overflow: hidden; border: 2px solid #334155; }
        img, video { width: 100%; display: block; }
        svg { width: 20px; height: 20px; fill: currentColor; }
    </style>
</head>
<body>

    <div id="auth-section" class="app-card">
        <svg style="width:40px;height:40px;margin-bottom:1rem;color:var(--primary)" viewBox="0 0 24 24"><path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" /></svg>
        <h1>Privat Arkiv</h1>
        <div id="auth-error" class="status-msg"></div>
        <input type="password" id="pass-field" placeholder="Lösenord">
        <button onclick="login()">Lås upp</button>
    </div>

    <div id="search-section" class="app-card hidden">
        <h1>Identifiera Media</h1>
        <div id="search-error" class="status-msg"></div>
        <input type="text" id="id-field" placeholder="Ange Media ID">
        <button onclick="checkId()">
            <svg viewBox="0 0 24 24"><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" /></svg>
            Identifiera
        </button>

        <div id="result-row" class="result-item hidden">
            <div class="result-label" id="type-info"></div>
            <button onclick="renderMedia()">Visa</button>
        </div>

        <div id="viewer" class="media-viewer hidden"></div>
    </div>

    <script>
        let sessionPass = "";
        let foundMedia = null;

        async function login() {
            const p = document.getElementById('pass-field').value;
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ password: p })
            });
            const data = await res.json();
            if(data.success) {
                sessionPass = p;
                document.getElementById('auth-section').classList.add('hidden');
                document.getElementById('search-section').classList.remove('hidden');
            } else {
                document.getElementById('auth-error').innerText = data.message;
            }
        }

        async function checkId() {
            const id = document.getElementById('id-field').value;
            const err = document.getElementById('search-error');
            const row = document.getElementById('result-row');
            const view = document.getElementById('viewer');
            
            err.innerText = "";
            row.classList.add('hidden');
            view.classList.add('hidden');

            const res = await fetch('/api/identify', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ password: sessionPass, id: id })
            });
            const data = await res.json();
            
            if(data.success) {
                foundMedia = data;
                const isVid = data.type === 'video';
                document.getElementById('type-info').innerHTML = isVid 
                    ? '<svg viewBox="0 0 24 24"><path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/></svg> Video'
                    : '<svg viewBox="0 0 24 24"><path d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z"/></svg> Bild';
                row.classList.remove('hidden');
            } else {
                err.innerText = data.message;
            }
        }

        function renderMedia() {
            const v = document.getElementById('viewer');
            v.innerHTML = "";
            if(foundMedia.type === 'image') {
                const img = document.createElement('img');
                img.src = foundMedia.url;
                v.appendChild(img);
            } else {
                const vid = document.createElement('video');
                vid.src = foundMedia.url;
                vid.controls = true;
                if(foundMedia.thumbnail) vid.poster = foundMedia.thumbnail;
                v.appendChild(vid);
            }
            v.classList.remove('hidden');
            document.getElementById('result-row').classList.add('hidden');
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlContent));
app.listen(PORT, () => console.log('Server klar.'));
