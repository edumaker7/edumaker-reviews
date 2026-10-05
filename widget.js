/*!
 * 에듀메이커 수업후기 위젯 (아임웹 코드 위젯용)
 *
 * 사용법 (아임웹 > 코드 위젯):
 *   <div id="edumaker-reviews"></div>
 *   <script src="https://아이디.github.io/edumaker-reviews/widget.js" defer></script>
 *
 * 옵션 (div 에 data- 속성으로):
 *   data-limit="6"         처음에 보여줄 개수 (기본 6)
 *   data-section="학생교육"  한 분류만 (학생교육 / 성인교육 / 교사강사연수)
 *   data-filter="false"    분류 버튼 숨기기
 *   data-more="false"      '더 보기' 버튼 숨기기
 *   data-more-url="/review" '더 보기' 대신 이 주소로 이동 (메인 화면용)
 *   data-cover="card"      카드 대표 이미지를 카드뉴스로 (기본: 현장 사진)
 *   data-title="수업 후기"  위젯 위에 제목 표시
 *   data-columns="3"       PC 에서 한 줄 개수 (기본 3)
 *   (필터 버튼을 누르면 같은 페이지의 다른 후기 위젯도 같은 분류로 함께 바뀝니다)
 *   data-latest="3"        (묶음 모드) 맨 위에 '최신 수업 후기' N개 — 필터 '전체'일 때만
 *   data-group="false"     분류별 묶음(학생교육 후기 / 기업·성인교육 후기 / 교사연수 후기) 끄기
 *                          (기본: 후기 페이지는 묶음, data-more-url 을 쓴 메인용은 최신순 한 줄)
 */
(function () {
  "use strict";
  var script = document.currentScript;
  var BASE = script ? script.src.replace(/[^\/]*(\?.*)?$/, "") : "./";

  var COLORS = {
    "학생교육": { bg: "#E8F5EC", fg: "#1F7A45" },
    "성인교육": { bg: "#E8EEFA", fg: "#2B4C9B" },
    "교사강사연수": { bg: "#FDF0E3", fg: "#B85C0A" }
  };
  var FALLBACK_LABEL = { "학생교육": "학생교육", "성인교육": "기업·성인교육", "교사강사연수": "교사연수" };

  var CSS = [
    ":host{all:initial;display:block;font-family:inherit;color:#1f2329;line-height:1.55;-webkit-font-smoothing:antialiased}",
    "*{box-sizing:border-box}",
    ".wrap{max-width:1200px;margin:0 auto}",
    ".head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px}",
    ".title{font-size:26px;font-weight:800;margin:0;letter-spacing:-.02em}",
    ".chips{display:flex;gap:8px;flex-wrap:wrap}",
    ".chip{font:inherit;font-size:14px;font-weight:600;border:1px solid #d9dde3;background:#fff;color:#4a5160;padding:7px 14px;border-radius:999px;cursor:pointer;transition:.15s}",
    ".chip:hover{border-color:#1F7A45;color:#1F7A45}",
    ".chip[aria-pressed=true]{background:#1F7A45;border-color:#1F7A45;color:#fff}",
    ".grid{display:grid;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));gap:22px}",
    "@media(max-width:960px){.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}}",
    "@media(max-width:560px){.grid{grid-template-columns:1fr}.title{font-size:22px}}",
    ".card{font:inherit;text-align:left;display:flex;flex-direction:column;background:#fff;border:1px solid #eceef1;border-radius:16px;overflow:hidden;cursor:pointer;padding:0;color:inherit;transition:transform .18s,box-shadow .18s}",
    ".card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(20,30,50,.10)}",
    ".card:focus-visible{outline:3px solid #1F7A45;outline-offset:2px}",
    ".thumb{position:relative;aspect-ratio:4/3;background:#f2f4f6;overflow:hidden}",
    ".thumb.sq{aspect-ratio:1/1}",
    ".thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s}",
    ".card:hover .thumb img{transform:scale(1.04)}",
    ".count{position:absolute;right:10px;bottom:10px;background:rgba(0,0,0,.55);color:#fff;font-size:12px;padding:3px 8px;border-radius:999px}",
    ".body{padding:16px 18px 18px;display:flex;flex-direction:column;gap:8px;flex:1}",
    ".meta{display:flex;align-items:center;gap:8px;font-size:13px;color:#7a818c}",
    ".badge{font-size:12px;font-weight:700;padding:3px 9px;border-radius:6px}",
    ".ctitle{font-size:17px;font-weight:700;margin:0;line-height:1.4;letter-spacing:-.01em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
    ".who{font-size:13px;color:#5b6270;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".sum{font-size:14px;color:#4a5160;margin:0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}",
    ".go{margin-top:auto;padding-top:6px;font-size:14px;font-weight:700;color:#1F7A45}",
    ".more{display:block;margin:28px auto 0;font:inherit;font-size:15px;font-weight:700;padding:12px 30px;border-radius:999px;border:1.5px solid #1F7A45;background:#fff;color:#1F7A45;cursor:pointer;text-decoration:none;text-align:center;width:max-content}",
    ".more:hover{background:#1F7A45;color:#fff}",
    ".grp{margin:0 0 44px}",
    ".grp:last-child{margin-bottom:0}",
    ".ghead{display:flex;align-items:center;gap:10px;margin:0 0 16px;padding:0 0 12px;border-bottom:2px solid var(--gc,#1F7A45)}",
    ".gbar{width:6px;height:22px;border-radius:3px;background:var(--gc,#1F7A45)}",
    ".gtitle{font-size:21px;font-weight:800;margin:0;letter-spacing:-.02em;color:#1f2329}",
    ".gnum{font-size:14px;font-weight:700;color:var(--gc,#1F7A45);background:var(--gb,#E8F5EC);padding:2px 10px;border-radius:999px}",
    ".grp .more{margin-top:20px}",
    "@media(max-width:560px){.gtitle{font-size:18px}.grp{margin-bottom:34px}}",
    ".empty{padding:48px 0;text-align:center;color:#7a818c}",
    ".sk{border-radius:16px;background:linear-gradient(90deg,#f2f4f6 25%,#e9ecef 37%,#f2f4f6 63%);background-size:400% 100%;animation:sh 1.4s ease infinite;aspect-ratio:3/4}",
    "@keyframes sh{0%{background-position:100% 50%}100%{background-position:0 50%}}"
  ].join("");

  var MCSS = [
    ":host{all:initial;font-family:inherit}",
    "*{box-sizing:border-box}",
    ".ov{position:fixed;inset:0;z-index:2147483000;background:rgba(15,20,30,.62);display:flex;align-items:center;justify-content:center;padding:24px;animation:fi .18s}",
    "@keyframes fi{from{opacity:0}to{opacity:1}}",
    ".box{background:#fff;color:#1f2329;border-radius:18px;max-width:860px;width:100%;max-height:calc(100vh - 48px);overflow:auto;position:relative;line-height:1.6;font-family:inherit}",
    ".x{position:absolute;top:12px;right:12px;width:38px;height:38px;border-radius:50%;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:22px;line-height:38px;cursor:pointer;z-index:2}",
    ".main{position:relative;background:#111;aspect-ratio:4/3;max-height:58vh;width:100%;display:flex;align-items:center;justify-content:center}",
    ".main img{max-width:100%;max-height:100%;object-fit:contain;display:block}",
    ".nav{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.85);font-size:22px;cursor:pointer;color:#1f2329}",
    ".prev{left:12px}.next{right:12px}",
    ".thumbs{display:flex;gap:8px;padding:10px 16px 0;overflow-x:auto}",
    ".thumbs button{flex:0 0 72px;height:54px;padding:0;border:2px solid transparent;border-radius:8px;overflow:hidden;cursor:pointer;background:#eee;opacity:.65}",
    ".thumbs button[aria-current=true]{border-color:#1F7A45;opacity:1}",
    ".thumbs img{width:100%;height:100%;object-fit:cover;display:block}",
    ".in{padding:20px 26px 26px}",
    ".meta{display:flex;align-items:center;gap:8px;font-size:13px;color:#7a818c}",
    ".badge{font-size:12px;font-weight:700;padding:3px 9px;border-radius:6px}",
    "h3{font-size:21px;line-height:1.4;margin:10px 0 4px;letter-spacing:-.01em}",
    ".hl{color:#5b6270;font-size:14px;margin:0 0 14px}",
    ".facts{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;background:#f6f8f7;border-radius:12px;padding:14px 16px;font-size:14px;margin:0 0 16px}",
    ".facts dt{font-weight:700;color:#1F7A45;white-space:nowrap}.facts dd{margin:0;color:#3b4250}",
    ".sum{font-size:15px;color:#3b4250;margin:0 0 18px;white-space:pre-line}",
    ".tags{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 20px}",
    ".tags span{font-size:12px;color:#5b6270;background:#f1f3f5;padding:3px 9px;border-radius:999px}",
    ".btns{display:flex;gap:10px;flex-wrap:wrap}",
    ".btn{display:inline-flex;align-items:center;gap:6px;font-size:15px;font-weight:700;padding:12px 20px;border-radius:10px;text-decoration:none}",
    ".blog{background:#03C75A;color:#fff}.blog:hover{background:#02b350}",
    ".ig{background:#fff;color:#c13584;border:1.5px solid #e5c1d6}.ig:hover{background:#fdf2f8}",
    "@media(max-width:560px){.ov{padding:0;align-items:flex-end}.box{border-radius:18px 18px 0 0;max-height:92vh}.in{padding:18px}h3{font-size:19px}}"
  ].join("");

  var FCSS = [
    ":host{all:initial;font-family:inherit}",
    "*{box-sizing:border-box}",
    ".bar{background:rgba(255,255,255,.97);border-bottom:1px solid #eceef1;box-shadow:0 6px 16px rgba(20,30,50,.07);font-family:inherit;color:#1f2329}",
    ".in{max-width:1200px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:12px}",
    ".lbl{font-size:15px;font-weight:800;white-space:nowrap;letter-spacing:-.01em}",
    ".chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}",
    ".chips::-webkit-scrollbar{display:none}",
    ".chip{flex:0 0 auto;white-space:nowrap;font:inherit;font-size:14px;font-weight:600;border:1px solid #d9dde3;background:#fff;color:#4a5160;padding:6px 13px;border-radius:999px;cursor:pointer}",
    ".chip:hover{border-color:#1F7A45;color:#1F7A45}",
    ".chip[aria-pressed=true]{background:#1F7A45;border-color:#1F7A45;color:#fff}",
    "@media(max-width:560px){.lbl{font-size:14px}.in{padding:8px 12px;gap:8px}}"
  ].join("");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function url(p) { return /^https?:/.test(p) ? p : BASE + p; }
  function fmtDate(d) { var a = (d || "").split("-"); return a.length === 3 ? a[0] + "." + a[1] + "." + a[2] : d; }
  function badge(r) {
    var c = COLORS[r.section] || { bg: "#eef0f3", fg: "#4a5160" };
    return '<span class="badge" style="background:' + c.bg + ";color:" + c.fg + '">' + esc(r.label || FALLBACK_LABEL[r.section] || r.section) + "</span>";
  }
  function who(r) {
    var f = (r.facts || []).filter(function (x) { return /대상/.test(x.k); })[0];
    return f ? f.v : (r.headline && r.headline[0]) || "";
  }
  function blogLink(r, blogHome) { return r.blog_url || blogHome; }

  var dataPromise = null;
  function loadData() {
    if (!dataPromise) {
      var v = Math.floor(Date.now() / 600000); // 10분 단위 캐시
      dataPromise = fetch(BASE + "reviews.json?v=" + v, { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (d) { return Array.isArray(d) ? { reviews: d } : d; });
    }
    return dataPromise;
  }

  // ------------------------------------------------------------ 상세 모달
  var modalHost = null;
  function openModal(r, blogHome, opener) {
    closeModal();
    modalHost = document.createElement("div");
    modalHost.setAttribute("data-edumaker-review-modal", "");
    document.body.appendChild(modalHost);
    var root = modalHost.attachShadow({ mode: "open" });
    var imgs = (r.photos || []).map(function (p) { return url(p.src); });
    if (r.card) imgs.push(url(r.card));
    var idx = 0;
    var facts = (r.course ? [{ k: "교육명", v: r.course }] : []).concat(r.facts || []);
    root.innerHTML = "<style>" + MCSS + "</style>" +
      '<div class="ov" part="overlay"><div class="box" role="dialog" aria-modal="true" aria-label="' + esc(r.title) + '">' +
      '<button class="x" aria-label="닫기">×</button>' +
      (imgs.length ? '<div class="main"><img alt=""></div>' +
        (imgs.length > 1 ? '<div class="thumbs">' + imgs.map(function (s, i) {
          return '<button data-i="' + i + '" aria-label="사진 ' + (i + 1) + '"><img src="' + esc(s) + '" alt="" loading="lazy"></button>';
        }).join("") + "</div>" : "") : "") +
      '<div class="in"><div class="meta">' + badge(r) + "<span>" + fmtDate(r.date) + "</span></div>" +
      "<h3>" + esc(r.title) + "</h3>" +
      (r.headline && r.headline.length ? '<p class="hl">' + esc(r.headline.join(" · ")) + "</p>" : "") +
      (facts.length ? '<dl class="facts">' + facts.map(function (f) { return "<dt>" + esc(f.k) + "</dt><dd>" + esc(f.v) + "</dd>"; }).join("") + "</dl>" : "") +
      '<p class="sum">' + esc(r.summary) + "</p>" +
      (r.tags && r.tags.length ? '<div class="tags">' + r.tags.map(function (t) { return "<span>#" + esc(t) + "</span>"; }).join("") + "</div>" : "") +
      '<div class="btns"><a class="btn blog" target="_blank" rel="noopener" href="' + esc(blogLink(r, blogHome)) + '">블로그에서 전체 후기 보기 →</a>' +
      (r.instagram_url ? '<a class="btn ig" target="_blank" rel="noopener" href="' + esc(r.instagram_url) + '">인스타그램</a>' : "") +
      "</div></div></div></div>";

    var mainImg = root.querySelector(".main img");
    var main = root.querySelector(".main");
    function show(i) {
      if (!mainImg) return;
      idx = (i + imgs.length) % imgs.length;
      mainImg.src = imgs[idx];
      root.querySelectorAll(".thumbs button").forEach(function (b, j) { b.setAttribute("aria-current", j === idx ? "true" : "false"); });
    }
    if (mainImg) {
      show(0);
      if (imgs.length > 1) {
        main.insertAdjacentHTML("beforeend", '<button class="nav prev" aria-label="이전 사진">‹</button><button class="nav next" aria-label="다음 사진">›</button>');
        root.querySelector(".prev").onclick = function () { show(idx - 1); };
        root.querySelector(".next").onclick = function () { show(idx + 1); };
        root.querySelectorAll(".thumbs button").forEach(function (b) { b.onclick = function () { show(+b.getAttribute("data-i")); }; });
        var sx = null;
        main.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
        main.addEventListener("touchend", function (e) {
          if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
          if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
        });
      }
    }
    var prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
    }
    document.addEventListener("keydown", onKey);
    root.querySelector(".x").onclick = closeModal;
    root.querySelector(".ov").addEventListener("click", function (e) { if (e.target === e.currentTarget) closeModal(); });
    root.querySelector(".x").focus();
    modalHost._cleanup = function () {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      if (opener && opener.focus) opener.focus();
    };
  }
  function closeModal() {
    if (modalHost) {
      if (modalHost._cleanup) modalHost._cleanup();
      modalHost.remove();
      modalHost = null;
    }
  }

  // ------------------------------------------------------------ 목록
  function mount(host) {
    if (host._edumakerMounted) return;
    host._edumakerMounted = true;
    var ds = host.dataset;
    var limit = parseInt(ds.limit || "6", 10) || 6;
    var showFilter = ds.filter !== "false" && !ds.section;
    var showMore = ds.more !== "false";
    var moreUrl = ds.moreUrl || "";
    var cover = ds.cover || "photo";
    var cols = parseInt(ds.columns || "3", 10) || 3;
    var group = ds.group ? ds.group !== "false" : (!moreUrl && !ds.section);
    var latestN = group ? (parseInt(ds.latest || "0", 10) || 0) : 0;   // 맨 위 '최신 수업 후기' 개수 (0=없음)
    var latestTitle = ds.latestTitle || "최신 수업 후기";
    // 최신 후기 위젯과 전체 후기 위젯이 같은 페이지에 있으면:
    // '수업 후기 더 보기'를 누를 때 페이지 이동 대신 아래 전체 후기 위젯으로 부드럽게 이동
    var samePage = false;
    if (moreUrl) {
      try {
        var target = new URL(moreUrl, location.href);
        samePage = target.host === location.host && target.pathname.replace(/\/+$/, "") === location.pathname.replace(/\/+$/, "");
      } catch (e) { /* 무시 */ }
    }
    function findFullWidget() {
      var all = document.querySelectorAll("#edumaker-reviews, [data-edumaker-reviews]");
      for (var i = 0; i < all.length; i++) if (all[i] !== host && !all[i].dataset.moreUrl) return all[i];
      return null;
    }
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
    var state = { sec: ds.section || "", shown: limit, all: [], gshown: {} };
    var blogHome = "https://blog.naver.com/edumaker07";

    root.innerHTML = "<style>" + CSS + "</style>" +
      '<div class="wrap" style="--cols:' + cols + '">' +
      '<div class="head">' + (ds.title ? '<h2 class="title">' + esc(ds.title) + "</h2>" : "<span></span>") + '<div class="chips"></div></div>' +
      '<div class="list"><div class="grid">' + new Array(Math.min(limit, cols) + 1).join(".").split(".").slice(1).map(function () { return '<div class="sk"></div>'; }).join("") + "</div></div>" +
      '<div class="foot"></div></div>';
    var box = root.querySelector(".list"), chips = root.querySelector(".chips"), foot = root.querySelector(".foot");
    var ORDER = ["학생교육", "성인교육", "교사강사연수"];
    function secRank(s) { var i = ORDER.indexOf(s); return i < 0 ? 99 : i; }
    function labelOf(s) {
      var r = state.all.filter(function (x) { return x.section === s; })[0];
      return (r && r.label) || FALLBACK_LABEL[s] || s;
    }

    function list() { return state.all.filter(function (r) { return !state.sec || r.section === state.sec; }); }

    // ---- 같은 페이지에 '전체 후기' 위젯이 있으면(연결 모드): 이 위젯의 필터는 아래 전체 목록을 거르는 메뉴
    function linkedFull() { return null; }

    function chipSecs() {
      var secs = [];
      state.all.forEach(function (r) { if (secs.indexOf(r.section) < 0) secs.push(r.section); });
      secs.sort(function (a, b) { return secRank(a) - secRank(b); });
      return secs;
    }
    function chipsHtml(active) {
      return ['<button class="chip" data-s="" aria-pressed="' + (!active) + '">전체</button>'].concat(chipSecs().map(function (s) {
        return '<button class="chip" data-s="' + esc(s) + '" aria-pressed="' + (active === s) + '">' + esc(labelOf(s)) + "</button>";
      })).join("");
    }
    function bindChips(container) {
      container.querySelectorAll(".chip").forEach(function (b) {
        b.onclick = function () { pickSec(b.getAttribute("data-s")); };
      });
    }
    function renderChips() {
      if (!showFilter || chipSecs().length < 2) { chips.innerHTML = ""; renderFloat(); return; }
      chips.innerHTML = chipsHtml(state.sec);
      bindChips(chips);
      renderFloat();
    }
    function pickSec(sec) {
      var floating = fl && fl.style.display !== "none";
      applySec(sec);
      // 따라 나온 필터에서 눌렀으면 목록 맨 위로 이동 (제목이 바뀐 걸 바로 보이게)
      if (floating) setTimeout(function () { scrollToEl(box); }, 30);
    }

    // 화면 위에 고정된 메뉴바(아임웹 헤더) 높이
    function headerOffset() {
      // 화면 맨 위에 고정된 메뉴바들(아임웹은 PC 에서 2줄일 수 있음)을 위에서부터 차례로 쌓아 계산
      var offset = 0;
      try {
        var xs = [0.5, 0.25, 0.75].map(function (f) { return Math.round(window.innerWidth * f); });
        for (var step = 0; step < 5; step++) {
          var y = Math.round(offset) + 2, next = offset;
          for (var xi = 0; xi < xs.length; xi++) {
            var els = document.elementsFromPoint(xs[xi], y);
            for (var i = 0; i < els.length; i++) {
              var el = els[i];
              if (fl && (el === fl || fl.contains(el))) continue;
              while (el && el !== document.body && el !== document.documentElement) {
                var pos = getComputedStyle(el).position;
                if (pos === "fixed" || pos === "sticky") {
                  var r = el.getBoundingClientRect();
                  if (r.top <= y + 1 && r.bottom > next && r.height < window.innerHeight * 0.5) next = r.bottom;
                  break;
                }
                el = el.parentElement;
              }
            }
          }
          if (next <= offset + 0.5) break;
          offset = next;
        }
      } catch (err) { /* 무시 */ }
      return Math.max(0, Math.min(offset, 300));
    }
    function scrollToEl(el) {
      var barH = fl ? (fl.offsetHeight || flH || 58) : 0;
      var y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset() - barH - 12;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }

    // ---- 스크롤해도 따라오는 필터 바 (연결 모드에서만)
    var fl = null, flRoot = null, flH = 0, flTick = false;
    function renderFloat() {
      if (!group || !showFilter || chipSecs().length < 2) { if (fl) fl.style.display = "none"; return; }
      if (!fl) {
        fl = document.createElement("div");
        fl.setAttribute("data-edumaker-review-float", "");
        fl.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147482000;display:none";
        document.body.appendChild(fl);
        flRoot = fl.attachShadow ? fl.attachShadow({ mode: "open" }) : fl;
        flRoot.innerHTML = "<style>" + FCSS + "</style>" +
          '<div class="bar"><div class="in"><span class="lbl"></span><div class="chips"></div></div></div>';
        window.addEventListener("scroll", onFloatScroll, { passive: true });
        window.addEventListener("resize", onFloatScroll);
      }
      flRoot.querySelector(".lbl").textContent = ds.title || "수업 후기";
      var fc = flRoot.querySelector(".chips");
      fc.innerHTML = chipsHtml(state.sec);
      bindChips(fc);
      updateFloat();
      flShownSec = null;
      showActiveChip();
    }
    // 휴대폰에서 고른 버튼이 화면 밖에 있으면 보이도록 옆으로 밀기
    var flShownSec = null;
    function showActiveChip() {
      if (!fl || fl.style.display === "none" || flShownSec === state.sec) return;
      var fc = flRoot.querySelector(".chips");
      var act = fc.querySelector('.chip[aria-pressed="true"]');
      if (act) { fc.scrollLeft = Math.max(0, act.offsetLeft - fc.offsetLeft - 40); flShownSec = state.sec; }
    }
    function onFloatScroll() {
      if (flTick) return;
      flTick = true;
      (window.requestAnimationFrame || setTimeout)(function () { flTick = false; updateFloat(); });
    }
    function updateFloat() {
      if (!fl) return;
      var top = headerOffset();
      fl.style.top = top + "px";
      var cr = chips.getBoundingClientRect(), fr = host.getBoundingClientRect();
      // 필터가 화면 밖으로 올라갔고, 후기 목록이 아직 화면에 있을 때만 보이기
      var show = cr.bottom < top + 4 && fr.bottom > top + 120;
      fl.style.display = show ? "block" : "none";
      if (show) { flH = fl.offsetHeight || flH; showActiveChip(); }
    }

    function cardHtml(r, key) {
      var useCard = cover === "card" && r.card;
      var img = useCard ? r.card : (r.photos && r.photos[0] ? r.photos[0].src : r.card);
      var n = (r.photos || []).length + (r.card ? 1 : 0);
      return '<button class="card" data-k="' + key + '" aria-label="' + esc(r.title) + ' 후기 자세히 보기">' +
        '<div class="thumb' + (useCard ? " sq" : "") + '">' + (img ? '<img src="' + esc(url(img)) + '" alt="" loading="lazy">' : "") +
        (n > 1 ? '<span class="count">사진 ' + n + "</span>" : "") + "</div>" +
        '<div class="body"><div class="meta">' + badge(r) + "<span>" + fmtDate(r.date) + "</span></div>" +
        '<h3 class="ctitle">' + esc(r.title) + "</h3>" +
        (who(r) ? '<p class="who">' + esc(who(r)) + "</p>" : "") +
        '<p class="sum">' + esc(r.summary) + "</p>" +
        '<span class="go">후기 보기 →</span></div></button>';
    }

    function bindCards(map) {
      box.querySelectorAll(".card").forEach(function (c) {
        c.onclick = function () { openModal(map[c.getAttribute("data-k")], blogHome, c); };
      });
    }

    function applySec(sec) {
      if (ds.section) return;                      // 한 분류 고정 위젯은 따라가지 않음
      state.sec = sec; state.shown = limit; state.gshown = {};
      renderChips(); render();
    }
    window.addEventListener("edumaker-reviews-filter", function (e) {
      if (!e.detail || e.detail.from === host || !state.all.length) return;
      applySec(e.detail.sec || "");
    });

    function render() {
      var items = list();
      if (!items.length) { box.innerHTML = '<div class="empty">아직 등록된 후기가 없어요.</div>'; foot.innerHTML = ""; return; }
      var map = {};

      if (!group) {                                   // 최신순 한 줄 (메인 화면용)
        var view = items.slice(0, state.shown);
        box.innerHTML = '<div class="grid">' + view.map(function (r, i) { map["a" + i] = r; return cardHtml(r, "a" + i); }).join("") + "</div>";
        bindCards(map);
        if (items.length > state.shown && showMore) {
          if (moreUrl) {
            foot.innerHTML = '<a class="more" href="' + esc(moreUrl) + '">수업 후기 더 보기</a>';
            foot.querySelector(".more").onclick = function (e) {
              var full = samePage && findFullWidget();
              if (full) { e.preventDefault(); scrollToEl(full); }
            };
          }
          else {
            foot.innerHTML = '<button class="more">더 보기 (' + (items.length - state.shown) + ')</button>';
            foot.querySelector(".more").onclick = function () { state.shown += limit; render(); };
          }
        } else foot.innerHTML = "";
        return;
      }

      // 분류별 묶음: 학생교육 후기 / 기업·성인교육 후기 / 교사연수 후기
      var secs = [];
      items.forEach(function (r) { if (secs.indexOf(r.section) < 0) secs.push(r.section); });
      secs.sort(function (a, b) { return secRank(a) - secRank(b); });
      var latestHtml = "";
      if (latestN && !state.sec) {
        latestHtml = '<section class="grp" style="--gc:#1f2329;--gb:#eef0f3">' +
          '<div class="ghead"><span class="gbar"></span><h3 class="gtitle">' + esc(latestTitle) + "</h3></div>" +
          '<div class="grid">' + items.slice(0, latestN).map(function (r, i) { var k = "n" + i; map[k] = r; return cardHtml(r, k); }).join("") + "</div></section>";
      }
      box.innerHTML = latestHtml + secs.map(function (s, gi) {
        var all = items.filter(function (r) { return r.section === s; });
        var shown = state.gshown[s] || limit;
        var c = COLORS[s] || { bg: "#eef0f3", fg: "#4a5160" };
        var cards = all.slice(0, shown).map(function (r, i) { var k = "g" + gi + "_" + i; map[k] = r; return cardHtml(r, k); }).join("");
        var more = (all.length > shown && showMore) ? '<button class="more" data-s="' + esc(s) + '">' + esc(labelOf(s)) + " 후기 더 보기 (" + (all.length - shown) + ")</button>" : "";
        return '<section class="grp" style="--gc:' + c.fg + ";--gb:" + c.bg + '">' +
          '<div class="ghead"><span class="gbar"></span><h3 class="gtitle">' + esc(labelOf(s)) + ' 후기</h3><span class="gnum">' + all.length + "건</span></div>" +
          '<div class="grid">' + cards + "</div>" + more + "</section>";
      }).join("");
      bindCards(map);
      box.querySelectorAll(".grp .more").forEach(function (b) {
        b.onclick = function () { var s = b.getAttribute("data-s"); state.gshown[s] = (state.gshown[s] || limit) + limit; render(); };
      });
      foot.innerHTML = "";
    }

    loadData().then(function (d) {
      state.all = (d.reviews || []).slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
      if (d.blog_home) blogHome = d.blog_home;
      renderChips();
      render();
    }).catch(function () {
      box.innerHTML = '<div class="empty">후기를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.</div>';
    });
  }

  function init() {
    var hosts = document.querySelectorAll("#edumaker-reviews, [data-edumaker-reviews]");
    for (var i = 0; i < hosts.length; i++) mount(hosts[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  // 아임웹 편집기/페이지 전환 대비: 늦게 생기는 위젯도 잡기
  if (window.MutationObserver) {
    var mo = new MutationObserver(function () { init(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 15000);
  }
})();
