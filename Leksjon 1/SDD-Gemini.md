# SDD-spesifikasjoner (Spec-Driven Development)
## Prosjekt: Turistforeningen i Utopia (TiU) – «UT.ut»
**Emne:** APP2000 / INF200E – Applikasjonsutvikling for web (USN)

---

## 1. Oversikt og Formål
Prosjektet går ut på å utvikle en webapplikasjon for turinteresserte i det fiktive landet Utopia (med geografi og organisering lik Norge / DNT), samt en dedikert portal for annonsører.

Applikasjonen skal fungere som:
1. En informasjons- og planleggingsportal for turer, hytter og turmål.
2. En interaktiv kartplattform for søk og visualisering.
3. En sosial plattform for planlegging og påmelding til fellesturer (med støtte for fleksible startdatoer basert på vær/kapasitet).
4. En annonseportal for bedrifter (utstyr, overnatting, turmat).

---

## 2. Globale / Overordnede Krav (SPEC-000)

- **SPEC-000-01 [Obligatorisk USN Banner]:** Nettsiden skal i toppen ha et tydelig og synlig banner som informerer om at nettsiden er en studentoppgave ved USN.
- **SPEC-000-02 [Autentisering & Autorisasjon]:** Systemet skal skille mellom rollene:
  - `Anonym bruker` (lese turer, hytter, kart, søke).
  - `Registrert bruker / Medlem` (melde interesse, melde seg på fellesturer, diskutere/planlegge).
  - `Turleder / Arrangør` (opprette fellesturer, koordinere datoer).
  - `Hyttevert / Overnattingssted-representant` (melde inn kapasitet, motta varsler).
  - `Annonsør` (opprette kampanjer, laste opp annonser, se statistikk).
  - `Administrator` (full CRUD på turruter, hytter, turmål, brukere og annonser).

---

## 3. Modulspesifikasjoner (SDD Specs)

### SPEC-001: Utforsker & Kartmodul (Map & Explorer)
* **Beskrivelse:** Interaktivt kart og listevisning for søk og filtrering av turer, hytter og turmål (inspirert av UT.no).
* **Funksjonelle Spesifikasjoner:**
  - **SPEC-001-01 (Kartvisning):** Kartet skal vise geografiske punkter for hytter/turmål og GPX/GeoJSON-ruter for turstier.
  - **SPEC-001-02 (Turrute-filtrering):** Bruker skal kunne filtrere turruter på:
    - *Type:* Fottur, skitur, sykkeltur.
    - *Vanskelighetsgrad:* Enkel (grønn), Middels (blå), Krevende (rød), Ekspert (svart).
    - *Varighet:* Antall timer eller dager (f.eks. dagstur vs. hytte-til-hytte).
    - *Lengde / Stigning:* Kilometer og høydemeter.
  - **SPEC-001-03 (Hytte-filtrering):** Bruker skal kunne filtrere overnattingssteder på:
    - *Type:* Betjent, selvbetjent, ubetjent, nødbu.
    - *Prisnivå:* Priskategori/intervall.
    - *Fasiliteter:* Strøm, innlagt vann, hund tillatt, badstue, servering, etc.
  - **SPEC-001-04 (Detaljvisning):** Klikk på objekt i kart/liste skal åpne en dedikert side med beskrivelse, bilder, kartspor, høydeprofil og tilknyttede hytter/turer.
* **Akseptansekriterier:**
  - Kartet oppdaterer synlige markører/ruter dynamisk i takt med aktive filtervalg og zoom-nivå.

---

### SPEC-002: Fellesturer & Sosial Plattform (Group Hikes & Social)
* **Beskrivelse:** Administrasjon, påmelding og planlegging av fellesturer med både faste og fleksible datoer (aktivitetskalender).
* **Funksjonelle Spesifikasjoner:**
  - **SPEC-002-01 (Aktivitetskalender):** Liste og kalendervisning av kommende fellesturer med filter for tidsrom (f.eks. "Uke 30"), område og ledige plasser.
  - **SPEC-002-02 (Kartintegrasjon for fellesturer):**
    - Visuell differensiering i kartet mellom turer med fast vs. fleksibel startdato.
    - Visuell differensiering mellom turer med ledige plasser vs. fullbookede turer.
  - **SPEC-002-03 (Fellesturer med Fast Dato):**
    - Påmelding med maksantall deltakere og venteliste.
    - Turleder kan sende beskjeder til påmeldte.
  - **SPEC-002-04 (Fellesturer med Fleksibel Dato & Vær-tilpasning):**
    - Turleder kan opprette en tur med et datovindu/tidsintervall (f.eks. helg i uke 32 eller 33).
    - Brukere kan registrere uforpliktende interesse for spesifikke datoer/intervaller.
    - Overnattingssteder langs ruten kan melde inn tilgjengelighet/kapasitet i samme tidsrom.
    - Turleder kan fastsette endelig startdato når værmelding/kapasitet tilsier det, og interesserte varsles for bindende påmelding.
  - **SPEC-002-05 (Varslinger til Overnattingssteder):**
    - Automatiske varsler til tilknyttede hytter når en ny fellestur planlegges innom deres lokasjon.
* **Akseptansekriterier:**
  - Brukere kan indikere interesse for fleksible datoer og se oppdaterte statusendringer når turen låses til en dato.

---

### SPEC-003: Administrasjon & Databehandling (Admin Portal)
* **Beskrivelse:** Internt grensesnitt for opprettelse og vedlikehold av baseressurser for TiU.
* **Funksjonelle Spesifikasjoner:**
  - **SPEC-003-01 (CRUD Hytter):** Admin kan registrere og redigere hytter (posisjon, navn, type, fasiliteter, sengekapasitet, bilder, sesong).
  - **SPEC-003-02 (CRUD Turruter):** Admin kan legge inn ruter manuelt eller via GPX/GeoJSON-opplasting, koble ruten til hytter/turmål, angi vanskelighetsgrad og legge inn etappebeskrivelser.
  - **SPEC-003-03 (CRUD Turmål):** Registrere topper, utsiktspunkter, severdigheter med GPS-koordinater.
  - **SPEC-003-04 (Bruker- og Rolleadministrasjon):** Tildele roller som Turleder, Hyttevert og Admin.
* **Akseptansekriterier:**
  - Kun autoriserte brukere har tilgang til `/admin`. Alle dataoppdateringer reflekteres umiddelbart i brukergrensesnittet og kartet.

---

### SPEC-004: Annonsørportal (Advertiser Portal)
* **Beskrivelse:** Selvbetjent portal for annonsører som ønsker å vise relevante produkter/tjenester (fjellsportutstyr, overnatting, turmat).
* **Funksjonelle Spesifikasjoner:**
  - **SPEC-004-01 (Annonsørkonto & Registrering):** Bedrifter kan registrere seg og administrere sin profil.
  - **SPEC-004-02 (Kampanje- og Annonsehåndtering):**
    - Opprette annonser med bilde/banner, overskrift, lenke og målkategori (f.eks. "Fjellsport", "Mat", "Spesifikk region/tur").
    - Definere visningsperiode og budsjett/avtaleform.
  - **SPEC-004-03 (Kontekstuell Annonsevisning på UT.ut):**
    - Relevante annonser vises integrert på tursider, hytteprofiler eller i søkeresultater basert på tags/kategori.
  - **SPEC-004-04 (Statistikk & Innsikt):**
    - Annonsøren kan se visninger (impressions), klikk (CTR) og aktive perioder.
* **Akseptansekriterier:**
  - Annonser lastes raskt uten å blokkere kart/kjerneinnhold, og klikk/visninger spores nøyaktig.

---

## 4. Ikke-funksjonelle Spesifikasjoner (NFRs)

- **NFR-001 (Ytelse & Skalerbarhet):**
  - Kartvisning med markører og ruter må laste responsivt (clustering av markører ved behov).
  - API-responstider for søk/filtrering bør være < 300 ms.
- **NFR-002 (Responsivitet & Tilgjengelighet - WCAG):**
  - Grensesnittet skal være fullt responsivt og fungere optimalt på mobil, nettbrett og desktop.
  - Skal følge standarder for universell utforming (WCAG 2.1 AA) for fargekontraster og navigasjon.
- **NFR-003 (Sikkerhet & Databeskyttelse):**
  - Sikker passordhåndtering (hashing med bcrypt/argon2).
  - Beskyttelse mot XSS, CSRF og SQL-injeksjon.
  - Skille mellom private brukerdata og offentlige profilvisninger.
- **NFR-004 (Arkitektur & Kodekvalitet):**
  - Flerlagsarkitektur (Frontend, Backend API/Controllers, Databaselag).
  - Dokumenterte endepunkter (f.eks. Swagger/OpenAPI) og modulær kodestruktur.

---

## 5. Foreslått Fremdriftsplan (Iterasjoner iht. oppgavens krav)

| Fase | Milepæl | Nøkkelleveranser |
|---|---|---|
| **Iterasjon 1** | **Prototype 1** | USN-banner, Database-skjema, Enkel CRUD for hytter/turer (Admin), Kartvisning med grunnleggende filtrering. |
| **Iterasjon 2** | **Prototype 2** | Fullverdig kartmodul, Fellesturer (faste og fleksible datoer), Interesse- og kapasitetsmelding, Varslingsfunksjonalitet. |
| **Iterasjon 3** | **Ferdig Løsning (Mai 2026)** | Annonsørportal med statistikk, kontekstuell annonsering, forbedret UX/mobilvisning, testing og dokumentasjon. |