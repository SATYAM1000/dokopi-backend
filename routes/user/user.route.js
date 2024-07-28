import express from "express";
import {  submitUserPhoneNumber, supportFormForUser } from "../../controllers/user/user.controller.js";
import { verifyUser } from "../../middlewares/user.middleware.js";

export const userRouter = express.Router();

// Endpoint to update or save user phone number
userRouter.post("/phone", verifyUser, submitUserPhoneNumber);

//Endpoint to submit support form
userRouter.post("/support", verifyUser, supportFormForUser);
