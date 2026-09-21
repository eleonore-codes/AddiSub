# AddiSub 1.1.1

Schriftliche Addition und Subtraktion für ein Kind in Klasse 4: feste Stellen, kurze Texte, große Ziffern, manuelle Hilfszahlen und ruhiges Training. Pädagogische Schwester von MultiDivi, mit eigenständigem Rechenkern. Ohne Konto, Werbung, Tracking, CDN oder externe Laufzeitbibliotheken.

## Start

Node.js 24 oder neuer:

```sh
npm start
```

Dann `http://localhost:8787/AddiSub/` öffnen. Ein Doppelklick auf `index.html` ist wegen ES-Modulen und Service Worker nicht vorgesehen. Auf einem Telefon die veröffentlichte HTTPS-Seite verwenden.

## Bedienung

1. Training starten. Die Einer sind zuerst aktiv.
2. Ergebnisziffer über die Zifferntasten eintragen.
3. Falls nötig, eine Stelle der kleinen Hilfszeile antippen und die Hilfszahl selbst eintragen. Auch falsche oder fehlende Hilfszahlen unterbrechen die Eingabe nicht.
4. Nach jeder Ergebnisziffer wandert die Auswahl eine Stelle nach links. Alle Ergebnis- und Hilfsfelder bleiben frei antippbar, änderbar und löschbar.
5. Das Kind bestimmt selbst das Ende und drückt **„Ergebnis prüfen“**. Erst jetzt werden das numerische Ergebnis und der vollständige schriftliche Rechenweg getrennt geprüft.
6. Fehlerhafte Stellen werden markiert, ohne die richtige Ziffer einzusetzen. Alle bisherigen Einträge bleiben stehen. Korrigieren und erneut prüfen; nach korrektem Abschluss führt „Weiter“ zur nächsten Aufgabe oder zum Phasenbericht.

Die Hilfszeile wird immer angeboten. Auch bei Aufgaben ohne Übergang bleibt sie sichtbar. Zukünftige Ergebnisstellen werden nicht abhängig vom Ergebnis hervorgehoben. Addition zeigt grundsätzlich eine neutrale Reservespalte, soweit innerhalb der sieben Stellen möglich. Subtraktion zeigt die Breite der Operanden. Führende Nullstellen bei Subtraktion werden mitgerechnet und bleiben sichtbar.

Eine erforderliche Hilfs-1 fehlt? Das Ergebnis allein genügt nicht. Die App prüft beides. Alle Stellen bleiben bis zur vollständig gelösten Rechnung editierbar. Vor dem ersten Prüfen gibt es weder Richtig-/Falsch-Meldungen noch entsprechende Farben oder Sperren.

## Architektur und Dateien

| Datei | Aufgabe |
| --- | --- |
| `config.js` | Zeiten, Schwellen, Stufen, Zahlenräume, Fehlerprioritäten |
| `math.js` | Stellenmodell, Generator, unabhängige Validierung, Fehlerdiagnose |
| `learning.js` | Fertigkeiten, Kombinationen und Auswahl |
| `session.js` | Rechenweg und Phasenübergänge |
| `rewards.js` | Trainingswertung, Erfolge und Tagesfolgen |
| `storage.js` | versionierte lokale Speicherung, Validierung, Datumsfunktionen |
| `app.js`, `index.html`, `styles.css` | deutsche Oberfläche, Eingaben, Fortschritt |
| `share.js` | lokale PNG-Erfolgskarten und Teilen/Download |
| `manifest.json`, `service-worker.js`, `icon*` | Offline-App und Installationsgrafik |
| `serve.js` | lokaler Entwicklungsserver |
| `tests/` | Rechen-, Lern-, Sitzungs-, Speicher-, UI- und Cachetests |

## Exaktes Stellenmodell

`place` ist der Exponent von 10, beginnend rechts: 0=E, 1=Z, 2=H, 3=T, 4=ZT, 5=HT, 6=M. `digit(n,p)=floor(n/10^p) mod 10`.

Eine Aufgabe enthält `a`, `b`, `operation`, `result`, `operandWidth`, `columns`, `transitions`, `zeroTransition`, `level`, `family`, `skills`, `difficulty`. Die Schwierigkeit enthält getrennt Stellenzahl, Übergänge, Nullstellen und Größenordnung.

Jede Spalte enthält `place`, `top`, `bottom`, `incoming`, `local`, `expected`, `outgoing`, `helperRequired`, `helperPlace`, `zeroTransition`. Ergebnis- und Hilfseingaben werden in getrennten Objekten nach absolutem Stellenindex gespeichert. `null` beziehungsweise ein fehlender Eintrag bedeutet leer; eine eingetragene 0 ist nicht leer.

Das CSS-Grid hat eine eigene Operatorspalte und exakt dieselben Stellenspalten für Beschriftung, beide Operanden, Hilfszeile und Ergebnis. Zahlen werden niemals mit Leerzeichen ausgerichtet. Jede Rasterzelle besitzt `data-place` und `data-row`.

## Addition

Für jede Stelle p: `s = top + bottom + incoming`; Ergebnisziffer `s mod 10`; ausgehender Übertrag `floor(s/10)`.

Liegt links noch eine Operandenspalte, muss der ausgehende Übertrag als Hilfs-1 bei p+1 eingetragen werden. Über der höchsten Operandenspalte wird die führende 1 direkt als weitere Ergebnisstelle eingetragen. Es gibt dort keine zusätzliche Hilfs-1. Der mathematische Eingang der neuen Ergebnisstelle bleibt im Modell 1.

`987 + 248`:

| Stelle | Rechnung | Ergebnis | Eintrag für danach |
| --- | --- | --- | --- |
| E | 7 + 8 = 15 | 5 | Hilfs-1 bei Z |
| Z | 8 + 4 + 1 = 13 | 3 | Hilfs-1 bei H |
| H | 9 + 2 + 1 = 12 | 2 | Ergebnis bei T selbst ergänzen |
| T | 0 + 0 + 1 = 1 | 1 | fertig |

## Subtraktion: Hilfs-1-Verfahren

`d = top - bottom - incoming`. Ist d negativ, wird oben 10 ergänzt: Ergebnisziffer `d+10`, ausgehende Hilfs-1 bei p+1. Sonst ist die Ergebnisziffer d und es entsteht keine Hilfs-1. Die obere Zahl wird weder ausgestrichen noch verändert. Die Hilfs-1 wird zur unteren Ziffer der nächsten Stelle gerechnet.

`731 − 265`: E: `11−5=6`, Hilfs-1 bei Z. Z: `13−(6+1)=6`, Hilfs-1 bei H. H: `7−(2+1)=4`. Ergebnis 466.

Auch wenn `bottom+incoming=10`, bleibt das Verfahren gültig: etwa `1000−999` mit `10−10=0` in den mittleren Stellen und einer weitergereichten Hilfs-1. Getestete Nullfälle: 500−278=222, 1002−487=515, 5002−2786=2216, 10000−4638=5362, 1000000−1=999999.

## Generierung, Stufen und Zahlenräume

| Stufe | Bedingung | Anfang → weitere Stellenbreiten |
| --- | --- | --- |
| 1 | Addition, exakt 0 Übergänge | 2 → 3 → 4 |
| 2 | Subtraktion, exakt 0 Übergänge | 2 → 3 → 4 |
| 3 | Addition, exakt 1 Übergang mit manueller Hilfs-1 | 2 → 3 → 4 |
| 4 | Subtraktion, exakt 1 Hilfs-1 | 2 → 3 → 4 |
| 5 | Addition, mindestens 2 Übergänge | 3 → 4 |
| 6 | Subtraktion, mindestens 2 Übergänge | 3 → 4 |
| 7 | beide Rechenarten, mindestens 2 Übergänge und ein Übergang an einer Nullziffer | 3 → 4 → 5 |
| 8 | adaptive Mischung der Familien 1–7 | 3 → 4 → 5 |
| 9 | gleiche Familien; Operanden und Ergebnis höchstens 100.000 | 4 → 5, einschließlich Grenzwert |
| 10 | gleiche Familien; Operanden und Ergebnis höchstens 1.000.000 | 5 → 6, einschließlich Grenzwert |

Nach jeweils acht vollständig fehlerfreien Aufgaben der ausgewählten Stufe wächst die Stellenbreite bis zum Stufenmaximum. Das ist unabhängig von der Übergangskomplexität. In den fortgeschrittenen Zahlenräumen wird ab der zweiten Breite auch der genaue Grenzwert als Operand oder Summe vorgeschlagen und nur bei passender Familienbedingung angenommen. Subtraktionen sind immer nichtnegativ.

Übergangsfreie Aufgaben werden ziffernweise konstruiert. Andere werden unter expliziten Bedingungen erzeugt und verworfen, wenn eine Bedingung nicht passt. Jede angenommene Aufgabe wird unabhängig spaltenweise nachgerechnet, einschließlich Eingängen, Ausgängen, Hilfsstellen und rekonstruiertem Ergebnis. Die letzten acht Aufgaben werden nicht unmittelbar wiederholt.

## Lernen und Auswahl

Pro Stelle werden Fertigkeiten beobachtet: Addition/Subtraktion, übergangsfreie Verfahren, Übertrag/Hilfs-1, vorhandene Hilfs-1, mehrere Übergänge, Nullübergänge, Stellenwert und Stellenbreite. Zusätzlich werden Rechenkombinationen `operation:top:bottom:incoming` gespeichert. Die unveränderliche erste Gesamtabgabe bildet die Lernbeobachtung; sie wird beim erfolgreichen Abschluss verbucht. Änderungen vor dem ersten Prüfen sind eigenständige Selbstkorrekturen und keine Fehler. Korrekturen nach Feedback überschreiben den ersten Versuch nicht. Die App schreibt keine Hilfszahl automatisch.

Je Fertigkeit: Gesamtbeobachtungen, richtige Beobachtungen, letztes lokales Datum und letzte 24 Beobachtungen. Unter 12 Beobachtungen: „Noch nicht ausreichend geübt.“ Danach unter 90 % jüngster Genauigkeit: „Noch unsicher“. Bei mindestens 90 %: „Sicher“, beziehungsweise „Richtig, aber noch langsam“ bei einer mittleren Stellenzeit über 18 Sekunden und mindestens zwölf brauchbaren Zeitmessungen. „Automatisiert“ erfordert mindestens 36 Beobachtungen, mindestens 96 % jüngste Genauigkeit sowie mindestens zwölf Zeitmessungen mit durchschnittlich höchstens zehn Sekunden. Unterbrochene Rechnungen liefern keine Geschwindigkeitsevidenz.

Die Auswahl gewichtet schwache Fertigkeiten, jüngste Fehler, längere Abstände und den Schwerpunkt aus Runde A. Jede zugelassene Familie behält ein positives Grundgewicht. Nach zwei Aufgaben derselben Familie wird eine andere gewählt, wenn die Stufe mehrere Familien zulässt. Runde B verwendet die tatsächlich beobachteten Fehler und langsamen, richtigen Schritte aus A. Bei Stufen mit nur einer Familie bleibt sie innerhalb dieses bereits bekannten Verfahrens und erzeugt neue Zahlen. Fehlerprioritäten stehen in `ERROR_PRIORITY`. Sicheres Können wird durch Abstandsgewichtung wieder aufgegriffen.

Zeit bis zur ersten Aktion, gesamte aktive Rechenzeit und Stellenzeit werden gespeichert. Die Anpassung verwendet Zeit je Stelle, niemals nur die gesamte Aufgabenzeit. Rechenrichtigkeit hat Vorrang vor Tempo.

## Fehlerdiagnose

Implementiert: `BASIC_ADDITION_ERROR`, `BASIC_SUBTRACTION_ERROR`, `PLACE_VALUE_ERROR`, `CARRY_NOT_RECOGNIZED`, `CARRY_MISSING`, `CARRY_WRONG_COLUMN`, `UNNECESSARY_CARRY`, `PREVIOUS_CARRY_NOT_USED`, `SUBTRACTION_HELPER_NOT_RECOGNIZED`, `SUBTRACTION_HELPER_MISSING`, `SUBTRACTION_HELPER_WRONG_COLUMN`, `SUBTRACTION_HELPER_NOT_USED`, `ZERO_TRANSITION_ERROR`, `FINAL_COLUMN_ERROR`.

„Nicht erkannt“ ist eine vorsichtige Diagnose, wenn Ergebnis und erforderliche Hilfszahl zugleich falsch sind. „Nicht benutzt“ erkennt die Ergebnisziffer, die ohne vorhandene Hilfs-1 entstehen würde. Ein Fehlertyp zählt im längerfristigen Fehlerprotokoll höchstens einmal je Rechnung. Die Elternansicht nennt ein Muster erst nach mindestens drei Rechnungen mit diesem Fehlertyp unter den letzten 60 Fehlereinträgen. Sie zeigt keine technischen Rohcodes.

## Training: 3 + 2 Minuten

Zustände: `a → between → b → done`. Es gibt keinen dritten Phasenübergang. Zeiten: 180.000 bzw. 120.000 ms aktive Trainingszeit. Ohne sichtbaren Countdown. Beim Zeitablauf darf das Kind alle Eingaben abschließen, selbst prüfen und bis zur vollständigen Auflösung korrigieren. Erst danach endet die Phase. Die Berichte und eine bewusste Starttaste trennen die Phasen. Pause, Hintergrund und Berichte zählen nicht mit. Nach Abschluss kann später bewusst ein neues Training gestartet werden. Die Anzeige einer bereits vollständig richtigen Rechnung zählt nicht weiter zur Trainingszeit.

Runden werden nur verglichen, wenn mindestens zwei Aufgaben je Runde mit überlappender Rechenfamilie und Stellenbreite vorliegen. Angezeigt werden die normierten Wertungen, keine unbelegte Fortschrittsbehauptung.

## Exakte Erfolgswertung

Seien T die vollständig beim ersten Versuch richtigen Rechnungen / alle Rechnungen, D die beim ersten Versuch richtigen Ergebnisstellen / alle Ergebnisstellen, H die fehlerfreien erforderlichen Hilfszahlen / alle erforderlichen Hilfszahlen.

Mit erforderlichen Hilfszahlen: `score = 0,4T + 0,4D + 0,2H`.

Ohne erforderliche Hilfszahlen: `score = 0,5T + 0,5D`.

Fehlende, falsche oder falsch platzierte Hilfszahlen bleiben Fehler, auch wenn sie später korrigiert werden. Ein Erfolg verlangt score ≥ 0,90, alle Schritte abschließend korrekt, in A mindestens drei Rechnungen und acht Ergebnisstellen, in B mindestens zwei Rechnungen und sechs Ergebnisstellen. Ein einzelner kleiner Rechenschritt erzeugt keinen Erfolg. Die Anzeige heißt „Trainingswertung“, da sie kein einfacher Prozentsatz ganzer Aufgaben ist.

Jede Phase hat eine persistierte ID `sessionId:phase`. `awarded` verhindert Doppelzählung, auch nach Neuladen. Beide Phasen können unabhängig je einen Erfolg erzeugen. Der Erfolgszähler bleibt bis zu einem bewusst bestätigten Reset erhalten. Erfolg und Fertigkeitsbeherrschung sind getrennte Modelle.

## Alle Stufen frei verfügbar

Alle Stufen 1–10 sind beim ersten Start, nach einem Reset und nach dem Laden alter Lernstände sofort wählbar. Frühere `unlockedLevels`-Werte werden auf 1–10 normalisiert, ohne Lernbeobachtungen, Erfolge, Tagesfolgen oder Historie zurückzusetzen. Sie kontrollieren keinen Zugang mehr. Es gibt keine Schlossdarstellung und keine Freischaltungsereignisse. Die Elternansicht zeigt stattdessen bereits geübte Stufen.

Auch ein laufendes Training verhindert die bewusste Wahl einer anderen Stufe nicht: seine Sitzung wird in `pausedSessions` zwischengespeichert. Beim Zurückwechseln kann die bestehende Rechnung weitergeführt werden. Jede Sitzung behält ihren eigenen 3+2-Minuten-Ablauf.

## Erster Prüfversuch und Korrekturen

Aktuelle Rechnungen verwenden `inputVersion: 2`. `firstSubmission` bewahrt Ergebnis- und Hilfseingaben, numerische Korrektheit, Pfadkorrektheit, betroffene Felder, Fehlerkategorien, Eingabezeit und Stellenzeiten der ersten Abgabe. `validation` hält die letzte Prüfung; beim Editieren wird nur diese Rückmeldung entfernt. `resolved` zeigt den Abschlussstatus.

`submissions` zählt Prüfungen; `corrections` ist die Zahl erneuter Prüfungen nach dem ersten Versuch; `correctionEdits` zählt Feldänderungen nach der ersten Prüfung. Abgeschlossene Historieneinträge enthalten außerdem `firstSubmissionCorrect`, `finalCorrect`, `finalSubmission` und `independent`. Die 90-%-Wertung verwendet ausschließlich die erste selbstständige Abgabe und die bestehenden 40/40/20- bzw. 50/50-Gewichte. Korrekturen erzeugen keinen zusätzlichen Punktabzug und zählen als erfolgreich abgeschlossene Rechnung, verwandeln aber einen zunächst falschen Versuch nicht nachträglich in einen unabhängigen Erfolg.

Bei bereits begonnenen alten Rechnungen bleiben alle Einträge erhalten. Wurde dort schon stellenweise Feedback gegeben, ist diese eine übernommene Rechnung als `legacyAssisted` markiert und wird vorsichtig nicht als neue unabhängige Leistung gewertet. Ab der nächsten Rechnung gilt das neue Modell vollständig. Alte abgeschlossene Historieneinträge werden nicht umgedeutet.

## Lerntage, Tagesfolgen und Fortschritt

Ein Lerntag enthält mindestens eine abgeschlossene Rechnung. Die Erfolgsfolge zählt lokale Kalendertage mit mindestens einem qualifizierenden Erfolg. Zwei Erfolge am gleichen Datum erhöhen den Erfolgszähler zweimal, die Tagesfolge nur einmal. Nach einem ausgelassenen Tag wird die aktuelle Folge 0 angezeigt; beim nächsten Erfolg beginnt sie bei 1. Die längste Folge bleibt erhalten. Keine negative Bewertung einer Unterbrechung.

Die Elternansicht zeigt Lerntage, Erfolge, aktuelle und längste Folge, geübte Stufen, Fertigkeiten einschließlich Hilfs-1/Überträgen/Nullen/großen Zahlen, wiederkehrende Fehlermuster und die letzten 20 Erfolgskarten. Alle Karten bleiben gespeichert. Reset steht nur im Einstellungsbereich und benötigt eine zweite ausdrückliche Bestätigung.

## Karten

Lokales Canvas, 1080×1080 PNG. Datum, Erfolgsnummer, Tagesfolge, normierte Trainingswertung, Trainingsart und „Stark geübt!“. Kein Name. Bei unterstützter Datei-Freigabe öffnet ein bewusster Klick den System-Teildialog; sonst wird die PNG heruntergeladen. Die App überträgt selbst nichts an einen Server.

## Speicherung und Datenschutz

Schlüssel `addisub-learning-v1`, `schemaVersion: 1`.

Gespeichert: `revision`, `skills`, `facts`, `history` (max. 400), `errors` (max. 300), `daily`, `pausedSessions`, `session` samt aktueller Aufgabe/Eingaben/Zeit/Evidenz, `unlockedLevels`, `levelProgress`, `successNumber`, `currentStreak`, `longestStreak`, `lastQualifyingSuccessDate`, `learningDays`, `awarded`, `cards`, `selectedLevel`.

Jede Eingabe, jeder Phasenwechsel und etwa alle zwei aktiven Sekunden werden gespeichert. Das Speichern ist ein einzelner localStorage-Schreibvorgang. Unbekannte Versionen oder beschädigte Daten werden nicht stillschweigend überschrieben. Bei Speicherfehlern oder Änderungen aus einem anderen Fenster stoppt das Training mit einem Hinweis. Ein Export als JSON ist im Elternbereich möglich; ein Import ist derzeit nicht Teil der App. Für eine spätere Schemaversion muss eine ausdrückliche Migration ergänzt werden.

Kein Name, Konto oder Cloudprofil. Browserdaten löschen oder Geräteverlust kann den Lernstand entfernen. Export daher bei Bedarf sichern. Der Service Worker speichert nur Programmdateien; Lernprofile werden nicht in dessen Cache kopiert.

## Offline und Updates

Relative Pfade, lokales Manifest, Version `addisub-v1.1.1`. Installation lädt die komplette Laufzeitdateiliste atomar in den Cache. Danach werden dieselben Dateien offline ausgeliefert. Beim Aktivieren einer neuen Version werden nur alte AddiSub-Caches gelöscht. Kein erzwungenes `skipWaiting`: ein Update übernimmt nach Schließen der alten App-Fenster, damit eine laufende Rechnung nicht durch einen Versionswechsel gestört wird. Bei Programmänderungen die Cacheversion erhöhen und die Dateiliste aktualisieren. Erst nach einmaligem vollständigem Online-Laden ist Offlinebetrieb vorgesehen.

## Tests

```sh
npm test
```

Die Tests benötigen keine Installation von Paketen. Details und offene Geräteprüfungen stehen in `TEST-REPORT.md`. Die DOM-Integration benutzt eine minimale Testumgebung; sie ist kein Ersatz für eine Browser-Layoutprüfung.

## GitHub Pages: genaue Schritte

Die App ist für `https://eleonore-codes.github.io/AddiSub/` vorbereitet. Diese Adresse wurde in dieser Arbeitsrunde nicht veröffentlicht oder als erreichbar bestätigt.

1. Bei GitHub als `eleonore-codes` das Repository **AddiSub** erstellen.
2. Den Inhalt dieses Ordners in die Wurzel des Repositorys übernehmen. Insbesondere müssen `index.html`, die JS-Dateien, das Manifest und die Icons direkt in der Wurzel liegen.
3. Änderungen auf den Branch `main` übertragen. Es gibt keinen Buildschritt und keine Paketinstallation für die veröffentlichte App.
4. Im Repository **Settings → Pages** öffnen. Bei **Build and deployment** die Quelle **Deploy from a branch** wählen.
5. Branch **main**, Ordner **/(root)** auswählen und speichern.
6. Den erfolgreichen Pages-Lauf abwarten. Die angezeigte URL öffnen und zuerst online testen.
7. Im Browser prüfen: `987+248`, `731−265`, Nullfälle, beide Phasen und Speichern/Neuladen. Dann nach vollständiger Installation die Verbindung abschalten und erneut öffnen.
8. Auf iPhone 13 in Safari im Hochformat prüfen; bei Bedarf über das Teilen-Menü zum Home-Bildschirm hinzufügen.

`.nojekyll` verhindert unnötige Jekyll-Verarbeitung. Weder ein GitHub-Zugang noch Zugangsdaten werden von der App benötigt.

## Noch offene Abnahme

52 automatisierte Tests bestehen. Zusätzlich wurde die App im echten integrierten Browser bei 390×844 geprüft: verzögerte Rückmeldung, freie Korrekturen, sieben exakt ausgerichtete Spalten mit je 48 px Breite, kein horizontaler Überlauf, sichtbarer Prüfknopf und alle Stufen frei. Ein realer Service-Worker-Test mit abgeschaltetem Testserver bestätigte Neuladen, Wiederherstellung der Eingaben, Gesamtprüfung, Phasenwechsel und freie Stufenwahl offline. Offen bleiben ein physisches iPhone mit Safari, dessen Home-Bildschirm-Installation und nativer Teildialog sowie der veröffentlichte GitHub-Pages-Endpunkt. Details: `TEST-REPORT.md`.

## Aktualisierung vom 21.09.2026

Der GitHub-Stand enthielt noch Version 1.0. Der geprüfte Stand mit offenen Stufen wird nun auch in das bestehende Repository übernommen. `aktualisieren.html` lädt den neuen Service Worker und aktiviert ihn bewusst, ohne localStorage oder Lernstände zu löschen. Auf der Startseite steht zur Kontrolle Version 1.1.1.
