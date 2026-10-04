# If-Sätze Typ 2 – Integrationsanleitung

Diese Anleitung richtet sich an den Agenten bzw. Entwickler, der die App in die Lernplattform einbaut.

## Überblick

| Eigenschaft | Wert |
|---|---|
| App-ID | `en-if-clauses-type2` |
| Version | `1.0.0` |
| Abhängigkeiten | keine (Vanilla JS, kein Build-Schritt) |
| Dateien | `index.html`, `style.css`, `data.js`, `app.js` |
| CSS | komplett unter der Klasse `.if2` gekapselt (Präfix `if2-`), keine globalen Styles außer im Standalone-`index.html` |
| Globale Namen | `window.IF2_DATA`, `window.IfType2Trainer`, liest `window.LEARNAPP_CONFIG` |

## Einbindung

### Variante A: direkt in eine Seite einbinden (empfohlen)

```html
<link rel="stylesheet" href="/apps/if-saetze-typ2/style.css">
<div id="if2-app"></div>

<script>
  window.LEARNAPP_CONFIG = {
    mount: '#if2-app',            // Selektor oder DOM-Element
    storageKey: 'if2',            // Präfix für localStorage
    user: { id: '42', name: 'Mia' },
    submitResult: async (result) => {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
    },
    fetchLeaderboard: async (modeId) => {
      const r = await fetch(`/api/leaderboard?app=en-if-clauses-type2&mode=${modeId}`);
      return r.json(); // [{ name, score, streak?, isMe? }]
    },
    onEvent: (type, detail) => { /* optional: start | answer | result | ready */ }
  };
</script>
<script src="/apps/if-saetze-typ2/data.js"></script>
<script src="/apps/if-saetze-typ2/app.js"></script>
```

`LEARNAPP_CONFIG` muss **vor** `app.js` gesetzt werden. Alle Felder sind optional; ohne Konfiguration läuft die App als Gast mit lokalem Speicher.

### Variante B: als iframe

`index.html` kann unverändert in einem iframe laufen. Alle Events werden zusätzlich per `postMessage` an das Elternfenster geschickt:

```js
window.addEventListener('message', (e) => {
  if (e.data?.source !== 'learnapp') return;
  if (e.data.type === 'result') saveScore(e.data.detail);
});
```

Den Nutzer reichst du im iframe-Fall über eine kleine Inline-Konfiguration in der ausgelieferten `index.html` durch (z. B. serverseitig gerendert) oder nachträglich mit `iframe.contentWindow.IfType2Trainer.setUser(...)` (nur bei gleicher Herkunft).

## Events

Jedes Event wird auf drei Wegen ausgeliefert: `CFG.onEvent(type, detail)`, als `CustomEvent` `learnapp:<type>` auf `window` und, falls die App in einem iframe läuft, per `postMessage({ source: 'learnapp', type, detail })`.

Jedes `detail` enthält `appId`, `appVersion` und `user`.

| type | Wann | Zusätzliche Felder |
|---|---|---|
| `ready` | App geladen | `modes` |
| `start` | Runde gestartet | `mode` |
| `answer` | Aufgabe beantwortet | `mode`, `itemId`, `correct`, `points`, `combo` |
| `result` | Runde beendet | siehe unten |

### `result`-Payload (für Bestenliste und Streaks)

```json
{
  "appId": "en-if-clauses-type2",
  "appVersion": "1.0.0",
  "user": { "id": "42", "name": "Mia" },
  "mode": "blitz",
  "modeName": "Blitz-Runde",
  "score": 230,
  "correct": 18,
  "total": 20,
  "accuracy": 90,
  "bestCombo": 11,
  "hintsUsed": 0,
  "perfect": false,
  "grade": null,
  "durationMs": 61234,
  "dayStreak": 4,
  "xpTotal": 1840,
  "level": 7,
  "timestamp": "2026-10-04T16:00:39.946Z"
}
```

- `score`: Punkte der Runde (für die Bestenliste)
- `bestCombo`: längste Serie richtiger Antworten in der Runde (Antwort-Streak)
- `dayStreak`: Tage in Folge gespielt. Wird **lokal** berechnet. Wenn die Plattform Tages-Streaks selbst führt, sollte sie ihren eigenen Wert verwenden.
- `grade`: deutsche Schulnote 1–6, nur im Modus `exam`, sonst `null`
- `xpTotal` / `level`: lokal pro Gerät und Nutzer, nur zur Anzeige

## Modi (`mode`-IDs für getrennte Bestenlisten)

| ID | Name | Ablauf |
|---|---|---|
| `gap` | Lückentext | 10 Sätze, Verbformen eintippen (Tipp-Button = halbe Punkte) |
| `mc` | Multiple Choice | 12 Fragen |
| `order` | Satzbau | 8 deutsche Sätze mit Wortbausteinen übersetzen, inkl. Ablenkern |
| `error` | Fehlerjagd | 10 Sätze: falschen Teil anklicken oder „korrekt“ wählen |
| `match` | Satzhälften | 3 Runden mit je 5 Paaren |
| `short` | Kurzantworten | 10 Fragen: Yes, … would. / No, … wouldn't. |
| `type` | Typ 1 oder Typ 2? | 12 Sätze einordnen |
| `comma` | Komma-Check | 12 Sätze |
| `blitz` | Blitz-Runde | 60 Sekunden auf Zeit, gemischt – **am besten für die Bestenliste** |
| `exam` | Klassenarbeit | 20 gemischte Aufgaben mit Note |
| `mistakes` | Fehler wiederholen | eigene Fehler üben, nicht für die Bestenliste gedacht |

## Punktesystem

- Richtige Antwort: 10 Punkte × Serien-Multiplikator (×1,0 bis ×2,0, +0,1 pro richtiger Antwort in Folge)
- Mit Tipp: halbe Punkte
- Perfekte Runde (alle richtig, nicht Blitz): +25 Bonus
- Falsche Antwort: Serie wird auf 0 zurückgesetzt, kein Punktabzug

## Öffentliche API: `window.IfType2Trainer`

```js
IfType2Trainer.setUser({ id, name })  // Nutzer wechseln (z. B. nach Login), lädt die Startseite neu
IfType2Trainer.configure({ submitResult, fetchLeaderboard, onEvent })
IfType2Trainer.getStats()             // { xp, level, best, bestCombo, dayStreak, played, openMistakes }
IfType2Trainer.start('blitz')         // Modus direkt starten (z. B. per Deep-Link)
IfType2Trainer.home()
IfType2Trainer.modes                  // [{ id, name }]
```

## Lokaler Speicher

Schlüssel: `<storageKey>:<userId|guest>:profile` und `…:mistakes`. Damit sind Gast- und Nutzerdaten getrennt. Die Plattform bleibt die maßgebliche Quelle für Bestenlisten. Lokal liegen nur Komfortdaten (Fehlerliste, XP, eigene Bestwerte, Ton an/aus).

## Bestenliste

Ist `fetchLeaderboard` gesetzt, zeigt der Bildschirm „🏆 Bestenliste“ die zurückgegebenen Zeilen je Modus (Tabs). Ist der Eintrag des aktuellen Nutzers mit `isMe: true` markiert, wird er hervorgehoben. Ohne Provider oder bei einem Fehler zeigt die App die lokalen Bestwerte an.

## Inhalte erweitern

Alle Aufgaben stehen in `data.js`. Das Format ist dort kommentiert. Neue Aufgaben bitte nur **hinten anhängen**, weil Aufgaben-IDs (`<typ>:<index>`) in der Fehlerliste gespeichert werden.
