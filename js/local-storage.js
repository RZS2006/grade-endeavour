export const fetchFromLocalStorage = (key, initial) => {
	const item = localStorage.getItem(`grade-endeavour-${key}`);

	if (item != null) {
		return JSON.parse(item);
	} else {
		return initial;
	}
};

export const saveToLocalStorage = (key, value) => {
	localStorage.setItem(`grade-endeavour-${key}`, JSON.stringify(value));
};
