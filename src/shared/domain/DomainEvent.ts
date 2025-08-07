// src/shared/domain/DomainEvent.ts
import { UniqueEntityID } from './UniqueEntityID';

export interface DomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): UniqueEntityID;
}