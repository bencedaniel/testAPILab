import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
        // Egy valós alkalmazásban itt bcrypt-et használnánk, de a teszt-labor
        // kedvéért implementálhatsz szándékosan gyenge (pl. MD5) vagy 
        // hiányzó hashelést, hogy az API2:2023 (Broken Authentication) is tesztelhető legyen.
    },
    role: {
        type: String,
        enum: ['user', 'manager', 'admin'],
        default: 'user'
        // SEBEZHETŐSÉG (API3:2023 - Mass Assignment): 
        // Ha a kontroller egyszerűen a `new User(req.body)` formát használja 
        // regisztrációnál vagy frissítésnél, a scanner könnyedén adminná 
        // teheti magát egy {"role": "admin"} JSON mező beküldésével.
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        // SEBEZHETŐSÉG (API1:2023 - BOLA): 
        // Ez a mező kiváló a jogosultsági hibák demonstrálására. 
        // Ha egy 'user' jogosultságú fiók lekéri a saját részlege adatait, 
        // de az API nem validálja, hogy a kért departmentId megegyezik-e a 
        // user sajátjával, akkor más részlegek (vagy bérlők) adatai is kiszivároghatnak.
    }
}, {
    timestamps: true // Automatikusan kezeli a createdAt és updatedAt mezőket
});

// Modell létrehozása és exportálása
const User = mongoose.model('User', userSchema);

export default User;