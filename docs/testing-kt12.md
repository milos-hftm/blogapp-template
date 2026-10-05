# Kurstag 12: Testing

## Akzeptanzkriterien: Blog-Liste

1. Wenn die Seite geladen wird, werden Blog-Eintraege angezeigt.
2. Jeder Blog-Eintrag zeigt einen Titel und eine Zusammenfassung.
3. Die Anzahl der Blog-Posts wird passend zur geladenen Liste angezeigt.

## Review des E2E-Tests

- Die API-Antwort wird im Test gemockt, damit der Test nicht vom lokalen BFF abhaengt.
- Die Assertions verwenden sichtbaren Text und die vorhandene `app-blog-card` Struktur.
- Der Test prueft Toolbar, Anzahl der Eintraege, Titel und Zusammenfassung.

## Unit Tests

- `BlogStateService` prueft Startzustand, Loading-State und `blogCount`.
- `BlogCard` prueft Erstellung, Titelanzeige und Like-Event.
