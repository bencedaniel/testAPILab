/**
 * API Data Seeder Script
 * Futtatás: node seed_api.js
 * 
 * Ez a script a REST API végpontokat meghívva tölti fel az alkalmazást tesztadatokkal.
 */

const API_BASE_URL = 'http://localhost:3000';

// Segédfüggvény a HTTP hívásokhoz
async function apiCall(method, endpoint, body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
        let data = {};
        try {
            data = await res.json();
        } catch (e) {
            // Ha nem JSON a válasz
            data = { text: await res.text() };
        }
        return { status: res.status, data };
    } catch (error) {
        console.error(`❌ Hálózati hiba a ${endpoint} hívásakor:`, error.message);
        return { status: 500, data: { error: error.message } };
    }
}

async function runSeed() {
    console.log('🚀 API Data Seeder elindítva...\n');

    // --- 1. FELHASZNÁLÓK REGISZTRÁLÁSA ---
    console.log('👤 Felhasználók regisztrálása...');
    const users = [
        { username: 'admin_user', email: 'admin@lab.local', password: 'Password123!' },
        { username: 'tester_user', email: 'tester@lab.local', password: 'Password123!' },
        { username: 'victim_user', email: 'victim@lab.local', password: 'Password123!' }
    ];

    

    // --- 2. BEJELENTKEZÉS ÉS TOKEN MEGSZERZÉSE ---
    console.log('\n🔑 Bejelentkezés az admin fiókkal...');
    const loginRes = await apiCall('POST', '/api/auth/login', {
        email: users[0].email,
        password: users[0].password
    });

    if (loginRes.status !== 200) {
        console.error('❌ Sikertelen bejelentkezés! Kilépés.', loginRes.data);
        process.exit(1);
    }

    // Alkalmazkodunk ahhoz, ahogy az API visszaadja a tokent (token, accessToken, stb.)
    const token = loginRes.data.token || loginRes.data.accessToken || loginRes.data.jwt;
    if (!token) {
        console.error('❌ A bejelentkezés sikeres volt, de nem találtam JWT tokent a válaszban!');
        process.exit(1);
    }
    console.log('  ✅ Sikeres bejelentkezés, JWT token megszerezve!');


    // --- 3. ESZKÖZÖK LÉTREHOZÁSA (Egyenként, Secure CRUD) ---
    console.log('\n📱 Eszközök generálása (Egyenkénti hívások a /api/devices/secure végponton)...');
    const deviceTypes = ['Laptop', 'Smartphone', 'Tablet', 'Router'];
    
    for (let i = 1; i <= 10; i++) {
        const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const deviceData = {
            name: `Egyedi ${type} - ${i}`,
            type: type,
            serialNumber: `SN-SEC-${Date.now().toString().slice(-5)}-${i}`
        };

        const createRes = await apiCall('POST', '/api/devices/secure', deviceData, token);
        if (createRes.status === 201) {
            process.stdout.write('🟢 '); // Siker jele egy sorban
        } else {
            process.stdout.write('🔴 ');
        }
    }
    console.log('\n  ✅ 10 eszköz egyenkénti beküldése befejezve.');


    // --- 4. TÖMEGES ESZKÖZ IMPORT (Bulk Upload) ---
    console.log('\n📦 Tetemes mennyiségű eszköz tömeges importálása (/api/system/import)...');
    
    const bulkDevices = [];
    for (let i = 1; i <= 50; i++) {
        bulkDevices.push({
            name: `Tömeges Eszköz ${i} (Importált)`,
            serial: `BULK-${1000 + i}` // A swagger doc alapján itt "serial" van "serialNumber" helyett
        });
    }

    const importRes = await apiCall('POST', '/api/system/import', { devices: bulkDevices }, token);
    
    if (importRes.status === 200) {
        console.log(`  ✅ 50 eszköz sikeresen importálva! (HTTP 200)`);
    } else {
        console.error(`  ❌ Hiba az importálás során (HTTP ${importRes.status}):`, importRes.data);
    }

    console.log('\n🎉 API Seed sikeresen befejeződött!');
    console.log(`Most már tesztelheted az OWASP szkennert a ${API_BASE_URL} címen.`);
}

// Futás
runSeed();