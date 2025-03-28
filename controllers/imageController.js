const path = require('path');
const s3 = require('../config/aws'); 



const uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const params = {
        Bucket: 'tower-defense-aztec-guardians',
        Key: `ranges/${path.basename(req.file.originalname)}`, 
        Body: req.file.buffer, 
        ContentType: req.file.mimetype,
    };

    s3.upload(params, (err, data) => {
        if (err) {
        return res.status(500).send('Error uploading image to S3: ' + err.message);
        }

        res.json({
        message: 'Image uploaded successfully',
        url: data.Location, 
        });
    });
}

module.exports = { uploadImage };