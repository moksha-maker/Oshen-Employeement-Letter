/* ============================================================
   DISHOOOM – OFFER LETTER SITE
   ============================================================ */

/* ---------- SETTINGS (edit these) ---------- */
var CONFIG = {
  // Where signed offers are sent. Paste a Formspree / Google Apps Script /
  // your own server URL. It receives a JSON POST: {name, id, signedAt, signature (PNG data URL), page}.
  // Leave empty to keep the signature in the browser only (they can still download a PDF).
  endpoint: "",
  employeeId: "200214000578",
  storageKey: "dishooom-signed-oshen"
};

/* ---------- SOUND (synthesised, no audio files needed) ---------- */
var Sound = (function () {
  var AC = null, muted = false;
  function ctx() {
    if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); }
    if (AC.state === "suspended") AC.resume();
    return AC;
  }
  function tone(f, at, dur, type, vol, f2) {
    var a = ctx(); if (!a || muted) return;
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (at || 0);
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, f0, f1, vol, at) {
    var a = ctx(); if (!a || muted) return;
    var n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + (at || 0);
    s.buffer = buf; bp.type = "bandpass"; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(a.destination); s.start(t);
  }
  var lastHover = 0;
  return {
    unlock: ctx,
    toggle: function () { muted = !muted; return muted; },
    squish: function () { tone(520, 0, .18, "sine", .18, 160); tone(90, 0, .25, "sine", .3, 45); },
    ring: function (i) { tone(300 + i * 160, 0, .35, "triangle", .12, 90 + i * 40); },
    whoosh: function () { noise(.9, 300, 3500, .35); },
    boom: function () { tone(110, 0, .7, "sine", .5, 30); noise(.4, 2000, 200, .25); },
    pop: function (i) { tone(500 + i * 220, 0, .15, "square", .06, 900 + i * 220); },
    lift: function () { noise(1, 2500, 250, .3); tone(200, 0, .9, "sawtooth", .05, 600); },
    hover: function () {
      var n = Date.now(); if (n - lastHover < 90) return; lastHover = n;
      tone(760 + Math.random() * 280, 0, .06, "sine", .035);
    },
    pen: function () { tone(1400 + Math.random() * 200, 0, .03, "triangle", .02); },
    clear: function () { noise(.25, 3000, 600, .15); },
    tick: function () { tone(880, 0, .08, "sine", .12); },
    success: function () {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, i * .11, .5, "triangle", .16); });
      tone(1318.5, .5, .9, "sine", .12);
      tone(65, 0, .5, "sine", .35, 40);
    }
  };
})();

/* ---------- ELEMENTS ---------- */
var body = document.body,
    go = document.getElementById("go"),
    ov = document.getElementById("ov"),
    muteBtn = document.getElementById("mute");

muteBtn.addEventListener("click", function () {
  var m = Sound.toggle();
  muteBtn.textContent = m ? "Sound: off" : "Sound: on";
  muteBtn.setAttribute("aria-pressed", String(m));
});

/* headline split into words for the entrance animation */
var h1 = document.getElementById("h1");
h1.innerHTML = h1.textContent.split(" ").map(function (w, i) {
  return '<span class="w" style="--i:' + i + '">' + w + "</span>";
}).join(" ");

/* wrap letter text so every line can highlight on hover */
document.querySelectorAll(".paper p, .paper li, .paper h2:not(.t)").forEach(function (el) {
  if (el.closest(".sal") || el.closest("header")) return;
  var s = document.createElement("span"); s.className = "hl";
  while (el.firstChild) s.appendChild(el.firstChild);
  el.appendChild(s);
});
document.querySelectorAll(".hl").forEach(function (el) {
  el.addEventListener("mouseenter", Sound.hover);
});
document.querySelectorAll(".sal div").forEach(function (el) {
  el.addEventListener("mouseenter", function () { Sound.pop(1); });
});

/* scroll reveal */
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

/* mouse parallax */
window.addEventListener("mousemove", function (e) {
  var x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
  document.querySelectorAll(".blob").forEach(function (b) {
    var m = +b.dataset.m; b.style.transform = "translate(" + x * m + "px," + y * m + "px)";
  });
});

/* ---------- INTRO ANIMATION ---------- */
var started = false;
go.addEventListener("click", function () {
  if (started) return; started = true;
  Sound.unlock();
  var r = go.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  go.classList.add("squish"); Sound.squish();

  [0, 180, 360].forEach(function (d, i) {
    setTimeout(function () {
      var n = document.createElement("div");
      n.className = "ring"; n.style.left = x + "px"; n.style.top = y + "px";
      document.body.appendChild(n); Sound.ring(i);
      setTimeout(function () { n.remove(); }, 1200);
    }, d);
  });

  ov.style.setProperty("--x", x + "px"); ov.style.setProperty("--y", y + "px");
  ov.style.clipPath = "circle(0 at " + x + "px " + y + "px)";
  setTimeout(function () { ov.style.clipPath = ""; ov.classList.add("open"); Sound.whoosh(); }, 350);

  setTimeout(function () {
    ov.classList.add("show"); Sound.boom();
    [["34%", "58%"], ["50%", "22%"], ["66%", "62%"]].forEach(function (p, i) {
      var o = document.createElement("div"); o.className = "pop";
      o.style.cssText = "--s:" + (34 + i * 10) + "px;--l:" + p[0] + ";--t:" + p[1] + ";--d:" + (0.5 + i * 0.18) + "s";
      ov.appendChild(o);
      setTimeout(function () { Sound.pop(i); }, 500 + i * 180);
    });
  }, 1250);

  setTimeout(function () {
    Sound.lift();
    ov.classList.add("lift");
    document.getElementById("intro").style.display = "none";
    body.classList.remove("lock"); window.scrollTo(0, 0);
    body.classList.add("live");
  }, 3200);
  setTimeout(function () { ov.remove(); }, 4400);
});

/* ============================================================
   E-SIGNATURE
   ============================================================ */
var pad = document.getElementById("pad"),
    padbox = document.getElementById("padbox"),
    pctx = pad.getContext("2d"),
    agree = document.getElementById("agree"),
    acceptBtn = document.getElementById("accept-btn"),
    clearBtn = document.getElementById("clear"),
    pname = document.getElementById("pname"),
    pdate = document.getElementById("pdate"),
    statusEl = document.getElementById("status"),
    strokes = [], cur = null, drawing = false;

function today() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
pdate.value = today();

function sizePad() {
  var dpr = window.devicePixelRatio || 1, w = pad.clientWidth, h = pad.clientHeight;
  if (!w) return;
  pad.width = w * dpr; pad.height = h * dpr;
  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}
function redraw() {
  var w = pad.clientWidth, h = pad.clientHeight;
  pctx.clearRect(0, 0, w, h);
  pctx.lineWidth = 3.2; pctx.lineCap = "round"; pctx.lineJoin = "round"; pctx.strokeStyle = "#3c2feb";
  strokes.forEach(function (s) {
    pctx.beginPath();
    s.forEach(function (p, i) { var px = p[0] * w, py = p[1] * h; i ? pctx.lineTo(px, py) : pctx.moveTo(px, py); });
    if (s.length === 1) pctx.lineTo(s[0][0] * w + 0.1, s[0][1] * h);
    pctx.stroke();
  });
}
function pt(e) {
  var r = pad.getBoundingClientRect();
  return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
}
function refresh() {
  var has = strokes.length > 0;
  padbox.classList.toggle("has", has);
  acceptBtn.disabled = !(has && agree.checked && pname.value.trim().length > 1);
}
pad.addEventListener("pointerdown", function (e) {
  e.preventDefault(); Sound.unlock();
  pad.setPointerCapture(e.pointerId);
  drawing = true; padbox.classList.add("on");
  cur = [pt(e)]; strokes.push(cur); redraw(); refresh(); Sound.pen();
});
pad.addEventListener("pointermove", function (e) {
  if (!drawing) return;
  cur.push(pt(e)); redraw();
  if (cur.length % 6 === 0) Sound.pen();
});
function endStroke() { drawing = false; padbox.classList.remove("on"); refresh(); }
pad.addEventListener("pointerup", endStroke);
pad.addEventListener("pointercancel", endStroke);
window.addEventListener("resize", sizePad);
clearBtn.addEventListener("click", function () { strokes = []; redraw(); refresh(); Sound.clear(); statusEl.textContent = ""; });
agree.addEventListener("change", function () { Sound.tick(); refresh(); });
pname.addEventListener("input", refresh);

/* make sure the canvas is sized once the letter is visible */
sizePad();
setTimeout(sizePad, 1500);
new IntersectionObserver(function (es, o) {
  if (es[0].isIntersecting) { sizePad(); o.disconnect(); }
}).observe(pad);

/* confetti */
function confetti() {
  for (var i = 0; i < 70; i++) {
    var c = document.createElement("div"); c.className = "conf";
    var ang = Math.random() * Math.PI * 2, dist = 150 + Math.random() * 350;
    c.style.left = innerWidth / 2 + "px"; c.style.top = innerHeight * 0.55 + "px";
    c.style.background = i % 3 ? "#3c2feb" : "#9a93ff";
    c.style.setProperty("--dx", Math.cos(ang) * dist + "px");
    c.style.setProperty("--dy", Math.sin(ang) * dist + 250 + "px");
    c.style.width = c.style.height = 6 + Math.random() * 10 + "px";
    document.body.appendChild(c);
    setTimeout((function (n) { return function () { n.remove(); }; })(c), 1700);
  }
}

/* show the signed state */
function showSigned(data, animate) {
  document.getElementById("sigimg").src = data.signature;
  document.getElementById("signedby").innerHTML =
    "<b>" + esc(data.name) + "</b><br>Signed online on " + esc(data.signedAt);
  document.getElementById("accept").classList.add("is-signed");
  if (animate) { Sound.success(); confetti(); }
}
function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

acceptBtn.addEventListener("click", function () {
  if (acceptBtn.disabled) return;
  var data = {
    name: pname.value.trim(),
    id: CONFIG.employeeId,
    signedAt: today() + ", " + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    signature: pad.toDataURL("image/png"),
    page: location.href
  };
  try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(data)); } catch (e) {}
  showSigned(data, true);

  var st = document.getElementById("status2");
  if (CONFIG.endpoint) {
    st.textContent = "Sending your signed offer…";
    fetch(CONFIG.endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error();
      st.textContent = "Done. Your signed offer has been sent to Dishoom. You can also download a copy below.";
    }).catch(function () {
      st.textContent = "We couldn't send it automatically. Please download the PDF below and email it to hello@dishooom.com.";
    });
  } else {
    st.textContent = "Signed. Please download your copy below and email it to hello@dishooom.com.";
  }
});

document.getElementById("dl").addEventListener("click", function () {
  Sound.tick();
  document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });
  window.print(); /* choose "Save as PDF" in the print dialog */
});

/* restore if already signed on this device */
try {
  var saved = localStorage.getItem(CONFIG.storageKey);
  if (saved) showSigned(JSON.parse(saved), false);
} catch (e) {}
