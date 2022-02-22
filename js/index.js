import { fetchFromLocalStorage, saveToLocalStorage } from './local-storage.js';

// Constants

const addCourseForm = document.querySelector('#add-course-form');
const ibGradingCheckbox = document.querySelector('#use-ib-grading-checkbox');
const courseContainer = document.querySelector('#course-container');

let MIN_GRADE = 4;
let MAX_GRADE = 10;

let courses = fetchFromLocalStorage('courses', []);
let useIbGradingScale = fetchFromLocalStorage('use-ib-grading-scale', false);

// Functions

const addCourse = (name, goal) => {
	const element = document.getElementsByTagName('template')[0];
	const clone = element.content.cloneNode(true);

	const key = Date.now();

	clone.querySelector('#course').setAttribute('data-key', key);

	clone.querySelector('#course-header').addEventListener('click', (e) => {
		e.target
			.closest('#course-header')
			.nextElementSibling.classList.toggle('hidden');
	});

	clone.querySelector('#course-details-name').innerText = name;

	clone.querySelector('#course-header-ca').innerText = (0).toFixed(2);
	clone.querySelector('#course-header-aa').innerText = goal;
	clone.querySelector('#course-header-na').innerText = goal;

	clone.querySelector(
		'#course-details-ca'
	).innerText = `Current Average: ${(0).toFixed(2)}`;
	clone.querySelector(
		'#course-details-aa'
	).innerText = `Aimed Average: ${goal}`;
	clone.querySelector(
		'#course-details-na'
	).innerText = `Needed Average: ${goal}`;

	clone
		.querySelector('#course-delete-link')
		.addEventListener('click', (e) => {
			deleteCourse(key);
		});

	clone
		.querySelector('#add-course-entry-form')
		.addEventListener('submit', (e) => {
			e.preventDefault();

			const itemContainerCourse = e.target.closest('#course');

			const itemContainer = itemContainerCourse.querySelector(
				'#course-item-container'
			);

			const element2 = document.getElementsByTagName('template')[1];
			const clone2 = element2.content.cloneNode(true);

			const key = Date.now();

			clone2
				.querySelector('#course-item-row')
				.setAttribute('data-key', key);

			clone2.querySelectorAll('td')[0].innerText =
				itemContainerCourse.querySelector('#course-item-name').value;
			clone2.querySelectorAll('td')[1].innerText =
				itemContainerCourse.querySelector('#course-item-type').value;
			clone2.querySelectorAll('td')[2].innerText =
				itemContainerCourse.querySelector('#course-item-date').value;
			clone2.querySelectorAll('td')[3].innerText =
				itemContainerCourse.querySelector('#course-item-grade').value;
			clone2.querySelectorAll('td')[4].addEventListener('click', (e) => {
				e.preventDefault();

				deleteCourseEntry(key, itemContainerCourse.dataset.key);
			});

			itemContainer.appendChild(clone2);
		});

	const object = {
		id: key,
		name,
		goal,
		courseEntries: [],
		forecastSpan: 1,
	};

	courses.push(object);

	saveToLocalStorage('courses', courses);

	courseContainer.appendChild(clone);
};

const deleteCourse = (courseId) => {
	courses = courses.filter((course) => course.id !== courseId);

	saveToLocalStorage('courses', courses);
	renderCourses(courses);
};

const addCourseEntry = (name, type, date, grade, courseId) => {
	const course = courses.find((course) => course.id === courseId);
	if (course) {
		course.courseEntries.push({
			id: Date.now(),
			name,
			type,
			date,
			grade,
		});
	}

	saveToLocalStorage('courses', courses);
	renderCourses(courses);
};

const deleteCourseEntry = (itemId, courseId) => {
	const courseElement = courseContainer.querySelector(
		`[data-key="${courseId}"]`
	);
	const itemElement = courseElement.querySelector(`[data-key="${itemId}"]`);
	itemElement.remove();

	saveToLocalStorage('courses', courses);
};

const changeForecastSpan = (value, courseId) => {
	const course = courses.find((course) => course.id === courseId);
	if (course) {
		course.forecastSpan = value;
	}

	saveToLocalStorage('courses', courses);
	renderCourses(courses);
};

const renderCourses = (courses) => {
	while (courseContainer.firstChild) {
		courseContainer.removeChild(courseContainer.lastChild);
	}

	courses.forEach((course) => {
		const { id, name, goal, courseEntries, forecastSpan } = course;

		const courseTemplate = document.querySelector('#template-course');
		const courseClone = courseTemplate.content.cloneNode(true);

		courseClone.querySelector('#course').setAttribute('data-key', id);

		courseClone
			.querySelector('#course-header')
			.addEventListener('click', (e) => {
				e.target
					.closest('#course-header')
					.nextElementSibling.classList.toggle('hidden');
			});

		courseClone.querySelector('#course-details-name').innerText = name;

		const currentAverage = getCurrentAverage(courseEntries);
		const neededAverage = getNeededAverage(
			courseEntries,
			goal,
			forecastSpan
		);

		courseClone.querySelector('#course-header-ca').innerText =
			currentAverage.toFixed(2);
		courseClone.querySelector('#course-header-aa').innerText =
			goal.toFixed(2);
		courseClone.querySelector('#course-header-na').innerText =
			currentAverage <= goal ? neededAverage.toFixed(2) : '-';

		courseClone.querySelector(
			'#course-details-ca'
		).innerText = `Current: ${currentAverage.toFixed(2)}`;
		courseClone.querySelector(
			'#course-details-aa'
		).innerText = `Aimed: ${goal.toFixed(2)}`;
		courseClone.querySelector('#course-details-na').innerText = `Needed: ${
			currentAverage <= goal ? neededAverage.toFixed(2) : '-'
		}`;

		const forecastSpanInput = courseClone.querySelector('#forecast-span');

		forecastSpanInput.value = forecastSpan;
		forecastSpanInput.addEventListener('change', (e) => {
			const value = parseInt(e.target.value);

			if (value >= 1 && value <= 10) {
				changeForecastSpan(value, id);
			}
		});

		// Delete Course Link

		courseClone
			.querySelector('#course-delete-link')
			.addEventListener('click', () => {
				deleteCourse(id);
			});

		const courseEntryContainer = courseClone.querySelector(
			'#course-entry-container'
		);

		courseEntries.forEach((entry) => {
			const { id, name, type, date, grade } = entry;

			const courseEntryTemplate = document.querySelector(
				'#template-course-entry'
			);
			const courseEntryClone =
				courseEntryTemplate.content.cloneNode(true);

			courseEntryClone
				.querySelector('#course-item-row')
				.setAttribute('data-key', id);

			courseEntryClone.querySelectorAll('td')[0].innerText = name;
			courseEntryClone.querySelectorAll('td')[1].innerText = type;
			courseEntryClone.querySelectorAll('td')[2].innerText = date;
			courseEntryClone.querySelectorAll('td')[3].innerText =
				grade.toFixed(2);

			courseEntryContainer.appendChild(courseEntryClone);
		});

		const addCourseEntryForm = courseClone.querySelector(
			'#add-course-entry-form'
		);

		addCourseEntryForm.addEventListener('submit', (e) => {
			e.preventDefault();

			const entryName = e.target.elements['name'].value;
			const entryType = e.target.elements['type'].value;
			const entryDate = e.target.elements['date'].value;
			const entryGrade = e.target.elements['grade'].value;

			addCourseEntry(
				entryName,
				entryType,
				entryDate,
				parseFloat(entryGrade),
				id
			);
		});

		// Append Clone

		courseContainer.appendChild(courseClone);
	});
};

const getCurrentAverage = (courseEntries) => {
	const sum = courseEntries.reduce(
		(prevEntry, curEntry) => prevEntry + curEntry.grade,
		0
	);
	return courseEntries.length > 0 ? sum / courseEntries.length : 0;
};

const getNeededAverage = (courseEntries, goal, forecastSpan) => {
	const currentAverage = getCurrentAverage(courseEntries);

	// Course Entries × Current Average + Forecast Span × (Needed Average)
	// ------------------------------------------------------------------- = Goal
	// Course Entries + Forecast Span

	return (
		(forecastSpan * goal +
			goal * courseEntries.length -
			currentAverage * courseEntries.length) /
		forecastSpan
	);
};

const changeGradingScale = (useIbGradingScale) => {
	MIN_GRADE = useIbGradingScale ? 1 : 4;
	MAX_GRADE = useIbGradingScale ? 7 : 10;

	const courseGoalInput = addCourseForm.querySelector('#add-course-goal');
	courseGoalInput.setAttribute('min', MIN_GRADE);
	courseGoalInput.setAttribute('max', MAX_GRADE);
	courseGoalInput.setAttribute('step', useIbGradingScale ? 1 : 0.25);

	console.info('Using IB DP Grading Scale:', useIbGradingScale);
};

// Event Listeners

addCourseForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const courseNameInput = addCourseForm.querySelector('#add-course-name');
	const courseGoalInput = addCourseForm.querySelector('#add-course-goal');

	const courseName = courseNameInput.value.trim();
	const courseGoal = parseFloat(courseGoalInput.value);

	if (
		courseName.length > 0 &&
		courseGoal >= MIN_GRADE &&
		courseGoal <= MAX_GRADE
	) {
		addCourse(courseName, courseGoal);

		courseNameInput.value = '';
		courseGoalInput.value = '';
	}
});

ibGradingCheckbox.addEventListener('change', () => {
	useIbGradingScale = ibGradingCheckbox.checked;
	changeGradingScale(useIbGradingScale);

	saveToLocalStorage('use-ib-grading-scale', useIbGradingScale);
});

document.addEventListener('DOMContentLoaded', () => {
	ibGradingCheckbox.checked = useIbGradingScale;
	changeGradingScale(useIbGradingScale);

	renderCourses(courses);
});
