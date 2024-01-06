import express from "express";
import router from "./Router/router.js";

const app = express();
const PORT = 3000;

app.use("/", router);

app.listen(PORT, () => console.log(`server is up at ${PORT}`));
