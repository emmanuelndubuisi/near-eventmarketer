import { PersistentUnorderedMap, u128, context } from "near-sdk-as";

@nearBindgen
export class Event {
  id: string;
  customer: string;
  admin: string;
  name: string;
  image: string;
  description: string;
  amount: u128;
  booked: bool;
  bookedTimestamp: i64;

  public static fromPayload(payload: Event): Event {
    const event = new Event();
    event.id = payload.id;
    event.name = payload.name;
    event.description = payload.description;
    event.amount = payload.amount;
    event.customer = "";
    event.admin = context.sender;
    event.image = payload.image;
    event.booked = false;
    return event;
  }

  public bookEvent(duration: i64): void {
    this.customer = context.sender;
    this.booked = true;
    this.bookedTimestamp = Date.now() + i64(duration);
  }

  public endBooking(): void {
    this.customer = "";
    this.booked = false;
  }

  public pauseBooking(): void {
    this.booked = true;
  }
  public unpauseBooking(): void {
    this.booked = false;
  }
}

export const listedEvent = new PersistentUnorderedMap<string, Event>("LISTED_EVENT");
