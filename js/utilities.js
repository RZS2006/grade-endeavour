export const emptyElement = (element) => {
	while (element.firstChild) {
		element.removeChild(element.lastChild);
	}
};

export const cloneTemplate = (templateId) => {
	const template = document.querySelector(templateId);
	return template.content.cloneNode(true);
};

export const setInnerText = (parent, elementId, text) => {
	parent.querySelector(elementId).innerText = text;
};

export const addClass = (parent, elementId, className) => {
	parent.querySelector(elementId).classList.add(className);
};

export const isBetween = (value, min, max) => {
	return value >= min && value <= max;
};

export const capitalizeString = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatDate = (date) => {
	return new Date(date).toLocaleDateString();
};

export const getArrayLengthText = (array, singular, plural) => {
	return `${array.length} ${array.length === 1 ? singular : plural}`;
};
