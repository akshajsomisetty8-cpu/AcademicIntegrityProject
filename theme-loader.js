(function () {
  var params = new URLSearchParams(window.location.search);
  var design = params.get("design") || "holo";
  var pages = ["index.html", "problem.html", "root-causes.html", "solutions.html", "conclusion.html", "citations.html"];
  var currentFile = window.location.pathname.split("/").pop() || "index.html";
  var pageIndex = Math.max(0, pages.indexOf(currentFile));
  var themes = {
    neural: "themes/neural-circuit.css",
    terminal: "themes/terminal-core.css",
    holo: "themes/holographic-lab.css"
  };

  document.body.dataset.pageIndex = String(pageIndex);
  document.body.style.setProperty("--page-count", pages.length);
  document.body.style.setProperty("--page-index", pageIndex);
  document.body.style.setProperty("--page-ratio", pages.length > 1 ? pageIndex / (pages.length - 1) : 0);

  if (themes[design]) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = themes[design] + "?v=45";
    link.id = "theme-stylesheet";
    document.head.appendChild(link);

    document.querySelectorAll('a[href$=".html"]').forEach(function (anchor) {
      var url = new URL(anchor.getAttribute("href"), window.location.href);
      url.searchParams.set("design", design);
      anchor.setAttribute("href", url.pathname.split("/").pop() + url.search);
    });
  }

  var header = document.querySelector(".site-header");
  var nav = document.querySelector(".nav");

  if (nav && !nav.querySelector(".nav-indicator")) {
    var indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    nav.appendChild(indicator);
  }

  function syncNav() {
    if (!nav) return;
    var links = Array.from(nav.querySelectorAll("a[href]"));
    links.forEach(function (anchor) {
      var hrefFile = anchor.getAttribute("href").split("?")[0];
      anchor.classList.toggle("active", hrefFile === currentFile);
    });
    var active = nav.querySelector("a.active");
    var indicator = nav.querySelector(".nav-indicator");
    if (!active || !indicator) return;
    var navBox = nav.getBoundingClientRect();
    var activeBox = active.getBoundingClientRect();
    indicator.style.width = activeBox.width + "px";
    indicator.style.transform = "translateX(" + (activeBox.left - navBox.left + nav.scrollLeft) + "px)";
  }

  function addProgress() {
    if (!header || document.querySelector(".route-progress")) return;
    var rail = document.createElement("nav");
    rail.className = "route-progress";
    pages.forEach(function (page, index) {
      var dot = document.createElement("a");
      dot.href = page + "?design=" + design;
      dot.className = "route-dot";
      if (index <= pageIndex) dot.classList.add("is-lit");
      if (index === pageIndex) dot.classList.add("is-current");
      dot.setAttribute("aria-label", page.replace(".html", ""));
      rail.appendChild(dot);
    });
    header.insertAdjacentElement("afterend", rail);
  }

  function addAmbient() {
    if (document.querySelector(".ambient-field")) return;
    var field = document.createElement("div");
    field.className = "ambient-field";
    field.setAttribute("aria-hidden", "true");
    field.innerHTML = '<span></span><span></span><span></span>';
    document.body.prepend(field);
  }

  function addPanelMotion() {
    var panels = document.querySelectorAll(".hero, .page-heading, .single-panel, .main-panel, .quote-panel, .feature-card, .citation-panel, .citation-image-card");
    var observer = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 }) : null;

    panels.forEach(function (panel) {
      panel.classList.add("motion-panel");
      if (observer) observer.observe(panel);
      panel.addEventListener("pointermove", function (event) {
        var box = panel.getBoundingClientRect();
        var x = ((event.clientX - box.left) / box.width - 0.5) * 2;
        var y = ((event.clientY - box.top) / box.height - 0.5) * 2;
        panel.style.setProperty("--tilt-x", (-y * 1.3).toFixed(2) + "deg");
        panel.style.setProperty("--tilt-y", (x * 1.3).toFixed(2) + "deg");
        panel.style.setProperty("--glow-x", ((event.clientX - box.left) / box.width * 100).toFixed(2) + "%");
        panel.style.setProperty("--glow-y", ((event.clientY - box.top) / box.height * 100).toFixed(2) + "%");
      });
      panel.addEventListener("pointerleave", function () {
        panel.style.setProperty("--tilt-x", "0deg");
        panel.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  window.addEventListener("pointermove", function (event) {
    document.body.style.setProperty("--cursor-x", (event.clientX / window.innerWidth * 100).toFixed(2) + "%");
    document.body.style.setProperty("--cursor-y", (event.clientY / window.innerHeight * 100).toFixed(2) + "%");
  }, { passive: true });

  addAmbient();
  addProgress();
  syncNav();
  addPanelMotion();
  window.addEventListener("resize", syncNav);
  nav && nav.addEventListener("scroll", syncNav, { passive: true });
})();
