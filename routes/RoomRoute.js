/**
 *  Web
 */

import express from "express";
import path from "path";

const router = express.Router();

router.get("/", (req, res, next) => {
  console.log("hello Web world!");
  res.send("test");
  // next();
});

export default router;
