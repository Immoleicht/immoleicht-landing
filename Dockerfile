# Betriebsabbild der Landingpage.
#
# Bewusst nginx statt eines Baukastens: Die Seite ist eine einzelne HTML-Datei
# ohne Bauschritt. Alles andere waere Aufwand ohne Gegenwert.
#
# Wie bei der Anwendung ein Dockerfile und kein anbieterspezifisches Format -
# das Abbild laeuft auf jedem Docker-Host gleich.

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html

# Die Schriften werden vom EIGENEN Server ausgeliefert, nicht von Google. Das ist
# hier nicht Geschmack: Google Fonts von Googles Servern einzubinden uebertraegt
# die IP-Adresse jedes Besuchers in die USA, und dafuer gibt es rechtskraeftige
# Abmahnungen. Alle drei stehen unter der SIL Open Font License 1.1; die
# Lizenztexte werden mitkopiert, weil die Lizenz das verlangt.
COPY schriften /usr/share/nginx/html/schriften

# preise-erzeugen.py wird bewusst NICHT kopiert: Es ist ein Werkzeug fuer den
# Menschen, der den Preis aendert, und kein Bauschritt.

EXPOSE 80

# Lebenszeichen ohne Abhaengigkeiten, damit der Server erkennt, ob ausgeliefert
# werden kann - und nicht bloss, ob der Prozess laeuft.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
