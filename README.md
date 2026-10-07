# Vulnerable API Lab – Telepítési Útmutató és Végpont Dokumentáció

A kiberbiztonsági mérnöki kutatási projekt automatizált API teszteléséhez (OWASP API Security Top 10 - 2023) készített sebezhető REST API tesztlabor hivatalos dokumentációja.

## 1. Rendszerkövetelmények és Telepítés

Az alkalmazás futtatásához Node.js (ajánlott: v18+) és Docker környezet szükséges.

### Telepítési lépések

1. **Függőségek telepítése:**
   Nyiss egy terminált a projekt gyökérkönyvtárában, és futtasd a csomagkezelőt:
   ```bash
   npm install
   ```

2. **Környezeti változók konfigurálása:**
   Hozz létre egy `.env` fájlt a gyökérkönyvtárban az alábbi tartalommal:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/vulnerable_api_lab
   JWT_SECRET=supersecret_jwt_key_for_testing
   NODE_ENV=development
   ```

3. **Adatbázis indítása (Docker):**
   A MongoDB konténer háttérben történő elindításához futtasd:
   ```bash
   docker-compose up -d
   ```

4. **Az API Szerver indítása:**
   Fejlesztői módban (automatikus újraindulással) indítsd el a szervert:
   ```bash
   npm run dev
   ```

5. **Dokumentáció elérése:**
   Sikeres indulás után az OpenAPI (Swagger) grafikus felülete böngészőből elérhető a `http://localhost:3000/api-docs` címen, a nyers JSON specifikáció pedig a `http://localhost:3000/api-docs.json` útvonalon.

---

## 2. API Végpontok és OWASP Sebezhetőségi Térkép

Az API labor szándékosan tartalmazza az OWASP Top 10 (2023) összes kategóriáját, kiegészítve teljesen biztonságos referenciapontokkal a szkennerek fals pozitív arányának teszteléséhez.

### Autentikáció (Auth)

* **`POST /api/auth/register`**
  * **OWASP Kategória:** API3:2023 - Broken Object Property Level Authorization (BOPLA / Mass Assignment)
  * **Részletek:** A végpont nem szűri a bemeneti paramétereket, így a támadó injektálhatja a `"role": "admin"` mezőt a regisztrációs JSON-be, jogosulatlanul megemelve a saját privilégiumait.

* **`POST /api/auth/login`**
  * **OWASP Kategória:** API2:2023 - Broken Authentication
  * **Részletek:** Hiányzik a Rate Limiting és a fiókzárolási mechanizmus (Account Lockout), lehetővé téve a brute-force vagy credential stuffing támadásokat.

### Felhasználókezelés (Users)

* **`GET /api/users/{id}`**
  * **OWASP Kategória:** API1:2023 - Broken Object Level Authorization (BOLA / IDOR)
  * **Részletek:** A rendszer validálja a JWT tokent, de nem ellenőrzi, hogy az URL-ben megadott `{id}` megegyezik-e a tokenben lévő azonosítóval.

* **`GET /api/v1/users/list`**
  * **OWASP Kategória:** API9:2023 - Improper Inventory Management (Zombie API)
  * **Részletek:** Kint felejtett, korábbi verziójú végpont, amelyről hiányzik a hitelesítést kikényszerítő middleware, így publikusan szivárogtatja a felhasználói adatbázist.

* **`GET /api/users/me/secure`** | **`PUT /api/users/me/secure`** | **`DELETE /api/users/me/secure`**
  * **Státusz:** BIZTONSÁGOS (Referencia)
  * **Részletek:** Teljesen védett CRUD műveletek. Az azonosítás kizárólag a tokenből történik (BOLA védelem), a frissítésnél pedig szigorú mezőszűrés fut (BOPLA védelem).

### Eszköznyilvántartás (Devices) - Sebezhető Végpontok

* **`GET /api/devices`**
  * **OWASP Kategória:** API4:2023 - Unrestricted Resource Consumption
  * **Részletek:** A `limit` paraméterre nincs felső korlát beállítva. Extrém nagy szám beküldésével memóriatúlterhelés (DoS) idézhető elő az adatbázisban és a szerveren.

* **`DELETE /api/devices/admin/{id}`**
  * **OWASP Kategória:** API5:2023 - Broken Function Level Authorization (BFLA)
  * **Részletek:** A backend kódja nem ellenőrzi a felhasználó szerepkörét (`role === 'admin'`), így bármilyen bejelentkezett felhasználó végrehajthatja a törlést.

* **`POST /api/devices/{id}/reserve`**
  * **OWASP Kategória:** API6:2023 - Unrestricted Access to Sensitive Business Flows
  * **Részletek:** Nincs üzleti korlátozás (Business Logic Rate Limit) arra vonatkozóan, hogy egy felhasználó hány eszközt foglalhat le adott idő alatt, lehetővé téve a raktárkészlet kimerítését.

### Eszköznyilvántartás (Devices) - Biztonságos Végpontok

* **`POST /api/devices/secure`** | **`GET /api/devices/secure/{id}`** | **`PUT /api/devices/secure/{id}`** | **`DELETE /api/devices/secure/{id}`**
  * **Státusz:** BIZTONSÁGOS (Referencia)
  * **Részletek:** Helyesen implementált, védett útvonalak. A módosítási és törlési műveletek 403 Forbidden hibát adnak, ha nem adminisztrátori tokennel hívják meg őket (BFLA védelem). A létrehozás szigorú sémavalidációt használ.

### Rendszer és Integrációk (System, Webhooks, Warranty)

* **`POST /api/webhooks/register`**
  * **OWASP Kategória:** API7:2023 - Server Side Request Forgery (SSRF)
  * **Részletek:** A rendszer HTTP kérést indít a kliens által megadott `targetUrl`-re anélkül, hogy validálná a domaint vagy IP címet. Ezzel a belső hálózat (pl. localhost portok) feltérképezhető.

* **`POST /api/system/import`**
  * **OWASP Kategória:** API8:2023 - Security Misconfiguration
  * **Részletek:** Érvénytelen bemenet esetén a szerver nem kezeli le a hibát megfelelően, hanem a teljes belső Node.js stack trace-t visszaküldi az 500-as válaszban.

* **`GET /api/warranty/devices/{id}`**
  * **OWASP Kategória:** API10:2023 - Unsafe Consumption of APIs
  * **Részletek:** A backend meghív egy harmadik féltől származó szolgáltatást, és a kapott választ szanálás vagy validáció nélkül közvetlenül feldolgozza, utat nyitva az injekciós támadásoknak.