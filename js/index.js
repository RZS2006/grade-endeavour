const addCourseForm = document.querySelector('#add-course-form');
const courseContainer = document.querySelector('#course-container');

const addCourse = (name, goal) => {
	const node = document.createElement('div');
	const textnode = document.createTextNode(`${name}: ${goal}`);
	node.appendChild(textnode);
	courseContainer.appendChild(node);
};

const deleteCourse = (id) => {
	return;
};

const addCourseItem = (name, type, date, grade, courseId) => {
	return;
};

const deleteCourseItem = (itemId, courseId) => {
	return;
};

addCourseForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const courseName = addCourseForm.querySelector('#course-name').value;
	const courseGoal = parseFloat(
		addCourseForm.querySelector('#course-goal').value
	);

	if (courseName.length > 0 && courseGoal >= 4 && courseGoal <= 10) {
		addCourse(courseName, courseGoal);
		console.log(`${courseName}: ${courseGoal}`);
	}
});
