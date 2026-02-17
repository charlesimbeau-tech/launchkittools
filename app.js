(function () {
  "use strict";

  var CATEGORIES = ["Writing", "Design", "Coding", "Marketing", "Video", "Audio", "Productivity", "Data"];
  var PRICING = ["Free", "Freemium", "Paid", "Enterprise"];
  var SORTS = [
    { label: "\ud83d\udd25 Popular", key: "popular" },
    { label: "\u2b50 Top Rated", key: "rated" },
    { label: "A\u2013Z", key: "az" },
    { label: "\u2728 Newest", key: "newest" }
  ];

  var ICON_SLUGS = {
    "ChatGPT": "openai", "DALL\u00b7E": "openai", "Canva AI": "canva",
    "Adobe Firefly": "adobe", "Figma AI": "figma", "GitHub Copilot": "github",
    "Cursor": "cursor", "Replit AI": "replit", "Tabnine": "tabnine",
    "Codeium": "codeium", "HubSpot AI": "hubspot", "Semrush AI": "semrush",
    "Mailchimp AI": "mailchimp", "Descript": "descript", "ElevenLabs": "elevenlabs",
    "Notion AI": "notion", "Jasper": "jasper", "Grammarly": "grammarly",
    "Claude": "anthropic", "Perplexity": "perplexity", "Gemini": "google",
    "Microsoft Copilot": "microsoft"
  };

  var activeCategory = null;
  var activePricing = null;
  var activeSort = "popular";
  var tools = [];

  function $(sel) { return document.querySelector(sel); }

  function buildFilters() {
    var catWrap = $("#category-filters");
    var priceWrap = $("#pricing-filters");
    var sortWrap = $("#sort-filters");

    // Categories
    var allCat = btn("All", true);
    allCat.addEventListener("click", function () { activeCategory = null; render(); setActive(catWrap, allCat); });
    catWrap.appendChild(allCat);
    CATEGORIES.forEach(function (c) {
      var b = btn(c, false);
      b.addEventListener("click", function () { activeCategory = c; render(); setActive(catWrap, b); });
      catWrap.appendChild(b);
    });

    // Pricing
    var allPrice = btn("All Pricing", true);
    allPrice.addEventListener("click", function () { activePricing = null; render(); setActive(priceWrap, allPrice); });
    priceWrap.appendChild(allPrice);
    PRICING.forEach(function (p) {
      var b = btn(p, false);
      b.addEventListener("click", function () { activePricing = p; render(); setActive(priceWrap, b); });
      priceWrap.appendChild(b);
    });

    // Sort
    if (sortWrap) {
      SORTS.forEach(function (s, i) {
        var b = btn(s.label, i === 0);
        b.addEventListener("click", function () { activeSort = s.key; render(); setActive(sortWrap, b); });
        sortWrap.appendChild(b);
      });
    }
  }

  function btn(text, active) {
    var el = document.createElement("button");
    el.className = "filter-btn" + (active ? " active" : "");
    el.textContent = text;
    return el;
  }

  function setActive(wrap, target) {
    var btns = wrap.querySelectorAll(".filter-btn");
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
    target.classList.add("active");
  }

  function filtered() {
    var q = ($("#search").value || "").toLowerCase();
    var list = tools.filter(function (t) {
      if (activeCategory && t.category !== activeCategory) return false;
      if (activePricing && t.pricing !== activePricing) return false;
      if (q && t.name.toLowerCase().indexOf(q) === -1 && t.description.toLowerCase().indexOf(q) === -1 && t.category.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });

    // Sort
    list.sort(function (a, b) {
      if (activeSort === "popular") return (b.popularity || 0) - (a.popularity || 0);
      if (activeSort === "rated") return (b.rating || 0) - (a.rating || 0);
      if (activeSort === "az") return a.name.localeCompare(b.name);
      if (activeSort === "newest") return (tools.indexOf(b)) - (tools.indexOf(a));
      return 0;
    });

    return list;
  }

  function esc(str) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function getDomain(url) {
    try { return new URL(url).hostname; } catch(e) { return ""; }
  }

  function iconHTML(tool) {
    var slug = ICON_SLUGS.hasOwnProperty(tool.name) ? ICON_SLUGS[tool.name] : tool.slug;
    if (slug) {
      var faviconFallback = tool.url ? "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(getDomain(tool.url)) + "&sz=64" : "";
      return '<img src="https://cdn.simpleicons.org/' + slug + '/c9952c" alt="" onerror="' +
        (faviconFallback ? "this.onerror=null;this.src=\'" + faviconFallback + "\'" : "this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'") +
        '">' +
        '<span style="display:none;width:100%;height:100%;align-items:center;justify-content:center">' + tool.name.charAt(0) + '</span>';
    }
    if (tool.url) {
      var domain = getDomain(tool.url);
      if (domain) {
        return '<img src="https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=64" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<span style="display:none;width:100%;height:100%;align-items:center;justify-content:center">' + tool.name.charAt(0) + '</span>';
      }
    }
    return '<span>' + tool.name.charAt(0) + '</span>';
  }

  function stars(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.3;
    var s = "";
    for (var i = 0; i < full; i++) s += "\u2605";
    if (half) s += "\u00BD";
    return s + " " + rating;
  }

  function pricingClass(p) {
    return "tag-" + p.toLowerCase();
  }

  function popularityBadge(pop) {
    if (!pop) return "";
    if (pop >= 90) return '<span class="pop-badge pop-hot">\ud83d\udd25 Trending</span>';
    if (pop >= 75) return '<span class="pop-badge pop-popular">\u2b50 Popular</span>';
    return "";
  }

  function render() {
    var list = filtered();
    var grid = $("#tools-grid");
    var empty = $("#empty-state");
    var count = $("#tools-count");

    count.textContent = list.length + " tool" + (list.length !== 1 ? "s" : "") + " found";

    if (!list.length) {
      grid.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    var html = "";
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      var link = 'tool?id=' + (t.id || '');
      html += '<a href="' + link + '" class="tool-card tool-card-link">' +
        '<div class="card-top">' +
          '<div class="tool-icon">' + iconHTML(t) + '</div>' +
          '<div class="card-title">' + esc(t.name) + popularityBadge(t.popularity) + '</div>' +
        '</div>' +
        '<p class="card-desc">' + esc(t.description) + '</p>' +
        '<div class="card-meta">' +
          '<div class="card-tags">' +
            '<span class="tag tag-category">' + t.category + '</span>' +
            '<span class="tag tag-pricing ' + pricingClass(t.pricing) + '">' + t.pricing + '</span>' +
          '</div>' +
          '<span class="card-rating">' + stars(t.rating) + '</span>' +
        '</div>' +
        '<span class="card-link">View details \u2192</span>' +
      '</a>';
    }
    grid.innerHTML = html;
  }

  // Init
  buildFilters();

  var searchTimer;
  $("#search").addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 200);
  });

  fetch("tools.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      tools = data;
      render();
    })
    .catch(function (e) {
      console.error("Failed to load tools:", e);
    });
})();
