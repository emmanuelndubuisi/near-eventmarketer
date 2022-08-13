import { Event, listedEvent } from "./model";
import { ContractPromiseBatch, context } from "near-sdk-as";

// 1 millisecond = 1000 seconds
const hour: i64 = i64(3600000);


/**
 *  @dev allows a user to create an event
 * @param event the event object containing all necessary arguments
 */
export function createEvent(event: Event): void {
	let storedEvent = listedEvent.get(event.id);
	if (storedEvent !== null) {
		throw new Error(`event with ${event.id} already exists`);
	}
	listedEvent.set(event.id, Event.fromPayload(event));
}

export function getEvent(id: string): Event | null {
	return listedEvent.get(id);
}

export function getEvents(): Event[] {
	return listedEvent.values();
}

/**
 * @dev allow users to book an event for x duration
 * @param eventId the id of event
 * @param duration the duration for booking, is in milliseconds
 */
export function bookEvent(eventId: string, duration: i64): void {
	const event = getEvent(eventId);
	if (event == null) {
		throw new Error(`event not found`);
	}
	assert(event.booked == false, "event has been booked");
	assert(
		event.admin.toString() != context.sender.toString(),
		"you can't book your own event"
	);
	assert(
		event.amount.toString() == context.attachedDeposit.toString(),
		"attached deposit should equal to the event's price"
	);
	assert(duration >= hour, "duration of booking must be at least an hour");
	ContractPromiseBatch.create(event.admin).transfer(context.attachedDeposit);
	event.bookEvent(duration);
	listedEvent.set(event.id, event);
}

/**
 *  @dev allows the owner/admin of an event to end the booking after the booking duration is over
 * @param eventId id of the event
 */

export function endBooking(eventId: string): void {
	const event = getEvent(eventId);
	if (event == null) {
		throw new Error("event not found");
	}
	assert(
		event.admin.toString() == context.sender.toString(),
		"you are not the owner of this event"
	);
	assert(Date.now() >= event.bookedTimestamp, "Booking hasn't ended yet");
	event.endBooking();
	listedEvent.set(event.id, event);
}

/**
 *  @dev allows the admin of an event to pause booking
 * @param eventId id of the event
 */
export function pauseBooking(eventId: string): void {
	const event = getEvent(eventId);
	if (event == null) {
		throw new Error("event not found");
	}
	assert(
		event.admin.toString() == context.sender.toString(),
		"you are not the owner of this event"
	);
	assert(event.customer.toString() == "", "Event is currently booked");
	event.pauseBooking();
	listedEvent.set(event.id, event);
}

/**
 *  @dev allows the admin of an event to unpause booking
 * @param eventId id of the event
 */
export function unpauseBooking(eventId: string): void {
	const event = getEvent(eventId);
	if (event == null) {
		throw new Error("event not found");
	}
	assert(
		event.admin.toString() == context.sender.toString(),
		"you are not the owner of this event"
	);
	assert(event.customer.toString() == "", "Event is currently booked");
	event.unpauseBooking();
	listedEvent.set(event.id, event);
}
