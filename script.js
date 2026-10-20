/* =========================================================
   Mon projet de formation – DEAES
   100 % local : aucune requête réseau, aucun stockage.
   ========================================================= */

/* ---------- À PERSONNALISER ---------- */
const CONFIG = {
  // Adresse du référent de parcours qui recevra les PDF (laisser "" pour aucun destinataire pré-rempli)
  emailReferent: "",
  // Libellé imprimé en tête du PDF
  promotion: "DEAES · Promotion AES 25"
};
/* ------------------------------------- */

// Obligations de stage selon le statut (document « Formation DEAES »)
const STATUTS = {
  "Formation initiale": "3 stages de 280 h (8 semaines chacun), soit 840 h, sur 3 terrains et avec 3 publics différents.",
  "En situation d'emploi": "Formation pratique chez votre employeur, plus 1 stage de 140 h (4 semaines) hors employeur, avec un public différent.",
  "Contrat de professionnalisation": "Formation pratique chez votre employeur, plus 1 stage de 140 h (4 semaines) hors employeur, avec un public différent.",
  "Contrat d'apprentissage": "Formation pratique chez votre employeur, plus 1 stage de 140 h (4 semaines) hors employeur. Démarches auprès du CFA du social au moins 3 semaines avant le stage.",
  "Transition professionnelle": "1 ou 3 stages selon votre situation et votre employeur : à vérifier avec votre référent de parcours."
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const form = $("#projet");
let dirty = false;

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
  const d = {};
  ["statut", "experience", "decouvrir", "approfondir", "qualites", "qualitesPrecisions", "objectifs",
   "freins", "difficultes", "pistes", "publics", "structures", "apprehensions",
   "competencesListe", "competences", "cv", "lm", "candidatures", "besoinRP", "avenir"].forEach(k => d[k] = val(k));
  return d;
}

/* ---------- Progression ---------- */
function sectionDone(sec) {
  return $$("textarea, input[type=number]", sec).some(i => i.value.trim()) ||
         $$("input[type=checkbox]:checked, input[type=radio]:checked", sec).length > 0;
}

function refresh() {
  const secs = $$("[data-section]");
  let n = 0;
  secs.forEach(s => { const d = sectionDone(s); s.classList.toggle("done", d); if (d) n++; });
  $("#progressFill").style.width = (n / secs.length * 100) + "%";
  $("#progressText").textContent = n + " / " + secs.length + " rubriques";
  const st = val("statut");
  $("#statutHint").textContent = st ? STATUTS[st] : "Sélectionnez votre statut pour afficher vos obligations de stage.";
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
  doc.text("Généré le " + new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) +
    " · Statut : " + (clean(d.statut) || "non renseigné"), M, 32);
  y = 50;

  section(1, "Votre situation");
  qa("Statut", d.statut ? d.statut + " – " + STATUTS[d.statut] : "");
  qa("Vos expériences auprès de personnes accompagnées", d.experience);

  section(2, "Vos attentes en stage");
  qa("Ce que vous souhaitez découvrir ou apprendre", d.decouvrir);
  qa("Ce que vous souhaitez développer, approfondir ou perfectionner", d.approfondir);

  section(3, "Vos qualités professionnelles");
  qa("Vous vous reconnaissez dans", d.qualites);
  qa("Un exemple concret", d.qualitesPrecisions);

  section(4, "Vos objectifs");
  qa("Vos objectifs à court, moyen et long terme", d.objectifs);

  section(5, "Vos difficultés et freins");
  qa("Freins identifiés", d.freins);
  qa("Les difficultés que vous identifiez", d.difficultes);
  qa("Les pistes pour y remédier", d.pistes);

  section(6, "Publics et structures");
  qa("Publics que vous souhaitez découvrir", d.publics);
  qa("Structures dans lesquelles vous vous projetez", d.structures);
  qa("Public ou structure qui suscite une appréhension", d.apprehensions);

  section(7, "Compétences");
  qa("Compétences que vous souhaitez développer en stage", d.competencesListe);
  qa("Autres compétences, précisions", d.competences);

  section(8, "Votre recherche de stage");
  qa("CV", d.cv);
  qa("Lettre de motivation", d.lm);
  qa("Structures déjà contactées pour votre prochain stage", d.candidatures);
  qa("Ce dont vous avez besoin de la part de votre référent de parcours", d.besoinRP);

  section(9, "Vos projections professionnelles");
  qa("Après le diplôme", d.avenir);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text("Mon projet de formation – DEAES", M, H - 10);
    doc.text("Page " + i + " / " + pages, W - M, H - 10, { align: "right" });
  }
  return doc;
}

/* ---------- Événements ---------- */
updateMail();
refresh();

form.addEventListener("input", () => { dirty = true; refresh(); });
form.addEventListener("change", () => { dirty = true; refresh(); });
form.addEventListener("submit", e => e.preventDefault());

$("#btnPdf").addEventListener("click", () => {
  const status = $("#pdfStatus");
  try {
    const doc = buildPdf(collect());
    doc.save("Mon-projet-de-formation-DEAES-" + new Date().toISOString().slice(0, 10) + ".pdf");
    status.textContent = "PDF généré. Retrouvez-le dans vos téléchargements, puis joignez-le à votre message.";
    dirty = false;
  } catch (err) {
    status.textContent = "Le PDF n'a pas pu être généré sur cet appareil. Essayez avec un autre navigateur (Chrome, Safari, Firefox).";
    console.error(err);
  }
});

$("#btnReset").addEventListener("click", () => {
  if (confirm("Effacer toutes vos réponses ?")) {
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
