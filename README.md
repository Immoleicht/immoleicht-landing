# Landingpage immoleicht.com

Eine einzelne HTML-Datei, ausgeliefert über nginx, betrieben auf Coolify.

## Warum so klein

Die Seite hat genau eine Aufgabe: verständlich machen, was Immoleicht ist. Dafür braucht
es keinen Baukasten, kein Framework und keinen Bauschritt. Wer sie ändern will, öffnet
`index.html` und ändert sie.

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
