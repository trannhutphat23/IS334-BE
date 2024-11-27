const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'djbelaeen',
    api_key: '215765949761668',
    api_secret: 'kI0Vsq_DQq4vbUEeBUXiV2vc0nw'
});

module.exports = cloudinary;
