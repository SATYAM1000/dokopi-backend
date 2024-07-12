import express from "express";
import { verifyUser } from "../../middlewares/user.middleware.js";
import { addToCart, clearCart, deleteCartItem, getCart, updateCartItem } from "../../controllers/user/cart.controller.js";

export const cartRouter = express.Router();

//Endpoint to add product to cart
cartRouter.post("/add", verifyUser, addToCart);

//Endpoint to view cart
cartRouter.get("/get", verifyUser, getCart);

//Endpoint to clear the complete cart
cartRouter.delete("/clear", verifyUser, clearCart);

//Endpoint to delete product from cart
cartRouter.delete("/delete/:fileId", verifyUser, deleteCartItem);

//Endpoint to update a cart item
cartRouter.put("/update/:fileId", verifyUser, updateCartItem);


