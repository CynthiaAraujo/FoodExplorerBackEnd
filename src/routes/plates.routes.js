const { Router } = require ("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const PlatesController = require("../controllers/PlatesController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const platesRoutes = Router();

const platesController = new PlatesController();
const upload = multer(uploadConfig.modules.MULTER);

platesRoutes.use(ensureAuthenticated);

platesRoutes.post("/", ensureAuthenticated, upload.single("img"), platesController.create);

platesRoutes.get("/:id", platesController.show);
platesRoutes.delete("/:id", platesController.delete);
platesRoutes.get("/", platesController.index);
platesRoutes.put("/:id", ensureAuthenticated, upload.single("img"), platesController.update);


module.exports  = platesRoutes;