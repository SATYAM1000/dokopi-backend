import mongoose from "mongoose";


const newPricingModel = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "XeroxStore",
        required: true,
    },
    // array index represents the size of the paper,0th represent A0 paper size and so on.
    priceList: [{
        printType: {
            type: String,
            enum: ["black_and_white", "simple_color", "digital_color"],
            required: true,
        },
        printSided: {
            type: String,
            enum: ["single_sided", "double_sided"],
            required: true,
        },
        base_price: {
            type: String,
            required: true,
            trim: true
        },
        quantity_types: [
            {
                quantity_type: {
                    type: String,
                    enum: ["quantity", "paper_type", "urgency", "double_sided", "binding"],
                },
                condition_value: {
                    type: String,
                    required: true,
                    time: true
                },
                condition_price: {
                    type: String,
                    required: true,
                    time: true
                },

            }
        ]
    }]
}, {
    timestamps: true
})

export default mongoose.model("NewPricing", newPricingModel);
