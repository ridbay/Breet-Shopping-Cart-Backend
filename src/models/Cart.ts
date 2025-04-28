import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema: Schema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const CartSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    items: [CartItemSchema],
    total: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
CartSchema.index({ userId: 1 });

// Pre-save middleware to calculate total
CartSchema.pre("save", function (this: ICart, next) {
  this.total = this.items.reduce(
    (sum: number, item: ICartItem) => sum + item.price * item.quantity,
    0
  );
  next();
});

export const Cart = mongoose.model<ICart>("Cart", CartSchema);
