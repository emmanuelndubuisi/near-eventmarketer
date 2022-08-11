import { PersistentUnorderedMap, u128, context } from "near-sdk-as";
import {Date} from "date"


@nearBindgen
export class Event {
  id: string;
  owner: string;
  admin: string;
  name: string;
  image: string;
  description: string;
  amount: u128;
  booked: bool;
  timestamp: i64;

  public static fromPayload(payload: Event): Event {
    const event = new Event();
    event.id = payload.id;
    event.name = payload.name;
    event.description = payload.description;
    event.amount = payload.amount;
    event.owner = context.sender;
    event.image = payload.image;
    event.timestamp = payload.timestamp;
    event.booked = false;
    return event;
  }
}

export const listedEvent = new PersistentUnorderedMap<string, Event>("LISTED_EVENT");
