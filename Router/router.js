import express from "express";
import { homepageGet } from "../Controllers/Controller.js";

const router = express.Router();

router.get("/", homepageGet);

export default router