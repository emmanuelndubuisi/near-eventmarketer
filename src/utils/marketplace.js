import { v4 as uuid4 } from "uuid";
import { parseNearAmount } from "near-api-js/lib/utils/format";

const GAS = 100000000000000;

export function createEvent(event) {
  event.id = uuid4();

  event.amount = parseNearAmount(event.amount + "");
  console.log(window.contract);

  return window.contract.createEvent({ event });
}

export function getEvents() {
  return window.contract.getEvents();
}

export async function bookEvent({ id, amount }) {
  console.log(id,amount);
  await window.contract.bookEvent({ eventId: id }, GAS, amount);
}

export async function sellTicket({ id }) {
  await window.contract.sellTicket({ eventId: id });
}

