export class HTTPError extends Error {
	statusCode: number;
	
	constructor(statusCode: number, message: string) {
		super(message);
		
		this.statusCode = statusCode;
	}
}

export class DiscordJSONError extends HTTPError {
	jsonCode: number;
	
	constructor(statusCode: number, json: { code: number; message: string }) {
		super(statusCode, `\nHTTP Status Code: ${statusCode}\nJSON: ${JSON.stringify(json)}`);
		
		this.jsonCode = json.code;
	}
}
