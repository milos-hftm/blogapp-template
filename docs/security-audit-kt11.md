# Security-Audit Kurstag 11

## Code-Checks

- `[innerHTML]`: Keine Treffer im Angular-Quellcode.
- `bypassSecurityTrust`: Keine Treffer im Angular-Quellcode.
- Interpolation mit `{{ }}` wird fuer Blog-Titel, Autor und Inhalt verwendet. Angular escaped diese Werte automatisch.
- Redirects und Return-URLs: Die geschuetzte Route erzeugt lokale Return-URLs. Die Login-Seite akzeptiert nur lokale Pfade, bevor sie den Wert an den BFF weitergibt. Der BFF prueft Return-URLs ebenfalls mit `safeReturnUrl()`.

## Auth Guards

- `/add-blog` ist mit `canMatch: [authGuard]` und Rolle `user` geschuetzt.
- `/`, `/blog/:id` und `/about` bleiben oeffentlich.
- Nicht angemeldete User werden zur Login-Seite weitergeleitet.

## CSP

Konfiguriert in `public/staticwebapp.config.json`:

```text
Content-Security-Policy: default-src 'none'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'
```

## npm audit

Ausgefuehrt mit:

```bash
npm audit --audit-level=moderate
```

Ergebnis: 29 Findings, davon 1 kritisch, 18 hoch, 6 moderat und 4 niedrig. Die Findings liegen vor allem in Angular-/Build-Tooling- und Entwicklungsabhaengigkeiten. `npm audit fix --dry-run` zeigt, dass ein Fix viele transitive Build-Pakete aktualisieren wuerde; deshalb wurde die Aktualisierung nicht automatisch eingespielt.
