import mongoose, { Document, Schema, Types } from 'mongoose';

interface IWatchlist extends Document {
  user: Types.ObjectId;
  stocks: Types.ObjectId[];
}

const watchlistSchema: Schema<IWatchlist> = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stocks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Stock',
      required: true,
    },
  ],
});

const Watchlist = mongoose.model<IWatchlist>('Watchlist', watchlistSchema);

export default Watchlist;
