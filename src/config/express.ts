import "dotenv/config"
import express from 'express'
import cors from 'cors'
import { errorMiddleware } from "./errorHandler"
import indexRouter from "../routes/index.router"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(indexRouter);

app.use(errorMiddleware);
export default app
