"use strict";

/* Import Module */
import express from "express";

import cors from "cors";

import WebRoute from "./routes/WebRoute.js";

class App {
  express;

  constructor() {
    this.express = express();

    this.mountMiddleware();
    this.mountRoutes();
  }

  /**
   * mount all Module
   */

  mountMiddleware() {
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cors());
  }

  /**
   * mount all routes
   */
  mountRoutes() {
    this.express.use("/", WebRoute);
  }

  /**
   * initialize
   */
  get() {
    return this.express;
  }
}

export default new App();
