import mongoose, { Document, Schema } from 'mongoose';

interface IAlert extends Document {
  user: mongoose.Schema.Types.ObjectId;
  symbol: string;
  targetPrice: number;
  pushToken: string; 
}

const alertSchema: Schema<IAlert> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  targetPrice: {
    type: Number,
    required: true,
  },
  pushToken: { 
    type: String,
    required: true,
  },
});

const Alert = mongoose.model<IAlert>('Alert', alertSchema);

export default Alert;
