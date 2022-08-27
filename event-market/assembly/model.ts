import { PersistentUnorderedMap, u128, context } from "near-sdk-as";

const hour: u64 = (60 * 60 * 1000 * 1000000);


@nearBindgen
export class Event {
  id: string;
  owner: string;
  name: string;
  image: string;
  description: string;
  amount: u128;
  bookingsCount: u64;
  closed: bool;
  endTimestamp: u64;

  public static fromPayload(payload: Event): Event {
    const event = new Event();
    event.id = payload.id;
    event.name = payload.name;
    event.description = payload.description;
    event.amount = payload.amount;
    event.owner = context.sender;
    event.image = payload.image;
    event.endTimestamp = hour * payload.endTimestamp;
    event.closed = false;
    event.bookingsCount = 0;
    
    return event;
  }

  public bookEvent() : void {
    this.bookingsCount++;
  }
}

export const listedEvent = new PersistentUnorderedMap<string, Event>("LISTED_EVENT");

export const listedUsers = new PersistentUnorderedMap<string, string[]>("LISTED_USERS");