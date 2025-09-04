"use strict";

import mongoose from "mongoose";
import config from "../configs/config.mongodb.js";
const {
  db: { host, port, name },
} = config;
// const connectString = `mongodb://${host}:${port}/${name}`;
const connectString = `${process.env.MONGOD_URI}/movie-ticket-booking-app`;
import { countConnect } from "../helpers/check.connect.js";

class Database {
  constructor() {
    this.connect();
  }

  //   connect
  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString, { maxPoolSize: 50 })
      .then((_) => {
        console.log(`connected mongodb success`, countConnect());
      })
      .catch((err) => console.log(`error connect`));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
export default instanceMongodb;
