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