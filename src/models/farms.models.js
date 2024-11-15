const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FarmsSchema = new Schema(
    {
        name: String,
        image: String,
        email: String,
        phone: String,
        link: String,
        info: String,
        items: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Items',
            }
        ]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Farms', FarmsSchema);