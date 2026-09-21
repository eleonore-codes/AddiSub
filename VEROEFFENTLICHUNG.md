# Stand am 21.09.2026

Die GitHub-Dateien auf `eleonore-codes/AddiSub`, Branch `main`, enthalten noch Version 1.0.0 mit gesperrten Stufen. Das wurde über die GitHub-Verbindung direkt anhand von `app.js`, `package.json` und `service-worker.js` bestätigt. Es ist daher nicht nur eine Vermutung über einen alten Browser-Cache.

Der lokale Stand 1.1.1 enthält alle zehn frei verfügbaren Stufen und die verzögerte Gesamtprüfung. Der Versuch, diesen Stand über die GitHub-Verbindung zu übertragen, wurde mit „Resource not accessible by integration“, HTTP 403, abgewiesen. Es wurde dadurch kein neuer Commit und keine Veröffentlichung erzeugt.

## Update bereitstellen

Den Inhalt des Ordners `AddiSub` aus dem aktuellen ZIP in die Wurzel des bestehenden Repositorys übernehmen und die vorhandenen gleichnamigen Dateien ersetzen. Den Unterordner `tests` als Unterordner beibehalten. Nicht einen zusätzlichen Ordner `AddiSub` innerhalb des Repositorys erstellen. Icons und Manifest sind enthalten. Die GitHub-Pages-Einstellung bleibt dieselbe.

Nach dem erfolgreichen Pages-Lauf `https://eleonore-codes.github.io/AddiSub/aktualisieren.html` öffnen. Diese neue Seite aktiviert den neuen Offline-Cache und öffnet die App. Sie löscht keine Lernstände. Zur Kontrolle steht auf der Startseite **Version 1.1.1 · Alle zehn Stufen verfügbar**.

Für eine direkte Veröffentlichung durch den Assistenten benötigt die GitHub-Verbindung Schreibzugriff auf dieses Repository. Bis dahin bleibt die öffentliche Webseite unverändert.
