/* =========================================================
   Mon projet de formation – DEAES
   100 % local : aucune requête réseau, aucun stockage.
   ========================================================= */

/* ---------- À PERSONNALISER ---------- */
const CONFIG = {
  // Adresse du référent de parcours qui recevra les PDF (laisser "" pour aucun destinataire pré-rempli)
  emailReferent: "",
  // Libellé de la promotion, imprimé en tête du PDF
  promotion: "AES 25 · Formation initiale",
  stages: [
    { n: 1, periode: "du 16 novembre 2026 au 5 février 2027", debut: "2026-11-16",
      bloc: "Bloc 1", focus: "Accompagner un temps clé du quotidien",
      certif: "Dossier de pratiques + soutenance orale le 28 mai 2027" },
    { n: 2, periode: "du 15 février au 23 avril 2027", debut: "2027-02-15",
      bloc: "Bloc 4", focus: "Une action en lien avec le projet personnalisé",
      certif: "Dossier + soutenance orale le 15 juin 2027" },
    { n: 3, periode: "du 3 mai au 30 juillet 2027", debut: "2027-05-03",
      bloc: "Bloc 3", focus: "Un projet d'activité ou d'animation",
      certif: "Dossier + soutenance orale le 24 septembre 2027" }
  ]
};
/* ------------------------------------- */

const PUBLICS = [
  "Personnes âgées",
  "Enfants en situation de handicap",
  "Adultes en situation de handicap",
  "Protection de l'enfance",
  "Accompagnement à domicile",
  "Précarité / exclusion",
  "Handicap psychique",
  "Milieu scolaire (inclusion)",
  "Autre"
];
const AVANCEMENT = ["Pas encore commencé", "Je cherche", "Candidatures envoyées", "Entretien prévu", "Stage trouvé", "Convention demandée"];
const BLOCS = [
  ["Bloc 1", "Actes essentiels de la vie quotidienne"],
  ["Bloc 2", "Vie quotidienne : respect, hygiène et sécurité"],
  ["Bloc 3", "Vie sociale et relationnelle"],
  ["Bloc 4", "Positionnement de travailleur social"],
  ["Bloc 5", "Équipe pluriprofessionnelle, risques, transmissions"]
];
const INTERDITS = /(cr[eè]che|multi[- ]?accueil|halte[- ]?garderie|petite enfance|0\s*[-àa]\s*3\s*ans|prison|carc[eé]ral|maison d.arr[eê]t|centre p[eé]nitentiaire|p[eé]nitentiaire)/i;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const form = $("#projet");
let dirty = false;

/* ---------- Construction dynamique ---------- */
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") e.textContent = v;
    else e.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c) e.appendChild(c);
  return e;
}

function buildStages() {
  const box = $("#stages");
  CONFIG.stages.forEach(s => {
    const id = "s" + s.n;
    const pubSel = el("select", { id: id + "public", name: id + "public" }, [el("option", { value: "", text: "— Choisir —" })]);
    PUBLICS.forEach(p => pubSel.appendChild(el("option", { value: p, text: p })));
    const avSel = el("select", { id: id + "avancement", name: id + "avancement" }, [el("option", { value: "", text: "— Choisir —" })]);
    AVANCEMENT.forEach(p => avSel.appendChild(el("option", { value: p, text: p })));

    const card = el("div", { class: "stage" }, [
      el("div", { class: "stage-head" }, [
        el("h3", { text: "Stage " + s.n }),
        el("span", { class: "tag", text: s.bloc + " · " + s.focus }),
        el("div", { class: "stage-meta", text: "Période : " + s.periode + " · 280 h · " + s.certif })
      ]),
      el("div", { class: "grid2" }, [
        el("div", { class: "field" }, [el("label", { class: "label", for: id + "public", text: "Public envisagé" }), pubSel]),
        el("div", { class: "field" }, [el("label", { class: "label", for: id + "avancement", text: "Où j'en suis" }), avSel])
      ]),
      el("div", { class: "field" }, [
        el("label", { class: "label", for: id + "structure", text: "Type de structure et pistes d'établissements" }),
        el("input", { type: "text", id: id + "structure", name: id + "structure", placeholder: "Ex. : EHPAD à Montreuil, IME de…" })
      ]),
      el("div", { class: "field" }, [
        el("label", { class: "label", for: id + "pourquoi", text: "Pourquoi ce choix, en lien avec le " + s.bloc + " ?" }),
        el("textarea", { id: id + "pourquoi", name: id + "pourquoi", rows: "2" })
      ])
    ]);
    box.appendChild(card);
  });
}

function buildScale() {
  const box = $("#blocsScale");
  BLOCS.forEach(([b, t], i) => {
    const name = "niveau" + (i + 1);
    const chips = el("div", { class: "chips", "data-single": "" });
    [1, 2, 3, 4].forEach(v => {
      chips.appendChild(el("label", {}, [el("input", { type: "radio", name, value: String(v), "aria-label": b + " niveau " + v }), document.createTextNode(String(v))]));
    });
    box.appendChild(el("div", { class: "scale-row" }, [
      el("div", { class: "bloc" }, [el("strong", { text: b }), document.createTextNode(t)]),
      chips
    ]));
  });
}

/* ---------- Lecture des réponses ---------- */
const val = name => {
  const f = form.elements[name];
  if (!f) return "";
  if (f instanceof RadioNodeList) {
    const checked = Array.from(f).filter(i => i.checked).map(i => i.value);
    return f[0] && f[0].type === "checkbox" ? checked : (checked[0] || "");
  }
  if (f.type === "checkbox") return f.checked ? [f.value] : [];
  return (f.value || "").trim();
};

function collect() {
  return {
    statut: val("statut"),
    experience: val("experience"),
    decouvrir: val("decouvrir"),
    approfondir: val("approfondir"),
    qualites: val("qualites"),
    qualitesPrecisions: val("qualitesPrecisions"),
    objectifs: val("objectifs"),
    realisables: val("realisables"),
    freins: val("freins"),
    difficultes: val("difficultes"),
    pistes: val("pistes"),
    publics: val("publics"),
    structures: val("structures"),
    apprehensions: val("apprehensions"),
    stages: CONFIG.stages.map(s => ({
      ...s,
      public: val("s" + s.n + "public"),
      avancement: val("s" + s.n + "avancement"),
      structure: val("s" + s.n + "structure"),
      pourquoi: val("s" + s.n + "pourquoi")
    })),
    competences: val("competences"),
    niveaux: BLOCS.map((b, i) => val("niveau" + (i + 1))),
    cv: val("cv"),
    lm: val("lm"),
    candidatures: val("candidatures"),
    besoinRP: val("besoinRP"),
    avenir: val("avenir")
  };
}

/* ---------- Progression & cohérence ---------- */
function sectionDone(sec) {
  return $$("textarea, input[type=text], input[type=number]", sec).some(i => i.value.trim()) ||
         $$("select", sec).some(s => s.value) ||
         $$("input[type=checkbox]:checked", sec).length > 0 ||
         $$("input[type=radio]:checked", sec).some(r => r.name !== "statut");
}

function updateProgress() {
  const secs = $$("[data-section]");
  let n = 0;
  secs.forEach(s => { const d = sectionDone(s); s.classList.toggle("done", d); if (d) n++; });
  $("#progressFill").style.width = (n / secs.length * 100) + "%";
  $("#progressText").textContent = n + " / " + secs.length + " rubriques";
}

function coherenceMessages(d) {
  const msgs = [];
  const chosen = d.stages.map(s => s.public).filter(p => p && p !== "Autre");
  const dup = chosen.filter((p, i) => chosen.indexOf(p) !== i);
  if (dup.length) msgs.push(["alert", "Même public choisi pour plusieurs stages (" + [...new Set(dup)].join(", ") + "). Les 3 stages doivent se dérouler avec des publics et sur des terrains différents."]);
  d.stages.forEach(s => {
    if (INTERDITS.test(s.structure)) msgs.push(["alert", "Stage " + s.n + " : la petite enfance (0–3 ans) et le milieu carcéral ne sont pas acceptés pour les stages AES."]);
  });
  const s1 = d.stages[0];
  const jours = Math.ceil((new Date(s1.debut) - new Date()) / 86400000);
  if (jours > 0 && !["Stage trouvé", "Convention demandée"].includes(s1.avancement)) {
    msgs.push(["alert", "Le stage 1 peut commencer dans " + jours + " jour" + (jours > 1 ? "s" : "") + ". Sans convention signée, pas de départ en stage."]);
  }
  if (chosen.length === 3 && !dup.length) msgs.push(["ok", "Trois publics différents : ton parcours respecte la règle des 3 terrains."]);
  return msgs;
}

function updateCoherence() {
  const box = $("#coherence");
  box.textContent = "";
  coherenceMessages(collect()).forEach(([cls, t]) => box.appendChild(el("p", { class: cls, text: t })));
}

/* ---------- Mail ---------- */
function updateMail() {
  const subject = "Mon projet de formation – DEAES";
  const body = "Bonjour,\n\nVous trouverez ci-joint mon projet de formation (PDF).\n\nCordialement,\n";
  $("#btnMail").href = "mailto:" + encodeURIComponent(CONFIG.emailReferent).replace("%40", "@") +
    "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}

/* ---------- PDF ---------- */
const WINANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
function clean(t) {
  return String(t || "")
    .replace(/\r/g, "")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/…/g, "...")
    .split("").map(c => (c.charCodeAt(0) < 256 || WINANSI_EXTRA.includes(c)) ? c : "").join("");
}

function buildPdf(d) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 18, CW = W - 2 * M;
  const BRAND = [29, 92, 99], ACCENT = [217, 115, 78], INK = [31, 42, 46], MUTED = [93, 107, 112], LINE = [226, 221, 211];
  let y = 0;

  const footer = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED);
      doc.text("Mon projet de formation – DEAES", M, H - 10);
      doc.text("Page " + i + " / " + pages, W - M, H - 10, { align: "right" });
    }
  };
  const ensure = h => { if (y + h > H - 18) { doc.addPage(); y = M; } };

  const section = (n, title) => {
    ensure(18);
    y += 4;
    doc.setFillColor(...BRAND); doc.circle(M + 3.5, y + 0.2, 3.5, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
    doc.text(String(n), M + 3.5, y + 1.4, { align: "center" });
    doc.setFontSize(13); doc.setTextColor(...BRAND);
    doc.text(clean(title), M + 10, y + 1.6);
    y += 5;
    doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, y, W - M, y);
    y += 5;
  };

  const qa = (q, a) => {
    const answer = Array.isArray(a) ? a.join(" · ") : a;
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
    const ql = doc.splitTextToSize(clean(q), CW);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10.5);
    const al = doc.splitTextToSize(clean(answer) || "—", CW);
    ensure(ql.length * 4.4 + Math.min(al.length, 3) * 5 + 3);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...MUTED);
    doc.text(ql, M, y); y += ql.length * 4.4;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(...(answer ? INK : MUTED));
    al.forEach(line => { ensure(5); doc.text(line, M, y); y += 5; });
    y += 3;
  };

  // En-tête
  doc.setFillColor(...BRAND); doc.rect(0, 0, W, 38, "F");
  doc.setFillColor(...ACCENT); doc.rect(0, 38, W, 1.6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text(clean(CONFIG.promotion).toUpperCase(), M, 14);
  doc.setFont("helvetica", "bold"); doc.setFontSize(22);
  doc.text("Mon projet de formation", M, 25);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
  doc.text("Généré le " + new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) + " · Statut : " + clean(d.statut), M, 32);
  y = 50;

  section(1, "Ma situation");
  qa("Mes expériences auprès de personnes accompagnées", d.experience);

  section(2, "Ce que j'attends de mes stages");
  qa("Ce que je souhaite découvrir ou apprendre", d.decouvrir);
  qa("Ce que je souhaite développer, approfondir ou perfectionner", d.approfondir);

  section(3, "Mes qualités professionnelles");
  qa("Je me reconnais dans", d.qualites);
  qa("Un exemple concret", d.qualitesPrecisions);

  section(4, "Mes objectifs");
  qa("Les objectifs que je peux me fixer", d.objectifs);
  qa("Sont-ils réalisables ?", d.realisables);

  section(5, "Mes difficultés et freins");
  qa("Freins identifiés", d.freins);
  qa("Mes difficultés", d.difficultes);
  qa("Pistes pour y remédier", d.pistes);

  section(6, "Publics et structures");
  qa("Publics que je souhaite découvrir", d.publics);
  qa("Structures dans lesquelles je me projette", d.structures);
  qa("Ce qui m'inquiète", d.apprehensions);

  section(7, "Mon parcours en 3 stages");
  d.stages.forEach(s => {
    ensure(34);
    doc.setFillColor(246, 243, 238); doc.roundedRect(M, y - 4, CW, 13, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...INK);
    doc.text("Stage " + s.n + " – " + clean(s.bloc) + " : " + clean(s.focus), M + 3, y + 1);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
    doc.text(clean(s.periode + " · 280 h · " + s.certif), M + 3, y + 6);
    y += 14;
    qa("Public envisagé", s.public);
    qa("Structure et pistes d'établissements", s.structure);
    qa("Pourquoi ce choix", s.pourquoi);
    qa("Où j'en suis", s.avancement);
  });
  const msgs = coherenceMessages(d);
  if (msgs.length) qa("Points de vigilance relevés automatiquement", msgs.map(m => (m[0] === "ok" ? "OK : " : "! ") + m[1]).join("\n"));

  section(8, "Compétences");
  qa("Compétences que je souhaite acquérir", d.competences);
  ensure(BLOCS.length * 7 + 8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...MUTED);
  doc.text("Auto-positionnement (1 = je découvre … 4 = je maîtrise)", M, y); y += 6;
  BLOCS.forEach(([b, t], i) => {
    const v = parseInt(d.niveaux[i], 10) || 0;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...INK);
    doc.text(b, M, y);
    doc.setFont("helvetica", "normal");
    doc.text(clean(t), M + 16, y);
    for (let k = 0; k < 4; k++) {
      const x = W - M - 32 + k * 8;
      if (k < v) { doc.setFillColor(...BRAND); doc.roundedRect(x, y - 3.6, 6.5, 4.5, 1, 1, "F"); }
      else { doc.setDrawColor(...LINE); doc.roundedRect(x, y - 3.6, 6.5, 4.5, 1, 1, "S"); }
    }
    if (!v) { doc.setTextColor(...MUTED); doc.setFontSize(8); doc.text("non renseigné", W - M - 34, y, { align: "right" }); }
    y += 7;
  });
  y += 2;

  section(9, "Ma recherche de stage");
  qa("Mon CV", d.cv);
  qa("Ma lettre de motivation", d.lm);
  qa("Structures déjà contactées pour le stage 1", d.candidatures);
  qa("Ce dont j'ai besoin de mon référent de parcours", d.besoinRP);

  section(10, "Mes projections professionnelles");
  qa("Après le diplôme, je me vois", d.avenir);

  footer();
  return doc;
}

/* ---------- Événements ---------- */
function refresh() { updateProgress(); updateCoherence(); }

function init() {
  buildStages();
  buildScale();
  updateMail();
  refresh();

  form.addEventListener("input", () => { dirty = true; refresh(); });
  form.addEventListener("change", () => { dirty = true; refresh(); });
  form.addEventListener("submit", e => e.preventDefault());

  $("#btnPdf").addEventListener("click", () => {
    const status = $("#pdfStatus");
    try {
      const doc = buildPdf(collect());
      const date = new Date().toISOString().slice(0, 10);
      doc.save("Mon-projet-de-formation-DEAES-" + date + ".pdf");
      status.textContent = "PDF généré. Retrouve-le dans tes téléchargements, puis joins-le à ton mail.";
      dirty = false;
    } catch (err) {
      status.textContent = "Le PDF n'a pas pu être généré sur cet appareil. Essaie avec un autre navigateur (Chrome, Safari, Firefox).";
      console.error(err);
    }
  });

  $("#btnReset").addEventListener("click", () => {
    if (confirm("Effacer toutes tes réponses ?")) {
      form.reset();
      dirty = false;
      $("#pdfStatus").textContent = "";
      refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  window.addEventListener("beforeunload", e => {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });
}

init();
