# Landingpage immoleicht.com

Eine einzelne HTML-Datei, ausgeliefert über nginx, betrieben auf Coolify.

## Warum so klein

Die Seite hat genau eine Aufgabe: verständlich machen, was Immoleicht ist. Dafür braucht
es keinen Baukasten, kein Framework und keinen Bauschritt. Wer sie ändern will, öffnet
`index.html` und ändert sie.

```
index.html          die ganze Seite, samt Gestaltung
darstellung.js      hell/dunkel, läuft blockierend im Kopf
rechner.js          der Preisregler, läuft mit defer
schriften/          drei selbst ausgelieferte Schriften und ihre Lizenztexte
nginx.conf          Kopfzeilen, robots.txt, Auslieferung
Dockerfile          das Betriebsabbild

pruefe-csp.py       Prüfwerkzeug: Server mit den ECHTEN nginx-Kopfzeilen
pruefe-seite.mjs    Prüfwerkzeug: Browser gegen genau diesen Server
preise-erzeugen.py  Prüfwerkzeug: hält die Preise an drei Stellen zusammen
```

Die drei `pruefe-*`-Dateien werden **nicht ausgeliefert** — das Dockerfile kopiert nur
`index.html`, die beiden Skripte, `schriften/` und `nginx.conf`.

## Gestaltung: eine eigene Sprache seit dem 22.08.2026

Zwei Anläufe vorher übernahm diese Seite Farben und Schrift unverändert aus der
Anwendung (`DESIGN-2`). Das war für ein ruhiges Verwaltungswerkzeug richtig und für
eine Landingpage zu leise — der Auftraggeber hat das ausdrücklich zurückgewiesen
(„das ist überhaupt keine geile Seite") und eine eigene Referenzseite mitgeschickt.
Diese Fassung übernimmt ihren **Typografie- und Energiecharakter**, aber nicht
ungeprüft ihren Inhalt. Was dabei bewusst **nicht** übernommen wurde, steht als Erstes
im Kopfkommentar von `index.html`, nicht versteckt in einem Commit:

- **Der Preis bleibt unverändert** — 9,99 € je Einheit und Monat, erste Einheit
  dauerhaft frei. Die Referenz zeigte ein anderes Modell (0 € bis 3 Einheiten, dann
  2 €/Einheit). Eine echte Preisänderung ist laut `.claude/rules/general.md` im
  Hauptprojekt eine von drei Sachen, die gefragt werden — nicht selbst entschieden.
- **Keine erfundenen Fähigkeiten.** Die Referenz zeigte einen KI-Assistenten,
  Bankanbindung, DATEV-Export — nichts davon existiert im Produkt. Jede Zahl und jede
  Fähigkeit auf dieser Seite ist entweder gebaut (siehe `features/INDEX.md` im
  Hauptprojekt) oder ausdrücklich als „als Nächstes" benannt.
- **Kein Formular, das eine Zusage vortäuscht.** Die Referenz hatte ein E-Mail-Feld mit
  der Erfolgsmeldung „Link ist unterwegs ✓" — ohne dass irgendetwas verschickt würde.
  Das ist keine Design-, sondern eine Ehrlichkeitsfrage. Der Schlussabschnitt führt
  stattdessen zum echten „Zur Anwendung", mit demselben ehrlichen Satz wie zuvor:
  „Wenn Sie einen Zugang haben, geht es hier weiter."

### Schrift: Bricolage Grotesque und Instrument Sans, selbst ausgeliefert

Beide unter der SIL Open Font License 1.1, geladen von den offiziellen Quelldateien
(`google/fonts`-Repository) und **selbst ausgeliefert, nicht von Googles Servern** —
das ist hier nicht Geschmack: Google Fonts von Googles Servern einzubinden überträgt
die IP-Adresse jedes Besuchers in die USA, und dafür gibt es rechtskräftige
Abmahnungen. IBM Plex Mono bleibt unverändert für alle Zahlen. Die vorher genutzten
Source Sans 3 / Source Serif 4 sind aus `schriften/` entfernt, damit keine toten
Schriftdateien mitgeliefert werden.

### Farbe: die zwei Bedeutungen bleiben, plus eine benannte, umgezogene Ausnahme

Die Grundregel ist unverändert: Grün/Gelb/Rot sagen, wie es um eine Sache steht, Blau
(„Tinte") sagt, wo man handeln kann. Neu ist **„Funke"** — ein Violett, das
ausschließlich als reine Fläche auftritt: der Punkt im Wortzeichen, der
Textmarker-Strich hinter dem Wort „Geld" in der Überschrift, der Glanz im Schlussband.
Es trägt nie einen Wert, nie einen Zustand, nie eine Schaltfläche.

**Bewusst nicht Gelb**, wie es die Referenz als „Sonne" vorschlug: Gelb ist bei uns
bereits „Frist bald fällig" (`--warnung`), sichtbar auf derselben Seite im Abschnitt
„Was jetzt ansteht". Ein zweiter, rein dekorativer Gelbton hätte mit dieser Bedeutung
kollidiert — genau die vierte Bedeutung, vor der die Regel warnt. Violett liegt fernab
von Blau, Grün, Gelb und Rot und kollidiert mit keiner. Beide Kontrastfälle
(Text-auf-Funke, Funke-auf-Fläche) sind nachgerechnet, hell **und** dunkel, jeweils
über 5 : 1.

Die vorige, DESIGN-2-treue Fassung nutzte den Akzent an drei Stellen rein dekorativ
(Aurora-Flecken, Maus-Licht, Schrittziffern). Diese Fassung ersetzt Aurora und
Maus-Licht durch den Aufmacher-Beweis (siehe unten) — geblieben und auf „Funke"
umgezogen sind der Wortzeichen-Punkt, der Textmarker und die Schrittziffern
„01"/„02".

## Der Aufmacher-Beweis: Stapel wird zur Abrechnung

Der Aufmacher zeigt in einer Bewegung, was anders ist: links liegen dieselben Zahlen als
lose Zettel (Kaltmiete, Rate, Kosten, eine unbeantwortete Frage), rechts stehen sie als
zwei fertige Rechnungskarten — Wohnung 3 (trägt sich) und Wohnung 1 (zahlt drauf).
**Dieselben Beispielzahlen, die auch im Abschnitt „Für wen" stehen** — keine zweite,
erfundene Zahl nur für den Aufmacher.

**Die CSS-Grundstellung zeigt bereits das Ergebnis, nicht den Zwischenschritt.** Das ist
zugleich der Zustand ohne JavaScript. `rechner.js` fügt nur eine kurze **Vorführung**
hinzu: kurz auf die Zettel zurückschalten, nach 2,2 Sekunden wieder zum Ergebnis — damit
der Unterschied als Bewegung auffällt, statt dass die Seite einfach im Endzustand
startet. Bei `prefers-reduced-motion` fällt die Vorführung komplett aus: sofort im
Ergebnis, kein unangekündigter Sprung. Der Umschalter „Vorher"/„Mit Immoleicht" bleibt
in jedem Fall bedienbar — und erscheint erst mit Skript, aus demselben Grund wie der
Darstellungsknopf: ohne Funktion wäre er ein toter Knopf.

## Der Preisregler

Im Abschnitt „Was es kostet" steht ein Schieberegler von 1 bis 100 Einheiten, daneben ein
Zahlenfeld für alles darüber (bis 9999 — eine Verwaltung soll ihre 340 eintippen können,
ohne einen Regler mit 340 Stufen zu bedienen). Umschalter monatlich/jährlich, der große
Betrag läuft beim Ziehen mit.

### Warum die Sicherheitsregel dafür geändert wurde

Bis zum 21.08.2026 stand hier ein Rechner mit **zwölf festen Stufen, ganz ohne
JavaScript** — versteckte Radiofelder, gesteuert durch CSS. Das war kein Selbstzweck:
`nginx.conf` setzte `script-src 'none'`, und ein Skript hätte im Betrieb wortlos nichts
getan.

Ein echter Schieberegler geht so nicht. `input type="range"` kann seinen Wert nicht an CSS
weiterreichen; ohne Skript bleibt nur eine feste Stufenleiter. Also ist die Policy
geändert worden, **so eng wie möglich**:

| | vorher | jetzt |
|---|---|---|
| Skript als eigene Datei von diesem Server | verboten | **erlaubt** |
| `<script>` im HTML, `onclick=`-Attribute | verboten | **weiterhin verboten** |
| `eval`, fremde Hosts | verboten | **weiterhin verboten** |

`script-src 'self'` **ohne** `'unsafe-inline'` ist deshalb kein weicher Kompromiss: Der
Riegel gegen eingeschleusten Code bleibt zu. Genau darum steht in `index.html` kein
einziges `<script>`-Element mit Inhalt, nur zwei Verweise auf eigene Dateien. Wer das
später auf `'unsafe-inline'` erweitert, hebt den Schutz auf — dann lieber ein Hash oder
eine Nonce.

**Ohne JavaScript bleibt die Seite vollständig lesbar.** Im `<noscript>`-Block steht
dieselbe Rechnung als Tabelle, und die Einblend-Bewegung hängt an einer Klasse, die erst
das Skript setzt — ohne Skript ist von Anfang an alles sichtbar.

### Prüfen, bevor ausgerollt wird

Eine CSP-Änderung ist genau die Sorte Änderung, bei der Nichtprüfen teuer ist: Zu eng, und
das Skript läuft nur örtlich. Ohne Docker auf der Maschine gibt es dafür ein eigenes Paar:

```bash
python3 pruefe-csp.py          # Fenster 1: Server mit den ECHTEN Kopfzeilen aus nginx.conf
node pruefe-seite.mjs          # Fenster 2: Browser dagegen
```

`pruefe-csp.py` **liest** die `add_header`-Zeilen aus `nginx.conf`, statt sie
abzuschreiben — zwei Fassungen derselben Policy liefen sonst beim ersten Ändern
auseinander. `pruefe-seite.mjs` lässt **jede** Konsolenmeldung des Browsers durchfallen;
so melden sich CSP-Verletzungen. Geprüft werden außerdem: Regler, Zahlenfeld über 100, der
kostenlose Fall, Umschalten auf jährlich, Bedienung per Pfeiltaste, was eine Vorlesehilfe
angesagt bekommt, Zielgrößen, unsinnige Eingaben, die Fortschrittslinie und die
Kopfleisten-Elevation beim Scrollen, die vier Fakten der Kennzahlenleiste, der
Aufmacher-Beweis (startet bei den Zetteln, wechselt von selbst zurück, Umschalter in
beide Richtungen, bei reduzierter Bewegung sofort im Ergebnis ohne Vorführung), ob jeder
angeforderte Pfad vom `Dockerfile` gedeckt ist, die Seite **ohne** JavaScript (inklusive:
der Aufmacher zeigt sofort das Ergebnis, nicht die Zettel), hell und dunkel samt
Speichern der Wahl, und waagerechtes Scrollen bei 390 px.

Jeder neue Wächter ist mit einer **Gegenprobe** belegt, nicht nur behauptet: Der
Dockerfile-Wächter schlägt an, wenn eine `COPY`-Zeile fehlt; der Fortschritts-/
Kopfleisten-Wächter schlägt an, wenn `kopfUndFortschrittAufsetzen()` nicht läuft. Beide
Male gemessen, nicht vermutet — sonst wäre es eine Zusage ohne Zähne.

`node` liegt im Hauptprojekt (dieses Repo hat kein npm); der Pfad zu Playwright steht oben
in `pruefe-seite.mjs`.

### Wenn sich der Preis ändert

Der Preis steht an **drei** Stellen, und das lässt sich nicht auf eine reduzieren: die
Konstanten in `rechner.js`, die Ersatztabelle im `<noscript>`-Block und der Satz im
Fließtext. Wer kein JavaScript hat, bekommt keine gerechneten Zahlen — nur das, was als
Text dasteht.

```bash
# die drei Zahlen in preise-erzeugen.py und rechner.js ändern, dann
python3 preise-erzeugen.py           # erzeugt die <noscript>-Tabelle
python3 preise-erzeugen.py --pruefe  # hält alle drei Stellen gegeneinander
```

Der Prüflauf misst auch den Nachlass am Jahresknopf: Steht dort „−17 %", muss das aus den
beiden Preisen wirklich folgen.

Die maßgebliche Preisregel steht im Hauptprojekt und ist dort begründet:
`docs/architektur/preis-und-zaehlung.md`. Weicht diese Seite davon ab, hat diese Seite
unrecht.

**Veraltet, hier stehen gelassen als Beleg, dass sich das geändert hat:** Bis zum
22.08.2026 stand hier der Satz „Die Gestaltung ist aus der Anwendung übernommen … Bewusst
kein eigenes Erscheinungsbild." Das gilt nicht mehr — siehe „Gestaltung: eine eigene
Sprache" oben. Die Landingpage trägt jetzt bewusst ein **eigenes** Erscheinungsbild,
losgelöst von `DESIGN-2`. Das ist im Marketing-Umfeld normal (Produktoberfläche und
Werbeauftritt dürfen unterschiedlich klingen) und war eine ausdrückliche Entscheidung
des Auftraggebers, keine stillschweigende Abweichung.

## Vor der Veröffentlichung — offen

- [ ] **Impressum.** Ein geschäftsmäßiges deutsches Online-Angebot braucht eine
      Anbieterkennzeichnung. Fehlt sie, ist das abmahnfähig. Solange die Seite auf
      `noindex` steht und nicht beworben wird, ist das Risiko gering — aber es ist
      der erste Punkt, bevor irgendwo ein Link darauf zeigt.
- [ ] **Datenschutzerklärung.** Die Seite setzt keine Cookies, lädt nichts von fremden
      Servern und verarbeitet keine Eingaben. Der Text bleibt trotzdem Pflicht, sobald
      sie öffentlich beworben wird.
- [ ] **`noindex` entfernen**, wenn die Seite gefunden werden soll. Steht im Kopf der
      HTML-Datei **und** in `nginx.conf` als `robots.txt` — beide Stellen anfassen.
- [x] ~~**Schrift und Akzentfarbe** kommen mit `DESIGN-2` im Hauptprojekt.~~
      **Erledigt am 21.08.2026** — siehe „Gestaltung: DESIGN-2" oben.
- [ ] **Zwischenspeicherung der Schriften.** Alles wird heute mit `Cache-Control:
      no-cache` ausgeliefert, auch die 128 KB Schriftdateien. Ein eigener
      `location`-Block dafür wäre die naheliegende Lösung und ist bewusst **nicht**
      gebaut: In nginx hebt ein `add_header` innerhalb eines `location`-Blocks die
      Vererbung **aller** `add_header` der Serverebene auf — lautlos. Genau daran sind
      hier schon einmal die vier Sicherheitskopfzeilen verschwunden (Commit `884494b`).
      Ohne Docker auf der Maschine lässt sich das örtlich nicht nachprüfen, und eine
      unprüfbare Änderung an den Sicherheitskopfzeilen ist den Gewinn nicht wert.
- [ ] **Preisangaben im Rechner sind eine Zusage.** Sobald die Seite beworben wird, ist
      jeder Betrag darin ein Angebot an Verbraucher. Die Zahlen stimmen heute mit
      `preis-und-zaehlung.md` überein (geprüft mit `--pruefe`); wer den Preis im
      Hauptprojekt ändert, ändert ihn **hier mit** — sonst steht auf der öffentlichen
      Seite ein anderer Preis als auf der Rechnung.

## Ändern und ausrollen

```bash
# ändern
$EDITOR index.html

# örtlich ansehen — OHNE Docker, aber mit den echten Kopfzeilen:
python3 pruefe-csp.py
# dann http://127.0.0.1:8199
```

**Nicht `python3 -m http.server` benutzen, um die Seite zu beurteilen.** Der liefert ohne
Content-Security-Policy aus — dort läuft jedes Skript, auch eines, das im Betrieb
abgewiesen würde. `pruefe-csp.py` setzt dieselben Kopfzeilen wie nginx.

Und die Seite **muss** über einen Server kommen, nicht per Doppelklick: Skripte und
Schriften liegen unter absoluten Pfaden (`/rechner.js`, `/schriften/…`); über `file://`
findet der Browser sie nicht. Die Seite sieht dann fast richtig aus — der Regler steht
bloß still.

Mit Docker, wenn vorhanden:

```bash
docker build -t immoleicht-landing . && docker run --rm -p 8080:80 immoleicht-landing
```

### Ausrollen — es geschieht NICHT von selbst

Zweig, Pull Request, nach Freigabe mergen. **Und dann ausrollen, von Hand.**

> **Richtigstellung vom 21.08.2026.** Hier stand: *„Coolify baut bei jedem Push auf main
> neu."* Das ist falsch. Nachgesehen an der GitHub-API: `GET /repos/…/hooks` liefert für
> dieses Repository eine **leere Liste** — es gibt keinen Push-Webhook. Was vorher wie
> automatisches Ausrollen aussah, war ein Mensch, der von Hand ausgerollt hat.
>
> Das ist derselbe Irrtum, der am 19.08.2026 schon für die Anwendung richtiggestellt
> wurde (`docs/arbeitsweise/entscheidungen.md`, Abschnitt „Betrieb"). Er ist gefährlich,
> weil er stumm ist: Wer ihn glaubt, merged und geht — und die Seite im Netz bleibt die
> alte, ohne dass irgendetwas fehlschlägt.

```bash
TOK=$(tr -d '\n' < ~/.config/coolify/access-token)
curl -s -X POST -H "Authorization: Bearer $TOK" -H "Accept: application/json" \
  "https://bidkom.de/api/v1/deploy?uuid=<uuid-der-landing-anwendung>"
```

Die UUID steht in Coolify an der Anwendung für `immoleicht.com`. Danach prüfen, ob die
Änderung wirklich draussen ist — nicht darauf vertrauen, dass der Aufruf zurückkam.

## Zusammenhang

| | |
|---|---|
| Anwendung | `app.immoleicht.com` — Repo `Immoleicht/immoleicht` |
| Diese Seite | `immoleicht.com` und `www.immoleicht.com` |
| Betrieb | Coolify, Server 46.225.90.134 |
