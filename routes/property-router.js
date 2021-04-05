// import needed modules
const express = require("express");
const propertyController = require("../controllers/property-controller");

// create new router
const router = express.Router();

// endpoints / routes
router.post("/property", propertyController.createProperty);
router.delete("/property-reset", propertyController.deleteAllProperties);
router.get("/property-sync", propertyController.syncData);
router.post("/properties", propertyController.loadAllProperties);

// export router
module.exports = router;