# Landingpage immoleicht.com

Eine einzelne HTML-Datei, ausgeliefert über nginx, betrieben auf Coolify.

## Warum so klein

Die Seite hat genau eine Aufgabe: verständlich machen, was Immoleicht ist. Dafür braucht
es keinen Baukasten, kein Framework und keinen Bauschritt. Wer sie ändern will, öffnet
`index.html` und ändert sie.

```
index.html          die ganze Seite, samt Gestaltung
schriften/          drei selbst ausgelieferte Schriften und ihre Lizenztexte
nginx.conf          Kopfzeilen, robots.txt, Auslieferung
Dockerfile          das Betriebsabbild
preise-erzeugen.py  Werkzeug für den Menschen, KEIN Bauschritt
```

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

## Der Preisrechner

Im Abschnitt „Was es kostet" steht ein Rechner: Man wählt eine von zwölf Stufen, und die
Seite zeigt, was das kostet — monatlich und jährlich, mit der ersten Einheit schon
abgezogen.

**Er kommt ohne JavaScript aus, und das ist keine Spielerei.** `nginx.conf` setzt
`script-src 'none'`. Ein eingebettetes Skript würde beim örtlichen Öffnen der Datei
tadellos rechnen und im Betrieb wortlos nichts tun — ein Fehler, den niemand sieht, weil
die Seite aussieht wie immer. Stattdessen: zwölf versteckte Radiofelder und je Stufe eine
CSS-Regel, die die passenden Zahlen einblendet. Alle Beträge stehen als Text im Quelltext.

Wer statt der Stufen ein freies Feld oder einen Schieberegler will, braucht eine eigene
`rechner.js` **und** `script-src 'self'` in `nginx.conf`. Beides ist bewusst nicht getan.

### Wenn sich der Preis ändert

Nicht von Hand. Der Rechner enthält **72 Zahlen** — zwölf Stufen mal sechs Werte:

```bash
# die beiden Preise in preise-erzeugen.py ändern, dann
python3 preise-erzeugen.py           # gibt die Blöcke aus, in index.html einsetzen
python3 preise-erzeugen.py --pruefe  # prüft, ob index.html dazu passt
```

`preise-erzeugen.py` ist **kein Bauschritt** — das Dockerfile kopiert nur `index.html`
und `nginx.conf`. Die Datei ist ein Werkzeug für den Menschen, der den Preis ändert.

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

# örtlich ansehen — OHNE Docker, aber mit richtigen Pfaden:
python3 -m http.server 8199
# dann http://127.0.0.1:8199
```

Die Seite **muss über einen Server** angesehen werden, nicht per Doppelklick. Die
Schriften liegen unter dem absoluten Pfad `/schriften/…`; über `file://` findet der
Browser sie nicht und fällt still auf die Systemschrift zurück. Es sieht dann fast
richtig aus — und ist es nicht.

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
