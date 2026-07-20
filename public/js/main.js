/* CarthaBot site — i18n (EN/FR), scroll reveals, mode picker, lazy 3D boot */
(function () {
  'use strict';

  /* ------------------------------------------------ i18n ------------------------------------------------ */
  var FR = {
    'skip': 'Aller au contenu',
    'nav.learn': 'Apprendre', 'nav.robot': 'Le robot', 'nav.app': 'Application', 'nav.specs': 'Fiche technique',
    'nav.contact': 'Contact', 'nav.download': "Obtenir l'app",
    'hero.kicker': 'Fabriqué en Tunisie par FAB619 🤖',
    'hero.title': 'Voici <em>CarthaBot</em>, le robot copain qui apprend le code aux enfants',
    'hero.sub': "Construis-le. Connecte-le. Programme-le avec des blocs colorés, un terrain de jeu 3D, des claps, des dessins et beaucoup d'imagination.",
    'hero.ctaApp': "Télécharger l'app gratuite", 'hero.ctaRobot': 'Découvrir le robot',
    'hero.badge1': '4 à 14 ans', 'hero.badge2': 'Sans compte', 'hero.badge3': 'Français & anglais',
    'hero.drag': '✋ Fais-moi tourner !',
    'partners.label': 'Avec nos partenaires',
    'pillars.title': 'Un robot, quatre super-pouvoirs',
    'pillars.sub': "CarthaBot transforme le temps d'écran en temps de création avec un parcours complet.",
    'pillars.build.t': 'Construire', 'pillars.build.d': 'Transformer les idées en vraies structures — châssis, roues et accessoires à assembler pour un CarthaBot unique.',
    'pillars.connect.t': 'Connecter', 'pillars.connect.d': "Relier capteurs, lumières et copains — les enfants découvrent les réseaux et le travail d'équipe en connectant les choses.",
    'pillars.code.t': 'Coder', 'pillars.code.d': 'Des blocs images à 4 ans au vrai Python à 14 ans — la logique grandit avec votre enfant.',
    'pillars.learn.t': 'Apprendre', 'pillars.learn.d': 'Expérimenter et découvrir — sciences, technologies et ingénierie par le jeu, les missions et les défis.',
    'modes.title': 'Quatre humeurs, un robot heureux',
    'modes.sub': "Touche une humeur — l'anneau lumineux de CarthaBot change de couleur, comme sur le vrai robot.",
    'modes.avoider.t': "Éviteur d'obstacles", 'modes.avoider.d': 'Ses yeux infrarouges repèrent les obstacles et CarthaBot les contourne poliment.',
    'modes.follower.t': 'Suiveur de ligne', 'modes.follower.d': 'Dessine une ligne noire et CarthaBot suit la piste comme une petite voiture de course.',
    'modes.friendly.t': 'Amical', 'modes.friendly.d': 'Pilote-le avec ses gros boutons colorés — avance, recule, tourne et danse !',
    'modes.obedient.t': 'Obéissant', 'modes.obedient.d': 'Tends la main et CarthaBot la suit partout comme un petit chien fidèle.',
    'tour.kicker': 'Suis la ligne',
    'tour.title': 'Emmène CarthaBot faire un tour',
    'tour.sub': 'Fais défiler pour faire rouler CarthaBot sur la piste. Chaque arrêt est une vraie pièce, avec un vrai rôle.',
    'tour.start': 'Départ', 'tour.finish': '🏁 Prêt à rouler',
    'tour.line.t': 'Suiveur de ligne',
    'tour.line.d': 'Sept yeux infrarouges lisent la ligne noire 100 fois par seconde et gardent CarthaBot bien sur la piste.',
    'tour.line.c': '7× capteurs IR · mode suiveur',
    'tour.avoid.t': "Éviteur d'obstacles",
    'tour.avoid.d': "Deux détecteurs IR à l'avant repèrent les murs, et CarthaBot les contourne poliment.",
    'tour.avoid.c': '2× IR avant · mode éviteur',
    'tour.remote.t': 'Télécommande',
    'tour.remote.d': "Un récepteur IR écoute la petite télécommande : pilote CarthaBot d'un bout à l'autre de la pièce.",
    'tour.remote.c': 'Récepteur IR · 38 kHz',
    'tour.leds.t': '13 LED RGB',
    'tour.leds.d': 'Treize LED RGB pilotables colorent CarthaBot comme tu veux — un seul bloc les allume toutes.',
    'tour.tune.t': 'Capteurs réglables',
    'tour.tune.d': 'De petits potentiomètres permettent de régler finement les capteurs avant, arrière et de ligne avec un tournevis.',
    'tour.tune.c': '3× potentiomètres',
    'tour.power.t': "De l'énergie toute la journée",
    'tour.power.d': 'Une batterie Li-Po 3,7 V 1500 mAh assure deux heures de jeu ou plus sur une seule charge.',
    'tour.power.c': 'Li-Po 3,7 V · 1500 mAh · 2h+',
    'tour.brain.t': 'Cerveau & sans fil',
    'tour.brain.d': 'Un cerveau RP2040 fait tourner MicroPython et envoie tes programmes en USB, Wi-Fi ou Bluetooth.',
    'tour.brain.c': 'RP2040 · USB · Wi-Fi · BLE',
    'app.kicker': 'Gratuit pour Windows',
    'app.title': "L'application CarthaBot Companion",
    'app.sub': "Tout ce qu'il faut pour donner vie à CarthaBot — une app ludique, sans compte, en français et en anglais.",
    'app.f1.t': 'Codage dès 4 ans', 'app.f1.d': "Associe des images événements et actions — « quand j'entends un clap → deviens vert ! » — et appuie sur play.",
    'app.f2.t': 'Terrain de jeu 3D & missions', 'app.f2.d': "Teste d'abord tes programmes sur un CarthaBot virtuel — six mondes, des pièces, des missions et des étoiles.",
    'app.f3.t': 'Dessine avec tes mains', 'app.f3.d': 'Dessine dans les airs devant la webcam — CarthaBot prend un stylo et le trace sur papier.',
    'app.f4.t': 'Claps & sons', 'app.f4.d': 'CarthaBot a de vraies oreilles — tape dans tes mains et il réagit, avec un test micro intégré.',
    'app.f5.t': 'Codage sans fil', 'app.f5.d': 'Envoie les programmes en Wi-Fi ou Bluetooth — plus de câble, le robot se promène librement.',
    'app.f6.t': 'Des blocs à Python', 'app.f6.d': 'Les blocs CarthaSoft pour débuter, un vrai éditeur Python pour les grands — une progression toute douce.',
    'dl.title': 'Prêt à jouer ?',
    'dl.sub': "Télécharge l'application CarthaBot Companion — gratuite, hors-ligne, faite avec amour par FAB619.",
    'dl.btn': 'Télécharger pour Windows',
    'dl.note': 'Windows 10/11 • un seul .exe, lance-le • sans installation • Français & anglais',
    'specs.title': 'Sous la coque',
    'specs.sub': 'De la vraie robotique, dans un visage tout mignon.',
    'specs.s1.t': 'Vitesse max', 'specs.s2.t': 'Batterie', 'specs.s2.d': 'Li-Po 3,7 V · 1500 mAh',
    'specs.s3.t': 'Autonomie', 'specs.s3.d': '2 h et + par charge',
    'specs.s4.t': 'Yeux', 'specs.s4.d': '9 capteurs infrarouges',
    'specs.s5.t': 'Lumières', 'specs.s5.d': '13 LED RGB',
    'specs.s6.t': 'Oreilles & voix', 'specs.s6.d': 'Micro + haut-parleur',
    'specs.s7.t': 'Cerveau', 'specs.s8.t': 'Connexions',
    'specs.custom': 'Personnalise-le : châssis imprimé 3D ou métal, packs de couleurs, accessoires à clipser et planches de stickers.',
    'footer.tag': 'Un robot éducatif conçu et fabriqué par FAB619 en Tunisie.',
    'footer.partners': 'Partenaires', 'footer.explore': 'Explorer',
    'footer.rights': 'Tous droits réservés.'
  };

  var EN = {};   // captured from the DOM on first load

  function applyLang(lang) {
    var dict = lang === 'fr' ? FR : EN;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (EN[k] === undefined) EN[k] = el.textContent;
      if (dict[k] !== undefined) el.textContent = dict[k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      if (EN[k] === undefined) EN[k] = el.innerHTML;
      if (dict[k] !== undefined) el.innerHTML = dict[k];
    });
    document.documentElement.lang = lang;
    var t = document.getElementById('langToggle');
    t.textContent = lang === 'fr' ? 'EN' : 'FR';
    t.setAttribute('aria-label', lang === 'fr' ? 'Switch to English' : 'Passer en français');
    try { localStorage.setItem('cartha-lang', lang); } catch (e) { /* private mode */ }
  }

  var lang = 'en';
  try { lang = localStorage.getItem('cartha-lang') || ((navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en'); } catch (e) { lang = 'en'; }
  applyLang(lang);

  document.getElementById('langToggle').addEventListener('click', function () {
    lang = lang === 'fr' ? 'en' : 'fr';
    applyLang(lang);
  });

  /* --------------------------------------------- scroll reveals ------------------------------------------ */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    var seen = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // small stagger between siblings revealed in the same batch
        e.target.style.setProperty('--rd', ((seen++ % 6) * 45) + 'ms');
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    // The browser may restore a deep scroll position (reload, #anchor): anything
    // already at or above the current viewport must show instantly — only
    // content still below the fold gets the scroll-in animation.
    var fold = window.innerHeight;
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.getBoundingClientRect().top < fold) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ----------------------------------------------- mode picker ------------------------------------------- */
  var MODE_COLORS = { avoider: '#F7941C', follower: '#22C55E', friendly: '#F164A2', obedient: '#587FED' };
  var moodGlow = document.getElementById('moodGlow');
  function selectMode(btn) {
    document.querySelectorAll('.mode-card').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
    var color = MODE_COLORS[btn.dataset.mode] || '#4F46E5';
    if (moodGlow) moodGlow.style.setProperty('--mood', color);
    window.dispatchEvent(new CustomEvent('cartha-mode', { detail: { mode: btn.dataset.mode, color: color } }));
  }
  document.querySelectorAll('.mode-card').forEach(function (btn) {
    btn.addEventListener('click', function () { selectMode(btn); });
  });
  // seed the mood ring with the first (active) mode's colour
  var firstMode = document.querySelector('.mode-card.is-active');
  if (firstMode && moodGlow) moodGlow.style.setProperty('--mood', MODE_COLORS[firstMode.dataset.mode] || '#F7941C');

  /* ----------------------------------------------- lazy 3D boot ------------------------------------------ */
  // The hero renders instantly with a lightweight SVG mascot; the real WebGL robot
  // loads after the page is interactive so first paint stays fast (A-grade LCP).
  function boot3d() {
    import('/js/hero3d.js').then(function (m) { m.start(); }).catch(function (err) {
      // No WebGL / blocked module? The SVG mascot simply stays — the page still works.
      console.warn('3D disabled:', err && err.message);
    });
    // the journey line's 3D robot (independent; falls back to the still photo)
    import('/js/journey3d.js').then(function (m) { m.start(); }).catch(function (err) {
      console.warn('journey 3D disabled:', err && err.message);
    });
  }
  if (document.readyState === 'complete') scheduleBoot();
  else window.addEventListener('load', scheduleBoot, { once: true });
  function scheduleBoot() {
    if ('requestIdleCallback' in window) requestIdleCallback(boot3d, { timeout: 2500 });
    else setTimeout(boot3d, 600);
  }
})();
