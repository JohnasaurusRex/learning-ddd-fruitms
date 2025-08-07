// src/modules/fruits/infrastructure/models/fruitModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFruitDocument extends Document {
  fruitId: string;
  name: string;
  description: string;
  limitOfFruitToBeStored: number;
  currentAmount: number;
}

const FruitSchema: Schema = new Schema({
  fruitId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  limitOfFruitToBeStored: { 
    type: Number, 
    required: true 
  },
  currentAmount: { 
    type: Number, 
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

export const FruitModel = mongoose.model<IFruitDocument>('Fruit', FruitSchema);