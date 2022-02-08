"use strict";

/* Import Module */
import express from "express";

import cors from "cors";

import WebRoute from "./routes/WebRoute.js";
import ApiRoute from "./routes/ApiRoute.js";
import Database from "./models/index.js";

class App {
  express;

  constructor() {
    this.express = express();

    this.mountDatabase();
    this.mountMiddleware();
    this.mountRoutes();
  }

  mountDatabase() {
    // Database.Connection.sync({ force: true })
    //   .then(() => {
    //     console.log("DB Connected!");
    //   })
    //   .catch((err) => {
    //     console.log("DB err : ", err);
    //   });
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
    this.express.use("/api", ApiRoute);
  }

  /**
   * initialize
   */
  get() {
    return this.express;
  }
}

export default new App();
