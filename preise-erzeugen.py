#!/usr/bin/env python3
"""
Erzeugt die Zahlen des Preisrechners in `index.html`.

WOFUER DAS DA IST — UND WOFUER NICHT

Das ist **kein Bauschritt**. Das Dockerfile kopiert `index.html` und `nginx.conf`,
sonst nichts; diese Datei wird nie ausgeliefert und nie ausgefuehrt, wenn die
Seite gebaut wird. Die Seite bleibt eine einzelne HTML-Datei ohne Werkzeugkette.

Sie existiert, weil der Rechner **72 Zahlen** enthaelt: je zwoelf Stufen mal
sechs Werte (Einheiten, zahlbare Einheiten, Monatspreis, Jahrespreis, der
Jahrespreis auf den Monat gerechnet, und die Ersparnis). Aendert sich der Preis,
sind das 72 Handgriffe — und Handarbeit an 72 Zahlen ist genau die Stelle, an der
ein falscher Betrag auf einer Preisseite steht, ohne dass es jemand merkt.

    python3 preise-erzeugen.py          # gibt die drei Bloecke aus
    python3 preise-erzeugen.py --pruefe # prueft, ob index.html dazu passt

Der Preis selbst steht in `docs/architektur/preis-und-zaehlung.md` des
Hauptprojekts und ist dort begruendet. Hier stehen nur die beiden Zahlen, aus
denen alles andere folgt.
"""

import re
import sys
from pathlib import Path

# Beide Betraege sind BRUTTO — der Gesamtpreis, den ein Privatvermieter zahlt.
# Am 19.08.2026 so festgelegt. Der Bruttopreis ist die feste Groesse, nicht der
# Nettopreis: Aendert sich der Steuersatz, aendert sich der Nettoerloes, nicht
# das, was der Kunde zahlt.
MONAT_JE_EINHEIT = 9.99
JAHR_JE_EINHEIT = 100.00

# Die erste Einheit ist je Mandant dauerhaft kostenlos.
FREI = 1

# Die Stufen des Rechners. Bewusst keine gleichmaessige Leiter: Unten steht
# jede Zahl einzeln, weil dort die Zielgruppe sitzt, die eine oder zwei
# Wohnungen hat und genau nachrechnen will. Oben genuegen Sprungmarken.
STUFEN = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 50, 100]


def euro(betrag: float) -> str:
    """1234.5 -> '1.234,50'. Deutsche Schreibweise, immer zwei Nachkommastellen."""
    ganz, komma = f"{betrag:,.2f}".split(".")
    return ganz.replace(",", ".") + "," + komma


def werte(n: int) -> dict[str, str]:
    zahlbar = max(0, n - FREI)
    monat = zahlbar * MONAT_JE_EINHEIT
    jahr = zahlbar * JAHR_JE_EINHEIT
    return {
        "anzahl": str(n),
        "zahlbar": str(zahlbar),
        "monat": euro(monat),
        "jahr": euro(jahr),
        # Der Jahrespreis auf den Monat gerechnet — die Zahl, die den Vergleich
        # ueberhaupt erst moeglich macht. Ohne sie stehen 9,99 im Monat neben
        # 100 im Jahr, und niemand rechnet das im Kopf.
        "jahr_monat": euro(jahr / 12),
        # Was die Jahreszahlung gegenueber zwoelf Monatszahlungen spart.
        "ersparnis": euro(monat * 12 - jahr),
    }


def block_stufen() -> str:
    """Die Auswahl: ein verstecktes Radiofeld je Stufe, dahinter sein Schildchen."""
    zeilen = []
    for n in STUFEN:
        w = werte(n)
        letzte = n == STUFEN[-1]
        sichtbar = f"{n}+" if letzte else str(n)
        einheit = "Einheit" if n == 1 else "Einheiten"
        if n == 1:
            vorlesen = f"{n} {einheit} — dauerhaft kostenlos"
        else:
            mehr = " oder mehr" if letzte else ""
            vorlesen = (
                f"{n} {einheit}{mehr} — {w['monat']} Euro im Monat, "
                f"oder {w['jahr']} Euro im Jahr"
            )
        gewaehlt = " checked" if n == 1 else ""
        zeilen.append(
            f'        <input type="radio" name="anzahl" id="e{n}"{gewaehlt}>\n'
            f'        <label for="e{n}">{sichtbar}'
            f'<span class="nurvorlesen"> {vorlesen}</span></label>'
        )
    return "\n".join(zeilen)


def block_werte(schluessel: str) -> str:
    """Alle zwoelf Fassungen eines Wertes nebeneinander. Sichtbar ist immer eine."""
    return "".join(f'<i class="w{n}">{werte(n)[schluessel]}</i>' for n in STUFEN)


def block_regeln() -> str:
    """Je Stufe eine CSS-Regel — sie zeigt alle sechs Werte dieser Stufe auf einmal."""
    return "\n".join(
        f".rechner #e{n}:checked ~ .ergebnis .w{n} {{ display: inline; }}" for n in STUFEN
    )


def pruefe(pfad: Path) -> int:
    """Steht in index.html wirklich das, was hier herauskommt?

    Prueft nicht den Text drumherum, sondern nur die Zahlen: jede Stufe muss
    ihre sechs Werte in genau dieser Schreibweise enthalten.
    """
    html = pfad.read_text(encoding="utf-8")
    fehler = []
    for n in STUFEN:
        for schluessel, wert in werte(n).items():
            if f'<i class="w{n}">{wert}</i>' not in html:
                fehler.append(f"  Stufe {n}, {schluessel}: {wert!r} fehlt")
        if f'id="e{n}"' not in html:
            fehler.append(f"  Stufe {n}: Auswahlfeld id=e{n} fehlt")
        if f".rechner #e{n}:checked" not in html:
            fehler.append(f"  Stufe {n}: CSS-Regel fehlt")

    # Gegenprobe: keine Stufe darf uebrig sein, die es hier nicht mehr gibt.
    for gefunden in set(re.findall(r'name="anzahl" id="e(\d+)"', html)):
        if int(gefunden) not in STUFEN:
            fehler.append(f"  Stufe {gefunden} steht in index.html, aber nicht in STUFEN")

    if fehler:
        print("index.html passt NICHT zu den Preisen:", *fehler, sep="\n")
        return 1
    print(f"index.html passt: {len(STUFEN)} Stufen, alle Zahlen stimmen.")
    return 0


if __name__ == "__main__":
    hier = Path(__file__).parent
    if "--pruefe" in sys.argv:
        sys.exit(pruefe(hier / "index.html"))

    print("── Auswahl ──\n")
    print(block_stufen())
    for schluessel in ("anzahl", "zahlbar", "monat", "jahr", "jahr_monat", "ersparnis"):
        print(f"\n── Werte: {schluessel} ──\n")
        print(block_werte(schluessel))
    print("\n── CSS-Regeln ──\n")
    print(block_regeln())
