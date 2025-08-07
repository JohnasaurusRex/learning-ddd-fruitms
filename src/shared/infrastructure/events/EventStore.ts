// src/shared/infrastructure/events/EventStore.ts
import mongoose, { Schema, Document } from 'mongoose';
import * as cron from 'node-cron';
import { DomainEvent } from '../../domain/DomainEvent';

interface IEventDocument extends Document {
  aggregateId: string;
  eventType: string;
  eventData: any;
  eventDate: Date;
  processed: boolean;
  processedAt?: Date;
  retryCount: number;
}

const EventSchema: Schema = new Schema({
  aggregateId: { type: String, required: true },
  eventType: { type: String, required: true },
  eventData: { type: Schema.Types.Mixed, required: true },
  eventDate: { type: Date, required: true },
  processed: { type: Boolean, default: false },
  processedAt: { type: Date },
  retryCount: { type: Number, default: 0 }
});

export const EventModel = mongoose.model<IEventDocument>('Event', EventSchema);

export class EventStore {
  private handlers: Map<string, Array<(event: any) => Promise<void>>> = new Map();

  constructor() {
    this.initializeEventProcessor();
  }

  public async saveEvent(event: DomainEvent): Promise<void> {
    await EventModel.create({
      aggregateId: event.getAggregateId().toString(),
      eventType: event.constructor.name,
      eventData: event,
      eventDate: event.dateTimeOccurred,
      processed: false,
      retryCount: 0
    });
  }

  public subscribe(eventType: string, handler: (event: any) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  private initializeEventProcessor(): void {
    // Process events every 10 seconds
    cron.schedule('*/10 * * * * *', async () => {
      await this.processUnprocessedEvents();
    });
  }

  private async processUnprocessedEvents(): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const unprocessedEvents = await EventModel.find({
        processed: false,
        retryCount: { $lt: 3 }
      }).session(session).lean();

      for (const eventDoc of unprocessedEvents) {
        try {
          await this.processEvent(eventDoc);
          
          await EventModel.updateOne(
            { _id: eventDoc._id },
            { 
              processed: true, 
              processedAt: new Date() 
            }
          ).session(session);
        } catch (error) {
          console.error(`Failed to process event ${eventDoc._id}:`, error);
          
          await EventModel.updateOne(
            { _id: eventDoc._id },
            { 
              $inc: { retryCount: 1 }
            }
          ).session(session);
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error('Event processing failed:', error);
    } finally {
      session.endSession();
    }
  }

  private async processEvent(eventDoc: any): Promise<void> {
    const handlers = this.handlers.get(eventDoc.eventType) || [];
    
    for (const handler of handlers) {
      await handler(eventDoc.eventData);
    }
  }
}