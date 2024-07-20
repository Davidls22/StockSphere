import mongoose, { Document, Schema } from 'mongoose';

interface IPortfolio extends Document {
  user: mongoose.Schema.Types.ObjectId;
  stocks: { symbol: string; quantity: number }[];
}

const portfolioSchema = new Schema<IPortfolio>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stocks: [{ symbol: { type: String, required: true }, quantity: { type: Number, required: true } }],
});

const Portfolio = mongoose.model<IPortfolio>('Portfolio', portfolioSchema);

export default Portfolio;
