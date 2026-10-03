/**
 * ==========================================================================
 * GAME ULAR TANGGA (SNAKES & LADDERS) - JAVASCRIPT ENGINE
 * Edisi: Bright & Colorful, Realistic Snakes & 3D Ladders,
 * Adventurous Upbeat Audio (Assets/ + Web Audio API Fallback),
 * 3D Dice Presisi, Bot AI, & Leaderboard Modal.
 * Lokasi Target: D:\Project-Ular-Tangga\script.js
 * ==========================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. AUDIO SYSTEM (UPBEAT, EXCITING, ADVENTUROUS & DUAL-LOADED)
     ========================================================================== */
  class SoundSystem {
    constructor() {
      this.isBgmActive = true;
      this.isSfxActive = true;
      this.isInitialized = false;

      // HTML5 Audio Elements from assets/
      this.assetBgm = new Audio('assets/bgm.wav');
      this.assetBgm.loop = true;
      this.assetBgm.volume = 0.4;

      this.assetSounds = {
        dice: new Audio('assets/dice.wav'),
        step: new Audio('assets/step.wav'),
        ladder: new Audio('assets/ladder.wav'),
        snake: new Audio('assets/snake.wav'),
        win: new Audio('assets/win.wav')
      };

      Object.values(this.assetSounds).forEach(a => { a.volume = 0.6; });

      // Web Audio API Fallback Synthesizer
      this.ctx = null;
      this.bgmGain = null;
      this.sfxGain = null;
      this.synthBgmInterval = null;
      this.synthBgmStep = 0;
    }

    init() {
      if (this.isInitialized) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.bgmGain = this.ctx.createGain();
          this.bgmGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
          this.bgmGain.connect(this.ctx.destination);

          this.sfxGain = this.ctx.createGain();
          this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
          this.sfxGain.connect(this.ctx.destination);
        }
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
      }
      this.isInitialized = true;
    }

    resume() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleBGM() {
      this.resume();
      this.isBgmActive = !this.isBgmActive;
      if (this.isBgmActive) {
        this.startBGM();
      } else {
        this.stopBGM();
      }
      return this.isBgmActive;
    }

    toggleSFX() {
      this.resume();
      this.isSfxActive = !this.isSfxActive;
      return this.isSfxActive;
    }

    startBGM() {
      if (!this.isBgmActive) return;
      this.resume();

      const playPromise = this.assetBgm.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.startSynthBGM();
        });
      }
    }

    stopBGM() {
      this.assetBgm.pause();
      this.assetBgm.currentTime = 0;
      this.stopSynthBGM();
    }

    // Adventurous, Upbeat 140 BPM Synth Fallback
    startSynthBGM() {
      if (!this.isBgmActive || !this.ctx || this.synthBgmInterval) return;

      const melody = [
        440, 440, 523.25, 659.25, 587.33, 523.25, 493.88, 523.25,
        349.23, 440, 523.25, 659.25, 698.46, 659.25, 587.33, 523.25,
        523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88, 440,
        392.00, 493.88, 587.33, 659.25, 659.25, 622.25, 587.33, 493.88
      ];

      const bassline = [
        110, 110, 220, 110, 110, 110, 220, 110,
        87.31, 87.31, 174.61, 87.31, 87.31, 87.31, 174.61, 87.31,
        130.81, 130.81, 261.63, 130.81, 130.81, 130.81, 261.63, 130.81,
        98.00, 98.00, 196.00, 98.00, 82.41, 82.41, 164.81, 82.41
      ];

      this.synthBgmStep = 0;
      const bpm = 140;
      const stepDuration = (60 / bpm) / 2; // eighth notes

      this.synthBgmInterval = setInterval(() => {
        if (!this.isBgmActive || !this.ctx) return;
        const now = this.ctx.currentTime;
        const step = this.synthBgmStep % melody.length;

        // Lead Melody (Pulse Wave)
        const freq = melody[step];
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.09, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.85);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + stepDuration * 0.85);

        // Bass Note (Triangle)
        const bFreq = bassline[step];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bFreq, now);

        bassGain.gain.setValueAtTime(0.14, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + stepDuration * 0.9);

        this.synthBgmStep++;
      }, stepDuration * 1000);
    }

    stopSynthBGM() {
      if (this.synthBgmInterval) {
        clearInterval(this.synthBgmInterval);
        this.synthBgmInterval = null;
      }
    }

    playAssetOrSynth(assetKey, synthFallbackFn) {
      if (!this.isSfxActive) return;
      this.resume();

      const audio = this.assetSounds[assetKey];
      if (audio) {
        audio.currentTime = 0;
        const p = audio.play();
        if (p !== undefined) {
          p.catch(() => {
            if (synthFallbackFn) synthFallbackFn.call(this);
          });
          return;
        }
      }
      if (synthFallbackFn) synthFallbackFn.call(this);
    }

    playClick() {
      if (!this.isSfxActive || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.08);
    }

    playDiceRoll() {
      this.playAssetOrSynth('dice', () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 7; i++) {
          const time = now + i * 0.09;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(240 + Math.random() * 220, time);
          gain.gain.setValueAtTime(0.18, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(time);
          osc.stop(time + 0.05);
        }
      });
    }

    playStep(stepIndex = 1) {
      this.playAssetOrSynth('step', () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const baseFreq = 420 + (stepIndex % 6) * 45;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.14);
      });
    }

    playLadder() {
      this.playAssetOrSynth('ladder', () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const time = now + idx * 0.11;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);
          gain.gain.setValueAtTime(0.3, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(time);
          osc.stop(time + 0.32);
        });
      });
    }

    playSnake() {
      this.playAssetOrSynth('snake', () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.65);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.65);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.65);
      });
    }

    playVictory() {
      this.playAssetOrSynth('win', () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const chords = [
          { time: 0.0, freq: 523.25 },
          { time: 0.2, freq: 659.25 },
          { time: 0.4, freq: 783.99 },
          { time: 0.65, freq: 1046.50 }
        ];
        chords.forEach(c => {
          const time = now + c.time;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(c.freq, time);
          gain.gain.setValueAtTime(0.35, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(time);
          osc.stop(time + 0.5);
        });
      });
    }
  }

  /* ==========================================================================
     2. GAME BOARD CONFIGURATION & MATHEMATICAL HELPERS
     ========================================================================== */
  const LADDERS = {
    4: 14,
    9: 31,
    20: 38,
    28: 84,
    40: 59,
    51: 67,
    63: 81,
    71: 91
  };

  const SNAKES = {
    17: 7,
    54: 34,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    99: 78
  };

  // 15 Kotak Tantangan di Papan (Tersebar Rata & Tanpa Tabrakan Ular / Tangga)
  const CHALLENGE_TILES = [6, 12, 18, 26, 33, 44, 52, 58, 65, 72, 77, 82, 88, 94, 97];

  // Bank Tepat 15 Tantangan Interaktif Ceria (Kuis Pengetahuan, Tongue Twister, Tebak Gaya, Nyanyi/Suara)
  const CHALLENGE_DATA = [
    {
      type: 'quiz',
      category: '🧠 KUIS IBU KOTA',
      title: 'Kuis Ibu Kota Negara!',
      desc: 'Pilih jawaban yang paling benar sebelum waktu habis!',
      question: 'Apakah nama ibu kota negara Indonesia saat ini?',
      options: ['Jakarta / IKN Nusantara', 'Bandung', 'Surabaya', 'Yogyakarta'],
      correctIndex: 0,
      seconds: 12
    },
    {
      type: 'quiz',
      category: '🧠 KUIS TATA SURYA',
      title: 'Kuis Astronomi Cilik!',
      desc: 'Jawab dengan tepat untuk lolos tantangan!',
      question: 'Planet apakah yang merupakan planet terbesar di tata surya kita?',
      options: ['Planet Mars', 'Planet Bumi', 'Planet Jupiter', 'Planet Saturnus'],
      correctIndex: 2,
      seconds: 12
    },
    {
      type: 'quiz',
      category: '🧠 KUIS MATEMATIKA CEPAT',
      title: 'Hitung Cepat Kilat!',
      desc: 'Berapakah hasil perkalian di bawah ini?',
      question: 'Berapa hasil dari 7 x 8 ?',
      options: ['54', '56', '58', '64'],
      correctIndex: 1,
      seconds: 10
    },
    {
      type: 'quiz',
      category: '🧠 KUIS SAINS & ALAM',
      title: 'Rumus Sains Dasar!',
      desc: 'Pilih simbol kimia yang tepat!',
      question: 'Apakah rumus kimia untuk molekul air murni?',
      options: ['CO₂ (Karbon)', 'O₂ (Oksigen)', 'H₂O (Air)', 'NaCl (Garam)'],
      correctIndex: 2,
      seconds: 12
    },
    {
      type: 'quiz',
      category: '🧠 KUIS DUNIA HEWAN',
      title: 'Raja Samudra!',
      desc: 'Pilih hewan mamalia terbesar di dunia!',
      question: 'Hewan apakah yang dinobatkan sebagai makhluk hidup terbesar di muka bumi?',
      options: ['Gajah Afrika', 'Paus Biru', 'Hiu Putih Besar', 'Jerapah Afrika'],
      correctIndex: 1,
      seconds: 12
    },
    {
      type: 'tongue',
      category: '👅 TONGUE TWISTER SERU',
      title: 'Ular Melingkar Pagar!',
      desc: 'Ucapkan kalimat ini 3 kali berturut-turut dengan cepat, jelas, dan lantang!',
      content: '“Ular melingkar di pagar bundar meliuk-liuk berputar-putar!” 🐍',
      seconds: 15
    },
    {
      type: 'tongue',
      category: '👅 TONGUE TWISTER SERU',
      title: 'Ucapkan Warna Cepat!',
      desc: 'Ucapkan kalimat warna ini 3 kali berturut-turut tanpa salah kata!',
      content: '“Satu ribu, dua biru, tiga ribu, empat biru, lima ribu, enam biru!” 🎨',
      seconds: 15
    },
    {
      type: 'tongue',
      category: '👅 TONGUE TWISTER SERU',
      title: 'Kucing Kuning Genteng!',
      desc: 'Ucapkan kalimat cepat ini 3 kali berturut-turut tanpa tersedak!',
      content: '“Kucing kuning kencing kencang di atas genteng kering!” 🐱',
      seconds: 15
    },
    {
      type: 'tongue',
      category: '👅 TONGUE TWISTER SERU',
      title: 'Kuku Kakek Kaku!',
      desc: 'Ucapkan kalimat lidah ini 3 kali berturut-turut tanpa jeda!',
      content: '“Kakak kok kuku kaki kakek kaku-kaku kayak kayu?” 🪵',
      seconds: 15
    },
    {
      type: 'pose',
      category: '🎭 TEBAK GAYA (PANTOMIM)',
      title: 'Tirukan Pose Monyet!',
      desc: 'Peragakan gaya ini selama 10 detik tanpa bersuara sampai pemain lain paham!',
      content: 'Peragakan: <strong>Monyet sedang mengupas pisang lalu kekenyangan</strong> 🍌🐒',
      seconds: 12
    },
    {
      type: 'pose',
      category: '🎭 TEBAK GAYA (PANTOMIM)',
      title: 'Tirukan Pose Robot!',
      desc: 'Lakukan gerakan ini tanpa bersuara sama sekali!',
      content: 'Peragakan: <strong>Robot yang tiba-tiba baterainya habis mendadak</strong> 🤖⚡',
      seconds: 12
    },
    {
      type: 'pose',
      category: '🎭 TEBAK GAYA (PANTOMIM)',
      title: 'Tirukan Orang Kepedasan!',
      desc: 'Peragakan ekspresi lucu ini di depan semua pemain!',
      content: 'Peragakan: <strong>Orang kepedasan makan cabai level 100 tanpa minum</strong> 🌶️🥵',
      seconds: 12
    },
    {
      type: 'action',
      category: '🎵 TANTANGAN NYANYI KREATIF',
      title: 'Nyanyi Huruf Vokal "O"!',
      desc: 'Ubah semua huruf vokal lagu menjadi huruf "O"!',
      content: 'Nyanyikan 2 baris lagu “Balonku Ada Lima” tapi semua huruf vokalnya diganti jadi <strong>“O”</strong>! 🎈',
      seconds: 15
    },
    {
      type: 'action',
      category: '🎵 TANTANGAN SUARA HEWAN',
      title: 'Tirukan 3 Suara Hewan!',
      desc: 'Bunyikan 3 suara hewan yang berbeda secara berturut-turut!',
      content: 'Tirukan suara: <strong>Kucing 🐱, Ayam Jago 🐓, dan Kambing 🐐</strong> dalam tempo 10 detik!',
      seconds: 12
    },
    {
      type: 'action',
      category: '😆 TAHAN TAWA 10 DETIK',
      title: 'Tahan Tawa Wajah Datar!',
      desc: 'Tatap layar atau pemain lain tanpa tersenyum atau tertawa!',
      content: 'Pasang wajah datar dan <strong>DILARANG TERSENYUM ATAU TERTAWA</strong> selama 10 detik penuh! 😐',
      seconds: 10
    }
  ];

  // Tepat 15 KARTU HUKUMAN ACAK LENGKAP & KREATIF (Interaktif, Kocak & Bervariasi)
  const PUNISHMENT_DECK = [
    {
      id: 1,
      title: 'Mundur 2 Langkah Santai',
      detail: 'Terpeleset kulit pisang licin! Karaktermu harus melangkah mundur 2 kotak ke belakang.',
      icon: '🍌',
      stepsBack: 2
    },
    {
      id: 2,
      title: 'Mundur 3 Langkah',
      detail: 'Kena hembusan badai gurun! Pion karaktermu melangkah mundur 3 kotak ke belakang.',
      icon: '🌪️',
      stepsBack: 3
    },
    {
      id: 3,
      title: 'Langkah Mundur Sesuai Dadu',
      detail: 'Pemain harus melangkah mundur ke belakang sebanyak angka dadu terakhir yang didapatkan!',
      icon: '🎲',
      stepsBack: 'lastRoll'
    },
    {
      id: 4,
      title: 'Mundur 1 Langkah Ringan',
      detail: 'Hanya mundur 1 kotak ke belakang. Anggap saja sebagai pemanasan kaki!',
      icon: '🚶',
      stepsBack: 1
    },
    {
      id: 5,
      title: 'Tirukan Suara Hewan Lucu',
      detail: 'Tirukan suara ayam berkokok atau kucing mengeong sekeras-kerasnya di hadapan semua pemain!',
      icon: '🐓',
      stepsBack: 0
    },
    {
      id: 6,
      title: 'Tahan Napas 10 Detik',
      detail: 'Kembungkan pipi dan tahan napas selama 10 detik penuh di depan semua pemain tanpa tertawa!',
      icon: '🫧',
      stepsBack: 0
    },
    {
      id: 7,
      title: 'Joget Lucu Tanpa Musik',
      detail: 'Berdiri dan lakukan gerakan joget atau tarian bebas paling kocak selama 10 detik!',
      icon: '💃',
      stepsBack: 0
    },
    {
      id: 8,
      title: 'Bicara Bahasa Alien 1 Ronde',
      detail: 'Selama 1 putaran ke depan, kamu hanya boleh berkomunikasi menggunakan suara bahasa alien atau robot!',
      icon: '👽',
      stepsBack: 0
    },
    {
      id: 9,
      title: 'Mode Bisu 1 Putaran',
      detail: 'Dilarang berbicara sepatah kata pun sampai giliranmu berikutnya tiba! Jika bersuara, mundur 1 kotak.',
      icon: '🤫',
      stepsBack: 0
    },
    {
      id: 10,
      title: 'Gaya Patung Membatu',
      detail: 'Diam membeku seperti patung es selama 10 detik penuh tanpa berkedip dan tanpa bergerak!',
      icon: '🗿',
      stepsBack: 0
    },
    {
      id: 11,
      title: 'Squat Semangat 5 Kali',
      detail: 'Lakukan gerakan jongkok-berdiri (squat) 5 kali di depan layar untuk melatih kebugaran tubuh!',
      icon: '🏋️',
      stepsBack: 0
    },
    {
      id: 12,
      title: 'Puji Semua Pemain Lawan',
      detail: 'Berikan satu kalimat pujian paling manis dan tulus untuk setiap pemain lawanmu secara bergantian!',
      icon: '💖',
      stepsBack: 0
    },
    {
      id: 13,
      title: 'Ganti Nama Julukan Lucu',
      detail: 'Pemain lain berhak memberikan nama julukan aneh kepadamu (misal: "Yang Mulia Kucing") sampai game berakhir!',
      icon: '👑',
      stepsBack: 0
    },
    {
      id: 14,
      title: 'Tertawa Ala Bos Jahat',
      detail: 'Keluarkan tawa jahat "MUAHAHAHA!" yang paling menggelegar dan dramatis selama 5 detik!',
      icon: '😈',
      stepsBack: 0
    },
    {
      id: 15,
      title: 'Tepuk Tangan Irama Kilat',
      detail: 'Bertepuk tanganlah dengan tempo cepat tanpa henti selama 10 detik sambil tersenyum bangga!',
      icon: '👏',
      stepsBack: 0
    }
  ];

  // Pool Avatar Hewan Lucu & Colorful
  const AVATAR_POOL = ['🦁', '🐰', '🐼', '🦊', '🐯', '🐸', '🐵', '🦄', '🐨', '🐧'];

  // Preset Pemain Default Berkarakter Hewan Ceria (Mendukung hingga 8 Pemain)
  const PLAYER_DEFAULT_PRESETS = [
    { name: 'Singa Merah', color: '#ef4444', class: 'p1', avatar: '🦁', isBot: false },
    { name: 'Kelinci Biru', color: '#2563eb', class: 'p2', avatar: '🐰', isBot: true },
    { name: 'Panda Hijau', color: '#059669', class: 'p3', avatar: '🐼', isBot: true },
    { name: 'Rubah Kuning', color: '#d97706', class: 'p4', avatar: '🦊', isBot: true },
    { name: 'Unicorn Ungu', color: '#8b5cf6', class: 'p5', avatar: '🦄', isBot: true },
    { name: 'Harimau Jingga', color: '#ea580c', class: 'p6', avatar: '🐯', isBot: true },
    { name: 'Katak Cyan', color: '#06b6d4', class: 'p7', avatar: '🐸', isBot: true },
    { name: 'Koala Pink', color: '#ec4899', class: 'p8', avatar: '🐨', isBot: true }
  ];

  function getTileGridCoords(tileNumber) {
    if (tileNumber < 1) tileNumber = 1;
    if (tileNumber > 100) tileNumber = 100;

    const row = Math.floor((tileNumber - 1) / 10);
    const isEvenRow = (row % 2 === 0);
    const col = isEvenRow ? ((tileNumber - 1) % 10) : (9 - ((tileNumber - 1) % 10));

    const xPercent = (col + 0.5) * 10;
    const yPercent = (9 - row + 0.5) * 10;

    const svgX = (col + 0.5) * 100;
    const svgY = (9 - row + 0.5) * 100;

    return { row, col, xPercent, yPercent, svgX, svgY };
  }

  // Offset sebaran cerdas jika 2 atau lebih pion berada di nomor petak yang sama
  function getPawnOffsetForTile(playerIndex, totalOnTile) {
    if (totalOnTile <= 1) {
      // Sendirian di petak: tepat di tengah petak
      return { dx: 0, dy: 0 };
    }
    if (totalOnTile === 2) {
      // 2 Pion: Berdampingan rapi kiri & kanan, sedikit ke bawah agar nomor kotak di kiri atas tetap bebas
      const offsets2 = [
        { dx: -1.3, dy: 0.6 },
        { dx: 1.3, dy: 0.6 }
      ];
      return offsets2[playerIndex % 2];
    }
    if (totalOnTile === 3) {
      // 3 Pion: Segitiga seimbang, sudut kiri atas tetap terbuka untuk angka petak
      const offsets3 = [
        { dx: 1.2, dy: -1.0 },
        { dx: -1.3, dy: 1.1 },
        { dx: 1.3, dy: 1.1 }
      ];
      return offsets3[playerIndex % 3];
    }
    if (totalOnTile === 4) {
      // 4 Pion: 4 Kuadran seimbang
      const offsets4 = [
        { dx: 1.3, dy: -1.1 },
        { dx: -1.3, dy: 1.2 },
        { dx: 1.3, dy: 1.2 },
        { dx: -1.3, dy: -0.4 }
      ];
      return offsets4[playerIndex % 4];
    }
    // 5 sampai 8 Pion (misal: di Kotak 1 saat awal permainan)
    const angle = (playerIndex / totalOnTile) * Math.PI * 2 - Math.PI / 2;
    const radius = 1.8;
    return {
      dx: Math.cos(angle) * radius,
      dy: Math.sin(angle) * radius + 0.5
    };
  }

  const PAWN_OFFSETS = [
    { dx: 0, dy: 0 },
    { dx: 1.3, dy: 0.6 },
    { dx: -1.3, dy: 0.6 },
    { dx: 1.2, dy: -1.0 }
  ];

  /* ==========================================================================
     3. CONFETTI CELEBRATION ENGINE
     ========================================================================== */
  class ConfettiEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
      this.particles = [];
      this.animationId = null;
      this.isActive = false;
    }

    start() {
      if (!this.canvas || !this.ctx) return;
      this.resize();
      this.particles = [];
      const colors = ['#ef4444', '#2563eb', '#059669', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

      for (let i = 0; i < 110; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height * 0.3 - 20,
          w: Math.random() * 9 + 6,
          h: Math.random() * 6 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 4.5,
          vy: Math.random() * 3.5 + 2.5,
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 9
        });
      }

      this.isActive = true;
      this.loop();
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = this.canvas.offsetWidth || 520;
      this.canvas.height = this.canvas.offsetHeight || 520;
    }

    loop() {
      if (!this.isActive) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (p.y > this.canvas.height) {
          p.y = -10;
          p.x = Math.random() * this.canvas.width;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        this.ctx.restore();
      });

      this.animationId = requestAnimationFrame(() => this.loop());
    }

    stop() {
      this.isActive = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  /* ==========================================================================
     4. GAME CONTROLLER
     ========================================================================== */
  class GameController {
    constructor() {
      this.sound = new SoundSystem();
      this.confetti = null;

      this.mode = 'solo';
      this.playerCount = 4;
      this.players = [];
      this.currentPlayerIndex = 0;
      this.turnRound = 1;
      this.isRolling = false;
      this.isMoving = false;
      this.isGameOver = false;
      this.moveSpeed = 'normal';
      this.consecutiveSixes = 0;

      this.stats = {
        totalTurns: 0,
        totalLadders: 0,
        totalSnakes: 0
      };

      this.dom = {};
      this.initDomReferences();
      this.bindEvents();
      this.renderSetupCards();
    }

    initDomReferences() {
      this.dom.screenLanding = document.getElementById('screen-landing');
      this.dom.screenSetup = document.getElementById('screen-setup');
      this.dom.screenGameplay = document.getElementById('screen-gameplay');

      this.dom.btnToggleBgm = document.getElementById('btn-toggle-bgm');
      this.dom.btnToggleSfx = document.getElementById('btn-toggle-sfx');
      this.dom.btnOpenRules = document.getElementById('btn-open-rules');

      this.dom.btnStartGame = document.getElementById('btn-start-game');

      this.dom.modeTabs = document.querySelectorAll('.mode-tab');
      this.dom.btnCounts = document.querySelectorAll('.btn-count');
      this.dom.playerConfigList = document.getElementById('player-config-list');
      this.dom.btnLaunchGame = document.getElementById('btn-launch-game');
      this.dom.btnBackToLanding = document.getElementById('btn-back-to-landing');

      this.dom.boardGrid = document.getElementById('board-grid');
      this.dom.boardSvgOverlay = document.getElementById('board-svg-overlay');
      this.dom.svgLaddersGroup = document.getElementById('svg-ladders-group');
      this.dom.svgSnakesGroup = document.getElementById('svg-snakes-group');
      this.dom.pawnsContainer = document.getElementById('pawns-container');
      this.dom.tileEffectsLayer = document.getElementById('tile-effects-layer');

      this.dom.turnCard = document.getElementById('turn-card');
      this.dom.turnAvatarBadge = document.getElementById('turn-avatar-badge');
      this.dom.turnPlayerName = document.getElementById('turn-player-name');
      this.dom.turnPlayerStatus = document.getElementById('turn-player-status');
      this.dom.playersMiniList = document.getElementById('players-mini-list');
      this.dom.gameLogStream = document.getElementById('game-log-stream');
      this.dom.turnCounter = document.getElementById('turn-counter');

      this.dom.diceCube = document.getElementById('dice-cube');
      this.dom.btnRollDice = document.getElementById('btn-roll-dice');
      this.dom.diceResultNumber = document.getElementById('dice-result-number');
      this.dom.diceResultText = document.getElementById('dice-result-text');

      this.dom.btnToggleSpeed = document.getElementById('btn-toggle-speed');
      this.dom.speedLabel = document.getElementById('speed-label');
      this.dom.btnForfeit = document.getElementById('btn-forfeit-game');

      this.dom.modalWinner = document.getElementById('modal-winner');
      this.dom.championName = document.getElementById('champion-name');
      this.dom.leaderboardPodiumList = document.getElementById('leaderboard-podium-list');
      this.dom.statTotalTurns = document.getElementById('stat-total-turns');
      this.dom.statTotalLadders = document.getElementById('stat-total-ladders');
      this.dom.statTotalSnakes = document.getElementById('stat-total-snakes');
      this.dom.btnPlayAgain = document.getElementById('btn-play-again');
      this.dom.btnReturnMenu = document.getElementById('btn-return-menu');

      this.dom.modalRules = document.getElementById('modal-rules');
      this.dom.btnCloseRules = document.getElementById('btn-close-rules');
      this.dom.btnGotIt = document.getElementById('btn-got-it');

      this.dom.toastContainer = document.getElementById('toast-container');
      this.dom.confettiCanvas = document.getElementById('confetti-canvas');

      // Modals: Challenge & 15-Card Punishment Deck
      this.dom.modalChallenge = document.getElementById('modal-challenge');
      this.dom.challengeCategoryPill = document.getElementById('challenge-category-pill');
      this.dom.challengeTitle = document.getElementById('challenge-title');
      this.dom.challengeDesc = document.getElementById('challenge-desc');
      this.dom.challengeContentBox = document.getElementById('challenge-content-box');
      this.dom.challengeTimerWrapper = document.getElementById('challenge-timer-wrapper');
      this.dom.timerBarFill = document.getElementById('timer-bar-fill');
      this.dom.timerSecondsText = document.getElementById('timer-seconds-text');
      this.dom.btnChallengeSuccess = document.getElementById('btn-challenge-success');
      this.dom.btnChallengeFail = document.getElementById('btn-challenge-fail');

      this.dom.modalPunishment = document.getElementById('modal-punishment');
      this.dom.card3dInner = document.getElementById('card-3d-inner');
      this.dom.punishmentIcon = document.getElementById('punishment-icon');
      this.dom.punishmentName = document.getElementById('punishment-name');
      this.dom.punishmentDetail = document.getElementById('punishment-detail');
      this.dom.punishmentCardNo = document.getElementById('punishment-card-no');
      this.dom.btnApplyPunishment = document.getElementById('btn-apply-punishment');

      this.confetti = new ConfettiEngine(this.dom.confettiCanvas);
    }

    bindEvents() {
      this.dom.btnToggleBgm.addEventListener('click', () => {
        const active = this.sound.toggleBGM();
        this.dom.btnToggleBgm.classList.toggle('active-mute', !active);
        this.dom.btnToggleBgm.querySelector('.icon').textContent = active ? '🎵' : '🔇';
        this.showToast(active ? 'Musik Latar Aktif' : 'Musik Latar Senyap');
      });

      this.dom.btnToggleSfx.addEventListener('click', () => {
        const active = this.sound.toggleSFX();
        this.dom.btnToggleSfx.classList.toggle('active-mute', !active);
        this.dom.btnToggleSfx.querySelector('.icon').textContent = active ? '🔊' : '🔈';
        this.showToast(active ? 'Efek Suara Aktif' : 'Efek Suara Senyap');
      });

      this.dom.btnOpenRules.addEventListener('click', () => {
        this.sound.playClick();
        this.dom.modalRules.classList.add('show');
      });

      this.dom.btnCloseRules.addEventListener('click', () => {
        this.sound.playClick();
        this.dom.modalRules.classList.remove('show');
      });

      this.dom.btnGotIt.addEventListener('click', () => {
        this.sound.playClick();
        this.dom.modalRules.classList.remove('show');
      });

      this.dom.btnStartGame.addEventListener('click', () => {
        this.sound.resume();
        this.sound.playClick();
        if (this.sound.isBgmActive) this.sound.startBGM();
        this.switchScreen('setup');
      });

      this.dom.modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          this.sound.playClick();
          this.dom.modeTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.mode = tab.dataset.mode;
          this.renderSetupCards();
        });
      });

      this.dom.btnCounts.forEach(btn => {
        btn.addEventListener('click', () => {
          this.sound.playClick();
          this.dom.btnCounts.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.playerCount = parseInt(btn.dataset.count, 10);
          this.renderSetupCards();
        });
      });

      this.dom.btnBackToLanding.addEventListener('click', () => {
        this.sound.playClick();
        this.switchScreen('landing');
      });

      this.dom.btnLaunchGame.addEventListener('click', () => {
        this.sound.playClick();
        this.collectPlayerSettingsAndStart();
      });

      this.dom.btnRollDice.addEventListener('click', () => {
        this.handleHumanRoll();
      });

      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && this.dom.screenGameplay.classList.contains('active')) {
          e.preventDefault();
          this.handleHumanRoll();
        }
      });

      this.dom.btnToggleSpeed.addEventListener('click', () => {
        this.sound.playClick();
        this.moveSpeed = this.moveSpeed === 'normal' ? 'fast' : 'normal';
        this.dom.speedLabel.textContent = this.moveSpeed === 'normal' ? 'Normal' : 'Cepat (2x)';
        this.showToast(`Kecepatan: ${this.dom.speedLabel.textContent}`);
      });

      this.dom.btnForfeit.addEventListener('click', () => {
        if (confirm('Yakin ingin menghentikan permainan dan kembali ke menu utama?')) {
          this.sound.playClick();
          this.switchScreen('landing');
        }
      });

      this.dom.btnPlayAgain.addEventListener('click', () => {
        this.sound.playClick();
        this.confetti.stop();
        this.dom.modalWinner.classList.remove('show');
        this.startMatch();
      });

      this.dom.btnReturnMenu.addEventListener('click', () => {
        this.sound.playClick();
        this.confetti.stop();
        this.dom.modalWinner.classList.remove('show');
        this.switchScreen('landing');
      });

      // Event Listeners: Modal Challenge & 15-Card Punishment Deck
      if (this.dom.btnChallengeSuccess) {
        this.dom.btnChallengeSuccess.addEventListener('click', () => {
          this.sound.playClick();
          this.handleChallengeSuccess();
        });
      }

      if (this.dom.btnChallengeFail) {
        this.dom.btnChallengeFail.addEventListener('click', () => {
          this.sound.playClick();
          this.handleChallengeFail();
        });
      }

      if (this.dom.card3dInner) {
        this.dom.card3dInner.addEventListener('click', () => {
          this.sound.playClick();
          this.dom.card3dInner.classList.toggle('flipped');
        });
      }

      if (this.dom.btnApplyPunishment) {
        this.dom.btnApplyPunishment.addEventListener('click', () => {
          this.sound.playClick();
          this.applyPunishmentAndContinue();
        });
      }

      window.addEventListener('resize', () => {
        if (this.dom.screenGameplay.classList.contains('active')) {
          this.renderSnakesAndLadders();
          this.updateAllPawnPositions(false);
        }
      });
    }

    switchScreen(screenName) {
      this.dom.screenLanding.classList.remove('active');
      this.dom.screenSetup.classList.remove('active');
      this.dom.screenGameplay.classList.remove('active');

      if (screenName === 'landing') {
        this.dom.screenLanding.classList.add('active');
      } else if (screenName === 'setup') {
        this.dom.screenSetup.classList.add('active');
      } else if (screenName === 'gameplay') {
        this.dom.screenGameplay.classList.add('active');
      }
    }

    renderSetupCards() {
      this.dom.playerConfigList.innerHTML = '';

      for (let i = 0; i < this.playerCount; i++) {
        const preset = PLAYER_DEFAULT_PRESETS[i];
        let defaultName = preset.name;
        let isBot = false;

        if (this.mode === 'solo') {
          if (i === 0) {
            defaultName = 'Kamu (Pemain)';
            isBot = false;
          } else {
            const botNames = ['Bot Kancil', 'Bot Robot', 'Bot Cerdas', 'Bot Pintar', 'Bot Juara', 'Bot Kilat', 'Bot Jagoan'];
            defaultName = botNames[i - 1] || `Bot ${i}`;
            isBot = true;
          }
        } else {
          defaultName = `Pemain ${i + 1}`;
          isBot = false;
        }

        const card = document.createElement('div');
        card.className = `player-config-card ${preset.class}`;
        card.innerHTML = `
          <button type="button" class="avatar-picker-btn" data-index="${i}" title="${isBot ? 'Ganti avatar bot' : 'Klik untuk ganti avatar'}">
            ${preset.avatar}
          </button>
          <div class="player-card-fields">
            <input type="text" class="player-name-input" data-index="${i}" value="${defaultName}" maxlength="14" placeholder="Nama Pemain" ${isBot ? 'readonly tabindex="-1"' : ''} title="${isBot ? defaultName : 'Klik untuk ubah nama'}">
            <span class="player-role-badge ${isBot ? 'is-bot' : ''}">
              <span class="role-icon">${isBot ? '🤖' : '👤'}</span>
              <span class="role-text">${isBot ? 'Bot AI' : 'Manusia'}</span>
            </span>
          </div>
        `;

        const avatarBtn = card.querySelector('.avatar-picker-btn');
        avatarBtn.addEventListener('click', () => {
          this.sound.playClick();
          const currentAv = avatarBtn.textContent.trim();
          const currIdx = AVATAR_POOL.indexOf(currentAv);
          const nextIdx = (currIdx + 1) % AVATAR_POOL.length;
          avatarBtn.textContent = AVATAR_POOL[nextIdx];
        });

        this.dom.playerConfigList.appendChild(card);
      }
    }

    collectPlayerSettingsAndStart() {
      this.players = [];
      const nameInputs = this.dom.playerConfigList.querySelectorAll('.player-name-input');
      const avatarBtns = this.dom.playerConfigList.querySelectorAll('.avatar-picker-btn');

      for (let i = 0; i < this.playerCount; i++) {
        const preset = PLAYER_DEFAULT_PRESETS[i];
        const nameVal = nameInputs[i].value.trim() || `Pemain ${i + 1}`;
        const avatarVal = avatarBtns[i].textContent.trim() || preset.avatar;
        const isBot = (this.mode === 'solo' && i > 0);

        this.players.push({
          id: i,
          name: nameVal,
          avatar: avatarVal,
          color: preset.color,
          class: preset.class,
          isBot: isBot,
          position: 1,
          rank: null,
          laddersClimbed: 0,
          snakesBitten: 0,
          turnsTaken: 0
        });
      }

      this.switchScreen('gameplay');
      this.startMatch();
    }

    startMatch() {
      this.currentPlayerIndex = 0;
      this.turnRound = 1;
      this.isRolling = false;
      this.isMoving = false;
      this.isGameOver = false;
      this.consecutiveSixes = 0;

      this.stats = {
        totalTurns: 0,
        totalLadders: 0,
        totalSnakes: 0
      };

      this.players.forEach(p => {
        p.position = 1;
        p.rank = null;
        p.laddersClimbed = 0;
        p.snakesBitten = 0;
        p.turnsTaken = 0;
      });

      this.buildBoardGrid();
      this.renderSnakesAndLadders();
      this.createPawnElements();
      this.updateSidebarUI();
      this.clearLog();
      this.addLog('🏁', 'Permainan dimulai! Kotak 1 adalah Garis Start.');

      this.updateTurnUI();
      this.checkBotTurn();
    }

    buildBoardGrid() {
      this.dom.boardGrid.innerHTML = '';

      for (let displayRow = 9; displayRow >= 0; displayRow--) {
        const isEvenRow = (displayRow % 2 === 0);

        for (let col = 0; col < 10; col++) {
          const colIndex = isEvenRow ? col : (9 - col);
          const tileNumber = displayRow * 10 + colIndex + 1;

          const tileEl = document.createElement('div');
          const colorVariant = ((displayRow + col) % 5) + 1;
          tileEl.className = `board-tile tile-color-${colorVariant}`;
          tileEl.id = `tile-${tileNumber}`;
          tileEl.dataset.tile = tileNumber;

          if (tileNumber === 1) tileEl.classList.add('tile-start');
          if (tileNumber === 100) tileEl.classList.add('tile-finish');

          let badgeHtml = '';
          if (tileNumber === 1) {
            badgeHtml = '<span class="tile-badge-icon">🚩</span>';
          } else if (tileNumber === 100) {
            badgeHtml = '<span class="tile-badge-icon">🏆</span>';
          } else if (LADDERS[tileNumber]) {
            badgeHtml = `
              <span class="tile-badge-icon">🪜</span>
              <span class="tile-jump-tag ladder-tag">↑${LADDERS[tileNumber]}</span>
            `;
          } else if (SNAKES[tileNumber]) {
            badgeHtml = `
              <span class="tile-badge-icon">🐍</span>
              <span class="tile-jump-tag snake-tag">↓${SNAKES[tileNumber]}</span>
            `;
          } else if (CHALLENGE_TILES.includes(tileNumber)) {
            tileEl.classList.add('tile-challenge');
            badgeHtml = `
              <span class="tile-badge-icon">⚡</span>
              <span class="tile-jump-tag challenge-tag">Tantangan</span>
            `;
          }

          tileEl.innerHTML = `
            <span class="tile-number">${tileNumber}</span>
            ${badgeHtml}
          `;

          this.dom.boardGrid.appendChild(tileEl);
        }
      }
    }

    /* ==========================================================================
       REALISTIC SNAKES & 3D LADDERS SVG RENDERER
       ========================================================================== */
    renderSnakesAndLadders() {
      this.dom.svgLaddersGroup.innerHTML = '';
      this.dom.svgSnakesGroup.innerHTML = '';

      // Render 3D Ladders
      Object.entries(LADDERS).forEach(([from, to]) => {
        const start = getTileGridCoords(parseInt(from, 10));
        const end = getTileGridCoords(parseInt(to, 10));
        const ladderSvg = this.createRealisticLadderSvg(start.svgX, start.svgY, end.svgX, end.svgY);
        this.dom.svgLaddersGroup.appendChild(ladderSvg);
      });

      // Render Realistic Snakes (Each with unique species colors & patterns)
      const snakeSpecies = [
        { grad: 'url(#snakeViperGrad)', belly: '#dcfce7', pattern: '#022c22', eye: '#fef08a' }, // Emerald Viper
        { grad: 'url(#snakeCoralGrad)', belly: '#fef08a', pattern: '#18181b', eye: '#ffffff' }, // Crimson Coral
        { grad: 'url(#snakeAmethystGrad)', belly: '#fae8ff', pattern: '#3b0764', eye: '#fde047' }, // Amethyst Cobra
        { grad: 'url(#snakeGoldenGrad)', belly: '#fef9c3', pattern: '#78350f', eye: '#ef4444' }  // Golden Python
      ];
      let snakeIndex = 0;

      Object.entries(SNAKES).forEach(([head, tail]) => {
        const start = getTileGridCoords(parseInt(head, 10));
        const end = getTileGridCoords(parseInt(tail, 10));
        const species = snakeSpecies[snakeIndex % snakeSpecies.length];
        snakeIndex++;

        const snakeSvg = this.createRealisticSnakeSvg(start.svgX, start.svgY, end.svgX, end.svgY, species);
        this.dom.svgSnakesGroup.appendChild(snakeSvg);
      });
    }

    createRealisticLadderSvg(x1, y1, x2, y2) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('filter', 'url(#elementShadow)');

      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      const ladderWidth = 19;
      const perpX = -Math.sin(angle) * (ladderWidth / 2);
      const perpY = Math.cos(angle) * (ladderWidth / 2);

      // Left Rail (Wooden 3D)
      const rail1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rail1.setAttribute('x1', x1 + perpX);
      rail1.setAttribute('y1', y1 + perpY);
      rail1.setAttribute('x2', x2 + perpX);
      rail1.setAttribute('y2', y2 + perpY);
      rail1.setAttribute('stroke', 'url(#ladderWoodGrad)');
      rail1.setAttribute('stroke-width', '6');
      rail1.setAttribute('stroke-linecap', 'round');
      g.appendChild(rail1);

      // Left Rail Highlight (Bevel Edge)
      const rail1Light = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rail1Light.setAttribute('x1', x1 + perpX - 1);
      rail1Light.setAttribute('y1', y1 + perpY - 1);
      rail1Light.setAttribute('x2', x2 + perpX - 1);
      rail1Light.setAttribute('y2', y2 + perpY - 1);
      rail1Light.setAttribute('stroke', 'rgba(255, 255, 255, 0.45)');
      rail1Light.setAttribute('stroke-width', '1.5');
      rail1Light.setAttribute('stroke-linecap', 'round');
      g.appendChild(rail1Light);

      // Right Rail (Wooden 3D)
      const rail2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rail2.setAttribute('x1', x1 - perpX);
      rail2.setAttribute('y1', y1 - perpY);
      rail2.setAttribute('x2', x2 - perpX);
      rail2.setAttribute('y2', y2 - perpY);
      rail2.setAttribute('stroke', 'url(#ladderWoodGrad)');
      rail2.setAttribute('stroke-width', '6');
      rail2.setAttribute('stroke-linecap', 'round');
      g.appendChild(rail2);

      // Cross Rungs with Golden Accents & Metal Brackets
      const rungSpacing = 30;
      const numRungs = Math.max(2, Math.floor(length / rungSpacing));

      for (let i = 1; i <= numRungs; i++) {
        const t = i / (numRungs + 1);
        const rungCenterX = x1 + dx * t;
        const rungCenterY = y1 + dy * t;

        const rx1 = rungCenterX + perpX;
        const ry1 = rungCenterY + perpY;
        const rx2 = rungCenterX - perpX;
        const ry2 = rungCenterY - perpY;

        // Rung Core
        const rung = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rung.setAttribute('x1', rx1);
        rung.setAttribute('y1', ry1);
        rung.setAttribute('x2', rx2);
        rung.setAttribute('y2', ry2);
        rung.setAttribute('stroke', 'url(#ladderRungGrad)');
        rung.setAttribute('stroke-width', '4');
        rung.setAttribute('stroke-linecap', 'round');
        g.appendChild(rung);

        // Metal Bracket Joints
        const joint1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        joint1.setAttribute('cx', rx1);
        joint1.setAttribute('cy', ry1);
        joint1.setAttribute('r', '2.5');
        joint1.setAttribute('fill', '#fef08a');
        g.appendChild(joint1);

        const joint2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        joint2.setAttribute('cx', rx2);
        joint2.setAttribute('cy', ry2);
        joint2.setAttribute('r', '2.5');
        joint2.setAttribute('fill', '#fef08a');
        g.appendChild(joint2);
      }

      return g;
    }

    createRealisticSnakeSvg(hx, hy, tx, ty, species) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('filter', 'url(#snakeShadow)');

      const dx = tx - hx;
      const dy = ty - hy;
      const angle = Math.atan2(dy, dx);
      const perpX = -Math.sin(angle) * 40;
      const perpY = Math.cos(angle) * 40;

      // Two organic control points for natural serpentine curves
      const cp1x = hx + dx * 0.32 + perpX;
      const cp1y = hy + dy * 0.32 + perpY;
      const cp2x = hx + dx * 0.68 - perpX;
      const cp2y = hy + dy * 0.68 - perpY;

      const pathData = `M ${hx} ${hy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tx} ${ty}`;

      // 1. Snake Realistic Thick Main Body
      const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      body.setAttribute('d', pathData);
      body.setAttribute('fill', 'none');
      body.setAttribute('stroke', species.grad);
      body.setAttribute('stroke-width', '22');
      body.setAttribute('stroke-linecap', 'round');
      g.appendChild(body);

      // 2. Realistic Cross-Scales & Diamond Pattern Overlay
      const scalesPattern = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      scalesPattern.setAttribute('d', pathData);
      scalesPattern.setAttribute('fill', 'none');
      scalesPattern.setAttribute('stroke', species.pattern);
      scalesPattern.setAttribute('stroke-width', '16');
      scalesPattern.setAttribute('stroke-linecap', 'round');
      scalesPattern.setAttribute('stroke-dasharray', '8 12');
      g.appendChild(scalesPattern);

      // 3. Snake Ventral Underbelly (Light scales plate stripe)
      const belly = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      belly.setAttribute('d', pathData);
      belly.setAttribute('fill', 'none');
      belly.setAttribute('stroke', species.belly);
      belly.setAttribute('stroke-width', '7');
      belly.setAttribute('stroke-linecap', 'round');
      belly.setAttribute('stroke-dasharray', '5 4');
      g.appendChild(belly);

      // 4. Specular Spine Highlight (Gives round 3D cylindrical shine)
      const spineShine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      spineShine.setAttribute('d', pathData);
      spineShine.setAttribute('fill', 'none');
      spineShine.setAttribute('stroke', 'rgba(255, 255, 255, 0.4)');
      spineShine.setAttribute('stroke-width', '2.5');
      spineShine.setAttribute('stroke-linecap', 'round');
      g.appendChild(spineShine);

      // 5. Tapered Tail with Rattle Rings at (tx, ty)
      for (let r = 1; r <= 3; r++) {
        const rattle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const rDist = r * 5;
        const rx = tx - Math.cos(angle) * rDist;
        const ry = ty - Math.sin(angle) * rDist;
        rattle.setAttribute('cx', rx);
        rattle.setAttribute('cy', ry);
        rattle.setAttribute('r', `${5 - r * 0.8}`);
        rattle.setAttribute('fill', species.belly);
        rattle.setAttribute('stroke', '#78350f');
        rattle.setAttribute('stroke-width', '1.2');
        g.appendChild(rattle);
      }

      // 6. Realistic Viper/Cobra Head (Triangular Diamond Shaped at hx, hy)
      const headGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Head direction points backwards from body entry
      const headAngle = angle + Math.PI;
      const headLength = 26;
      const headWidth = 20;

      const noseX = hx + Math.cos(headAngle) * headLength;
      const noseY = hy + Math.sin(headAngle) * headLength;

      const leftJawX = hx + Math.cos(headAngle + Math.PI * 0.6) * headWidth;
      const leftJawY = hy + Math.sin(headAngle + Math.PI * 0.6) * headWidth;

      const rightJawX = hx + Math.cos(headAngle - Math.PI * 0.6) * headWidth;
      const rightJawY = hy + Math.sin(headAngle - Math.PI * 0.6) * headWidth;

      // Realistic Viper Head Crown (Hexagonal/Diamond polygon)
      const headCrown = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const pts = `${noseX},${noseY} ${leftJawX},${leftJawY} ${hx},${hy} ${rightJawX},${rightJawY}`;
      headCrown.setAttribute('points', pts);
      headCrown.setAttribute('fill', species.pattern);
      headCrown.setAttribute('stroke', '#ffffff');
      headCrown.setAttribute('stroke-width', '1.5');
      headGroup.appendChild(headCrown);

      // Head Plate Texture
      const headPlate = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const innerNoseX = hx + Math.cos(headAngle) * (headLength * 0.75);
      const innerNoseY = hy + Math.sin(headAngle) * (headLength * 0.75);
      const innerLeftX = hx + Math.cos(headAngle + Math.PI * 0.5) * (headWidth * 0.6);
      const innerLeftY = hy + Math.sin(headAngle + Math.PI * 0.5) * (headWidth * 0.6);
      const innerRightX = hx + Math.cos(headAngle - Math.PI * 0.5) * (headWidth * 0.6);
      const innerRightY = hy + Math.sin(headAngle - Math.PI * 0.5) * (headWidth * 0.6);
      headPlate.setAttribute('points', `${innerNoseX},${innerNoseY} ${innerLeftX},${innerLeftY} ${hx},${hy} ${innerRightX},${innerRightY}`);
      headPlate.setAttribute('fill', species.belly);
      headPlate.setAttribute('opacity', '0.85');
      headGroup.appendChild(headPlate);

      // Realistic Predatory Eyes (Glowing Yellow/White with Slit Pupils)
      const eyeOffsetAngle = 0.42;
      const eyeDist = 13;

      // Left Eye
      const eye1X = hx + Math.cos(headAngle + eyeOffsetAngle) * eyeDist;
      const eye1Y = hy + Math.sin(headAngle + eyeOffsetAngle) * eyeDist;
      const eye1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      eye1.setAttribute('cx', eye1X);
      eye1.setAttribute('cy', eye1Y);
      eye1.setAttribute('r', '3.8');
      eye1.setAttribute('fill', species.eye);
      eye1.setAttribute('stroke', '#000000');
      eye1.setAttribute('stroke-width', '1');
      headGroup.appendChild(eye1);

      const pupil1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      pupil1.setAttribute('cx', eye1X);
      pupil1.setAttribute('cy', eye1Y);
      pupil1.setAttribute('rx', '1');
      pupil1.setAttribute('ry', '3');
      pupil1.setAttribute('transform', `rotate(${(headAngle * 180 / Math.PI) + 90}, ${eye1X}, ${eye1Y})`);
      pupil1.setAttribute('fill', '#090d16');
      headGroup.appendChild(pupil1);

      // Right Eye
      const eye2X = hx + Math.cos(headAngle - eyeOffsetAngle) * eyeDist;
      const eye2Y = hy + Math.sin(headAngle - eyeOffsetAngle) * eyeDist;
      const eye2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      eye2.setAttribute('cx', eye2X);
      eye2.setAttribute('cy', eye2Y);
      eye2.setAttribute('r', '3.8');
      eye2.setAttribute('fill', species.eye);
      eye2.setAttribute('stroke', '#000000');
      eye2.setAttribute('stroke-width', '1');
      headGroup.appendChild(eye2);

      const pupil2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      pupil2.setAttribute('cx', eye2X);
      pupil2.setAttribute('cy', eye2Y);
      pupil2.setAttribute('rx', '1');
      pupil2.setAttribute('ry', '3');
      pupil2.setAttribute('transform', `rotate(${(headAngle * 180 / Math.PI) + 90}, ${eye2X}, ${eye2Y})`);
      pupil2.setAttribute('fill', '#090d16');
      headGroup.appendChild(pupil2);

      // Nostrils (Pit Organs)
      const nostrilDist = headLength * 0.85;
      const nostril1X = hx + Math.cos(headAngle + 0.18) * nostrilDist;
      const nostril1Y = hy + Math.sin(headAngle + 0.18) * nostrilDist;
      const nostril2X = hx + Math.cos(headAngle - 0.18) * nostrilDist;
      const nostril2Y = hy + Math.sin(headAngle - 0.18) * nostrilDist;

      const n1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      n1.setAttribute('cx', nostril1X);
      n1.setAttribute('cy', nostril1Y);
      n1.setAttribute('r', '1.2');
      n1.setAttribute('fill', '#000000');
      headGroup.appendChild(n1);

      const n2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      n2.setAttribute('cx', nostril2X);
      n2.setAttribute('cy', nostril2Y);
      n2.setAttribute('r', '1.2');
      n2.setAttribute('fill', '#000000');
      headGroup.appendChild(n2);

      // Sharp White Fangs
      const fangLeft = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      fangLeft.setAttribute('points', `${innerNoseX},${innerNoseY} ${innerNoseX + Math.cos(headAngle - 0.4) * 5},${innerNoseY + Math.sin(headAngle - 0.4) * 5} ${innerNoseX - 2},${innerNoseY}`);
      fangLeft.setAttribute('fill', '#ffffff');
      headGroup.appendChild(fangLeft);

      // Long Crimson Forked Tongue Flicking Out
      const tongueRootX = noseX;
      const tongueRootY = noseY;
      const tongueTipX = tongueRootX + Math.cos(headAngle) * 16;
      const tongueTipY = tongueRootY + Math.sin(headAngle) * 16;

      const fork1X = tongueTipX + Math.cos(headAngle + 0.5) * 7;
      const fork1Y = tongueTipY + Math.sin(headAngle + 0.5) * 7;
      const fork2X = tongueTipX + Math.cos(headAngle - 0.5) * 7;
      const fork2Y = tongueTipY + Math.sin(headAngle - 0.5) * 7;

      const tongue = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tongue.setAttribute('d', `M ${tongueRootX} ${tongueRootY} L ${tongueTipX} ${tongueTipY} M ${tongueTipX} ${tongueTipY} L ${fork1X} ${fork1Y} M ${tongueTipX} ${tongueTipY} L ${fork2X} ${fork2Y}`);
      tongue.setAttribute('stroke', '#dc2626');
      tongue.setAttribute('stroke-width', '2.5');
      tongue.setAttribute('stroke-linecap', 'round');
      headGroup.appendChild(tongue);

      g.appendChild(headGroup);
      return g;
    }

    createPawnElements() {
      this.dom.pawnsContainer.innerHTML = '';

      this.players.forEach((p) => {
        const pawnEl = document.createElement('div');
        pawnEl.className = `pawn-token pawn-${p.class}`;
        pawnEl.id = `pawn-${p.id}`;
        pawnEl.style.color = p.color;

        pawnEl.innerHTML = `
          <div class="pawn-figure">
            <div class="pawn-pin">
              <span>${p.avatar}</span>
            </div>
          </div>
        `;

        this.dom.pawnsContainer.appendChild(pawnEl);
      });

      this.updateAllPawnPositions(false);
    }

    updateAllPawnPositions(animate = true) {
      this.players.forEach((p) => {
        this.positionPawnOnTile(p, p.position, animate, false);
      });
    }

    positionPawnOnTile(player, tileNumber, animate = true, isMidHop = false) {
      const pawnEl = document.getElementById(`pawn-${player.id}`);
      if (!pawnEl) return;

      const coords = getTileGridCoords(tileNumber);

      let offset = { dx: 0, dy: 0 };
      if (!isMidHop && this.players) {
        // Hitung pemain yang berada di kotak petak yang sama
        const sameTilePlayers = this.players.filter(p => p.position === tileNumber);
        const total = sameTilePlayers.length;
        const pIndex = sameTilePlayers.findIndex(p => p.id === player.id);
        offset = getPawnOffsetForTile(pIndex >= 0 ? pIndex : 0, total);
      }

      const x = coords.xPercent + offset.dx;
      const y = coords.yPercent + offset.dy;

      if (!animate) {
        pawnEl.style.transition = 'none';
      } else {
        const duration = this.moveSpeed === 'normal' ? '0.28s' : '0.14s';
        pawnEl.style.transition = `left ${duration} ease, top ${duration} ease, transform ${duration} cubic-bezier(0.34, 1.56, 0.64, 1)`;
      }

      pawnEl.style.left = `${x}%`;
      pawnEl.style.top = `${y}%`;

      if (!animate) {
        void pawnEl.offsetHeight;
        pawnEl.style.transition = '';
      }
    }

    updateTurnUI() {
      const cur = this.players[this.currentPlayerIndex];

      this.dom.turnCard.style.borderColor = cur.color;
      this.dom.turnCard.style.boxShadow = `0 8px 24px ${cur.color}50`;
      this.dom.turnAvatarBadge.textContent = cur.avatar;
      this.dom.turnAvatarBadge.style.background = cur.color;
      this.dom.turnPlayerName.textContent = cur.name;
      this.dom.turnPlayerName.style.color = cur.color;

      if (cur.isBot) {
        this.dom.turnPlayerStatus.textContent = '🤖 Bot sedang berpikir...';
        this.dom.btnRollDice.disabled = true;
      } else {
        this.dom.turnPlayerStatus.textContent = 'Giliranmu! Tekan Kocok Dadu atau [Spasi]';
        this.dom.btnRollDice.disabled = false;
      }

      document.querySelectorAll('.pawn-token').forEach(el => el.classList.remove('active-turn'));
      const activePawn = document.getElementById(`pawn-${cur.id}`);
      if (activePawn) activePawn.classList.add('active-turn');

      this.updateSidebarUI();
    }

    updateSidebarUI() {
      this.dom.turnCounter.textContent = `Ronde: ${this.turnRound}`;
      this.dom.playersMiniList.innerHTML = '';

      const sorted = [...this.players].sort((a, b) => b.position - a.position);

      sorted.forEach(p => {
        const isCurrent = (p.id === this.players[this.currentPlayerIndex].id);
        const row = document.createElement('div');
        row.className = `player-mini-row ${isCurrent ? 'active-turn' : ''}`;
        row.style.borderLeftColor = p.color;

        row.innerHTML = `
          <div class="mini-pawn-dot" style="background-color: ${p.color};"></div>
          <span class="mini-player-name" style="color: ${isCurrent ? p.color : '#1e293b'};">
            ${p.avatar} ${p.name} ${p.isBot ? '🤖' : ''}
          </span>
          <span class="mini-player-pos">Kotak ${p.position}</span>
        `;

        this.dom.playersMiniList.appendChild(row);
      });
    }

    addLog(icon, text, type = 'normal') {
      const entry = document.createElement('div');
      entry.className = `log-entry ${type}`;
      entry.innerHTML = `
        <span class="log-icon">${icon}</span>
        <span class="log-text">${text}</span>
      `;
      this.dom.gameLogStream.appendChild(entry);
      this.dom.gameLogStream.scrollTop = this.dom.gameLogStream.scrollHeight;
    }

    clearLog() {
      this.dom.gameLogStream.innerHTML = '';
    }

    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      this.dom.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }

    handleHumanRoll() {
      const cur = this.players[this.currentPlayerIndex];
      if (cur.isBot || this.isRolling || this.isMoving || this.isGameOver) return;
      this.executeDiceRoll();
    }

    checkBotTurn() {
      if (this.isGameOver) return;
      const cur = this.players[this.currentPlayerIndex];
      if (!cur.isBot) return;

      setTimeout(() => {
        if (!this.isGameOver && cur.isBot && !this.isRolling && !this.isMoving) {
          this.executeDiceRoll();
        }
      }, 1000);
    }

    executeDiceRoll() {
      this.isRolling = true;
      this.dom.btnRollDice.disabled = true;

      const cur = this.players[this.currentPlayerIndex];
      cur.turnsTaken++;
      this.stats.totalTurns++;

      this.dom.diceCube.className = 'dice-cube rolling';
      this.sound.playDiceRoll();

      this.dom.diceResultNumber.textContent = '...';
      this.dom.diceResultText.textContent = `${cur.name} mengocok dadu...`;

      setTimeout(() => {
        const rollValue = Math.floor(Math.random() * 6) + 1;
        this.dom.diceCube.className = `dice-cube show-${rollValue}`;
        this.dom.diceResultNumber.textContent = rollValue;
        this.dom.diceResultText.textContent = `Angka ${rollValue}!`;

        this.addLog('🎲', `${cur.name} mendapat angka dadu <strong>${rollValue}</strong>`);

        this.isRolling = false;
        setTimeout(() => {
          this.movePawnStepByStep(cur, rollValue);
        }, 350);
      }, 750);
    }

    movePawnStepByStep(player, steps) {
      this.isMoving = true;
      const pawnEl = document.getElementById(`pawn-${player.id}`);

      let stepsRemaining = steps;
      let currentPos = player.position;
      let movingForward = true;
      let stepCounter = 1;

      const stepDelay = this.moveSpeed === 'normal' ? 260 : 130;

      const stepInterval = setInterval(() => {
        if (stepsRemaining <= 0) {
          clearInterval(stepInterval);
          player.position = currentPos;
          this.isMoving = false;
          this.updateAllPawnPositions(true);
          this.handleTileLanding(player, steps);
          return;
        }

        if (movingForward) {
          if (currentPos < 100) {
            currentPos++;
          } else {
            movingForward = false;
            currentPos--;
            this.showToast('Memantul dari kotak 100! ↩️');
            this.addLog('↩️', `${player.name} memantul dari kotak 100!`);
          }
        } else {
          currentPos--;
        }

        this.positionPawnOnTile(player, currentPos, true, true);

        if (pawnEl) {
          pawnEl.classList.remove('hopping');
          void pawnEl.offsetWidth;
          pawnEl.classList.add('hopping');
        }
        this.sound.playStep(stepCounter);

        stepCounter++;
        stepsRemaining--;
        this.updateSidebarUI();
      }, stepDelay);
    }

    handleTileLanding(player, lastRoll) {
      const pos = player.position;

      if (pos === 100) {
        this.handleGameWon(player);
        return;
      }

      if (LADDERS[pos]) {
        const dest = LADDERS[pos];
        player.laddersClimbed++;
        this.stats.totalLadders++;

        setTimeout(() => {
          this.sound.playLadder();
          this.flashTile(pos, '#10b981');
          this.showToast(`${player.name} Naik Tangga Berkah ke ${dest}! 🪜`);
          this.addLog('🪜', `${player.name} naik tangga dari <strong>${pos}</strong> ke <strong>${dest}</strong>!`, 'ladder');

          player.position = dest;
          this.updateAllPawnPositions(true);
          this.updateSidebarUI();

          setTimeout(() => {
            this.concludeTurn(player, lastRoll);
          }, 600);
        }, 400);
        return;
      }

      if (SNAKES[pos]) {
        const dest = SNAKES[pos];
        player.snakesBitten++;
        this.stats.totalSnakes++;

        setTimeout(() => {
          this.sound.playSnake();
          this.flashTile(pos, '#ef4444');
          this.showToast(`${player.name} Digigit Ular Licik turun ke ${dest}! 🐍`);
          this.addLog('🐍', `${player.name} digigit ular dari <strong>${pos}</strong> turun ke <strong>${dest}</strong>!`, 'snake');

          player.position = dest;
          this.updateAllPawnPositions(true);
          this.updateSidebarUI();

          setTimeout(() => {
            this.concludeTurn(player, lastRoll);
          }, 600);
        }, 400);
        return;
      }

      if (CHALLENGE_TILES.includes(pos)) {
        this.showChallengeModal(player, lastRoll);
        return; // pause turn for challenge
      }
      this.concludeTurn(player, lastRoll);
    }

    flashTile(tileNumber, color) {
      const coords = getTileGridCoords(tileNumber);
      const pulse = document.createElement('div');
      pulse.className = 'tile-pulse-box';
      pulse.style.left = `${coords.xPercent - 5}%`;
      pulse.style.top = `${coords.yPercent - 5}%`;
      pulse.style.width = '10%';
      pulse.style.height = '10%';
      pulse.style.boxShadow = `0 0 25px ${color}, inset 0 0 15px ${color}`;
      pulse.style.border = `3px solid ${color}`;

      this.dom.tileEffectsLayer.appendChild(pulse);
      setTimeout(() => pulse.remove(), 1200);
    }

    /* ==========================================================================
       SISTEM TANTANGAN INTERAKTIF & 15 KARTU HUKUMAN ACAK
       ========================================================================== */
    showChallengeModal(player, lastRoll) {
      this.activeChallengePlayer = player;
      this.activeChallengeRoll = lastRoll;
      this.challengeTimerId = null;

      // Efek visual & audio saat mendarat di kotak tantangan
      this.flashTile(player.position, '#8b5cf6');
      this.sound.playClick();
      this.showToast(`⚡ ${player.name} Mendarat di Kotak Tantangan ${player.position}!`);
      this.addLog('⚡', `${player.name} mendarat di Kotak Tantangan <strong>${player.position}</strong>!`, 'system');

      // Ambil satu tantangan secara acak dari bank tantangan
      const challenge = CHALLENGE_DATA[Math.floor(Math.random() * CHALLENGE_DATA.length)];
      this.currentChallenge = challenge;

      // Update Header Modal Tantangan
      if (this.dom.challengeCategoryPill) {
        this.dom.challengeCategoryPill.textContent = challenge.category;
      }
      if (this.dom.challengeTitle) {
        this.dom.challengeTitle.textContent = `${player.avatar} ${challenge.title}`;
      }
      if (this.dom.challengeDesc) {
        this.dom.challengeDesc.innerHTML = `Pemain <strong>${player.name}</strong>: ${challenge.desc}`;
      }

      // Reset Content Arena
      this.dom.challengeContentBox.innerHTML = '';

      if (challenge.type === 'quiz') {
        // Tipe Kuis Pilihan Ganda Interaktif
        const questionEl = document.createElement('div');
        questionEl.className = 'quiz-question-text';
        questionEl.style.fontSize = '1.15rem';
        questionEl.style.fontWeight = '800';
        questionEl.style.color = '#1e1b4b';
        questionEl.style.marginBottom = '12px';
        questionEl.textContent = challenge.question;

        const optionsList = document.createElement('div');
        optionsList.className = 'quiz-options-list';

        challenge.options.forEach((optText, optIdx) => {
          const optBtn = document.createElement('button');
          optBtn.type = 'button';
          optBtn.className = 'quiz-option-btn';
          optBtn.textContent = optText;

          optBtn.addEventListener('click', () => {
            if (this.quizAnswered) return;
            this.quizAnswered = true;
            this.sound.playClick();

            if (optIdx === challenge.correctIndex) {
              optBtn.classList.add('correct');
              this.showToast('Jawaban Benar! Luar Biasa! 🎉');
              this.sound.playLadder();
              setTimeout(() => {
                this.handleChallengeSuccess();
              }, 700);
            } else {
              optBtn.classList.add('wrong');
              // Highlight jawaban yang benar
              const correctBtn = optionsList.children[challenge.correctIndex];
              if (correctBtn) correctBtn.classList.add('correct');
              this.showToast('Jawaban Belum Tepat! Kena Hukuman ❌');
              this.sound.playSnake();
              setTimeout(() => {
                this.handleChallengeFail();
              }, 1100);
            }
          });

          optionsList.appendChild(optBtn);
        });

        this.quizAnswered = false;
        this.dom.challengeContentBox.appendChild(questionEl);
        this.dom.challengeContentBox.appendChild(optionsList);
      } else {
        // Tipe Tongue Twister, Pantomim / Tebak Gaya, Nyanyi, atau Aksi Ceria
        const textEl = document.createElement('div');
        textEl.style.fontSize = '1.25rem';
        textEl.style.fontWeight = '800';
        textEl.style.lineHeight = '1.5';
        textEl.style.color = '#312e81';
        textEl.innerHTML = challenge.content;
        this.dom.challengeContentBox.appendChild(textEl);
      }

      // Tampilkan Modal Tantangan
      this.dom.modalChallenge.classList.add('show');

      // Mulai Countdown Timer Visual
      this.startChallengeTimer(challenge.seconds || 12);

      // Jika BOT yang kena tantangan: Simulasi bot berpikir & merespons otomatis
      if (player.isBot) {
        if (this.dom.btnChallengeSuccess) this.dom.btnChallengeSuccess.disabled = true;
        if (this.dom.btnChallengeFail) this.dom.btnChallengeFail.disabled = true;
        if (this.dom.challengeDesc) {
          this.dom.challengeDesc.innerHTML = `🤖 <em>Bot ${player.name} sedang memproses tantangan...</em>`;
        }

        setTimeout(() => {
          const botWins = Math.random() < 0.72;
          if (botWins) {
            this.handleChallengeSuccess();
          } else {
            this.handleChallengeFail();
          }
          if (this.dom.btnChallengeSuccess) this.dom.btnChallengeSuccess.disabled = false;
          if (this.dom.btnChallengeFail) this.dom.btnChallengeFail.disabled = false;
        }, 2400);
      }
    }

    startChallengeTimer(totalSeconds) {
      this.stopChallengeTimer();
      let remaining = totalSeconds;
      if (this.dom.timerSecondsText) {
        this.dom.timerSecondsText.textContent = remaining;
      }
      if (this.dom.timerBarFill) {
        this.dom.timerBarFill.style.transition = 'none';
        this.dom.timerBarFill.style.width = '100%';
        setTimeout(() => {
          if (this.dom.timerBarFill) {
            this.dom.timerBarFill.style.transition = `width ${totalSeconds}s linear`;
            this.dom.timerBarFill.style.width = '0%';
          }
        }, 50);
      }

      this.challengeTimerId = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          if (this.dom.timerSecondsText) this.dom.timerSecondsText.textContent = '0';
          this.stopChallengeTimer();
          // Jika waktu habis dan modal masih terbuka, otomatis gagal & buka kartu hukuman
          if (this.dom.modalChallenge && this.dom.modalChallenge.classList.contains('show')) {
            this.showToast('Waktu Habis! Ambil Kartu Hukuman ⏰');
            this.handleChallengeFail();
          }
        } else {
          if (this.dom.timerSecondsText) this.dom.timerSecondsText.textContent = remaining;
        }
      }, 1000);
    }

    stopChallengeTimer() {
      if (this.challengeTimerId) {
        clearInterval(this.challengeTimerId);
        this.challengeTimerId = null;
      }
    }

    handleChallengeSuccess() {
      this.stopChallengeTimer();
      const player = this.activeChallengePlayer;
      const roll = this.activeChallengeRoll;

      if (this.dom.modalChallenge) {
        this.dom.modalChallenge.classList.remove('show');
      }
      this.showToast(`${player.name} Sukses Melibas Tantangan! Horeee! 🎉`);
      this.addLog('✨', `🎉 <strong>${player.name}</strong> sukses menyelesaikan tantangan dengan gemilang!`);
      this.sound.playLadder();

      setTimeout(() => {
        this.concludeTurn(player, roll);
      }, 500);
    }

    handleChallengeFail() {
      this.stopChallengeTimer();
      const player = this.activeChallengePlayer;

      if (this.dom.modalChallenge) {
        this.dom.modalChallenge.classList.remove('show');
      }
      this.showToast(`${player.name} Gagal! Bersiap Buka Kartu Hukuman! 🃏`);
      this.addLog('⚠️', `❌ <strong>${player.name}</strong> belum berhasil dalam tantangan dan harus menarik Kartu Hukuman!`);
      this.sound.playSnake();

      setTimeout(() => {
        this.drawPunishmentCard(player);
      }, 400);
    }

    drawPunishmentCard(player) {
      // Ambil kartu acak dari PUNISHMENT_DECK (15 kartu)
      const randomCard = PUNISHMENT_DECK[Math.floor(Math.random() * PUNISHMENT_DECK.length)];
      this.currentPunishment = randomCard;

      // Isi elemen kartu
      if (this.dom.card3dInner) {
        this.dom.card3dInner.classList.remove('flipped');
      }
      if (this.dom.punishmentIcon) {
        this.dom.punishmentIcon.textContent = randomCard.icon || '⚡';
      }
      if (this.dom.punishmentName) {
        this.dom.punishmentName.textContent = randomCard.title;
      }
      if (this.dom.punishmentDetail) {
        this.dom.punishmentDetail.textContent = randomCard.detail;
      }
      if (this.dom.punishmentCardNo) {
        this.dom.punishmentCardNo.textContent = `Kartu #${randomCard.id} dari 15 Deck Hukuman`;
      }

      // Tampilkan modal kartu hukuman
      if (this.dom.modalPunishment) {
        this.dom.modalPunishment.classList.add('show');
      }

      // Animasi 3D membalik kartu terbuka secara otomatis
      setTimeout(() => {
        if (this.dom.card3dInner) {
          this.dom.card3dInner.classList.add('flipped');
          this.sound.playClick();
        }
      }, 400);

      // Jika Bot yang kena hukuman: otomatis lanjut setelah 2.6 detik
      if (player.isBot && this.dom.btnApplyPunishment) {
        this.dom.btnApplyPunishment.disabled = true;
        setTimeout(() => {
          if (this.dom.btnApplyPunishment) this.dom.btnApplyPunishment.disabled = false;
          this.applyPunishmentAndContinue();
        }, 2600);
      }
    }

    applyPunishmentAndContinue() {
      const player = this.activeChallengePlayer;
      const card = this.currentPunishment;
      const roll = this.activeChallengeRoll;

      if (this.dom.modalPunishment) {
        this.dom.modalPunishment.classList.remove('show');
      }

      if (!card) {
        this.concludeTurn(player, roll);
        return;
      }

      this.addLog('🃏', `${player.name} menerima hukuman: <strong>${card.title}</strong> (${card.detail})`);

      // Cek apakah ada langkah mundur
      let stepsToBack = 0;
      if (card.stepsBack === 'lastRoll') {
        stepsToBack = roll || 1;
      } else if (typeof card.stepsBack === 'number' && card.stepsBack > 0) {
        stepsToBack = card.stepsBack;
      }

      if (stepsToBack > 0) {
        this.showToast(`${player.name} Mundur ${stepsToBack} langkah sesuai kartu! 💥`);
        this.movePawnBackwards(player, stepsToBack, () => {
          this.concludeTurn(player, roll);
        });
      } else {
        this.showToast(`${player.name}: Jalankan Hukuman "${card.title}"! 😂`);
        setTimeout(() => {
          this.concludeTurn(player, roll);
        }, 500);
      }
    }

    movePawnBackwards(player, steps, onComplete) {
      let remaining = steps;
      const stepDelay = this.moveSpeed === 'normal' ? 240 : 120;

      const stepInterval = setInterval(() => {
        if (remaining <= 0 || player.position <= 1) {
          clearInterval(stepInterval);
          this.updateAllPawnPositions(true);
          this.updateSidebarUI();
          if (onComplete) onComplete();
          return;
        }

        player.position--;
        remaining--;
        this.positionPawnOnTile(player, player.position, true, true);
        this.sound.playStep(1);
        this.updateSidebarUI();
      }, stepDelay);
    }

    concludeTurn(player, lastRoll) {
      if (lastRoll === 6 && this.consecutiveSixes < 2) {
        this.consecutiveSixes++;
        this.showToast(`${player.name} dapat angka 6! Bonus Kocok Lagi! 🎲`);
        this.addLog('⭐', `Bonus giliran untuk ${player.name} karena mendapat angka 6!`);
        this.updateTurnUI();
        this.checkBotTurn();
        return;
      }

      this.consecutiveSixes = 0;
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      if (this.currentPlayerIndex === 0) {
        this.turnRound++;
      }

      this.updateTurnUI();
      this.checkBotTurn();
    }

    handleGameWon(champion) {
      this.isGameOver = true;
      this.sound.playVictory();
      this.confetti.start();

      this.dom.championName.textContent = champion.name;
      this.dom.championName.style.color = champion.color;

      champion.rank = 1;
      const otherPlayers = this.players
        .filter(p => p.id !== champion.id)
        .sort((a, b) => b.position - a.position);

      otherPlayers.forEach((p, idx) => {
        p.rank = idx + 2;
      });

      const fullLeaderboard = [champion, ...otherPlayers];

      this.dom.leaderboardPodiumList.innerHTML = '';
      fullLeaderboard.forEach(p => {
        const item = document.createElement('div');
        item.className = `podium-item rank-${p.rank}`;

        item.innerHTML = `
          <div class="podium-rank">${p.rank}</div>
          <div class="podium-avatar">${p.avatar}</div>
          <div class="podium-name" style="color: ${p.color};">
            ${p.name} ${p.isBot ? '(Bot)' : ''}
          </div>
          <div class="podium-tile-tag">
            ${p.rank === 1 ? '🎉 FINISH 100' : `Kotak ${p.position}`}
          </div>
        `;

        this.dom.leaderboardPodiumList.appendChild(item);
      });

      this.dom.statTotalTurns.textContent = this.stats.totalTurns;
      this.dom.statTotalLadders.textContent = this.stats.totalLadders;
      this.dom.statTotalSnakes.textContent = this.stats.totalSnakes;

      this.addLog('👑', `🏆 <strong>${champion.name}</strong> keluar sebagai JUARA 1!`);

      setTimeout(() => {
        this.dom.modalWinner.classList.add('show');
      }, 500);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new GameController();
  });
})();
