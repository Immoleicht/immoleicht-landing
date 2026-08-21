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

## Gestaltung: DESIGN-2, nicht mehr DESIGN-1

Am 21.08.2026 nachgezogen. Bis dahin stand diese Seite auf dem Stand von `DESIGN-1`,
und das war an drei Stellen sichtbar:

- **Keine feste Schrift.** Hier stand „Avenir Next" — die liegt nur auf Apple-Geräten.
  Unter Windows erschien Segoe UI, unter Android Roboto. Jetzt dieselben drei selbst
  ausgelieferten Schriften wie die Anwendung: Source Sans 3, Source Serif 4, IBM Plex
  Mono. **Selbst ausliefern ist hier nicht Geschmack:** Google Fonts von Googles Servern
  einzubinden überträgt die IP-Adresse jedes Besuchers in die USA, und dafür gibt es
  rechtskräftige Abmahnungen. Alle drei stehen unter der SIL Open Font License 1.1.
- **Keine Akzentfarbe.** `DESIGN-1` hatte entschieden, dass es gar keine gibt.
  `DESIGN-2` hat das aufgehoben — sonst sieht alles, wo man handeln kann, wie Text aus.
  Jetzt „Tinte", ein dunkles Marineblau.
- **Ein zu blasser Grauton.** `--leise` stand auf 49 % Helligkeit. Genau dieser Wert ist
  im Hauptprojekt am 20.08.2026 durchgefallen — 3,77 : 1, wo WCAG AA 4,5 : 1 verlangt —
  und wurde dort auf 41 % gesenkt; hier stand er unverändert weiter. Jetzt derselbe Wert.

Alle 26 Text-auf-Fläche-Paare sind nachgerechnet und liegen über 4,5 : 1, in **beiden**
Darstellungen. Die eine Regel bleibt: Farbe hat genau zwei Bedeutungen — Grün/Gelb/Rot
sagen, wie es um eine Sache steht, Blau sagt, wo man handeln kann. Eine dritte Bedeutung
gibt es nicht.

**Was diese Seite im Unterschied zur Anwendung nicht hat:** eine vermessene
Ersatzschrift. Next rechnet dort aus, wie viel Platz die Ersatzschrift braucht, damit
der Text beim Nachladen nicht umspringt. Ohne Bauschritt lässt sich das nicht ehrlich
nachbauen — geschätzte Werte wären schlimmer als keine. Stattdessen sind die zwei
wichtigsten Schnitte im Kopf der Datei vorgeladen.

### Die eine Ausnahme, gesammelt an einer Stelle

Seit dem 21.08.2026 benutzt die Seite den Akzentton an drei Stellen als reine **Fläche**,
nicht als **Zeichen**: die schwebenden Flecken hinter der Überschrift (`.aurora`), das
Licht, das der Maus folgt (`.spotlight`), und die großen blassen Ziffern „01"/„02" hinter
den beiden Textkarten (`.schrittnr`). Keine der drei trägt einen Wert oder einen Zustand;
nimmt man sie weg, geht keine Aussage verloren, nur ein Eindruck.

Das steht bewusst als **eine** Sammelstelle im Kopf von `index.html`, nicht als drei
verstreute Kommentare — wer eine vierte Stelle dieser Art einführt, findet dort, was
schon gilt, und muss sich fragen, ob sie wirklich dieselbe Begründung trägt. Alle drei
rechnen ausschließlich mit `--akzent-h`, nie mit den Statusfarben — genau das wäre die
verbotene dritte Bedeutung.

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
Kopfleisten-Elevation beim Scrollen, die hochzählenden Zahlen der Bestandsleiste, ob jeder
angeforderte Pfad vom `Dockerfile` gedeckt ist, die Seite **ohne** JavaScript, hell und
dunkel samt Speichern der Wahl, und waagerechtes Scrollen bei 390 px.

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

Die Gestaltung ist **aus der Anwendung übernommen** (`immoleicht/src/app/globals.css`) —
dieselben Farben, dieselbe Schriftregel, dieselbe Bedeutung von Farbe. Bewusst kein
eigenes Erscheinungsbild: Sonst gäbe es zwei, und `DESIGN-2` müsste später beide
einsammeln.

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
