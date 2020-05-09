export function stringifyQueryParams(obj: any) {
	const stringifiedParams = (new URLSearchParams(obj)).toString();

	if (stringifiedParams) {
		return "?" + stringifiedParams;
	} else {
		return "";
	}
}
