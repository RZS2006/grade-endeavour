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

	console.log(clone);

	const key = Date.now();

	clone.querySelector('#course').setAttribute('data-key', key);

	clone.querySelector('#course-header').addEventListener('click', (e) => {
		e.target
			.closest('#course-header')
			.nextElementSibling.classList.toggle('hidden');
	});

	clone.querySelector('#course-d-name').innerText = name;

	clone.querySelector('#course-header-ca').innerText = (0).toFixed(2);
	clone.querySelector('#course-header-aa').innerText = goal;
	clone.querySelector('#course-header-na').innerText = goal;

	clone.querySelector(
		'#course-d-current-average'
	).innerText = `Current Average: ${(0).toFixed(2)}`;
	clone.querySelector(
		'#course-d-aimed-average'
	).innerText = `Aimed Average: ${goal}`;
	clone.querySelector(
		'#course-d-needed-average'
	).innerText = `Needed Average: ${goal}`;

	clone
		.querySelector('#course-delete-link')
		.addEventListener('click', (e) => {
			deleteCourse(key);
		});

	clone
		.querySelector('#add-course-item-form')
		.addEventListener('submit', (e) => {
			e.preventDefault();

			const itemContainerCourse = e.target.closest('#course');

			const itemContainer = itemContainerCourse.querySelector(
				'#course-item-container'
			);

			const element2 = document.getElementsByTagName('template')[1];
			const clone2 = element2.content.cloneNode(true);

			console.log(clone2);

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

				deleteCourseItem(key, itemContainerCourse.dataset.key);
			});

			itemContainer.appendChild(clone2);
		});

	const object = {
		id: key,
		name,
		goal,
		courseItems: [],
	};

	courses.push(object);

	saveToLocalStorage('courses', courses);

	courseContainer.appendChild(clone);
};

const deleteCourse = (id) => {
	const courseElement = courseContainer.querySelector(`[data-key="${id}"]`);
	courseElement.remove();

	courses = courses.filter((course) => course.id !== id);

	saveToLocalStorage('courses', courses);
};

const addCourseItem = (name, type, date, grade, courseId) => {
	courses = courses.map((course) => {
		if (course.id === courseId) {
			const object = {
				name,
				type,
				date,
				grade,
			};

			return { ...course, courseItems: { ...courseItems, object } };
		} else {
			return course;
		}
	});

	saveToLocalStorage('courses', courses);
};

const deleteCourseItem = (itemId, courseId) => {
	const courseElement = courseContainer.querySelector(
		`[data-key="${courseId}"]`
	);
	const itemElement = courseElement.querySelector(`[data-key="${itemId}"]`);
	itemElement.remove();

	saveToLocalStorage('courses', courses);
};

const renderCourses = (courses) => {
	courses.forEach((course) => {
		const element = document.getElementsByTagName('template')[0];
		const clone = element.content.cloneNode(true);

		clone.querySelector('#course').setAttribute('data-key', course.id);

		clone.querySelector('#course-header').addEventListener('click', (e) => {
			e.target.nextElementSibling.classList.toggle('hidden');
		});

		clone.querySelector('#course-d-name').innerText = course.name;

		clone.querySelector('#course-header-ca').innerText = (0).toFixed(2);
		clone.querySelector('#course-header-aa').innerText = course.goal;
		clone.querySelector('#course-header-na').innerText = course.goal;

		clone.querySelector('#course-d-current-average').innerText =
			(0).toFixed(2);
		clone.querySelector('#course-d-aimed-average').innerText = course.goal;
		clone.querySelector('#course-d-needed-average').innerText = course.goal;

		clone
			.querySelector('#course-delete-link')
			.addEventListener('click', (e) => {
				deleteCourse(course.id);
			});

		clone
			.querySelector('#add-course-item-form')
			.addEventListener('submit', (e) => {
				e.preventDefault();
			});

		courseContainer.appendChild(clone);
	});
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
		addCourse(courseName, courseGoal.toFixed(2));

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
