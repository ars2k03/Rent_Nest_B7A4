import express from 'express';
import cors from "cors";
import authRoutes from "./router/auth.route.js";
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    status : "OK",
    message : "RentNest API is running..."
  });
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})