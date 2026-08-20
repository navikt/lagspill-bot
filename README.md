# Lagspill Bot 🤖
Basert på navikt/helsesjekk-bot

# Hva er det?

Dette er en Slack-bot som gjør det enklere å spille lagspill med teamet ditt, vi bruker den til timeguesser. Gjør det enkelt å starte et spill, motta påmeldinger gjennom slack, og dele inn i tilfeldige lag. Meld inn scores og se statistikk over tid.

## Jeg fant noe feil!

Ta kontakt på #helsesjekk-bot på NAV-IT slacken!

# Jeg vil utvikle på den!

### Avhengigheter

Noen av bottens avhengigheter er hostet her på Github. Github tillatter ikke anonyme pulls av pakker fra Github Package Registry.

For å kunne installere avhengighetene må du opprette en Personal Access Token (PAT), som beskrevet her:

-   https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic

Denne PAT-en skal _kun_ ha tilgangen `package:read`. Sett denne PAT-en som miljøvariabel på maskinen din.

`export NPM_AUTH_TOKEN=<tokenet du nettopp genererte>`

i enten `.bashrc` eller `.zshrc` (avhengig av ditt shell).

Du skal nå kunne kjøre `yarn` for å installere avhengighetene uten 401-feil.

### Utvikle selve botten:

1. Først så trenger du ditt helt eget slack workspace du har admin tilgang til.
2. Deretter kan du opprette en ny bot i Slack, bruk slack-manifest.yml i dette repoet til å kickstarte alle permissions du trenger.
3. Opprett en `.env`-fil på rot i repoet, og legg til følgende:
    ```env
    NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL="postgresql://postgres:postgres@localhost:5432/postgres"
    SLACK_SIGNING_SECRET=<secret>
    SLACK_BOT_TOKEN=<secret>
    SLACK_APP_TOKEN=<secret>
    ```
4. Start opp en lokal postgres-database:
    ```bash
    yarn dev:db
    ```
5. Kjør Drizzle-migreringene mot databasen:
    ```bash
    yarn drizzle:migrate
    ```
6. Endelig kan vi starte development-serveren:
    ```bash
    yarn dev
    ```
7. Gjør en curl request mot `/api/internal/is_ready` for å starte slack-integrasjonen.
    ```bash
    curl -X GET http://localhost:3000/api/internal/is_ready
    ```

Utviklingsflyten vil være å interaktere med slack botten gjennom ditt private slack workspace. F.eks. ved å legge botten til som en integrasjon på en testkanal, kjøre /lagspill i den kanalen.
