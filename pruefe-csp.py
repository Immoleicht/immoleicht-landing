#!/usr/bin/env python3
"""
Liefert die Seite mit GENAU den Kopfzeilen aus, die nginx im Betrieb setzt.

WOFUER DAS DA IST

Auf dieser Maschine ist kein Docker installiert. `docker build && docker run`
faellt damit aus, und ohne das gibt es keinen Weg, eine Aenderung an der
Content-Security-Policy vor dem Ausrollen zu pruefen.

Das ist genau die Sorte Aenderung, bei der Nichtpruefen teuer ist: Eine zu enge
Policy bricht das Skript, und zwar NUR im Betrieb — oertlich ueber einen
gewoehnlichen Dateiserver laeuft alles. Die Seite sieht dabei aus wie immer,
der Regler steht bloss still.

Dieses Skript liest die `add_header`-Zeilen aus `nginx.conf` — es schreibt sie
nicht ab, sondern liest sie, damit es nicht auseinanderlaufen kann — und setzt
sie auf jede Antwort.

    python3 pruefe-csp.py            # Server auf 127.0.0.1:8199
    python3 pruefe-csp.py --port N   # anderer Port

Der Browser meldet jede Verletzung als Konsolenfehler; `pruefe-seite.mjs` faengt
sie ab und laesst die Pruefung daran scheitern.
"""

import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HIER = Path(__file__).parent


def kopfzeilen_aus_nginx() -> list[tuple[str, str]]:
    """Liest die `add_header`-Zeilen. Bewusst lesen statt abschreiben."""
    text = (HIER / "nginx.conf").read_text(encoding="utf-8")
    gefunden = []
    for zeile in text.splitlines():
        zeile = zeile.strip()
        if zeile.startswith("#") or not zeile.startswith("add_header "):
            continue
        # add_header Name "Wert" always;   ODER   add_header Name Wert always;
        treffer = re.match(r'add_header\s+(\S+)\s+(".*?"|\S+)\s*(always)?\s*;', zeile)
        if not treffer:
            continue
        name, wert = treffer.group(1), treffer.group(2)
        gefunden.append((name, wert.strip('"')))
    if not gefunden:
        raise SystemExit("nginx.conf enthaelt keine add_header-Zeilen — Pruefung waertlos.")
    return gefunden


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, kopfzeilen=(), **kw):
        self._kopfzeilen = kopfzeilen
        super().__init__(*a, directory=str(HIER), **kw)

    def end_headers(self):
        for name, wert in self._kopfzeilen:
            self.send_header(name, wert)
        super().end_headers()

    def log_message(self, *a):
        pass  # still, sonst geht die eigentliche Ausgabe unter


if __name__ == "__main__":
    port = 8199
    if "--port" in sys.argv:
        port = int(sys.argv[sys.argv.index("--port") + 1])

    kopfzeilen = kopfzeilen_aus_nginx()
    print(f"Kopfzeilen aus nginx.conf ({len(kopfzeilen)}):")
    for name, wert in kopfzeilen:
        print(f"  {name}: {wert[:100]}{'…' if len(wert) > 100 else ''}")
    print(f"\nhttp://127.0.0.1:{port}  — Strg-C beendet.")
    ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, kopfzeilen=kopfzeilen)).serve_forever()
