#!/usr/bin/env python3
"""
Haelt die Preise an den drei Stellen zusammen, an denen sie stehen muessen.

WARUM ES DREI STELLEN SIND — UND WARUM DAS NICHT ZU VERMEIDEN IST

    1. rechner.js      die drei Zahlen, aus denen der Regler alles rechnet
    2. index.html      die Tabelle im <noscript>-Block, fuer Besucher ohne Skript
    3. index.html      der Satz "9,99 EUR im Monat oder 100 EUR im Jahr"

Eine einzige Stelle waere schoener und geht nicht: Wer kein JavaScript hat,
bekommt keine gerechneten Zahlen, sondern nur, was als Text dasteht. Genau
deshalb muessen die Zahlen doppelt vorkommen — und genau deshalb braucht es
etwas, das sie gegeneinander haelt.

    python3 preise-erzeugen.py            # erzeugt die <noscript>-Tabelle
    python3 preise-erzeugen.py --pruefe   # haelt alle drei Stellen gegeneinander

Massgeblich ist und bleibt `docs/architektur/preis-und-zaehlung.md` im
Hauptprojekt. Weichen diese Dateien davon ab, haben diese Dateien unrecht.
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
FREI = 1

# Die Zeilen der Ersatztabelle. Bewusst weniger als frueher: Sie ist kein
# Rechner, sondern ein Notnagel — sie soll die Groessenordnung zeigen, nicht
# jeden Fall treffen.
ZEILEN = [1, 2, 3, 5, 10, 20, 50, 100]

HIER = Path(__file__).parent


def euro(betrag: float) -> str:
    """1234.5 -> '1.234,50'. Deutsche Schreibweise, immer zwei Nachkommastellen."""
    ganz, komma = f"{betrag:,.2f}".split(".")
    return ganz.replace(",", ".") + "," + komma


def werte(n: int) -> tuple[str, str]:
    zahlbar = max(0, n - FREI)
    return euro(zahlbar * MONAT_JE_EINHEIT), euro(zahlbar * JAHR_JE_EINHEIT)


def tabelle() -> str:
    zeilen = []
    for n in ZEILEN:
        monat, jahr = werte(n)
        zeilen.append(f"              <tr><td>{n}</td><td>{monat} €</td><td>{jahr} €</td></tr>")
    return "\n".join(zeilen)


def pruefe() -> int:
    js = (HIER / "rechner.js").read_text(encoding="utf-8")
    html = (HIER / "index.html").read_text(encoding="utf-8")
    fehler = []

    # 1. Die Konstanten im Skript.
    for name, soll in (
        ("MONAT_JE_EINHEIT", MONAT_JE_EINHEIT),
        ("JAHR_JE_EINHEIT", JAHR_JE_EINHEIT),
        ("FREI", FREI),
    ):
        treffer = re.search(rf"^const {name} = ([\d.]+);", js, re.MULTILINE)
        if not treffer:
            fehler.append(f"  rechner.js: {name} nicht gefunden")
        elif float(treffer.group(1)) != float(soll):
            fehler.append(f"  rechner.js: {name} ist {treffer.group(1)}, erwartet {soll}")

    # 2. Jede Zeile der Ersatztabelle.
    for n in ZEILEN:
        monat, jahr = werte(n)
        zeile = f"<tr><td>{n}</td><td>{monat} €</td><td>{jahr} €</td></tr>"
        if zeile not in html:
            fehler.append(f"  index.html <noscript>: Zeile fuer {n} fehlt oder stimmt nicht")

    # 3. Gegenprobe: keine Zeile in der Tabelle, die hier nicht vorgesehen ist.
    noscript = re.search(r"<noscript>(.*?)</noscript>", html, re.DOTALL)
    if not noscript:
        fehler.append("  index.html: kein <noscript>-Block — Besucher ohne Skript sehen keinen Preis")
    else:
        gefunden = {int(m) for m in re.findall(r"<tr><td>(\d+)</td>", noscript.group(1))}
        for n in sorted(gefunden - set(ZEILEN)):
            fehler.append(f"  index.html <noscript>: Zeile {n} steht dort, aber nicht in ZEILEN")

    # 4. Der Satz im Fliesstext.
    satz_monat = euro(MONAT_JE_EINHEIT).rstrip("0").rstrip(",") if False else euro(MONAT_JE_EINHEIT)
    if f'<span class="preis">{satz_monat}&nbsp;€</span>' not in html:
        fehler.append(f"  index.html: der Satz nennt nicht {satz_monat} € im Monat")
    if '<span class="preis">100&nbsp;€</span>' not in html:
        fehler.append("  index.html: der Satz nennt nicht 100 € im Jahr")

    # 5. Der Nachlass am Jahresknopf muss zur Rechnung passen.
    nachlass = round((1 - JAHR_JE_EINHEIT / (MONAT_JE_EINHEIT * 12)) * 100)
    if f"−{nachlass} %" not in html:
        fehler.append(f"  index.html: der Jahresknopf muss −{nachlass} % nennen")

    if fehler:
        print("Die Preise laufen auseinander:", *fehler, sep="\n")
        return 1
    print(
        f"Alle drei Stellen stimmen ueberein: {MONAT_JE_EINHEIT} €/Monat, "
        f"{JAHR_JE_EINHEIT:.0f} €/Jahr, {FREI} frei, Nachlass {nachlass} %."
    )
    return 0


if __name__ == "__main__":
    if "--pruefe" in sys.argv:
        sys.exit(pruefe())
    print("── Tabelle fuer den <noscript>-Block ──\n")
    print(tabelle())
