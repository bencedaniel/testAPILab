import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true
    },
    serialNumber: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'retired','reserved'],
        default: 'active'
    }
}, { timestamps: true });

const Device = mongoose.model('Device', deviceSchema);

export default Device;