/*
 * Laeuft als ERSTES und BLOCKIEREND im Kopf der Seite. Zwei Aufgaben, und beide
 * muessen erledigt sein, bevor der Browser das erste Mal zeichnet.
 *
 * 1. DIE GEWAEHLTE DARSTELLUNG SETZEN.
 *    Steht sie erst nach dem Zeichnen fest, sieht der Nutzer die helle Seite
 *    aufblitzen und dann auf dunkel umspringen. Das ist der Grund, warum diese
 *    paar Zeilen nicht unten bei `rechner.js` stehen: `defer` liefe nach dem
 *    Aufbau, und genau dann ist es zu spaet.
 *
 * 2. DIE KLASSE `js` SETZEN.
 *    Alles, was ohne JavaScript unsichtbar waere, haengt an dieser Klasse. Die
 *    Seite ist damit im Grundzustand VOLLSTAENDIG SICHTBAR, und erst dieses
 *    Skript schaltet die Einblend-Bewegung ein. Andersherum — Inhalte per CSS
 *    verstecken und per JavaScript zeigen — waere die haeufigste Art, eine
 *    Seite fuer jeden unbrauchbar zu machen, bei dem das Skript nicht laeuft.
 *
 * Kein `<script>` im HTML: Die Content-Security-Policy erlaubt Skripte nur als
 * eigene Datei von diesem Server (`script-src 'self'`), NICHT eingebettet.
 * Genau das ist der Riegel gegen eingeschleusten Code, und er bleibt zu.
 */
(function () {
  var wurzel = document.documentElement;
  wurzel.classList.add("js");

  try {
    var wahl = localStorage.getItem("immoleicht-darstellung");
    if (wahl === "hell" || wahl === "dunkel") {
      wurzel.setAttribute("data-darstellung", wahl);
    }
  } catch (e) {
    /* Privater Modus oder gesperrter Speicher: dann eben die Systemeinstellung.
       Ein Fehler hier darf die Seite nicht anhalten — sie ist ohne die
       gespeicherte Wahl vollstaendig benutzbar. */
  }
})();
