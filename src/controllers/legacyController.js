import User from '../models/User.js';

// API9:2023 - Improper Inventory Management (Zombie API)
export const getLegacyUsersVulnerable = async (req, res) => {
    try {
        // VULNERABLE: Egy régi végpont, amely minden felhasználót listáz, 
        // és szándékosan visszaadja a teljes adatbázis-objektumot (akár a jelszavakat is).
        const users = await User.find({});
        
        res.status(200).json({
            warning: 'Ez a végpont elavult (v1). Kérjük, térjen át a v2-es API használatára.',
            data: users
        });
    } catch (error) {
        res.status(500).json({ error: 'Szerverhiba' });
    }
};