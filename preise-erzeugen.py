#!/usr/bin/env python3
"""
Haelt die Preise an den drei Stellen zusammen, an denen sie stehen muessen.

WARUM ES DREI STELLEN SIND — UND WARUM DAS NICHT ZU VERMEIDEN IST

    1. rechner.js      die Pakettabelle, aus der der Regler alles rechnet
    2. index.html      die Tabelle im <noscript>-Block, fuer Besucher ohne Skript
    3. index.html      die Kennzahlenleiste, die den Einstiegspreis nennt

Eine einzige Stelle waere schoener und geht nicht: Wer kein JavaScript hat,
bekommt keine gerechneten Zahlen, sondern nur, was als Text dasteht. Genau
deshalb muessen die Zahlen doppelt vorkommen — und genau deshalb braucht es
etwas, das sie gegeneinander haelt.

    python3 preise-erzeugen.py            # erzeugt die <noscript>-Tabelle
    python3 preise-erzeugen.py --pruefe   # haelt alle drei Stellen gegeneinander

Massgeblich ist und bleibt `docs/architektur/preis-und-zaehlung.md` im
Hauptprojekt. Weichen diese Dateien davon ab, haben diese Dateien unrecht.

SEIT DEM 22.08.2026: Paketmodell statt Preis je Einheit — echte
Preisentscheidung des Auftraggebers, hergeleitet gegen objego und DoorLoop.
Begruendung: `docs/eingang/2026-08-22-preismodell-pakete.md` im Hauptprojekt.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Alle Betraege sind BRUTTO — der Gesamtpreis, den ein Privatvermieter zahlt.
# `bis` ist die letzte Einheitenzahl, die noch in dieses Paket faellt.
PAKETE = [
    {"name": "Start", "bis": 1, "monat": 0.0, "jahr": 0.0},
    {"name": "Wachstum", "bis": 10, "monat": 7.99, "jahr": 79.99},
    {"name": "Portfolio", "bis": 50, "monat": 24.99, "jahr": 249.99},
]

HIER = Path(__file__).parent


def euro(betrag: float) -> str:
    """1234.5 -> '1.234,50'. Deutsche Schreibweise, immer zwei Nachkommastellen."""
    ganz, komma = f"{betrag:,.2f}".split(".")
    return ganz.replace(",", ".") + "," + komma


def tabelle() -> str:
    zeilen = []
    vorher = 1
    for p in PAKETE:
        spanne = str(p["bis"]) if vorher == p["bis"] else f"{vorher}–{p['bis']}"
        zeilen.append(
            f'              <tr><td>{spanne}</td><td>{euro(p["monat"])} €</td>'
            f'<td>{euro(p["jahr"])} €</td></tr>'
        )
        vorher = p["bis"] + 1
    zeilen.append(
        '              <tr><td>ab '
        f'{PAKETE[-1]["bis"] + 1}</td><td colspan="2">individuell — Gespräch statt Tabelle</td></tr>'
    )
    return "\n".join(zeilen)


def js_pakete(js: str) -> list[dict] | None:
    treffer = re.search(r"const PAKETE = \[(.*?)\];", js, re.DOTALL)
    if not treffer:
        return None
    eintraege = []
    for m in re.finditer(
        r'\{\s*name:\s*"([^"]+)",\s*bis:\s*(\d+),\s*monat:\s*([\d.]+),\s*jahr:\s*([\d.]+)\s*\}',
        treffer.group(1),
    ):
        eintraege.append(
            {
                "name": m.group(1),
                "bis": int(m.group(2)),
                "monat": float(m.group(3)),
                "jahr": float(m.group(4)),
            }
        )
    return eintraege


def pruefe() -> int:
    js = (HIER / "rechner.js").read_text(encoding="utf-8")
    html = (HIER / "index.html").read_text(encoding="utf-8")
    fehler = []

    # 1. Die Pakettabelle im Skript, Eintrag fuer Eintrag.
    gefunden = js_pakete(js)
    if gefunden is None:
        fehler.append("  rechner.js: PAKETE nicht gefunden")
    elif gefunden != PAKETE:
        fehler.append(f"  rechner.js: PAKETE ist {gefunden}, erwartet {PAKETE}")

    # 2. Jede Zeile der Ersatztabelle.
    for zeile in tabelle().split("\n"):
        if zeile.strip() not in html:
            fehler.append(f"  index.html <noscript>: Zeile fehlt oder stimmt nicht: {zeile.strip()}")

    # 3. Gegenprobe: keine <noscript>-Tabellenzeile, die hier nicht vorgesehen ist.
    noscript = re.search(r"<noscript>(.*?)</noscript>", html, re.DOTALL)
    if not noscript:
        fehler.append("  index.html: kein <noscript>-Block — Besucher ohne Skript sehen keinen Preis")
    else:
        erwartete_zeilen = {z.strip() for z in tabelle().split("\n")}
        vorhandene_zeilen = {
            m.strip() for m in re.findall(r"<tr><td>.*?</tr>", noscript.group(1))
        }
        for z in sorted(vorhandene_zeilen - erwartete_zeilen):
            fehler.append(f"  index.html <noscript>: unerwartete Zeile: {z}")

    # 4. Die Kennzahlenleiste nennt den Einstiegspreis des guenstigsten
    # zahlenden Pakets (seit der Paketumstellung vom 22.08.2026).
    einstieg = next(p for p in PAKETE if p["monat"] > 0)
    satz_monat = euro(einstieg["monat"])
    if f'<div class="n">{satz_monat}<small>€</small></div>' not in html:
        fehler.append(f"  index.html: die Kennzahlenleiste nennt nicht {satz_monat} € im Monat")

    # 5. Der Nachlass am Jahresknopf muss zu JEDEM zahlenden Paket passen —
    # sie duerfen nicht auseinanderlaufen, sonst gilt die eine Zahl auf dem
    # Knopf nicht fuer jedes Paket, das ihn benutzt.
    nachlaesse = {
        round((1 - p["jahr"] / (p["monat"] * 12)) * 100) for p in PAKETE if p["monat"] > 0
    }
    if len(nachlaesse) != 1:
        fehler.append(f"  Pakete ergeben verschiedene Nachlaesse: {nachlaesse} — der Jahresknopf kann nur einen nennen")
    else:
        nachlass = nachlaesse.pop()
        if f"−{nachlass} %" not in html:
            fehler.append(f"  index.html: der Jahresknopf muss −{nachlass} % nennen")

    if fehler:
        print("Die Preise laufen auseinander:", *fehler, sep="\n")
        return 1
    namen = ", ".join(f'{p["name"]} {euro(p["monat"])} €/Monat' for p in PAKETE)
    print(f"Alle drei Stellen stimmen ueberein: {namen}.")
    return 0


if __name__ == "__main__":
    if "--pruefe" in sys.argv:
        sys.exit(pruefe())
    print("── Tabelle fuer den <noscript>-Block ──\n")
    print(tabelle())
