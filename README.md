# 🎲 Petualangan Ular Tangga (Snakes & Ladders Web Game)

Proyek game web interaktif **Ular Tangga (Snakes & Ladders)** dengan tema **Bright & Colorful**, **Ular Realistis**, **Tangga 3D Emas/Kayu**, dan **Musik Petualangan Seru & Menantang** untuk Tugas Akhir Desain Web.

---

## 📁 Struktur Folder Project di `D:\Project-Ular-Tangga`

```text
D:\Project-Ular-Tangga\
├── assets/
│   ├── bgm.wav        (Audio petualangan seru & menantang tempo 140 BPM)
│   ├── dice.wav       (Efek kocokan wadah kayu & debuman meja padat)
│   ├── ladder.wav     (Fanfare brass megah saat menaiki tangga berkah)
│   ├── snake.wav      (Desisan & meluncur kartun dramatis saat digigit ular)
│   ├── step.wav       (Efek suara pop langkah pion melompat)
│   └── win.wav        (Fanfare kejayaan juara & drum roll selebrasi)
├── index.html         (Struktur web ceria, definisi SVG ular realistis, dadu 3D, modal skor)
├── style.css          (Desain terang/light theme, palet permen warna-warni, responsif)
├── script.js          (Mesin game: SVG kurva ular bertaring, dadu 3D presisi, Bot AI, confetti)
└── README.md          (Dokumentasi petunjuk game)
```

---

## ✨ Peningkatan & Fitur Baru (Update Sesuai Permintaan)

1. **🎨 Tampilan UI/UX Terang & Colorful (Light Theme):**
   - Latar belakang cerah bermandikan cahaya matahari, balon-balon permen melayang, dan bintang ceria.
   - Kartu antarmuka putih bersih berkilau (*bright glassmorphism*) dengan bayangan lembut dan garis batas berwarna ceria.
   - Tipografi kontras tinggi yang sangat mudah dibaca (*high readability*).
   - Tombol utama **"START GAME"** dan **"KOCOK DADU"** bergaya 3D permen dengan pantulan kilau cahaya interaktif.

2. **🐍 Ular Jauh Lebih Jelas & Realistis (Realistic Snakes):**
   - **Badan Bervolume 3D:** Menggunakan kurva tebal yang meruncing alami dari leher ke ekor dengan bayangan jatuh (*drop shadow*) berlapis.
   - **Tekstur Sisik Nyata:** Sisik punggung berpola berlian (Diamondback) dan sisik perut (*ventral plates*) krem bergaris kontras.
   - **Kepala Berbisa Realistis:** Kepala segitiga jenis beludak/kobra (*viper head*) lengkap dengan:
     - Mata predator menyala dengan pupil celah vertikal (*slit pupils*).
     - Sisik alis menonjol (*brow ridge*).
     - Lubang hidung/pit sensor panas.
     - Taring putih tajam di tepi mulut.
     - Lidah bercabang merah menyala yang menjulur panjang.
   - **4 Spesies Berbeda:** Emerald Viper hijau zamrud, Crimson Coral merah menyala, Royal Amethyst Cobra ungu mistis, dan Golden Python kuning keemasan.

3. **🪜 Tangga 3D Kayu & Emas:**
   - Rel kayu bergradasi dengan bevel highlight berkilau.
   - Anak tangga keemasan dilengkapi plat engsel logam baut emas di setiap sambungan.

4. **🎵 Musik Latar (BGM) & SFX Lebih Seru dan Menantang:**
   - **BGM:** Musik bertempo cepat 140 BPM dengan ketukan drum energik, bassline *groove*, dan progresi melodi arkade petualangan seru (Am - F - C - G/E7).
   - **SFX Realistis:** Kocokan dadu dalam gelas kayu, suara langkah melompat kartun, melodi naik tangga megah, dan suara desisan ular dramatis.
   - **Dual Audio:** Memutar file nyata di folder `assets/` dengan *fallback* otomatis ke Web Audio API synthesizer.
   - Tombol toggle Mute/Unmute BGM dan SFX selalu tersedia di pojok kanan atas.

5. **🎲 Dadu 3D Presisi di Tengah:**
   - Dadu 3D dengan 6 sisi titik kubus presisi diletakkan di panel tengah bawah yang ergonomis.
   - Animasi kocok berguling realistis di banyak sumbu (*multi-axis 3D roll effect*).
   - Mendukung tombol shortcut keyboard: **`[Spasi]`** untuk mengocok dadu.

6. **🏆 Papan Skor Pemenang (Leaderboard):**
   - Ketika ada pemain yang mencapai Kotak 100, muncul modal podium dengan urutan **Juara 1 🥇**, **Juara 2 🥈**, **Juara 3 🥉**, dan **Juara 4 🎖️**.
   - Dilengkapi ledakan semburan konfeti 60fps (*HTML5 Canvas Confetti*), ringkasan statistik (ronde, tangga dinaiki, ular digigit), serta tombol **"Main Lagi"** dan **"Main Menu"**.

---

## 🚀 Cara Menjalankan

1. Buka File Explorer di Windows.
2. Buka folder `D:\Project-Ular-Tangga`.
3. Klik ganda file `index.html` untuk langsung memainkannya di browser Chrome, Edge, Firefox, atau browser apa pun.
