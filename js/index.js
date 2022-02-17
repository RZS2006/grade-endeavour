import { fetchFromLocalStorage, saveToLocalStorage } from './local-storage.js';

const addCourseForm = document.querySelector('#add-course-form');
const courseContainer = document.querySelector('#course-container');

let courses = fetchFromLocalStorage('courses', []);

const addCourse = (name, goal) => {
	const element = document.getElementsByTagName('template')[0];
	const clone = element.content.cloneNode(true);

	const key = Date.now();

	clone.querySelector('#course').setAttribute('data-key', key);

	clone.querySelector('#course-header').addEventListener('click', (e) => {
		e.target.nextElementSibling.classList.toggle('hidden');
	});

	clone.querySelector('#course-d-name').innerText = name;

	clone.querySelector('#course-header-ca').innerText = (0).toFixed(2);
	clone.querySelector('#course-header-aa').innerText = goal;
	clone.querySelector('#course-header-na').innerText = goal;

	clone.querySelector('#course-d-current-average').innerText = (0).toFixed(2);
	clone.querySelector('#course-d-aimed-average').innerText = goal;
	clone.querySelector('#course-d-needed-average').innerText = goal;

	clone
		.querySelector('#course-delete-link')
		.addEventListener('click', (e) => {
			const parent = e.target.closest('#course');
			const key = parent.dataset.key;

			deleteCourse(key);
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
	return;
};

const deleteCourseItem = (itemId, courseId) => {
	return;
};

addCourseForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const courseNameInput = addCourseForm.querySelector('#add-course-name');
	const courseGoalInput = addCourseForm.querySelector('#add-course-goal');

	const courseName = courseNameInput.value;
	const courseGoal = parseFloat(courseGoalInput.value);

	if (courseName.length > 0 && courseGoal >= 4 && courseGoal <= 10) {
		addCourse(courseName, courseGoal.toFixed(2));

		courseNameInput.value = '';
		courseGoalInput.value = '';
	}
});
