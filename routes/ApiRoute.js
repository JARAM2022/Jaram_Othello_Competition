/**
 *  Api
 */

import express from "express";
// import MainController from '../controllers/MainController.js';

// import AuthRoute from './AuthRoute.js';
import RoomRoute from "./RoomRoute.js";

const router = express.Router();

// router.get('/', MainController.index);

// router.use('/auth', AuthRoute);
router.use("./room", RoomRoute);

router.get("*", (req, res, next) => {
  /* TODO: error handle */
  next();
});

export default router;
