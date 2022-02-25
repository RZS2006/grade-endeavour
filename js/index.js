import { fetchFromLocalStorage, saveToLocalStorage } from './local-storage.js';
import { getCurrentAverage, getNeededAverage } from './averages.js';
import {
	emptyElement,
	cloneTemplate,
	setInnerText,
	addClass,
	isBetween,
	capitalizeString,
	formatDate,
} from './utilities.js';

// Constants

const addCourseForm = document.querySelector('#add-course-form');
const addCourseFormName = document.querySelector('#add-course-name');
const addCourseFormGoal = document.querySelector('#add-course-goal');
const ibGradingCheckbox = document.querySelector('#use-ib-grading-checkbox');
const courseContainer = document.querySelector('#course-container');

let MIN_GRADE = 4;
let MAX_GRADE = 10;
let GRADE_STEP = 0.25;

const MIN_FORECAST_SPAN = 1;
const MAX_FORECAST_SPAN = 10;

let courses = fetchFromLocalStorage('courses', []);
let useIbGradingScale = fetchFromLocalStorage('use-ib-grading-scale', false);

// Functions

const findCourseById = (id, callback) => {
	const course = courses.find((course) => course.id === id);
	if (course) {
		callback(course);
	}
};

const saveAndRenderCourses = (courses) => {
	saveToLocalStorage('courses', courses);
	renderCourses(courses);
};

const addCourse = (name, goal, useIbGradingScale) => {
	courses.push({
		id: Date.now(),
		name,
		goal,
		useIbGradingScale,
		isOpen: false,
		forecastSpan: 1,
		courseEntries: [],
	});

	saveAndRenderCourses(courses);
};

const deleteCourse = (courseId) => {
	courses = courses.filter((course) => course.id !== courseId);

	saveAndRenderCourses(courses);
};

const addCourseEntry = (name, type, date, grade, courseId) => {
	findCourseById(courseId, (course) => {
		course.courseEntries.push({
			id: Date.now(),
			name,
			type,
			date,
			grade,
		});
	});

	saveAndRenderCourses(courses);
};

const deleteCourseEntry = (entryId, courseId) => {
	findCourseById(courseId, (course) => {
		course.courseEntries = course.courseEntries.filter(
			(entry) => entry.id !== entryId
		);
	});

	saveAndRenderCourses(courses);
};

const changeForecastSpan = (courseId, value) => {
	findCourseById(courseId, (course) => {
		course.forecastSpan = value;
	});

	saveAndRenderCourses(courses);
};

const changeDropdownOpen = (courseId, value) => {
	findCourseById(courseId, (course) => {
		course.isOpen = value || !course.isOpen;
	});

	saveAndRenderCourses(courses);
};

const renderCourses = (courses) => {
	emptyElement(courseContainer);

	setInnerText(
		document,
		'#courses-count',
		`${courses.length} course${courses.length === 1 ? '' : 's'}`
	);

	courses.forEach((course) => {
		const {
			id: courseId,
			name,
			goal,
			courseEntries,
			forecastSpan,
			isOpen,
			useIbGradingScale,
		} = course;

		const courseClone = cloneTemplate('#template-course');

		courseClone.querySelector('#course').setAttribute('data-key', courseId);

		courseClone
			.querySelector('#course-header')
			.addEventListener('click', () => changeDropdownOpen(courseId));

		if (!isOpen) {
			addClass(courseClone, '#course-body', 'hidden');
		}

		if (!useIbGradingScale) {
			addClass(courseClone, '#ib-grading-pill', 'hidden');
		}

		setInnerText(courseClone, '#course-details-name', name);

		const currentAverage = getCurrentAverage(courseEntries).toFixed(2);
		const neededAverage = getNeededAverage(
			courseEntries,
			goal,
			forecastSpan
		).toFixed(2);
		const aimedAverage = goal.toFixed(2);

		const displayedNeededAverage =
			currentAverage <= aimedAverage ? neededAverage : '-';

		setInnerText(courseClone, '#course-header-ca', currentAverage);
		setInnerText(courseClone, '#course-header-aa', aimedAverage);
		setInnerText(courseClone, '#course-header-na', displayedNeededAverage);

		setInnerText(
			courseClone,
			'#course-details-ca',
			`Current: ${currentAverage}`
		);
		setInnerText(
			courseClone,
			'#course-details-aa',
			`Aimed: ${aimedAverage}`
		);
		setInnerText(
			courseClone,
			'#course-details-na',
			`Needed: ${displayedNeededAverage}`
		);

		const forecastSpanInput = courseClone.querySelector('#forecast-span');

		forecastSpanInput.value = forecastSpan;
		forecastSpanInput.addEventListener('change', (e) => {
			const value = parseInt(e.target.value);

			if (isBetween(value, MIN_FORECAST_SPAN, MAX_FORECAST_SPAN)) {
				changeForecastSpan(courseId, value);
			}
		});

		// Delete Course Link

		courseClone
			.querySelector('#course-delete-link')
			.addEventListener('click', () => deleteCourse(courseId));

		const courseEntryContainer = courseClone.querySelector(
			'#course-entry-container'
		);

		const courseEntryGradeInput =
			courseClone.querySelector('#course-item-grade');
		courseEntryGradeInput.setAttribute('min', useIbGradingScale ? 1 : 4);
		courseEntryGradeInput.setAttribute('max', useIbGradingScale ? 7 : 10);
		courseEntryGradeInput.setAttribute(
			'step',
			useIbGradingScale ? 1 : 0.25
		);

		if (courseEntries.length === 0) {
			addClass(courseClone, '#course-entry-table', 'hidden');
		}

		setInnerText(
			courseClone,
			'#course-entry-count',
			`${courseEntries.length} course entr${
				courseEntries.length === 1 ? 'y' : 'ies'
			}`
		);

		// Render Course Entries

		courseEntries
			.sort((entryA, entryB) => {
				return new Date(entryA.date) - new Date(entryB.date);
			})
			.forEach((entry) => {
				const { id: entryId, name, type, date, grade } = entry;

				const courseEntryClone = cloneTemplate(
					'#template-course-entry'
				);

				courseEntryClone
					.querySelector('#course-item-row')
					.setAttribute('data-key', entryId);

				setInnerText(courseEntryClone, '#course-entry-name', name);
				setInnerText(
					courseEntryClone,
					'#course-entry-type',
					capitalizeString(type)
				);
				setInnerText(
					courseEntryClone,
					'#course-entry-date',
					formatDate(date)
				);
				setInnerText(
					courseEntryClone,
					'#course-entry-grade',
					grade.toFixed(2)
				);

				// Delete Course Entry

				courseEntryClone
					.querySelector('#course-entry-delete')
					.addEventListener('click', () =>
						deleteCourseEntry(entryId, courseId)
					);

				courseEntryContainer.appendChild(courseEntryClone);
			});

		// Add Course Entry

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
				courseId
			);
		});

		// Append Clone

		courseContainer.appendChild(courseClone);
	});
};

// TODO: EXTRACT

const changeGradingScale = (useIbGradingScale) => {
	MIN_GRADE = useIbGradingScale ? 1 : 4;
	MAX_GRADE = useIbGradingScale ? 7 : 10;
	GRADE_STEP = useIbGradingScale ? 1 : 0.25;

	addCourseFormGoal.setAttribute('min', MIN_GRADE);
	addCourseFormGoal.setAttribute('max', MAX_GRADE);
	addCourseFormGoal.setAttribute('step', GRADE_STEP);

	console.info('Using IB DP Grading Scale:', useIbGradingScale);
};

// Event Listeners

addCourseForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const courseName = addCourseFormName.value.trim();
	const courseGoal = parseFloat(addCourseFormGoal.value);

	if (courseName.length > 0 && isBetween(courseGoal, MIN_GRADE, MAX_GRADE)) {
		addCourse(courseName, courseGoal, useIbGradingScale);

		addCourseFormName.value = '';
		addCourseFormGoal.value = '';
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
