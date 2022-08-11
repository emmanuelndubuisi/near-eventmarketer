import { Event, listedEvent } from "./model";
import { ContractPromiseBatch, context } from "near-sdk-as";


export function createEvent(event: Event): void {
  let storedEvent = listedEvent.get(event.id);
  if (storedEvent !== null) {
    throw new Error(`event with ${event.id} already exists`);
  }
  event.owner = context.sender;
  event.booked = false;

 

  listedEvent.set(event.id, Event.fromPayload(event));
}

export function getEvent(id: string): Event | null {
  return listedEvent.get(id);
}

export function getEvents(): Event[] {
  return listedEvent.values();
}

export function bookEvent(eventId: string): void {
  const event = getEvent(eventId);
  if (event == null) {
    throw new Error(`event not found`);
  }
  if (event.booked) {
    throw new Error("event has been booked");
  }

  if (event.amount.toString() != context.attachedDeposit.toString()) {
    throw new Error("attached deposit should equal to the event's price");
  }
  ContractPromiseBatch.create(event.owner).transfer(context.attachedDeposit);
  event.owner = context.sender;
  event.booked = true;
  listedEvent.set(event.id, event);
}

export function sellTicket(eventId: string): void {
    const event = getEvent(eventId);
    if (event == null) {
      throw new Error("event not found");
    }
    if (event.owner != context.sender) {
      throw new Error(`you are not the owner of this event ${typeof(event.owner)} = ${typeof(context.sender.toString())} `);
    }
    event.owner = context.sender;
    event.booked = false;
    listedEvent.set(event.id, event);
}
