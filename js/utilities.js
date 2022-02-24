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
