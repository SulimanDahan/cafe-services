import RoomModel from "./room_model";

/**
 * Represents a customer dining room reservation.
 * Matches the Prisma Reservation model.
 */
type ReservationModel = {
	id: string;
	number: number;
	client_name: string;
	phone: string;
	date_time: Date;
	room_id: string;
	order_passkey: number;
	accepted: boolean;
	activated: boolean;
	completed: boolean;
	created_at: Date;
	updated_at: Date;
	/** Included via Prisma relation */
	room?: RoomModel;
};

export const initialReservationState: ReservationModel = {
	id: "",
	client_name: "",
	number: 0,
	phone: "",
	order_passkey: 0,
	date_time: new Date(),
	room_id: "",
	accepted: false,
	activated: false,
	completed: false,
	created_at: new Date(),
	updated_at: new Date(),
};

export default ReservationModel;
