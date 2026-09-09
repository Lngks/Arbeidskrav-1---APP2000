1) SDD-001 — Brukerregistrering og -autentisering [MVP]
- Formål: Tillate registrering, pålogging og basisprofiladministrasjon.
- Forutsetning: Ingen.
- Input: e-post, passord, navn (valgfritt).
- Output: brukerobjekt med id, epost, rolle, profilfelt; JWT-tilgangstoken.
- Atferd:
  - POST /api/auth/register oppretter bruker og sender bekreftelses-e-post (kan stubbes).
  - POST /api/auth/login returnerer JWT ved gyldig epost/passord.
  - GET /api/users/me returnerer profil for autentisert bruker.
- Sikkerhet: passord hashed med bcrypt/scrypt; JWT med utløpstid (f.eks. 1h) og refresh-token.
- Akseptansekriterier / tester:
  - Registrering med ny epost → 201 Created og bruker opprettet i DB.
  - Login med riktig passord → 200 OK + token; feil passord → 401.
  - Etter registrering kan bruker oppdatere eget profilfelt via PUT /api/users/me.
- Datamodell (min): User { id, email, password_hash, display_name, roles[], created_at }

2) SDD-002 — Roller og autorisasjon [MVP]
- Formål: Skille mellom vanlige brukere, turleder, hytteeier, admin, annonsør.
- Forutsetning: SDD-001.
- Atferd:
  - Rolle-attributt tildeles av admin eller gjennom egen annonsør-/hytte-eier registrering.
  - Autorisasjon i endepunkter (f.eks. kun turledere kan opprette arrangerte turer).
- Akseptanse:
  - Forsøk på administrativ handling uten rolle → 403 Forbidden.
  - Bruker med rolle 'hyttowner' kan redigere egen hytte-profil, men ikke andres.

3) SDD-003 — Opprette / redigere turrute (tegning og GPX-opplasting) [MVP]
- Formål: Registrere rute/sti manuelt og via GPX.
- Input: rute-objekt med geojson/polyline eller GPX-fil; metadata (navn, type: fottur/sykkel/skitur, varighet, vanskelighetsgrad).
- Output: rute-lagre med geometri, distanse, totalstigning, estimerte varighet.
- Atferd:
  - POST /api/routes med geojson eller GPX opplastet → parser geometri + kalkulerer distanse og høydedata (hvis høydedata tilført).
  - Støtte for å tegne rute i klient (client-side) og sende geojson til server.
- Akseptanse:
  - Last opp en gyldig GPX → route saved med samme antall waypoints som filen.
  - Tegn 3+ punkter i kart → rute opprettes og distanse > 0.
- Datamodell (min): Route { id, name, geometry (GeoJSON), length_m, ascent_m, difficulty, created_by }

4) SDD-004 — Hytter / overnattingssteder (opprett, rediger, undersider) [MVP]
- Formål: Registrere hytter, vise detaljside per hytte.
- Input: navn, posisjon, type (betjent/ubetjent), fasiliteter, bilde, kontaktinfo, kapasitet, priser.
- Output: Hytte-objekt med id og lenke til underside.
- Atferd:
  - Hytteeier kan opprette/vedlikeholde egen hytte-side og bilder.
  - Admin kan godkjenne/endre hytter.
- Akseptanse:
  - Opprettelse synlig i søk og kart etter publisering.
  - Hytte-side viser kapasitet og fasiliteter korrekt.
- Datamodell (min): Hut { id, name, location, type, capacity, facilities[], owner_user_id }

5) SDD-005 — Kartvisning og filtrering [MVP]
- Formål: Interaktivt søkbart kart med filter for ruter, hytter og fellesturer.
- Forutsetning: SDD-003, SDD-004.
- Input (fra UI): bounding box eller sentrumskoordinat, filterparametre (type, vanskelighetsgrad, varighet, betjent/ubetjent, tilgjengelighet, startdato-interval).
- Output: sett med geometriobjekter (GeoJSON) og paginert metadata.
- Endepunkt: GET /api/map?bbox=...&type=route|hut|event&difficulty=...
- Akseptanse:
  - Velge filter "betjent" → kartet viser ingen ubemannede hytter.
  - Filtrer på "skitur" → kun skiruter returneres.
- UI-krav: zoom/pan, klikk på objekt åpner detaljvisning, mobilresponsivt.

6) SDD-006 — Søk (tekst + kart + facetter) [MVP]
- Formål: Søke på navn, kategori, tekst i beskrivelser og filtre.
- Input: q (tekst), facet filters, bbox/nearby.
- Output: rangert liste med resultater + count per facet.
- Endepunkt: GET /api/search?q=...&type=...
- Akseptanse:
  - Søk etter "Gjendesheim" returnerer hytteside som topprank.
  - Facetter teller samsvarende elementer (f.eks. 10 betjente hytter).

7) SDD-007 — Fellesturer: opprettelse, flere mulige startdatoer (fleksible datoer) [MVP]
- Formål: Støtte arrangerte turer med både faste og fleksible startdatoer.
- Input: tour metadata (title, route_id, start_dates[] eller start_interval), max_deltakere, price, lead_user_id.
- Atferd:
  - En tur kan ha én eller flere faste startdatoer eller et intervall (start_window).
  - Brukere kan "melde interesse" (ikke bindende) for et tidspunkt eller "binde seg" til en bestemt dato.
  - Når nok bindende påmeldinger for en gitt startdato oppnådd → dato låses → andre påmeldinger for samme tur fristilles (avmeldes eller merkes ikke-bindende).
- Endepunkter:
  - POST /api/tours
  - POST /api/tours/:id/register-interest { user_id, preferred_date? }
  - POST /api/tours/:id/commit { user_id, date }
- Akseptanse:
  - Opprett tur med start_interval → brukere kan melde interesse uten å binde seg.
  - Simuler 5 bindende påmeldinger (tilsvarende min deltakerkrav) → dato låses og system sender varsler til berørte brukere/hytter.
- Datamodell: Tour { id, route_id, start_dates[], start_interval{from,to}, capacity_per_date, status_per_date }

8) SDD-008 — Påmelding-regler og blokkering av overlappende bindende påmeldinger [MVP]
- Formål: Hindre overlapping bindende påmeldinger for samme person.
- Forutsetning: SDD-007.
- Atferd:
  - Ved bindende påmelding sjekkes brukerens eksisterende bindende påmeldinger for datointerval overlap.
  - Hvis overlap → 409 Conflict med forklaring.
- Akseptanse:
  - Bruker med bindende tur 1-3 aug kan ikke binde seg til annen tur som overlapper 2 aug.

9) SDD-009 — Varslinger og bekreftelser (epost / interne varsler) [MVP]
- Formål: Varsle hytteeiere og deltakere ved relevante hendelser (ny tur, dato låst, bekreftet reservasjon).
- Hendelser: ny tur opprettet, bindende dato låst, hytte bekrefter/trekker sengeplass, annonse godkjent.
- Akseptanse:
  - Opprett ny fellestur → hytteeier mottar varsel (kan være stub/mock).
  - Dato låses → alle bindende deltakere får bekreftelsesvarsel.

10) SDD-010 — Hytteeiers bekreftelse av reserverte sengeplasser [MVP]
- Formål: Hytteeier skal kunne bekrefte/avkrefte innrapporterte mulige plasser.
- Atferd:
  - Hytteeier mottar forespørsel om å bekrefte sengeplasser for en låst dato.
  - Når bekreftet settes bookingstatus til confirmed for de berørte deltakerne.
- Akseptanse:
  - Hytteeier bekrefter → bookingstatus=reserved/confirmed.

11) SDD-011 — Chat (direktemeldinger + gruppesamtaler per tur) [MVP-extended]
- Formål: Gi enkel chat for turdeltakere og private meldinger.
- Funksjonalitet:
  - 1:1-meldinger og gruppechat knyttet til Tour.id.
  - Laste opp bilder i chat (maks størrelse/format).
  - Mulighet for å godkjenne bilde-deling (samtykke).
- Endepunkter / protokoll:
  - WebSocket /api/ws/chat eller long-polling REST.
  - POST /api/tours/:id/message
- Akseptanse:
  - Bruker i turgruppe kan sende og se meldinger; bilde krever tillatelse før offentlig visning.

12) SDD-012 — Bildehåndtering og privatliv / samtykke [MVP]
- Formål: Håndtere opplasting, deling og samtykke for bilder fra tur.
- Atferd:
  - Bilder tilhører en medlemssamling; andre må gi eksplisitt samtykke for publisering i gruppe eller i offentlig hytte/tur-side.
- Akseptanse:
  - Last opp bilde i gruppe → sendes til 'pending approval' for deltakerne; uten samtykke vises kun for uploader.

13) SDD-013 — Favoritter, anmeldelser og rating [MVP]
- Formål: Brukere kan lagre favoritter og gi stjerner/tekst-anmeldelser.
- Endepunkter:
  - POST /api/users/:id/favorites {type: route|hut|tour, item_id}
  - POST /api/reviews { item_type, item_id, rating, text, user_id }
- Akseptanse:
  - Bruker kan gi 1-5 stjerner; gjennomsnittlig rating kalkuleres korrekt.

14) SDD-014 — Annonsøraportal (annonsørregistrering, annonser opprettelse, godkjenning, statistikk)
- Formål: Annonsører kan legge inn annonser; ansvarlig redaktør godkjenner.
- Forutsetning: Arena for admin/redaktør.
- Endepunkter:
  - POST /api/ads (annonsør)
  - GET /api/ads/pending (for redaktør)
  - POST /api/ads/:id/approve
  - GET /api/ads/:id/stats?from=...&to=...
- Krav: bilder, tekst, målgruppe (kategorier), tidsperiode, betaling per visning/klikk (må kunne simulere/aggregate).
- Akseptanse:
  - Annonsør oppretter annonse → status pending → redaktør godkjenner → annonse vises i UI.

15) SDD-015 — Betalingsmodell (grunnleggende) — prototyp
- Formål: Sette opp mock/stripe-simulering for betaling for annonser.
- Atferd:
  - Annonsør kan kjøpe annonse-kampanje (betalingsgateway stubbet i MVP).
- Akseptanse:
  - Betaling simuleres, og kampanje blir aktiv i tidsrommet.

16) SDD-016 — Værintegrasjon (Yr) [MVP]
- Formål: Hente værprognoser for en lokasjon for å hjelpe valg av startdato.
- Endepunkt/bruk:
  - GET /api/weather?lat=..&lon=..
  - Bruk Yr API; cache resultat 15–60 min.
- Akseptanse:
  - For en gitt koordinat returneres 3-døgns prognose; UI viser vind/temp/precip.

17) SDD-017 — Navigasjon / tracks live (mobil) [MVP-extended]
- Formål: Klient bruker GPS for å vise brukerens posisjon i forhold til planlagt rute.
- Atferd:
  - Mobile klienter henter rute-GeoJSON og sammenstiller med GPS-posisjon; distance-to-route beregnes klient-side.
  - UI skal ha "følg meg" og "vis rute" modus.
- Akseptanse:
  - På mobil følges posisjon og viser avstand til nærmeste punkt på ruten

18) SDD-018 — Internasjonalisering (i18n) [MVP]
- Formål: Appen skal være flerspråklig (minstekrav: norsk/engelsk).
- Implementasjon: bruk react-i18next i klient.
- Akseptanse:
  - Switch språk i UI → alle tekstknapper/labels endres; datafelt for hytte/turbeskrivelser kan ha språk-lokalisering.

19) SDD-019 — REST API: CRUD-kontrakter og paginering [MVP]
- Formål: Konsistent API-kontrakt for alle ressurser med paginering & filtering.
- Krav:
  - Alle list-endepunkter støtter ?page & ?per_page og sortering.
  - Feil format: JSON med { error, code, details }.
- Akseptanse:
  - Store oppramsinger (f.eks. 1000 ruter) returnerer paginerte svar og ikke overskrider response size-limiter.

20) SDD-020 — Data- og skjema-validering [MVP]
- Formål: Server validerer inndata (lengder, required felter, GPX-validitet).
- Akseptanse:
  - Feil GPX → 400 med feilmelding.
  - Manglende mandatory felt → 422 Unprocessable Entity.

21) SDD-021 — Konsekventer og reaksjon ved låsing av dato (transaksjonalitet) [MVP]
- Formål: Når en startdato låses må flere tilstander oppdateres atomisk (påmeldinger, hyttevarslinger, betaling/kvittering hvis relevant).
- Atferd:
  - Lås-dato operasjon må være atomisk; dersom hyttebekreftelse feiler → transaksjon rulles tilbake eller settes i ventestatus.
- Akseptanse:
  - Feilstilfelle ved midlertidig DB-feil → ingen deltaker får bekreftelse/booking.

22) SDD-022 — Sikkerhet og personvern [MVP]
- Krav:
  - TLS for all kommunikasjon.
  - Lagring av følsom data (passord) hashed.
  - GDPR: brukerkontoer kan be om dataeksport og sletting (DELETE /api/users/:id - etter verifisering).
- Akseptanse:
  - Passord lagres ikke i klartekst.
  - Dataeksport returnerer brukerens poster innen rimelig tid (simulert i dev).

23) SDD-023 — Ytelse og skalering (ikke-funksjonell)
- Mål:
  - Side/ API-response under 500ms for typiske forespørsler; kart-tiles og søk optimalisert via caching.
  - Map queries for bbox under 300ms for ≤1000 objekter.
- Teknikker:
  - DB-index på geometri, text-search index for søk, caching (Redis) for vær + annonse-statistikk.

24) SDD-024 — Testbarhet: end-to-end og enhetstester
- Krav:
  - Enhetstester på forretningslogikk (påmelding, låsing, overlap-check).
  - E2E-test (Cypress / Playwright) for user-registrering, opprette tur og melde interesse.
- Akseptanse:
  - E2E-skript kjører i CI og verifiserer 3 kritiske flows.

25) SDD-025 — Tilgjengelighet og responsivt design [MVP]
- Krav:
  - WCAG 2.1 AA-kompatibilitet for viktige sider (registrering, turdetaljer, påmelding).
  - Mobile-first design; kart-interaksjon godt tilpasset berøring.
- Akseptanse:
  - Manuell WCAG-sjekk eller automatisert verktøy finner ingen kritiske brudd i MVP-sider.

26) SDD-026 — Logging, overvåkning og feilrapporter
- Krav:
  - Sentralisert logging (strukturert JSON), feilmeldinger har korrelasjons-id.
  - Metrics for API-latenser og feilrater.
- Akseptanse:
  - Ved testfeil skal stacktrace være logget til dev-logg (ikke returnert i prod).

27) SDD-027 — Import / eksport data for hytteliste og ruter (administrasjon)
- Formål: Admin kan importere store datasett (CSV/GPX) for hytter/ruter.
- Akseptanse:
  - Last opp CSV med 100 rader → import fullført eller feilrapport for rader som feiler.

28) SDD-028 — Annonsestatistikk (visninger/klikk)
- Formål: Telle visninger og klikk per annonse; eksponer statistikk for annonsør.
- Akseptanse:
  - Når annonse vises i UI, inkrementeres visningsteller; klikk på annonse registrerer klikk.

29) SDD-029 — Dokumentasjon og API-spec
- Krav:
  - OpenAPI/Swagger for REST API med eksempler og felttyper.
  - README med kjøreinstruksjon, miljøvariabler og lokal utviklingsguide.
- Akseptanse:
  - Kjørbar swagger UI tilgjengelig i dev-miljø.

30) SDD-030 — Ekstra/valgfritt: eksport til ut.no-lignende format og samsvar
- Valgfritt for utvidelse: eksport/import i format som ut.no for datautveksling.

-------------------------
Sprint / Prioriteringsforslag (kort)
- Sprint 0 (setup): autentisering, DB, grunnleggende datamodeller, OpenAPI, i18n skeleton, CI.
- MVP sprint 1: Brukerregister + rute/hytte-CRUD + kartvisning enkleste filter.
- MVP sprint 2: Fellestur-påmelding (interesse + bindende) + grunnleggende varsler + værintegrasjon.
- MVP sprint 3: Chat (minimal), favoritter/anmeldelser, annonseportal (opprett/pending/approve).
- Etter MVP: betalingsintegrasjon, avansert caching/skala, full WCAG, bilder/samtykke-workflow.

-------------------------
Forslag til konkrete akseptansetester (eksempel, kan automatiseres)
- Test A (auth): Register -> confirm DB entry -> login -> fetch /users/me returns riktig email.
- Test B (GPX): Upload sample.gpx with 10 waypoints -> GET /api/routes/:id shows geometry with 10 points and length > 0.
- Test C (Fleksibel tur + låsing): Create tour with start_window; 10 users express interest; then 5 users commit → system låser dato når commit-count ≥ min_required; tileggsjekk: andre users markeres som fristilte.
- Test D (Overlap): User A bindes til tour 1 (dato 1-3 juli) → attempt to bind to tour 2 overlapping 2 juli → API returns 409.

-------------------------
Praktiske noter / anbefalinger
- Databasen bør støtte geometri (PostGIS) for rask spatial-søk og indekser. Alternativt dokument-store med geo-index (MongoDB) hvis enklere for teamet, men Postgres+PostGIS anbefales.
- Cache værkall (Yr) pga. rate-limits; bruk server-side caching (Redis).
- Use OpenLayers eller Leaflet i React; vurder react-leaflet for enklere integrasjon.
- Internationalisering: bruk react-i18next som krav sier.
- For chat vurder WebSocket-løsning (Socket.io eller native WS) for sanntid.