import { Schema, model, models } from 'mongoose';

const ConfigSchema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

const Config = models?.Config || model('Config', ConfigSchema);

export default Config;
