# Prüfbericht – AddiSub

Stand: 20.09.2026. Node.js 24.20.0 unter Windows.

## Ausgeführt

`node --test --test-isolation=none tests/*.test.js`

33 Tests bestanden, 0 fehlgeschlagen. Der normale Node-Testlauf mit separaten Kindprozessen wurde durch die lokale Prozess-Sandbox blockiert; der identische Testbestand lief anschließend ohne Prozessisolation erfolgreich.

### Mathematisches Modell

- 20.000 Zufallszahlenpaare, jeweils Addition und nichtnegative Subtraktion: **40.000 Modelle** unabhängig geprüft.
- Zusätzlich **8.960 generierte Aufgaben**: für jede Stufe, jede erlaubte Familie und vier Wachstumsstände je 80 Aufgaben. Stellenzahl, Zahlenraum, Übergangsbedingungen und das vollständige Modell geprüft.
- `987+248=1235`: E5/Z3/H2/T1; Hilfszahlen Z1/H1; keine zusätzliche Hilfszahl in der führenden Tausender-Ergebnisstelle.
- `731−265=466`: E `11−5`, Z `13−(6+1)`, H `7−(2+1)`.
- Fehlende und falsch platzierte Hilfszahlen, unnötige Hilfszahl und vergessene eingehende Hilfszahl geprüft.
- Nullfälle 500−278, 1002−487, 5002−2786, 10000−4638, 1000000−1, 1000−999 und 100−99 bestanden.
- Ungleiche Operandenbreiten bis zur Million geprüft.
- Bewusst manipuliertes Modell wird abgewiesen.

### Lernen, Belohnung, Sitzung und Speicherung

- Normierte Wertung, Mindestumfang und Ausschluss unvollständiger Rechenwege.
- Wiederholte Erfolgsvergabe nach Serialisierung erzeugt keine Doppelzählung.
- Zwei Erfolge an einem Tag, Folgetag, ausgelassener Tag und längste Folge.
- Beobachtungsminimum, langsame korrekte Arbeit und Automatisierungsminimum.
- Fehler aus A bestimmen den Schwerpunkt; Grundabdeckung bleibt bestehen; maximal zwei gleiche Familien hintereinander bei gemischten Stufen.
- Freischaltung benötigt wiederholte Evidenz und bleibt dauerhaft bestehen.
- Zeitablauf beendet erst nach Abschluss der Rechnung die 3- bzw. 2-Minuten-Phase; keine dritte Phase.
- Frühere richtige Eingaben bleiben nach späteren Fehlern erhalten.
- Serialisierung und Wiederherstellung; unbekannte Schemaversion wird ohne automatisches Löschen abgewiesen.

### Simulierte UI-Integration

Das tatsächliche `app.js` wurde mit minimalen Dokument-/Speicherdoubles geladen. Die Klick-Handler wurden durchlaufen: Fortsetzen, Ergebnis, fehlende Hilfszahl, Hilfszahl manuell, spätere Korrektur, führende Ergebnisstelle, Abschluss, Pause, Fortschritt und Reset mit zweiter Bestätigung.

Für jede Zeile der Vierstellendarstellung wurde die identische absolute Stellenfolge T/H/Z/E im erzeugten HTML geprüft. Dies prüft die Verbindung von UI und Rechenkern, **keine Pixelgeometrie eines Browsers**.

### Simulierter Offlinebetrieb

Der echte Service-Worker-Code wurde in einer isolierten JavaScript-Testumgebung ausgeführt: alle vorkonfigurierten Dateien vorhanden, relative Auflösung unter `/AddiSub/`, Installation und Aktivierung, ausschließlich alte AddiSub-Caches gelöscht, Programmdateien ohne Netzantwort aus Cache geliefert, Fremdursprung nicht abgefangen. Laufzeitdateien enthalten keine externen URLs oder domain-root-absoluten Assets.

## Nicht als bestanden gewertet

- Echter Browserstart: Playwright konnte Edge wegen `spawn EPERM` nicht starten. Der integrierte Browser blockierte sowohl `127.0.0.1` als auch `localhost` mit `ERR_BLOCKED_BY_CLIENT`.
- iPhone-13-Geometrie 390×844: responsive CSS implementiert, aber keine reale Screenshot-/Geometrieabnahme.
- Sieben Spalten: mathematisch feste Stellen und flexibles Grid implementiert; tatsächliche Touchbedienung auf iPhone nicht abgenommen.
- iOS-Safari, Home-Bildschirm-Installation, echter Flugmodus, Cacheupdate bei offener App und native Freigabe der PNG-Karte nicht ausgeführt.
- GitHub Pages nicht veröffentlicht; ein echter HTTPS-Endpunkt wurde nicht geprüft.

Diese offenen Prüfungen verhindern die Aussage „vollständig abgenommen“. Sie sind keine bekannten mathematischen Fehler, dürfen aber auch nicht durch simulierte Tests als erledigt ausgegeben werden.
