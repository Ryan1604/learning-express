const router = require("express").Router();
const adminController = require("../controllers/adminController");
const { upload, uploadMultiple } = require("../middlewares/multer");
const isLogin = require("../middlewares/auth");

// Sign In
router.get("/signin", adminController.viewSignIn);
router.post("/signin", adminController.actionSignIn);
router.use(isLogin);
router.get("/signout", adminController.actionSignOut);

// Dashboard
router.get("/dashboard", adminController.viewDashboard);

// Category
router.get("/category", adminController.viewCategory);
router.post("/category", adminController.addCategory);
router.put("/category", adminController.editCategory);
router.delete("/category/:id", adminController.deleteCategory);

// Bank
router.get("/bank", adminController.viewBank);
router.post("/bank", upload, adminController.addBank);
router.put("/bank", upload, adminController.editBank);
router.delete("/bank/:id", adminController.deleteBank);

// Item
router.get("/item", adminController.viewItem);
router.post("/item", uploadMultiple, adminController.addItem);
router.get("/item/show-image/:id", adminController.showImageItem);
router.get("/item/:id", adminController.showEditItem);
router.put("/item/:id", uploadMultiple, adminController.editItem);
router.delete("/item/:id", adminController.deleteItem);

// Detail item
// Feature
router.get("/item/detail/:itemId", adminController.showDetailItem);
router.post("/item/feature", upload, adminController.addFeature);
router.put("/item/update/feature", upload, adminController.editFeature);
router.delete("/item/:itemId/feature/:id", adminController.deleteFeature);

// Detail item
// Activity
router.get("/item/detail/:itemId", adminController.showDetailItem);
router.post("/item/activity", upload, adminController.addActivity);
router.put("/item/update/activity", upload, adminController.editActivity);
router.delete("/item/:itemId/activity/:id", adminController.deleteActivity);

// Booking
router.get("/booking", adminController.viewBooking);
router.get("/booking/:id", adminController.showDetailBooking);
router.put("/booking/:id/confirmation", adminController.actionConfirm);
router.put("/booking/:id/reject", adminController.actionReject);

module.exports = router;
