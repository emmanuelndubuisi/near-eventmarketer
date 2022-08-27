import { ContractPromiseBatch, context } from "near-sdk-as";
import {Event, listedEvent, listedUsers} from "./model";


/**
 * Create an event
 * @param event Event details obejct
 */
export function createEvent(event: Event): void {
  let storedEvent = listedEvent.get(event.id);
  if (storedEvent !== null) {
    throw new Error(`event with ${event.id} already exists`);
  }

  listedEvent.set(event.id, Event.fromPayload(event));
}

/**
 * Get details of an event
 * @param eventId ID of the Event
 * @return Details object if there is an event present with the given ID. Otherwise, null.
 */
export function getEvent(eventId: string): Event | null {
  return listedEvent.get(eventId);
}

/**
 * Get all the events present in the contract
 * @return Array of Events
 */
export function getEvents(): Event[] {
  return listedEvent.values();
}

/**
 * Book a seat for a given event
 * @param eventId ID of the event
 */
export function bookEvent(eventId: string): void {
  const event = getEvent(eventId);
  if (event == null) {
    throw new Error(`event not found`);
  }

  if (event.closed) {
    throw new Error("Event has been closed");
  }

  if(context.blockTimestamp > event.endTimestamp){
      throw new Error("Event is already finished");
  }

  if (event.amount.toString() != context.attachedDeposit.toString()) {
    throw new Error("attached deposit should equal to the event's price");
  }

  let userEvents = listedUsers.get(context.sender);
  if(userEvents == null){
      userEvents = [];
  }

  if(userEvents.indexOf(eventId) > 0){
      throw new Error("You have already booked the event");
  }

  ContractPromiseBatch.create(event.owner).transfer(context.attachedDeposit);
  listedEvent.set(event.id, event);

  userEvents.push(eventId);
  listedUsers.set(context.sender, userEvents);
}


/**
 * Close an event. It is only accessible to event owner
 * @param eventId ID of the event
 */
export function closeEvent(eventId: string): void {
    const event = getEvent(eventId);
    if (event == null) {
      throw new Error("event not found");
    }

    if (event.owner != context.sender) {
      throw new Error(`you are not the owner of this event`);
    }

    if (event.closed) {
        throw new Error(`Event is already closed`);
    }

    event.closed = true;
    listedEvent.set(event.id, event);
}


/**
 * Gift your event seat for another user
 * @param eventId ID of the event
 * @param newOwner ID of the user who would like to gift your event seat
 */
export function giftEventBooking(eventId: string, newOwner: string): void {
    const event = getEvent(eventId);
    if (event == null) {
        throw new Error("event not found");
    }

    if(context.blockTimestamp > event.endTimestamp){
        throw new Error("Event is already finished");
    }

    let userEvents = listedUsers.get(context.sender);

    if(!userEvents || userEvents.indexOf(eventId) < 0){
        throw new Error(`You don't have a booking for ${event.name}`);
    }

    const userEventIndex = userEvents.indexOf(eventId);
    userEvents.splice(userEventIndex, 1);

    listedUsers.set(context.sender, userEvents);

    let newOwnerEvents = listedUsers.get(newOwner);
    if(newOwnerEvents == null){
        newOwnerEvents = [];
    }
    newOwnerEvents.push(eventId);

    listedUsers.set(newOwner, newOwnerEvents);
}


/**
 * Get details of events which has bought by the given user
 * @param accountId ID of the user
 * @return Array of event details bought by the given user
 */
export function getUserEvents(accountId: string): string[] {
    let userEvents = listedUsers.get(accountId);
    if(userEvents == null){
        return [];
    }
    return userEvents;
}