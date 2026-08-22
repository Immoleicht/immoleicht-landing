/*
 * Faehrt die Seite in einem echten Browser gegen die ECHTEN nginx-Kopfzeilen.
 *
 * Voraussetzung: `python3 pruefe-csp.py` laeuft auf 127.0.0.1:8199.
 *
 * Der Punkt dieser Datei ist die Content-Security-Policy. Ohne sie liefe das
 * Skript oertlich tadellos und im Betrieb gar nicht — die Seite saehe aus wie
 * immer, der Regler stuende bloss still. Deshalb ist JEDE Konsolenmeldung des
 * Browsers hier ein Fehlschlag: So melden sich CSP-Verletzungen.
 *
 * Aufruf (playwright liegt im Hauptprojekt, dieses Repo hat kein npm):
 *   node pruefe-seite.mjs
 */
import { chromium } from "/Users/Investorenausbildung/Projekte/immobilien-software/node_modules/playwright/index.mjs";

const U = "http://127.0.0.1:8199/";
const BILDER = process.env.BILDER || null;

let fehler = 0;
const melde = (was, ist, soll) => {
  const gut = String(ist) === String(soll);
  if (!gut) {
    console.log(`  FEHLER ${was}: "${ist}" statt "${soll}"`);
    fehler++;
  }
  return gut;
};

/** Haengt sich an eine Seite und laesst jede Browser-Meldung durchfallen. */
function lauschen(seite, wo) {
  seite.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      console.log(`  FEHLER ${wo}: Browser meldet [${m.type()}] ${m.text()}`);
      fehler++;
    }
  });
  seite.on("pageerror", (e) => {
    console.log(`  FEHLER ${wo}: Ausnahme im Skript — ${e.message}`);
    fehler++;
  });
  seite.on("requestfailed", (r) => {
    console.log(`  FEHLER ${wo}: ${r.url()} gescheitert — ${r.failure()?.errorText}`);
    fehler++;
  });
}

const browser = await chromium.launch();

/* ── 1. Kommt die Policy ueberhaupt an? ──────────────────────────────────── */
{
  const seite = await browser.newPage();
  const antwort = await seite.goto(U);
  const csp = antwort.headers()["content-security-policy"] || "";
  melde("CSP vorhanden", csp.includes("script-src 'self'"), true);
  melde("CSP ohne unsafe-inline", csp.includes("unsafe-inline") && csp.includes("script-src 'self' 'unsafe-inline'"), false);
  melde("Rahmen verboten", csp.includes("frame-ancestors 'none'"), true);
  console.log(`  Policy: ${csp}`);
  await seite.close();
}

/* ── 2. Der Regler, ohne Bewegung damit die Zahlen sofort stehen ─────────── */
{
  const seite = await browser.newPage({
    viewport: { width: 1100, height: 900 },
    reducedMotion: "reduce",
  });
  lauschen(seite, "Regler");
  await seite.goto(U, { waitUntil: "networkidle" });

  const betrag = seite.locator("#betrag");
  const rechner = seite.locator(".rechner");

  melde("Rechner sichtbar (Skript lief)", await rechner.isVisible(), true);
  melde("Startwert 5 Einheiten, Paket Wachstum", await betrag.innerText(), "7,99");

  // Ueber das Zahlenfeld: der Weg fuer eine Verwaltung, die 37 eintippt.
  // 37 faellt ins Paket "Portfolio" (11 bis 50 Einheiten).
  await seite.fill("#zahl", "37");
  melde("37 Einheiten, Paket Portfolio", await betrag.innerText(), "24,99");
  melde("Regler zieht mit", await seite.inputValue("#regler"), "37");

  // Ueber die letzte Paketgrenze: Regler bleibt am Anschlag, die Zahl zaehlt
  // weiter, der Preis bleibt beim letzten Paket (individuell ist hier nicht
  // abgebildet, siehe "Hinweis fuer grosse Bestaende").
  await seite.fill("#zahl", "340");
  melde("340 Einheiten, weiterhin Paket Portfolio", await betrag.innerText(), "24,99");
  melde("Regler am Anschlag", await seite.inputValue("#regler"), "50");
  melde("Hinweis fuer grosse Bestaende", await seite.locator("#viele").isVisible(), true);

  // Der kostenlose Fall.
  await seite.fill("#zahl", "1");
  melde("1 Einheit kostet nichts", await betrag.innerText(), "0,00");
  melde(
    "und sagt warum",
    (await seite.locator("#herleitung").innerText()).includes("dauerhaft kostenlos"),
    true,
  );
  melde("kein Hinweis auf Pakete", await seite.locator("#viele").isVisible(), false);

  // Jaehrlich. 12 faellt ins Paket "Portfolio" (24,99 €/Monat, 249,99 €/Jahr).
  await seite.fill("#zahl", "12");
  await seite.click('.taktwahl button[data-takt="jahr"]');
  melde("jaehrlich, auf den Monat", await betrag.innerText(), "20,83");
  melde("Ersparnis genannt", await seite.locator("#jahresvorteil").innerText(), "spart 49,89 €");
  melde(
    "Jahresbetrag genannt",
    (await seite.locator("#nebensatz").innerText()).includes("249,99 € im Jahr"),
    true,
  );
  await seite.click('.taktwahl button[data-takt="monat"]');
  melde("zurueck auf monatlich", await betrag.innerText(), "24,99");
  melde("Ersparnis wieder weg", await seite.locator("#jahresvorteil").isVisible(), false);

  // Tastatur: der Regler muss ohne Maus bedienbar sein. Ausgangswert 12,
  // zwei Schritte nach rechts macht 14 - weiterhin Paket "Portfolio".
  await seite.locator("#regler").focus();
  await seite.keyboard.press("ArrowRight");
  await seite.keyboard.press("ArrowRight");
  melde("Pfeiltaste bewegt den Regler", await seite.inputValue("#regler"), "14");
  melde("und die Zahl rechnet mit", await betrag.innerText(), "24,99");

  // Was eine Vorlesehilfe ansagt: nicht "14", sondern was es kostet.
  const gesprochen = await seite.locator("#regler").getAttribute("aria-valuetext");
  melde("Ansage nennt den Preis", gesprochen.includes("24,99"), true);

  // Zielgroessen.
  for (const wahl of ["#zahl", '.taktwahl button[data-takt="jahr"]', "#darstellung"]) {
    const k = await seite.locator(wahl).boundingBox();
    if (!k || k.height < 40) {
      console.log(`  FEHLER Zielgroesse ${wahl}: ${k ? k.height : "fehlt"} px`);
      fehler++;
    }
  }

  // Unsinnige Eingaben duerfen nicht in Unsinn muenden. 99999 wird auf 9999
  // gekappt - weit ueber der letzten Paketgrenze, also Paket "Portfolio".
  for (const [eingabe, erwartet] of [["0", "0,00"], ["-5", "0,00"], ["99999", "24,99"]]) {
    await seite.fill("#zahl", eingabe);
    await seite.locator("#zahl").blur();
    melde(`Eingabe "${eingabe}" abgefangen`, await betrag.innerText(), erwartet);
  }

  await seite.close();
}

/* ── 3. Fortschrittslinie, schwebende Kopfleiste, Kennzahlenleiste ───────── */
{
  const seite = await browser.newPage({
    viewport: { width: 1100, height: 900 },
    reducedMotion: "reduce",
  });
  lauschen(seite, "Bewegung");
  await seite.goto(U, { waitUntil: "networkidle" });

  melde("Fortschritt startet bei 0", await seite.locator("#fortschritt").evaluate((e) => e.style.width), "0%");
  melde("Kopfleiste startet ohne Schatten", await seite.locator(".kopf").evaluate((e) => e.classList.contains("schwebt")), false);

  await seite.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await seite.waitForTimeout(50); // ein scroll-Ereignis reicht, kein Zeitablauf noetig

  const breite = await seite.locator("#fortschritt").evaluate((e) => parseFloat(e.style.width));
  melde("Fortschritt bewegt sich beim Scrollen", breite > 50, true);
  melde("Kopfleiste bekommt Schatten", await seite.locator(".kopf").evaluate((e) => e.classList.contains("schwebt")), true);

  // Die vier realen Fakten der Kennzahlenleiste - keine Erfindungen, siehe
  // Kopfkommentar in index.html.
  // Kein Leerzeichen zwischen Zahl und Einheit im Text - der Abstand kommt
  // von `.leiste .n small { margin-left: … }`, nicht von einem Zeichen.
  const zahlen = await seite.locator(".leiste .n").allInnerTexts();
  melde("Kennzahl: erste Einheit", zahlen[0].trim(), "1");
  melde("Kennzahl: Monatspreis", zahlen[1].replace(/\s+/g, ""), "7,99€");
  melde("Kennzahl: Standort", zahlen[2].trim(), "Frankfurt");
  melde("Kennzahl: versteckte Kosten", zahlen[3].replace(/\s+/g, ""), "0€");

  await seite.close();
}

/* ── 4. Der Aufmacher-Beweis: Stapel wird zur Abrechnung ──────────────────── */
{
  // Zuerst MIT Bewegung: die Vorfuehrung muss wirklich laufen, nicht nur die
  // Klasse zufaellig richtig stehen.
  const seite = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  lauschen(seite, "Aufmacher-Beweis");
  await seite.goto(U, { waitUntil: "networkidle" });

  const demo = seite.locator("#demo");
  melde("startet bei den Zetteln (Vorfuehrung laeuft an)", await demo.evaluate((e) => e.classList.contains("zeigt-vorher")), true);
  melde("Umschalter erscheint mit Skript", await seite.locator("#umschalter").isVisible(), true);

  await seite.waitForTimeout(2500);
  melde("wechselt von selbst zurueck zum Ergebnis", await demo.evaluate((e) => e.classList.contains("zeigt-vorher")), false);

  // Von Hand zurueck zu den Zetteln und wieder zurueck.
  await seite.click('#umschalter button[data-zustand="vorher"]');
  melde("Umschalter zeigt die Zettel", await demo.evaluate((e) => e.classList.contains("zeigt-vorher")), true);
  await seite.click('#umschalter button[data-zustand="nachher"]');
  melde("Umschalter zeigt wieder das Ergebnis", await demo.evaluate((e) => e.classList.contains("zeigt-vorher")), false);
  await seite.close();

  // Und MIT reduzierter Bewegung: keine Vorfuehrung, sofort im Ergebnis -
  // derselbe Zustand wie ohne Skript.
  const ruhig = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: "reduce" });
  await ruhig.goto(U, { waitUntil: "networkidle" });
  melde(
    "bei reduzierter Bewegung sofort im Ergebnis, keine Vorfuehrung",
    await ruhig.locator("#demo").evaluate((e) => e.classList.contains("zeigt-vorher")),
    false,
  );
  await ruhig.close();
}

/* ── 4b. Der erste Schritt: dieselbe Rechnung als Tipp-Vorgang ────────────── */
{
  // Zuerst ohne Skript-Warten: die Karte muss VOR jeder Animation schon die
  // richtigen Werte tragen - das ist der Zustand, den ein no-JS-Besucher und
  // eine Suchmaschine sehen.
  const sofort = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  await sofort.goto(U, { waitUntil: "domcontentloaded" });
  const werteSofort = await sofort.locator("#eintragKarte .eintrag-text").allInnerTexts();
  melde("Werte stehen vor jeder Bewegung schon richtig da", werteSofort.join("|"), "780,00|612,40|145,00");
  await sofort.close();

  // Dann MIT Bewegung, bis in den Abschnitt gescrollt: die Karte MUSS die
  // Werte zwischendurch wirklich loeschen und neu aufbauen - nicht nur am
  // Ende zufaellig gleich aussehen. Ein Test, der nur den Endzustand prueft,
  // waere gruen geblieben, selbst wenn eintragAufsetzen() gar nicht liefe
  // (genau das wurde hier auch geprueft: erste Fassung dieser Pruefung
  // ueberlebte eine auskommentierte Funktion unbemerkt).
  const seite = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  lauschen(seite, "Erster Schritt");
  await seite.goto(U, { waitUntil: "networkidle" });
  await seite.locator("#eintragKarte").scrollIntoViewIfNeeded();
  await seite.waitForTimeout(120); // kurz NACH dem Ausloesen, deutlich VOR dem Ende
  const ersteZeile = await seite.locator("#eintragKarte .eintrag-text").first().innerText();
  melde("Vorfuehrung loescht/tippt wirklich (Zwischenstand kuerzer als Endwert)", ersteZeile !== "780,00", true);

  await seite.waitForTimeout(3500); // drei Zeilen a ~6 Zeichen plus Pausen
  const werteFertig = await seite.locator("#eintragKarte .eintrag-text").allInnerTexts();
  melde("nach der Vorfuehrung wieder dieselben Werte", werteFertig.join("|"), "780,00|612,40|145,00");
  melde(
    "Summe stimmt mit dem Aufmacher ueberein",
    (await seite.locator(".eintrag-summe strong").innerText()).trim(),
    "+ 22,60 €",
  );
  await seite.close();

  // Und MIT reduzierter Bewegung: keine Vorfuehrung, die Werte stehen von
  // Anfang an und bleiben unangetastet - kein Loeschen, kein Neu-Tippen.
  const ruhigSeite = await browser.newPage({ viewport: { width: 1000, height: 900 }, reducedMotion: "reduce" });
  await ruhigSeite.goto(U, { waitUntil: "networkidle" });
  await ruhigSeite.locator("#eintragKarte").scrollIntoViewIfNeeded();
  await ruhigSeite.waitForTimeout(500);
  const werteRuhig = await ruhigSeite.locator("#eintragKarte .eintrag-text").allInnerTexts();
  melde("bei reduzierter Bewegung keine Vorfuehrung", werteRuhig.join("|"), "780,00|612,40|145,00");
  await ruhigSeite.close();
}

/* ── 5. Hell, dunkel, wie das System ─────────────────────────────────────── */
{
  const seite = await browser.newPage({ colorScheme: "light", reducedMotion: "reduce" });
  lauschen(seite, "Darstellung");
  await seite.goto(U, { waitUntil: "networkidle" });

  const wurzel = seite.locator("html");
  melde("startet ohne eigene Wahl", await wurzel.getAttribute("data-darstellung"), null);
  await seite.click("#darstellung");
  melde("erster Klick: hell", await wurzel.getAttribute("data-darstellung"), "hell");
  await seite.click("#darstellung");
  melde("zweiter Klick: dunkel", await wurzel.getAttribute("data-darstellung"), "dunkel");
  melde(
    "Wahl ist gespeichert",
    await seite.evaluate(() => localStorage.getItem("immoleicht-darstellung")),
    "dunkel",
  );

  // Und sie ueberlebt das Neuladen, OHNE dass die helle Seite aufblitzt:
  // darstellung.js laeuft blockierend im Kopf.
  await seite.reload({ waitUntil: "networkidle" });
  melde("nach dem Neuladen noch dunkel", await wurzel.getAttribute("data-darstellung"), "dunkel");
  const grund = await seite.evaluate(() => getComputedStyle(document.body).backgroundColor);
  melde("und der Grund ist wirklich dunkel", grund, "rgb(15, 22, 31)");

  await seite.click("#darstellung");
  melde("dritter Klick: zurueck zum System", await wurzel.getAttribute("data-darstellung"), null);
  await seite.close();
}

/* ── 6. Ohne JavaScript muss die Seite lesbar bleiben ────────────────────── */
{
  const kontext = await browser.newContext({ javaScriptEnabled: false });
  const seite = await kontext.newPage();
  await seite.goto(U, { waitUntil: "load" });

  melde("Ersatztabelle sichtbar", await seite.locator(".ohneskript table").isVisible(), true);
  melde("Regler bleibt verborgen", await seite.locator(".rechner:not(.ohneskript)").isVisible(), false);
  melde(
    "Preis steht trotzdem da",
    (await seite.locator(".ohneskript").innerText()).includes("7,99 €"),
    true,
  );
  // Der wichtigste Punkt: Nichts ist durch die Einblend-Bewegung unsichtbar.
  melde("Ueberschrift sichtbar", await seite.locator("h1").isVisible(), true);
  melde("Alle Abschnitte sichtbar", await seite.locator(".enthuellen").first().isVisible(), true);
  const durchsichtig = await seite.evaluate(
    () => [...document.querySelectorAll(".enthuellen")].filter((e) => getComputedStyle(e).opacity !== "1").length,
  );
  melde("kein Abschnitt auf Deckkraft 0", durchsichtig, 0);
  melde("Darstellungsknopf verborgen (taete nichts)", await seite.locator("#darstellung").isVisible(), false);

  // Der Aufmacher-Beweis ohne Skript: Grundstellung zeigt bereits das
  // ERGEBNIS (die Rechnungskarten), nicht den Zwischenschritt mit den losen
  // Zetteln - siehe Begruendung in index.html bei `.demo`. `isVisible()`
  // allein reicht hier NICHT: Playwright wertet `opacity: 0` nicht als
  // unsichtbar, deshalb wird die Deckkraft direkt gemessen (derselbe Trick
  // wie oben bei ".enthuellen").
  const deckkraft = (sel) => seite.locator(sel).first().evaluate((e) => getComputedStyle(e).opacity);
  melde("Aufmacher zeigt sofort das Ergebnis", await deckkraft(".ergebnis-karte"), "1");
  melde("lose Zettel bleiben unsichtbar", await deckkraft(".zettel"), "0");
  melde("Umschalter verborgen (taete nichts)", await seite.locator("#umschalter").isVisible(), false);

  await kontext.close();
}

/* ── 7. Handy ────────────────────────────────────────────────────────────── */
{
  const seite = await browser.newPage({ viewport: { width: 390, height: 844 } });
  lauschen(seite, "Handy");
  await seite.goto(U, { waitUntil: "networkidle" });
  const breit = await seite.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  melde("kein waagerechtes Scrollen bei 390 px", breit, false);
  if (BILDER) await seite.screenshot({ path: `${BILDER}/v3-handy.png`, fullPage: true });
  await seite.close();
}

/* ── 8. Wird ueberhaupt alles ausgeliefert, was die Seite anfordert? ─────── */
/*
 * Der Pruefserver liefert das ganze Verzeichnis aus, das Betriebsabbild nur,
 * was im Dockerfile steht. Eine vergessene COPY-Zeile faellt oertlich deshalb
 * NIE auf — und im Betrieb fehlt die Datei. Genau diese Luecke schliesst der
 * folgende Abgleich: Jeder Pfad, den die Seite anfordert, muss vom Dockerfile
 * gedeckt sein.
 */
{
  const { readFileSync } = await import("node:fs");
  const dockerfile = readFileSync(new URL("./Dockerfile", import.meta.url), "utf8");
  const kopiert = [...dockerfile.matchAll(/^COPY\s+(\S+)\s+(\S+)/gm)]
    .map((m) => m[2])
    .filter((ziel) => ziel.startsWith("/usr/share/nginx/html"))
    .map((ziel) => ziel.replace("/usr/share/nginx/html", "") || "/");

  const seite = await browser.newPage();
  const angefordert = new Set();
  seite.on("request", (r) => {
    const u = new URL(r.url());
    if (u.origin === new URL(U).origin) angefordert.add(u.pathname);
  });
  await seite.goto(U, { waitUntil: "networkidle" });
  await seite.close();

  let offen = 0;
  for (const roh of angefordert) {
    // nginx loest "/" ueber `index index.html` auf — sonst meldete die Wurzel
    // sich hier als ungedeckt, obwohl sie die am besten gedeckte Adresse ist.
    const pfad = roh === "/" ? "/index.html" : roh;
    const gedeckt = kopiert.some((k) => pfad === k || (k !== "/" && pfad.startsWith(k + "/")));
    if (!gedeckt) {
      console.log(`  FEHLER Dockerfile: ${pfad} wird angefordert, aber nicht kopiert`);
      fehler++;
      offen++;
    }
  }
  if (!offen) console.log(`  Dockerfile deckt alle ${angefordert.size} angeforderten Pfade.`);
}

/* ── 9. Bilder fuer den Menschen ─────────────────────────────────────────── */
if (BILDER) {
  for (const schema of ["light", "dark"]) {
    // `reducedMotion` statt "Klasse setzen und hoffen": Bei eingeschalteter
    // Bewegung erwischt das Bild den Uebergang mitten im Einblenden, und die
    // halbe Seite steht blass da. Mit dieser Einstellung greift die Regel unter
    // `prefers-reduced-motion`, und alles ist von Anfang an sichtbar.
    const seite = await browser.newPage({
      viewport: { width: 1100, height: 1000 },
      colorScheme: schema,
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });
    await seite.goto(U, { waitUntil: "networkidle" });
    await seite.screenshot({ path: `${BILDER}/v3-seite-${schema}.png`, fullPage: true });
    await seite.locator(".rechner").scrollIntoViewIfNeeded();
    await seite.locator(".rechner").screenshot({ path: `${BILDER}/v3-rechner-${schema}.png` });
    await seite.close();
  }
}

await browser.close();
console.log(fehler === 0 ? "\nAlles in Ordnung." : `\n${fehler} Fehler.`);
process.exit(fehler === 0 ? 0 : 1);
