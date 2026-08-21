/*
 * Preisregler, Darstellungswechsel und die Einblend-Bewegung.
 *
 * Laeuft mit `defer`, also nach dem Aufbau der Seite und ohne sie aufzuhalten.
 * Die Seite ist ohne dieses Skript vollstaendig lesbar: Der `<noscript>`-Block
 * im Preisabschnitt traegt dieselben Zahlen als Tabelle.
 *
 * ── DIE EINE STELLE, AN DER DER PREIS STEHT ─────────────────────────────────
 *
 * Massgeblich ist `docs/architektur/preis-und-zaehlung.md` im Hauptprojekt.
 * Hier stehen nur die drei Zahlen, aus denen alles andere folgt. Aendert sich
 * der Preis, aendert er sich hier — und `preise-erzeugen.py --pruefe` haelt
 * die Tabelle im `<noscript>`-Block dagegen, damit die beiden nicht
 * auseinanderlaufen.
 *
 * Beide Betraege sind BRUTTO: der Gesamtpreis, den ein Privatvermieter zahlt.
 */
const MONAT_JE_EINHEIT = 9.99;
const JAHR_JE_EINHEIT = 100.0;
const FREI = 1;

/* Der Regler reicht bis 100. Das Zahlenfeld daneben nimmt mehr an — eine
   Verwaltung mit 340 Wohnungen soll sie eintippen koennen, ohne dass ein
   Regler mit 3400 Stufen entsteht, auf dem niemand die 12 trifft. */
const REGLER_MAX = 100;
const ZAHL_MAX = 9999;

const euro = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const ganz = new Intl.NumberFormat("de-DE");

const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ── Rechnung ─────────────────────────────────────────────────────────────── */

function rechne(einheiten) {
  const zahlbar = Math.max(0, einheiten - FREI);
  const monat = zahlbar * MONAT_JE_EINHEIT;
  const jahr = zahlbar * JAHR_JE_EINHEIT;
  return {
    einheiten,
    zahlbar,
    monat,
    jahr,
    jahrProMonat: jahr / 12,
    // Was die Jahreszahlung gegenueber zwoelf Monatszahlungen spart.
    ersparnis: monat * 12 - jahr,
  };
}

/* ── Zahlen, die hochlaufen ───────────────────────────────────────────────── */

/*
 * Laesst einen Betrag von seinem alten auf seinen neuen Wert laufen.
 *
 * Warum ueberhaupt: Der grosse Betrag ist die Antwort auf die Frage, die der
 * Nutzer gerade stellt. Springt er, sieht man nur das Ergebnis; laeuft er, sieht
 * man den Zusammenhang zur Reglerbewegung.
 *
 * Warum mit Ruecksicht: Wer `prefers-reduced-motion` gesetzt hat, hat dafuer in
 * der Regel einen medizinischen Grund. Dann wird gesetzt, nicht animiert.
 */
function laufeZu(element, vonWert, zuWert, formatiere) {
  if (ruhig.matches) {
    element.textContent = formatiere(zuWert);
    return;
  }
  if (element._lauf) cancelAnimationFrame(element._lauf);

  const dauer = 260;
  const start = performance.now();
  const schritt = (jetzt) => {
    const anteil = Math.min(1, (jetzt - start) / dauer);
    // Sanft auslaufend: schnell los, ruhig ankommen.
    const weich = 1 - Math.pow(1 - anteil, 3);
    element.textContent = formatiere(vonWert + (zuWert - vonWert) * weich);
    if (anteil < 1) element._lauf = requestAnimationFrame(schritt);
  };
  element._lauf = requestAnimationFrame(schritt);
}

/* ── Der Regler ───────────────────────────────────────────────────────────── */

function reglerAufsetzen() {
  const regler = document.getElementById("regler");
  const zahl = document.getElementById("zahl");
  const rechner = document.querySelector(".rechner");
  if (!regler || !zahl || !rechner) return;

  const betrag = document.getElementById("betrag");
  const takt = document.getElementById("takt");
  const nebensatz = document.getElementById("nebensatz");
  const herleitung = document.getElementById("herleitung");
  const vorteil = document.getElementById("jahresvorteil");
  const viele = document.getElementById("viele");
  const schalter = Array.from(document.querySelectorAll(".taktwahl button"));

  let einheiten = Number(regler.value) || 1;
  let jaehrlich = false;
  let letzterBetrag = 0;

  function zeichne(mitLauf) {
    const r = rechne(einheiten);
    const neu = jaehrlich ? r.jahrProMonat : r.monat;

    if (mitLauf) laufeZu(betrag, letzterBetrag, neu, (v) => euro.format(v));
    else betrag.textContent = euro.format(neu);
    letzterBetrag = neu;

    takt.textContent = "im Monat";
    nebensatz.textContent = jaehrlich
      ? `${euro.format(r.jahr)} € im Jahr, jährlich gezahlt`
      : `${euro.format(r.monat * 12)} € im Jahr, monatlich gezahlt`;

    if (r.zahlbar === 0) {
      herleitung.textContent =
        "Ihre erste Einheit ist dauerhaft kostenlos — ohne Frist und ohne Kreditkarte.";
    } else {
      const je = jaehrlich ? "100,00 €" : "9,99 €";
      herleitung.textContent =
        `${ganz.format(r.einheiten)} Einheiten − 1 dauerhaft kostenlos ` +
        `= ${ganz.format(r.zahlbar)} × ${je}`;
    }

    vorteil.textContent = r.ersparnis > 0 ? `spart ${euro.format(r.ersparnis)} €` : "";
    vorteil.hidden = r.ersparnis <= 0 || !jaehrlich;

    viele.hidden = einheiten <= REGLER_MAX;

    // Der Fuellstand der Reglerschiene, als Anteil fuer die CSS-Regel.
    const anteil = ((Math.min(einheiten, REGLER_MAX) - 1) / (REGLER_MAX - 1)) * 100;
    rechner.style.setProperty("--fuellung", anteil + "%");

    /*
     * Der eigentliche Barrierefreiheits-Griff: Eine Vorlesehilfe sagt bei einem
     * Schieberegler von sich aus nur die nackte Zahl an — „37". Damit weiss der
     * Nutzer, wo der Regler steht, aber nicht, was es kostet, und das ist die
     * Frage, um die es hier geht. `aria-valuetext` ersetzt die Ansage.
     *
     * Bewusst KEIN aria-live auf dem Ergebnis: Das spraeche bei jedem einzelnen
     * Tastendruck den ganzen Block noch einmal vor.
     */
    regler.setAttribute(
      "aria-valuetext",
      r.zahlbar === 0
        ? "1 Einheit — dauerhaft kostenlos"
        : `${r.einheiten} Einheiten — ${euro.format(neu)} Euro im Monat`,
    );
  }

  function setze(wert, mitLauf) {
    einheiten = Math.max(1, Math.min(ZAHL_MAX, Math.round(wert) || 1));
    regler.value = String(Math.min(einheiten, REGLER_MAX));
    if (document.activeElement !== zahl) zahl.value = String(einheiten);
    zeichne(mitLauf);
  }

  regler.addEventListener("input", () => setze(Number(regler.value), true));

  zahl.addEventListener("input", () => {
    // Waehrend des Tippens nicht gegen den Nutzer arbeiten: ein leeres Feld
    // bleibt leer, statt sofort auf 1 zu springen.
    if (zahl.value === "") return;
    setze(Number(zahl.value), true);
  });
  zahl.addEventListener("blur", () => setze(Number(zahl.value), false));

  schalter.forEach((knopf) => {
    knopf.addEventListener("click", () => {
      jaehrlich = knopf.dataset.takt === "jahr";
      schalter.forEach((k) => {
        const aktiv = k === knopf;
        k.classList.toggle("aktiv", aktiv);
        k.setAttribute("aria-pressed", String(aktiv));
      });
      zeichne(true);
    });
  });

  setze(einheiten, false);
  rechner.hidden = false;
}

/* ── Hell, dunkel, wie das System ─────────────────────────────────────────── */

function darstellungAufsetzen() {
  const knopf = document.getElementById("darstellung");
  if (!knopf) return;

  const wurzel = document.documentElement;
  const reihe = ["system", "hell", "dunkel"];
  const namen = { system: "wie das System", hell: "hell", dunkel: "dunkel" };

  function jetzige() {
    return wurzel.getAttribute("data-darstellung") || "system";
  }

  function beschrifte() {
    const w = jetzige();
    knopf.setAttribute("aria-label", `Darstellung: ${namen[w]}. Umschalten.`);
    knopf.dataset.wahl = w;
  }

  knopf.addEventListener("click", () => {
    const naechste = reihe[(reihe.indexOf(jetzige()) + 1) % reihe.length];
    if (naechste === "system") wurzel.removeAttribute("data-darstellung");
    else wurzel.setAttribute("data-darstellung", naechste);
    try {
      if (naechste === "system") localStorage.removeItem("immoleicht-darstellung");
      else localStorage.setItem("immoleicht-darstellung", naechste);
    } catch (e) {
      /* Gesperrter Speicher: die Wahl gilt dann nur fuer diesen Besuch. */
    }
    beschrifte();
  });

  beschrifte();
  knopf.hidden = false;
}

/* ── Einblenden beim Scrollen ─────────────────────────────────────────────── */

function enthuellenAufsetzen() {
  const stuecke = document.querySelectorAll(".enthuellen");
  if (!stuecke.length) return;

  // Ohne Beobachter oder bei gewuenschter Ruhe: alles sofort sichtbar.
  if (ruhig.matches || !("IntersectionObserver" in window)) {
    stuecke.forEach((s) => s.classList.add("sichtbar"));
    return;
  }

  const beobachter = new IntersectionObserver(
    (eintraege) => {
      eintraege.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("sichtbar");
        beobachter.unobserve(e.target); // einmal einblenden, nicht bei jedem Scrollen
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );

  stuecke.forEach((s) => beobachter.observe(s));
}

reglerAufsetzen();
darstellungAufsetzen();
enthuellenAufsetzen();
