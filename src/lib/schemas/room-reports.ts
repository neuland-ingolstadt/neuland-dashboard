export type RoomReport = {
	id: string;
	createdAt: string;
	description: string;
	reason:
		| "WRONG_DESCRIPTION"
		| "WRONG_LOCATION"
		| "NOT_EXISTING"
		| "MISSING"
		| "OTHER";
	resolvedAt: string | null;
	room: string;
};
