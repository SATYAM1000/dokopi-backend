import { Cart } from "../../models/cart.model.js";
import { logger } from "../../config/logger.config.js";
import Joi from "joi";

const cartItemSchema = Joi.object({
  fileId: Joi.string().required(),
  fileKey: Joi.string().required(),
  fileName: Joi.string().required(),
  fileSize: Joi.string().required(),
  fileExtension: Joi.string().required(),
  pageCount: Joi.number().required(),
  iconPath: Joi.string().default("/files-icon/other.svg"),
  copiesCount: Joi.number().default(1),
  xeroxStoreMessage: Joi.string().allow(""),
  paperSize: Joi.string().valid("A4", "A3", "A2", "A1", "A0").default("A4"),
  printType: Joi.string()
    .valid("black_and_white", "simple_color", "digital_color")
    .default("black_and_white"),
  printSides: Joi.string()
    .valid("single_sided", "double_sided")
    .default("single_sided"),
  colorPages: Joi.array().items(Joi.string()).default([]),
  mixedPrintType: Joi.string()
    .valid(null, "simple_color", "digital_color")
    .default("simple_color")
    .optional(),
});

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const newCartItem = req.body;
    const { error } = cartItemSchema.validate(newCartItem);
    if (error) {
      return res.status(400).json({
        msg: error.details[0].message,
        success: false,
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, cartItems: [newCartItem] });
    } else {
      cart.cartItems.push(newCartItem);
    }

    await cart.save();
    return res.status(200).json({
      msg: "Added to cart successfully!",
      success: true,
      cartItem: newCartItem,
    });
  } catch (error) {
    logger.error(`Error while adding to cart: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        msg: "Cart is empty!",
        success: false,
      });
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Filter out items older than 3 days
    const recentItems = cart.cartItems.filter(
      (item) => new Date(item.createdAt) > threeDaysAgo
    );
    const expiredItems = cart.cartItems.filter(
      (item) => new Date(item.createdAt) <= threeDaysAgo
    );

    // If there are expired items, remove them from the cart
    if (expiredItems.length > 0) {
      cart.cartItems = recentItems;
      await cart.save();
    }

    // Set the cartItems to recentItems before sending the response
    cart.cartItems = recentItems;

    return res.status(200).json({
      msg: "Cart fetched successfully!",
      success: true,
      cart: cart,
    });
  } catch (error) {
    console.error(`Error while fetching cart: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};


export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        msg: "Cart is empty!",
        success: false,
      });
    }
    await Cart.deleteOne({ userId });
    return res.status(200).json({
      msg: "Cart cleared successfully!",
      success: true,
      cart: cart,
    });
  } catch (error) {
    logger.error(`Error while clearing cart: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const deleteCartItem = async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.id;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart is empty!" });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.fileId.toString() === fileId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    cart.cartItems.splice(itemIndex, 1);

    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error,
    });
  }
};

const updateCartItemSchema = Joi.object({
  fileId: Joi.string().required(),
  fileKey: Joi.string().required(),
  fileName: Joi.string().required(),
  fileSize: Joi.string().required(),
  fileExtension: Joi.string().required(),
  filePageCount: Joi.number().required(),
  iconPath: Joi.string().default("/files-icon/other.svg"),
  copiesCount: Joi.number().default(1),
  xeroxStoreMessage: Joi.string().allow(null, ""),
  paperSize: Joi.string().valid("A4", "A3", "A2", "A1", "A0").default("A4"),
  printType: Joi.string()
    .valid("black_and_white", "simple_color", "digital_color")
    .default("black_and_white"),
  printSides: Joi.string()
    .valid("single_sided", "double_sided")
    .default("single_sided"),
  colorPages: Joi.array().items(Joi.string()).default([]),
  mixedPrintType: Joi.string()
    .valid("simple_color", "digital_color")
    .allow(null)
    .optional(),
});

export const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const updatedCartItem = req.body;

  const { error } = updateCartItemSchema.validate(updatedCartItem);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ success: false, message: "Invalid item ID" });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    cart.cartItems[itemIndex] = {
      ...cart.cartItems[itemIndex],
      ...updatedCartItem,
    };

    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Item updated in cart", cart });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating item in cart", error });
  }
};
