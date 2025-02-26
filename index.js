import express from "express";
import "dotenv/config";
import connectDB from "./DBConfig.js";
import router from "./router/index.js";
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.get(`/api/v1`, (req, res) => {
  res.status(200).json({ message: "Api is running Great" });
});

app.use(`/api/v1`, router);

const StartServer = async () => {
  try {
    await connectDB;
    app.listen(PORT, () => {
      console.log(`Server is running on  http://localhost:${PORT}`);
    });
    console.log("DB connected Successfully");
  } catch (error) {
    console.log("Error connecting to DB", error);
  }
};
StartServer();
