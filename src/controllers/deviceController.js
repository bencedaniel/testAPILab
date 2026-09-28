import Device from '../models/Device.js';

export const getAllDevices = async (req, res) => {
    try {
        // VULNERABLE: A rendszer elfogadja a limit paramétert, de nincs rajta felső korlát.
        // Ha a scanner beküld egy óriási számot, a Mongoose az összes rekordot 
        // betölti a RAM-ba, ami DoS (Denial of Service) állapotot okozhat.
        const limit = req.query.limit ? parseInt(req.query.limit) : 0; 
        
        // A Mongoose-ban a .limit(0) azt jelenti, hogy nincs korlát
        const devices = await Device.find().limit(limit);
        
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ error: 'Belső szerverhiba' });
    }
};
export const deleteDeviceVulnerable = async (req, res) => {
    try {
        const deviceId = req.params.id;
        
        // VULNERABLE: Bár ez elvileg egy adminisztrátori funkció (amit az URL is sugall),
        // a kód CSAK azt ellenőrzi (a router middleware-jében), hogy a felhasználó be van-e jelentkezve.
        // Súlyos hiba: Nincs ellenőrizve, hogy a req.user.role === 'admin' teljesül-e.
        const deletedDevice = await Device.findByIdAndDelete(deviceId);
        
        if (!deletedDevice) {
            return res.status(404).json({ error: 'Eszköz nem található.' });
        }
        
        res.status(200).json({ message: 'Eszköz sikeresen törölve.', device: deletedDevice });
    } catch (error) {
        res.status(500).json({ error: 'Belső szerverhiba' });
    }
};

export const reserveDeviceVulnerable = async (req, res) => {
    try {
        const deviceId = req.params.id;
        
        // Ellenőrizzük, hogy az eszköz létezik-e és szabad-e
        const device = await Device.findOne({ _id: deviceId, status: 'active' });
        
        if (!device) {
            return res.status(400).json({ error: 'Az eszköz jelenleg nem elérhető foglalásra.' });
        }

        // VULNERABLE: A rendszer nem ellenőrzi, hogy a req.user.id hányszor hívta meg
        // ezt a funkciót az elmúlt órában, és nincs limitálva, hogy egy ember 
        // maximum hány eszközt birtokolhat. 
        // Egy automatizált script (a scannered) másodpercek alatt végigiterálhat 
        // az összes aktív ID-n, és lefoglalhatja a cég teljes raktárkészletét.
        
        device.status = 'reserved';
        await device.save();
        
        res.status(200).json({ 
            message: 'Eszköz sikeresen lefoglalva.', 
            deviceId: device._id 
        });
    } catch (error) {
        res.status(500).json({ error: 'Belső szerverhiba' });
    }
};

// API8:2023 - Security Misconfiguration (Információszivárgás hibaüzenetben)
export const importDeviceInventory = async (req, res) => {
    try {
        const { devices } = req.body;
        
        // VULNERABLE LOGIC: Nem ellenőrizzük, hogy a 'devices' egyáltalán létezik-e vagy tömb-e.
        // Ha a kliens érvénytelen formátumot küld, a '.length' hívás TypeError-t fog dobni.
        const importCount = devices.length; 
        
        res.status(200).json({ message: `${importCount} eszköz feldolgozva.` });
    } catch (error) {
        // VULNERABLE RESPONSE: Ahelyett, hogy logolnánk a hibát a szerveren, 
        // és egy generikus 400 Bad Request-et adnánk vissza, a teljes nyers 
        // stack trace-t (fájlútvonalakkal együtt) kiküldjük az API válaszban.
        res.status(500).json({
            error: 'Belső rendszerhiba az importálás során.',
            rawErrorMessage: error.message,
            stackTrace: error.stack, // Ez felfedi a szerver belső struktúráját!
            serverEnv: process.env.NODE_ENV || 'development'
        });
    }
};
// BIZTONSÁGOS: Új eszköz létrehozása (Create)
export const createDeviceSecure = async (req, res) => {
    try {
        // Védelem Mass Assignment ellen: csak az engedélyezett mezőket olvassuk ki
        const { name, type, serialNumber } = req.body;
        
        if (!name || !type) {
            return res.status(400).json({ error: 'Név és típus megadása kötelező.' });
        }

        const newDevice = new Device({ name, type, serialNumber });
        await newDevice.save();
        res.status(201).json(newDevice);
    } catch (error) {
        // Biztonságos hibakezelés (API8 védelem): nincs stack trace szivárgás
        res.status(500).json({ error: 'Hiba az eszköz létrehozásakor.' });
    }
};

// BIZTONSÁGOS: Egyetlen eszköz lekérése (Read)
export const getDeviceByIdSecure = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).json({ error: 'Eszköz nem található.' });
        
        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ error: 'Érvénytelen azonosító formátum.' });
    }
};

// BIZTONSÁGOS: Eszköz módosítása (Update)
export const updateDeviceSecure = async (req, res) => {
    try {
        // RBAC ellenőrzés (API5 BFLA védelem): Csak adminisztrátorok frissíthetnek
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Nincs jogosultságod a művelethez.' });
        }

        const updatedDevice = await Device.findByIdAndUpdate(
            req.params.id, 
            { $set: { name: req.body.name, type: req.body.type, status: req.body.status } }, 
            { new: true, runValidators: true }
        );

        if (!updatedDevice) return res.status(404).json({ error: 'Eszköz nem található.' });
        res.status(200).json(updatedDevice);
    } catch (error) {
        res.status(500).json({ error: 'Szerverhiba a frissítés során.' });
    }
};

// BIZTONSÁGOS: Eszköz törlése (Delete) - A sebezhető API5 végpontunk "jó" verziója
export const deleteDeviceSecure = async (req, res) => {
    try {
        // RBAC ellenőrzés (API5 BFLA védelem)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Kizárólag adminisztrátorok törölhetnek eszközt.' });
        }

        const deletedDevice = await Device.findByIdAndDelete(req.params.id);
        if (!deletedDevice) return res.status(404).json({ error: 'Eszköz nem található.' });
        
        res.status(200).json({ message: 'Eszköz sikeresen törölve.', id: deletedDevice._id });
    } catch (error) {
        res.status(500).json({ error: 'Szerverhiba.' });
    }
};