const Item = require("../models/Item");
const Activity = require("../models/Activity");
const Booking = require("../models/Booking");
const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Member = require("../models/Member");

module.exports = {
    landingPage: async (req, res) => {
        try {
            const mostPicked = await Item.find()
                .select("_id title city country price unit imageId")
                .populate({ path: "imageId", select: "_id imageUrl" })
                .limit(5);

            const travelers = await Activity.find();
            const treasures = await Booking.find();
            const cities = await Item.find();

            const category = await Category.find()
                .select("_id name")
                .limit(3)
                .populate({
                    path: "itemId",
                    perDocumentLimit: 4,
                    select: "_id title city country imageId isPopular",
                    options: { sort: { sumBooking: -1 } },
                    populate: {
                        path: "imageId",
                        select: "_id imageUrl",
                        perDocumentLimit: 1,
                    },
                });

            // Cek Category
            for (let i = 0; i < category.length; i++) {
                // Cek ItemID in Category
                for (let j = 0; j < category[i].itemId.length; j++) {
                    const item = await Item.findOne({
                        _id: category[i].itemId[j]._id,
                    });
                    item.isPopular = false;
                    await item.save();
                    // Index 0 : terbesar
                    if (category[i].itemId[0] === category[i].itemId[j]) {
                        item.isPopular = true;
                        await item.save();
                    }
                }
            }

            res.status(200).json({
                hero: {
                    travelers: travelers.length,
                    treasures: treasures.length,
                    cities: cities.length,
                },
                mostPicked,
                category,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    detailItem: async (req, res) => {
        try {
            const { id } = req.params;
            const item = await Item.findOne({ _id: id })
                .populate({
                    path: "featureId",
                    select: "_id name qty imageUrl",
                })
                .populate({
                    path: "activityId",
                    select: "_id name type imageUrl",
                })
                .populate({ path: "imageId", select: "_id imageUrl" });

            const bank = await Bank.find();

            res.status(200).json({
                ...item._doc,
                bank,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    bookingPage: async (req, res) => {
        try {
            const {
                idItem,
                duration,
                bookingStartDate,
                bookingEndDate,
                firstName,
                lastName,
                email,
                phoneNumber,
                accountHolder,
                bankFrom,
            } = req.body;

            if (!req.file) {
                return res.status(404).json({ message: "Image not found" });
            }

            if (
                idItem === undefined ||
                duration === undefined ||
                bookingStartDate === undefined ||
                bookingEndDate === undefined ||
                firstName === undefined ||
                lastName === undefined ||
                email === undefined ||
                phoneNumber === undefined ||
                accountHolder === undefined ||
                bankFrom === undefined
            ) {
                res.status(404).json({ message: "Lengkapi semua field" });
            }

            const item = await Item.findOne({ _id: idItem });

            if (!item) {
                return res.status(404).json({ message: "Item not found" });
            }

            item.sumBooking += 1;
            await item.save();

            let total = item.price * duration;
            let tax = total * 0.1;

            const invoice = Math.floor(1000000 + Math.random() * 9000000);

            const member = await Member.create({
                firstName,
                lastName,
                email,
                phoneNumber,
            });

            const newBooking = {
                invoice,
                bookingStartDate,
                bookingEndDate,
                total: (total += tax),
                itemId: {
                    _id: item.id,
                    title: item.title,
                    price: item.price,
                    duration: duration,
                },
                memberId: member.id,
                payments: {
                    proofPayment: `images/${req.file.filename}`,
                    bankFrom: bankFrom,
                    accountHolder: accountHolder,
                },
            };

            const booking = await Booking.create(newBooking);
            res.status(201).json({ message: "Success Booking", booking });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server internal error" });
        }
    },
};
