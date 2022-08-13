import React, { useState, useEffect, useCallback } from "react";
import {
	login,
	logout as destroy,
	accountBalance,
	getAccountId,
} from "./utils/near";
import {
	getEvents as getEventsList,
	bookEvent,
	sellTicket,
	createEvent,
} from "./utils/marketplace";

import "./App.css";

function App() {
	const [events, setEvents] = useState([]);
	const [name, setName] = useState("");
	const [amount, setAmount] = useState("");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState("");
	const account = window.walletConnection.account();
	const [balance, setBalance] = useState("0");
	const [loading, setLoading] = useState(false);
	const getBalance = useCallback(async () => {
		if (account.accountId) {
			setBalance(await accountBalance());

			await getEvents();
		}
	}, [account]);

	useEffect(() => {
		if (!account.accountId) {
			login();
		}
	}, []);

	useEffect(() => {
		getBalance();
	}, [getBalance]);

	const getEvents = useCallback(async () => {
		setLoading(true);
		try {
			const events = await getEventsList();
			setEvents(events);
		} catch (error) {
			console.log({ error });
		} finally {
			setLoading(false);
		}
	}, [setEvents, events]);

	// function to initiate transaction
	const book = async (id, amount) => {
		setLoading(true);
		try {
			await bookEvent({ id, amount });
			getEvents();
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const sell = async (id) => {
		setLoading(true);
		try {
			await sellTicket({ id });
			getEvents();
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const formSubmit = async (e) => {
		e.preventDefault();
		try {
			if (!name || !amount || !description || !image) return;
			await createEvent({
				name,
				amount,
				description,
				image,
				timestamp: new Date(),
			});
			getEvents();
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<header className="site-header sticky-top py-1">
				<nav className="container d-flex flex-column flex-md-row justify-content-between">
					<a className="py-2" style={{ color: "white" }} href="#">
						<h3>Event Market</h3>
					</a>
					<a className="py-2 d-none d-md-inline-block" href="#">
						Balance: {balance} NEAR
					</a>
				</nav>
			</header>
			<main>
				<div className="row row-cols-1 row-cols-md-3 mb-3 text-center">
					{events.map((event) => (
						<div className="col" key={event.id}>
							<div className="card mb-4 rounded-3 shadow-sm">
								<div className="card-header py-3">
									<h4 className="my-0 fw-bold">
										{event.name}
									</h4>
								</div>
								<div className="card-body">
									<h1 className="card-title pricing-card-title">
										$
										{event.amount /
											1000000000000000000000000}
										<small className="text-muted fw-light">
											NEAR
										</small>
									</h1>
									<img width={200} src={event.image} alt="" />
									<p className="list-unstyled mt-3 mb-4">
										{event.description}
									</p>
									{!event.booked ? (
										<button
											type="button"
											onClick={() =>
												book(event.id, event.amount)
											}
											className="w-100 btn btn-lg btn-primary"
										>
											Book Event
										</button>
									) : event.owner === account.accountId ? (
										<button
											type="button"
											onClick={() => sell(event.id)}
											className="w-100 btn btn-lg btn-outline-danger"
										>
											Sell Slot
										</button>
									) : (
										"Ticket has already been bought"
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</main>

			<div className="p-3 w-50 justify-content-center">
				<h2>Create Event</h2>
				<div className="">
					<form onSubmit={formSubmit}>
						<div className="form-floating mb-3">
							<input
								type="text"
								className="form-control rounded-4"
								id="floatingInput"
								placeholder="Name"
								onChange={(e) => setName(e.target.value)}
								required
							/>
							<label htmlFor="floatingInput">Name</label>
						</div>
						<div className="form-floating mb-3">
							<input
								type="text"
								className="form-control rounded-4"
								id="floatingInput"
								placeholder="Amount"
								onChange={(e) => setAmount(e.target.value)}
								required
							/>
							<label htmlFor="floatingInput">Amount</label>
						</div>
						<div className="form-floating mb-3">
							<textarea
								className="form-control rounded-4"
								id="floatingInput"
								placeholder="Description"
								rows={5}
								onChange={(e) => setDescription(e.target.value)}
								required
							/>
							<label htmlFor="floatingInput">Description</label>
						</div>
						<div className="form-floating mb-3">
							<input
								className="form-control rounded-4"
								id="floatingInput"
								placeholder="Image Url"
								onChange={(e) => setImage(e.target.value)}
								required
							/>
							<label htmlFor="floatingInput">Image</label>
						</div>

						<button
							className="w-100 mb-2 btn  rounded-4 btn-primary"
							type="submit"
						>
							Create
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default App;
