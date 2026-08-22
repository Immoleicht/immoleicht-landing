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

## Gestaltung: eine eigene Sprache, seit dem 22.08.2026 an das echte Corporate Design gebunden

Zwei Anläufe vorher übernahm diese Seite Farben und Schrift unverändert aus der
Anwendung (`DESIGN-2`). Das war für ein ruhiges Verwaltungswerkzeug richtig und für
eine Landingpage zu leise — der Auftraggeber hat das ausdrücklich zurückgewiesen
(„das ist überhaupt keine geile Seite") und eine eigene Referenzseite mitgeschickt.
Diese Fassung übernimmt deren **Typografie- und Energiecharakter**, aber nicht
ungeprüft ihren Inhalt. Was dabei bewusst **nicht** übernommen wurde, steht als Erstes
im Kopfkommentar von `index.html`, nicht versteckt in einem Commit:

- **Der Preis wurde nicht stillschweigend von der Referenz übernommen** (0 € bis
  3 Einheiten, dann 2 €/Einheit) — eine echte Preisänderung ist laut
  `.claude/rules/general.md` im Hauptprojekt eine von drei Sachen, die gefragt
  werden, nicht selbst entschieden. Am 22.08.2026 hat der Auftraggeber dann
  ausdrücklich ein Paketmodell entschieden, siehe „Der Preis: seit dem
  22.08.2026 in Paketen" weiter unten — mit eigenen, an der Konkurrenz
  recherchierten Zahlen statt den Werten der Referenz.
- **Keine erfundenen Fähigkeiten.** Die Referenz zeigte einen KI-Assistenten,
  Bankanbindung, DATEV-Export — nichts davon existiert im Produkt. Jede Zahl und jede
  Fähigkeit auf dieser Seite ist entweder gebaut (siehe `features/INDEX.md` im
  Hauptprojekt) oder ausdrücklich als „als Nächstes" benannt.
- **Kein Formular, das eine Zusage vortäuscht.** Die Referenz hatte ein E-Mail-Feld mit
  der Erfolgsmeldung „Link ist unterwegs ✓" — ohne dass irgendetwas verschickt würde.
  Das ist keine Design-, sondern eine Ehrlichkeitsfrage. Der Schlussabschnitt führt
  stattdessen zum echten „Zur Anwendung", mit demselben ehrlichen Satz wie zuvor:
  „Wenn Sie einen Zugang haben, geht es hier weiter."

### 22.08.2026 — die Farb- und Schriftfrage ist nicht mehr selbst entschieden, sondern übernommen

Die Frage „welches Gelb, und wo darf es hin" wurde hier zweimal **selbst** beantwortet:
erst mit Violett statt Gelb (Begründung: Gelb war bereits `--warnung`), dann, auf
ausdrücklichen Wunsch des Auftraggebers, doch mit Gelb — mit einer selbst
ausgedachten Trennung über Helligkeit und Sättigung, und der Regel „Gelb steht nie auf
einer Schaltfläche".

Am 22.08.2026 wurde dieselbe Frage an anderer Stelle **echt und verbindlich**
beantwortet: der Corporate-Design-Auftrag im Hauptprojekt
(`immobilien-software/docs/eingang/2026-08-22-corporate-design-und-funktionsordnung.md`,
umgesetzt in PR #207, verankert mit CI-Wächtern in
`features/DESIGN-1-designsystem.md`). Die drei Farbregeln dort:

1. **Gelb ist Marke und Handlung, nie Warnung.** Höchstens eine gelbe Fläche pro
   Bildschirm — die Handlung, die der Bildschirm empfiehlt.
2. **Blau ist Struktur und Navigation.** Es bedeutet nie einen Zustand.
3. **Grün, Orange und Rot bedeuten ausschließlich Zustand.**

Das ist **anders**, als der eigene Kompromiss es löste — Gelb darf jetzt auf einer
Schaltfläche stehen, weil `--warn` dort auf ein Orange-Braun verschoben wurde und die
Kollision damit an der Quelle verschwunden ist. Diese Seite übernimmt seither die
**exakten** Werte der Anwendung, nicht mehr eigene Annäherungen:

- **Elf Marken- und Flächenfarben, drei Zustandsfarben mit je drei Tönen** —
  Grundton für den Betrag (3 : 1 bei großer Schrift), `-ink`-Ton für das Wort im Chip
  (4,5 : 1 bei kleiner Schrift). Betrifft z. B. die Fristen-Liste und die
  Ergebniskarten im Aufmacher-Beweis.
- **Drei Schriften statt zwei**: Bricolage Grotesque (Überschriften), Instrument Sans
  (Fließtext), **JetBrains Mono** (Beträge, Kennzahlen) — ersetzt IBM Plex Mono. Alle
  drei unter der SIL Open Font License 1.1, selbst geladen von den offiziellen
  Quelldateien und **selbst ausgeliefert, nicht von Googles Servern**: Google Fonts von
  Googles Servern einzubinden überträgt die IP-Adresse jedes Besuchers in die USA, und
  dafür gibt es rechtskräftige Abmahnungen.
- **Die Wortmarke** folgt jetzt exakt der Vorgabe A.4: „Immo" in Bricolage 800, „leicht"
  in Bricolage 300 und um 0,14 em angehoben, der Punkt in `--sun` bei 0,4× Versalhöhe
  an der oberen Kante.
- **`--ergebnis-karte.gut`** (die positive Beispielkarte im Aufmacher) stand vorher auf
  Blau — ein Rest aus der Behebung eines CSS-Bugs, keine bewusste Zustandsentscheidung.
  Das verstößt gegen Farbregel 2 (Blau bedeutet nie einen Zustand) und ist jetzt Grün.
- **„Höchstens eine gelbe Fläche pro Bildschirm" ist im Hauptprojekt ausdrücklich nicht
  automatisch geprüft** (siehe `DESIGN-1`, „Offene Fragen") — hier von Hand
  durchgesehen: Der Textmarker hinter „Geld" im Aufmacher stand vorher ebenfalls in
  Gelb, direkt über dem gelben Knopf „Preis berechnen". Beides gleichzeitig sichtbar
  wäre zwei gelbe Flächen auf einem Bildschirm gewesen; der Marker steht jetzt in Blau
  (Struktur, keine Handlung).

**Zwei Punkte bleiben ehrlich vermerkt:** Die Canvas-Vorlage der Design-Sitzung selbst
(`claude.ai/design/p/…`) ließ sich hier nicht öffnen (403 Forbidden) — Grundlage ist der
geschriebene Auftrag samt seinen Hex-Werten, nicht ein Blick auf die Vorlage selbst. Und
der Punkt der Wortmarke ist nach der Textvorgabe gesetzt, aber nicht pixelgenau gegen
die Vorlage nachgemessen.

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

### Der Preis: seit dem 22.08.2026 in Paketen

Bis dahin galt ein Preis je Einheit (9,99 €/Monat, erste Einheit dauerhaft frei). Der
Auftraggeber hat das am 22.08.2026 ausdrücklich geändert — Wortlaut: „das Preismodell ist
auch richtig zu übernehmen, da wir uns an der Konkurrenz orientieren müssen und die
Preise in Paketen machen müssen. Eins bleibt trotzdem kostenlos." Die konkreten Stufen
waren an die Sitzung delegiert und gegen echte Wettbewerbspreise hergeleitet (objego,
DoorLoop) — vollständige Herleitung und Quellen:
`docs/eingang/2026-08-22-preismodell-pakete.md` im Hauptprojekt.

**Das Modell, brutto:**

| Paket | Umfang | Preis |
|---|---|---|
| Start | 1 Einheit | 0 €, dauerhaft |
| Wachstum | 2–10 Einheiten | 7,99 €/Monat, 79,99 €/Jahr |
| Portfolio | 11–50 Einheiten | 24,99 €/Monat, 249,99 €/Jahr |
| ab 51 Einheiten | — | individuell (`TARIF-3`, unverändert) |

Der Regler bleibt als Interaktion bestehen, rechnet aber nicht mehr kontinuierlich je
Einheit — er zeigt, in welches Paket eine eingegebene Einheitenzahl fällt. Das ist mit
Absicht: Wer den Regler von 2 auf 10 zieht und der Preis bewegt sich nicht, versteht das
Paketprinzip schneller als aus einem Satz Fließtext.

**Ehrlich offen:** Die eigentliche Preisregel im Hauptprojekt
(`docs/architektur/preis-und-zaehlung.md`) ist nachgezogen, ebenso `docs/PRD.md` und
`docs/arbeitsweise/entscheidungen.md`. Die beiden großen Abrechnungs-Specs `TARIF-1` und
`TARIF-2` (zusammen rund 3.900 Zeilen) sind es **nicht** — sie sind bis ins Detail um den
alten Preis je Einheit gebaut (tagesgenaue Anteilsrechnung, Steuer-Gegenproben,
Rechnungszeilen) und brauchen eine eigene Überarbeitungs-Tranche, keine Zahlenersetzung
nebenbei. Das ist im Eingang-Dokument selbst so vermerkt. Beide Specs stehen auf
„Spezifiziert", nicht „Fertig" — es gibt also keinen ausgerollten Code, der der alten
Zahl noch folgt.

### Wenn sich der Preis wieder ändert

Der Preis steht an **drei** Stellen, und das lässt sich nicht auf eine reduzieren: die
Pakettabelle in `rechner.js`, die Ersatztabelle im `<noscript>`-Block und die
Kennzahlenleiste im Fließtext. Wer kein JavaScript hat, bekommt keine gerechneten Zahlen
— nur das, was als Text dasteht.

```bash
# die Pakettabelle in preise-erzeugen.py und rechner.js gemeinsam aendern, dann
python3 preise-erzeugen.py           # erzeugt die <noscript>-Tabelle
python3 preise-erzeugen.py --pruefe  # haelt alle drei Stellen gegeneinander
```

Der Prüflauf misst auch den Nachlass am Jahresknopf: Steht dort „−17 %", muss das aus
**jedem** zahlenden Paket einzeln folgen — laufen die Pakete auf verschiedene Nachlässe
hinaus, schlägt er eigens dafür an.

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

## „So einfach ist der erste Schritt" — dieselbe Rechnung als Ablauf

Ein Wettbewerbs- und Psychologie-Bericht ging der Entscheidung voraus (objego, DoorLoop,
Mercury verglichen; Fazit: kein einziges erfolgreiches Vorbild erfindet eine Fähigkeit,
und echte Bildschirminhalte überzeugen nachweislich stärker als Illustrationen oder
Mock-ups). Der Auftraggeber hatte sich einen Ablauf gewünscht, wie ein Anfänger etwas
„hochlädt" und „die KI antwortet". Es gibt weder eine Hochlade-Funktion noch eine KI, die
antwortet — dieselbe Art Tatsachenbehauptung wie beim Preis oder den erfundenen
Fähigkeiten, siehe oben.

**Was stattdessen gebaut wurde:** derselbe Wohnung-3-Datensatz, der auch im Aufmacher
steht, aber als **Ablauf** statt als fertiges Ergebnis. Die Karte trägt die drei Zeilen
von Anfang an korrekt im Quelltext — das ist der Zustand ohne Skript. Erst beim ersten
Sichtbarwerden löscht `eintragAufsetzen()` in `rechner.js` die Werte kurz und tippt sie
neu, Zeile für Zeile, mit einer kurzen Betonung auf der Summe am Ende. Unter
`prefers-reduced-motion` passiert nichts — die Werte stehen unverändert da.

**Geprüft mit Gegenprobe, und die erste Fassung der Prüfung hatte keine Zähne:** Ein
Test, der nur den ENDZUSTAND nach mehreren Sekunden mit dem erwarteten Wert vergleicht,
bleibt grün, selbst wenn `eintragAufsetzen()` gar nicht läuft — die statischen
Ausgangswerte sind ja bereits korrekt. Erst eine zweite Prüfung, die den
**Zwischenstand** kurz nach dem Sichtbarwerden misst (die erste Zeile muss kürzer als
der Endwert sein, weil gerade getippt wird), schlägt an, wenn die Funktion fehlt.

## „Vorschläge, die Sie bestätigen" — die ehrliche Fassung des KI-Chats aus der Vorlage

Die Referenzseite zeigte einen KI-Chat, der selbständig drei Handwerkeranfragen
verschickt. Das gibt es nicht, und es wird auch nicht so gebaut: Das Hauptprojekt hat am
22.08.2026 ausdrücklich entschieden, dass die KI **keine** Handwerkeranfrage selbst
versendet — „sie schreibt den Entwurf, ein Mensch gibt frei" — und dass jeder
KI-Vorschlag als Vorschlag in „Heute" landet, mit Sicherheitswert, dort bestätigt statt
automatisch übernommen.

Der Abschnitt `#ki-vorschau` zeigt genau diese **bereits entschiedene** Regel als Bild,
nicht als Behauptung, es gäbe sie schon: eine Karte im Chat-Look (Sprechblase,
Sicherheitswert, zwei Reaktionen), oben ausdrücklich beschriftet „Vorschau — so ist es
geplant, noch nicht gebaut". Bewusst **kein** `<button>` für „Übernehmen"/„Ablehnen" —
ein Element, das wie ein Knopf aussieht und nichts auslöst, ist ein toter Knopf. Beide
stehen als einfacher Text, nicht fokussierbar, nicht als Steuerelement angesagt.

## Zusammenhang

| | |
|---|---|
| Anwendung | `app.immoleicht.com` — Repo `Immoleicht/immoleicht` |
| Diese Seite | `immoleicht.com` und `www.immoleicht.com` |
| Betrieb | Coolify, Server 46.225.90.134 |
