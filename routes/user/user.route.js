import express from "express";
import {  submitUserPhoneNumber } from "../../controllers/user/user.controller.js";
import { verifyUser } from "../../middlewares/user.middleware.js";

export const userRouter = express.Router();

// Endpoint to update or save user phone number
userRouter.post("/phone", verifyUser, submitUserPhoneNumber);
