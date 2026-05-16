(function() {
  function $(id) {
    return document.getElementById(id);
  }

  var card   = $('card'),
      openB  = $('open'),
      closeB = $('close'),
      timer  = null;

  openB.addEventListener('click', function() {
    card.setAttribute('class', 'open-half');
    if (timer) clearTimeout(timer);
    timer = setTimeout(function() {
      card.setAttribute('class', 'open-fully');
      timer = null;
    }, 1000);
  });

  closeB.addEventListener('click', function() {
    card.setAttribute('class', 'close-half');
    if (timer) clearTimeout(timer); // FIX: was clearTimerout (typo)
    timer = setTimeout(function() {
      card.setAttribute('class', '');
      timer = null;
    }, 1000);
  });

  // ─── Photo gallery ──────────────────────────────
  var polaroids = document.querySelectorAll('.polaroid');
  var indicator = document.getElementById('photo-indicator');
  var current   = 0;

  function showPhoto(index) {
    polaroids.forEach(function(p) { p.classList.remove('active'); });
    polaroids[index].classList.add('active');
    indicator.textContent = (index + 1) + ' / ' + polaroids.length;
  }

  document.getElementById('next-photo').addEventListener('click', function() {
    current = (current + 1) % polaroids.length;
    showPhoto(current);
  });

  document.getElementById('prev-photo').addEventListener('click', function() {
    current = (current - 1 + polaroids.length) % polaroids.length;
    showPhoto(current);
  });

  showPhoto(0);
 /* ─── Lyrics (timestamps in seconds) ───────────── */
   var OFFSET = -2; // <── ubah ini jika SEMUA lyric meleset serentak

  var lyrics = [
      // ── Intro ─────────────────────────────── (~0:00–0:13)
    { t:  0.0,  text: "🎵 Bitterlove — Ardhito Pramono" },
 
    // ── Verse 1 ───────────────────────────── (~0:14–0:36)
    { t:  4.5, text: "There is bitter in everyday" },
    { t:  10.5, text: "But then I feel it" },
    { t:  13.5, text: "That you would be the only one" },
    { t:  17.5, text: "Well sometimes, it doesn't have to be so sure" },
    { t:  24.5, text: "The sweetest love can be so hard to find" },
 
    // ── Verse 2 ───────────────────────────── (~0:37–0:57)
    { t:  30.5, text: "We'll be better, in every way" },
    { t:  36.5, text: "But, then I would go to be in other space" },
    { t:  43.5, text: "Sometimes, the bitter of love can be so good" },
    { t:  50.5, text: "It's like a coffee with a rainbow's mood" },
 
    // ── Chorus 1 ──────────────────────────── (~0:58–1:23)
    { t:  56.5, text: "Sometimes you feel off, but sometimes you're feeling right" },
    { t:  63.5, text: "Is it to be or it is not to be?" },
    { t:  69.5, text: "To fall in love again, to be the one for me" },
    { t:  75.5, text: "Sometimes you fall" },
    { t:  79.0, text: "But there'll be time, we'll be together" },
 
    // ── Verse 3 ───────────────────────────── (~1:26–1:46)
    { t:  82.5, text: "We'll be mad in every way" },
    { t:  88.5, text: "Then I remember the store we went last April" },
    { t:  95.5, text: "Sometimes, recalling things would be so good" },
    { t: 101.5, text: "It's like a perfect cake, that my grandma's made" },
 
    // ── Chorus 2 ──────────────────────────── (~1:48–2:13)

    { t: 134.0, text: "Sometimes you feel off, but sometimes you're feeling right" },
    { t: 140.0, text: "Is it to be or it is not to be?" },
    { t: 146.0, text: "To fall in love again, to be the one for me" },
    { t: 153.0, text: "Sometimes you fall" },
    { t: 156.0, text: "But there'll be time, we'll be together" },
 
    // ── Outro ─────────────────────────────── (~2:20–3:35)
    { t: 159.5, text: "We'll be better, in every way" },
    { t: 165.0, text: "But, then I would go to be in other space" },
    { t: 172.0, text: "Sometimes, the bitter of love can be so good" },
    { t: 179.0, text: "It's like a coffee with a rainbow" },
    { t: 182.0, text: "It's like a coffee with a rainbow" },
    { t: 185.2, text: "It's like a coffee with a rainbow's mood" },
    { t: 193.0, text: "With a rainbow's mood" },
    { t: 198.0, text: "LOVE U KIANA🩵 🎵" }
  ];
 
  /* ─── Build lyric DOM ───────────────────────────── */
  var lyricBox   = $('lyric-box');
  var lyricLines = $('lyric-lines');
 
  lyrics.forEach(function (l, i) {
    var el = document.createElement('div');
    el.className = 'lyric-line';
    el.textContent = l.text;
    el.dataset.index = i;
    lyricLines.appendChild(el);
  });
 
  var lineEls = lyricLines.querySelectorAll('.lyric-line');
 
  /* ─── Music Player ──────────────────────────────── */
  var audio       = $('bg-audio');
  var playBtn     = $('play-btn');
  var progressBar = $('progress-bar');
  var fill        = $('progress-fill');
  var timeDisplay = $('time-display');
  var lyricToggle = $('lyric-toggle');
  var activeLine  = -1;
 
  function formatTime(s) {
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }
 
  function updateLyrics(t) {
    var idx = -1;
    for (var i = 0; i < lyrics.length; i++) {
      if (t >= lyrics[i].t) idx = i;
      else break;
    }
    if (idx === activeLine) return;
    activeLine = idx;
 
    lineEls.forEach(function (el, i) {
      el.classList.remove('active', 'past');
      if (i < idx)  el.classList.add('past');
      if (i === idx) el.classList.add('active');
    });
 
    // Auto-scroll active line into view
    if (idx >= 0 && lineEls[idx]) {
      lineEls[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
 
  audio.addEventListener('timeupdate', function () {
    var t = audio.currentTime;
    var d = audio.duration || 1;
    fill.style.width = (t / d * 100) + '%';
    timeDisplay.textContent = formatTime(t);
    if (lyricBox.classList.contains('open')) {
      updateLyrics(t);
    }
  });
 
  audio.addEventListener('ended', function () {
    playBtn.textContent = '▶';
    playBtn.classList.remove('playing');
    activeLine = -1;
    lineEls.forEach(function (el) { el.classList.remove('active', 'past'); });
  });
 
  playBtn.addEventListener('click', function () {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = '⏸';
      playBtn.classList.add('playing');
    } else {
      audio.pause();
      playBtn.textContent = '▶';
      playBtn.classList.remove('playing');
    }
  });
 
  // Click on progress bar to seek
  progressBar.addEventListener('click', function (e) {
    var rect = progressBar.getBoundingClientRect();
    var ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * (audio.duration || 0);
  });
 
  // Toggle lyric panel
  lyricToggle.addEventListener('click', function () {
    lyricBox.classList.toggle('open');
    lyricToggle.classList.toggle('active');
    if (lyricBox.classList.contains('open')) {
      updateLyrics(audio.currentTime);
    }
  });
 
}());
 
