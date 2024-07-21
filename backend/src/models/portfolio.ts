import mongoose, { Document, Schema } from 'mongoose';

interface IStockItem {
  symbol: string;
  quantity: number;
  price?: number;
  date?: string;
}

interface IPortfolio extends Document {
  user: mongoose.Schema.Types.ObjectId;
  stocks: IStockItem[];
}

const stockItemSchema: Schema = new Schema({
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: false },
  date: { type: String, required: false },
});

const portfolioSchema = new Schema<IPortfolio>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stocks: [stockItemSchema],
});

const Portfolio = mongoose.model<IPortfolio>('Portfolio', portfolioSchema);

export default Portfolio;
