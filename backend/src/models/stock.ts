import mongoose, { Document, Schema } from 'mongoose';

interface IStock extends Document {
  symbol: string;
  data: Record<string, any>;
}

const stockSchema: Schema = new Schema({
  symbol: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const Stock = mongoose.model<IStock>('Stock', stockSchema);

export default Stock;
