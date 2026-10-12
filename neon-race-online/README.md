# Race tegen de klok

## Nieuw in deze versie
- Nachtelijke neon-look met roze/cyaan licht, gloeiende baanranden, futuristische gebouwen en neonauto's.
- Ronde-indicator voor een race van 3 rondes.
- Na een overwinning wordt het moeilijkheidsniveau hoger: de auto kan sneller gaan en de besturing wordt uitdagender.
- Geen levens, geen hartjes en geen levens-systeem.
- Multiplayer-prototype blijft inbegrepen: spelers op dezelfde server zien elkaars auto's.

## Lokaal starten
1. Installeer Node.js via https://nodejs.org/
2. Pak de ZIP uit.
3. Open een terminal in de map `neon-race-online`.
4. Voer `npm install` uit.
5. Voer `npm start` uit.
6. Open http://localhost:3000

## Online publiceren
Deze game heeft een Node.js-server nodig voor Socket.IO multiplayer. Je kunt de map in GitHub zetten en als Web Service publiceren bij bijvoorbeeld Render. De paginatitel, Nederlandstalige beschrijving en basisgegevens voor zoekmachines zijn alvast ingesteld. Dat garandeert niet dat Google de site meteen toont; de game moet eerst publiek online staan en geïndexeerd worden.
- Build Command: `npm install`
- Start Command: `npm start`

Controleer de actuele hostingvoorwaarden. Gratis diensten kunnen in slaapstand gaan.

## Prototype-opmerkingen
- Dit is een eerste versie, nog geen afgewerkte racegame.
- De moeilijkheidsgraad wordt in deze browser onthouden met `sessionStorage` voor de sessie; een echte account-/serveroplossing kan later worden toegevoegd.
- Multiplayer toont andere spelers, maar heeft nog geen lobby, bots, betrouwbare gedeelde race-uitslagen of anti-cheat.
- De rondeteller is eenvoudig en moet verder getest en verfijnd worden.
