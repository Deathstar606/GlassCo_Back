const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('./cors');

const Sunglasses = require('../models/sun');
var authenticate = require('../authenticate');

/* const storageD = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const storageC = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Category');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const uploadDish = multer({ storage: storageD });
const uploadCat = multer({ storage: storageC }); */

const sunRouter = express.Router();

sunRouter.use(bodyParser.json());

sunRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, async (req, res, next) => {
    try {
        const sunItems = await Sunglasses.find(req.query)
        res.status(200).json(sunItems);
    } catch (error) {
        next(error);
    }
})
.post(cors.corsWithOptions, /* upload.array('images'), */ async (req, res) => {
    const { name, material, price, shape, gender, images } = req.body;
    //const imagePaths = req.files ? req.files.map(file => file.path.replace(/^public[\/\\]/, '')) : []; // Handle multiple image uploads

    const sunItem = {
        _id: new mongoose.Types.ObjectId(),
        name,
        material,
        price,
        shape,
        gender,
        images: Array.isArray(images) ? images : [images],
    };

    try {
        const newSunItem = await Sunglasses.create(sunItem);
        res.status(200).json(newSunItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
.delete(cors.corsWithOptions, async (req, res) => {
    const { _id } = req.body;
    
    try {
        const deletedSunItem = await Sunglasses.findByIdAndDelete(_id);

        if (!deletedSunItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(deletedSunItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

sunRouter.route('/:glassId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    const { glassId } = req.params;

    Sunglasses.findById(glassId)
        .then((dish) => {
            if (dish) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            } else {
                const err = new Error(`Glass ${glassId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch((err) => next(err));
})
/* .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    const { glassId } = req.params;

    Sunglasses.findById(glassId)
        .then((sunglasses) => {
            if (sunglasses) {
                // Update the fields
                sunglasses.images = req.body.images || sunglasses.images; // Preserve existing if not provided
                sunglasses.color = req.body.color || sunglasses.color;   // Preserve existing if not provided

                return sunglasses.save(); // Save the updated document
            } else {
                const err = new Error(`Glass ${glassId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .then((updatedSunglasses) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(updatedSunglasses);
        })
        .catch((err) => next(err));
}) */
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Sunglasses.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Sunglasses.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = sunRouter;