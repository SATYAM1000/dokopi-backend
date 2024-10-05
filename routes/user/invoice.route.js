import express from "express";
import { generateInvoiceByOrderId } from "../../controllers/user/invoice.controller.js";

const invoiceRouter = express.Router();


// GET /api/invoice/:orderId
invoiceRouter.get("/:orderId", generateInvoiceByOrderId);
export default invoiceRouter;
