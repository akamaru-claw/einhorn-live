# EINHORN.live — Bitcoin-Finanzplanung für große Käufe

Interaktives Tool zum Vergleichen verschiedener Finanzierungsoptionen, wenn man Bitcoin besitzt und eine größere Anschaffung plant.

## Ziel

Die oberste Priorität des Tools ist es, dem Nutzer zu helfen, **möglichst viel Bitcoin zu behalten**, ohne dabei eine unangemessen hohe monatliche Belastung aufzunehmen und ohne jetzt unnötig viel BTC bei niedrigem Preis zu verkaufen.

## Funktionen

- **Sofortverkauf:** Wie viel BTC muss heute verkauft werden?
- **BTC-besicherter Kredit:** Kredit mit Bitcoin als Sicherheit (max. 50% LTV, Sicherheit mind. 2× Kreditsumme).
- **Händlerkredit:** Klassischer Ratenkredit mit variabler Anzahlung und Laufzeit.
- **Mix-Szenario:** Kombination aus Teilzahlung und Kredit.
- **Zukunftsszenarien:** Verkauf in 1 Jahr bei pessimistischem, realistischem und optimistischem BTC-Preis.
- **Entscheidungshilfe:** Vergleich aller Optionen nach BTC-Erhalt, monatlicher Belastung, sofortigem Verkauf und Gesamtkosten.
- **Tilgungsplan:** Detaillierter Verlauf für den Händlerkredit.

## Technik

- Reines Frontend: HTML, CSS, JavaScript
- Kein Backend notwendig
- Alle Berechnungen laufen lokal im Browser

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.html` | Seitenstruktur und Eingabeformular |
| `style.css` | Dark-Theme Layout |
| `app.js` | Berechnungslogik und Rendering |

## Lokal ausführen

```bash
git clone <repo-url>
cd einhorn-live
# Einfach index.html im Browser öffnen
```

Oder mit einem lokalen Server:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen.

## Hinweise

- Die Steuerberechnung ist vereinfacht und dient der Orientierung.
- Die tatsächlichen Konditionen für BTC-besicherte Kredite variieren je nach Anbieter.
- Es handelt sich um Planungs- und keine Anlageberatung.

## Lizenz

MIT
