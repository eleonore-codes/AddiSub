# Prüfbericht – AddiSub 1.1

## Automatisierte Tests

Ausgeführt unter Windows/Node.js 24.20.0:

```sh
node --test --test-isolation=none tests/*.test.js
```

**52 Tests bestanden, 0 fehlgeschlagen.**

- 40.000 zufällige Rechenmodelle unabhängig nachgerechnet.
- 8.960 generierte Aufgaben, alle Stufen/Familien und vier Wachstumsstände.
- Addition/Subtraktion, bekannte Hilfs-1-Methode, Mehrfachübergänge und Nullübergänge unverändert bestanden.
- Explizite komplette Abgaben: 23+14, 987+248, 999+1, 99999+1, 999999+1, 731−265, 638427−259684, 5002−2786, 1000000−1.
- Ergebnislänge steuert weder Rasterkapazität noch Eingabefortschritt.
- Falsche Ergebnis- und Hilfseingaben blockieren keine folgende Stelle; keine Prüfung vor Abgabe.
- Freies Ändern/Löschen; richtige Felder bleiben erhalten; Nachkorrektur und erneute Abgabe.
- Numerisches Ergebnis separat vom vollständigen schriftlichen Pfad geprüft.
- Erster Prüfversuch über Serialisierung und Korrektur hinweg unverändert; adaptive Evidenz und Erfolgswertung bleiben unabhängig von späterer Auflösung.
- Timer läuft ab, aber die Rechnung darf einschließlich Korrekturen beendet werden. Zwei Phasen, keine dritte.
- Alle zehn Stufen mit frischem/älterem Speicher, nach Reset und Reload; Wechsel zu einer anderen Stufe ohne Verlust einer begonnenen Rechnung.
- Erfolgsnummern, Tagesfolgen, Grundmengen, Fertigkeitszustände und adaptive Auswahl bestanden.
- Echte UI-Klickhandler in einer minimalen DOM-Testumgebung geprüft; kein Ersatz für die unten zusätzlich ausgeführte Browserprüfung.
- Service-Worker-Dateiliste, Cache-Aktivierung, Offlineantworten, relative Pfade und fehlende externe Laufzeitanfragen automatisiert geprüft.

## Zusätzliche reale Browserprüfung

Der lokale Server hatte einen Windows-Pfadvergleich mit gemischten Trennzeichen. Er wurde auf `fileURLToPath` umgestellt. Danach lieferten Startseite, App-/Sitzungs-/Speichermodule, Service Worker und Manifest unter `/AddiSub/` HTTP 200 mit passenden MIME-Typen. Der zunächst blockierte Browser konnte die App anschließend öffnen.

In einem echten integrierten Browser:

1. Frischer Lernstand: Alle zehn Stufen ohne Sperrhinweise sichtbar; Stufe 10 direkt gewählt und gestartet.
2. Aufgabe 84251−84110: absichtlich E=9 eingegeben; Auswahl wechselte zu Z, keinerlei Richtig-/Falsch-Rückmeldung. Weitere Stellen ohne Unterbrechung eingegeben. Unnötige Hilfs-1 eingetragen und vor dem Absenden gelöscht, ebenfalls ohne Rückmeldung.
3. Erst „Ergebnis prüfen“ meldete die Einerstelle. Alle anderen Ziffern blieben erhalten. Nur E auf 1 geändert, erneut geprüft: „Ergebnis und Rechenweg stimmen“.
4. Isolierte Testinstanz auf separatem lokalen Port, ohne echte Lernprofile: 999999+1, sechs Nullen und die Millionenziffer von rechts nach links, fünf Hilfs-1 manuell eingetragen. Bis zur Gesamtabgabe keine Bewertung.

## Responsive Prüfung: 390×844

Screenshot der siebenstelligen Rechnung visuell geprüft. Gemessene Rasterspalten M bis E:

| Stelle | x | Breite |
| --- | ---: | ---: |
| M | 39 px | 48 px |
| HT | 87 px | 48 px |
| ZT | 135 px | 48 px |
| T | 183 px | 48 px |
| H | 231 px | 48 px |
| Z | 279 px | 48 px |
| E | 327 px | 48 px |

Alle Zeilen haben pro Stelle dieselbe x-Position. Dokumentbreite: 390 px. Kein horizontaler Überlauf. Prüfknopf-Unterkante: 711,5 px bei 844 px Bildschirmhöhe. Ziffern, Hilfszeile, Tasten und Prüfknopf sind gleichzeitig sichtbar. Der temporäre Viewport wurde anschließend zurückgesetzt.

## Reale Offlineprüfung

Nach vollständiger Installation wurde der isolierte Testserver beendet. Ein unabhängiger HTTP-Aufruf bestätigte, dass der Server nicht mehr erreichbar war.

Anschließend im Browser erfolgreich:

- App neu geladen: Startseite aus Cache verfügbar.
- Training fortgesetzt: sieben Ergebnisziffern und fünf manuelle Hilfszahlen wiederhergestellt.
- 999999+1 vollständig offline geprüft.
- Phase A erst nach Abschluss der Rechnung beendet; der Testfall enthielt bewusst bereits abgelaufene Phasenzeit.
- Phase B offline gestartet.
- Startseite und alle zehn verfügbaren Stufen offline geöffnet.

Cacheversion: `addisub-v1.1.0`. Keine Änderung am Speicherkey und keine Löschung des Lernstands für das Update.

## Grenzen

Die responsive Abnahme erfolgte im integrierten Browser, nicht auf physischem iPhone/Safari. Ein vollständiger Flugmodus auf einem realen Gerät, iOS-Installation und native Kartenfreigabe bleiben offen. Kartenmodul und Erfolgsformel wurden nicht verändert; Erfolgs-/Streak-Logik ist automatisiert geprüft. Der veröffentlichte GitHub-Pages-Endpunkt wurde in dieser Runde nicht verändert oder geprüft.
