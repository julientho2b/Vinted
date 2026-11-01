const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middleware/isAuthenticated");

const Offer = require("../models/Offer");

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { MARQUE: req.body.brand },
          { TAILLE: req.body.size },
          { ÉTAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],

        owner: req.user._id,
      });

      // console.log(newOffer);
      await newOffer.save();

      if (req.files && req.files.picture) {
        const picture = req.files.picture;

        const result = await cloudinary.uploader.upload(
          convertToBase64(picture),
          {
            folder: `offers/${newOffer._id}`,
          },
        );

        newOffer.product_image = result.secure_url;

        await newOffer.save();
      }

      return res.status(201).json(newOffer);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
);

router.get("/offers", async (req, res) => {
  try {
    const filters = {};
    let page = Number(req.query.page) || 1;
    const limit = 5;
    const sort = {};

    if (req.query.sort === "price-desc") {
      sort.product_price = -1;
    } else if (req.query.sort === "price-asc") {
      sort.product_price = 1;
    }

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    console.log(filters);

    if (req.query.priceMin && req.query.priceMax) {
      filters.product_price = {
        $gte: Number(req.query.priceMin),
        $lte: Number(req.query.priceMax),
      };
    } else if (req.query.priceMin) {
      filters.product_price = {
        $gte: Number(req.query.priceMin),
      };
    } else if (req.query.priceMax) {
      filters.product_price = {
        $lte: Number(req.query.priceMax),
      };
    }

    const offers = await Offer.find(filters)
      .sort(sort)
      .select("product_name product_price -_id")
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Offer.countDocuments(filters);

    return res.status(200).json({ total, offers });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    const showAnnounce = await Offer.findById(req.params.id);
    if (showAnnounce === null) {
      return res.status(404).json({ message: "Offer not found" });
    }
    return res.status(200).json(showAnnounce);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
