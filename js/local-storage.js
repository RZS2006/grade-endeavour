export const fetchFromLocalStorage = (key, initial) => {
	const item = localStorage.getItem(`grade-endeavour-${key}`);

	return JSON.parse(item) || initial;
};

export const saveToLocalStorage = (key, value) => {
	localStorage.setItem(`grade-endeavour-${key}`, JSON.stringify(value));
};
