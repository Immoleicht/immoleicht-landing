# Landingpage immoleicht.com

Eine einzelne HTML-Datei, ausgeliefert über nginx, betrieben auf Coolify.

## Warum so klein

Die Seite hat genau eine Aufgabe: verständlich machen, was Immoleicht ist. Dafür braucht
es keinen Baukasten, kein Framework und keinen Bauschritt. Wer sie ändern will, öffnet
`index.html` und ändert sie.

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
- [ ] **Schrift und Akzentfarbe** kommen mit `DESIGN-2` im Hauptprojekt. Diese Seite
      erbt sie, sobald die Werte feststehen.
- [ ] **Preisangaben im Rechner sind eine Zusage.** Sobald die Seite beworben wird, ist
      jeder Betrag darin ein Angebot an Verbraucher. Die Zahlen stimmen heute mit
      `preis-und-zaehlung.md` überein (geprüft mit `--pruefe`); wer den Preis im
      Hauptprojekt ändert, ändert ihn **hier mit** — sonst steht auf der öffentlichen
      Seite ein anderer Preis als auf der Rechnung.

## Ändern und ausrollen

```bash
# ändern
$EDITOR index.html

# örtlich ansehen
docker build -t immoleicht-landing . && docker run --rm -p 8080:80 immoleicht-landing
# dann http://localhost:8080

# ausrollen: Zweig, Pull Request, nach Freigabe mergen.
# Coolify baut bei jedem Push auf main neu.
```

## Zusammenhang

| | |
|---|---|
| Anwendung | `app.immoleicht.com` — Repo `Immoleicht/immoleicht` |
| Diese Seite | `immoleicht.com` und `www.immoleicht.com` |
| Betrieb | Coolify, Server 46.225.90.134 |
