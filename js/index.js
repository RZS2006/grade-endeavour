import { fetchFromLocalStorage, saveToLocalStorage } from './local-storage.js';
import {
	getWeightSum,
	getCurrentAverage,
	getNeededAverage,
} from './averages.js';
import {
	CONSTANTS,
	getScaleByName,
	getScaleByBoolean,
} from './grading-scale.js';
import {
	emptyElement,
	cloneTemplate,
	setInnerText,
	addClass,
	isBetween,
	capitalizeString,
	formatDate,
	getArrayLengthText,
} from './utilities.js';

// Constants

const addCourseForm = document.querySelector('#add-course-form');
const addCourseFormName = document.querySelector('#add-course-name');
const addCourseFormGoal = document.querySelector('#add-course-goal');
const ibGradingCheckbox = document.querySelector('#use-ib-grading-checkbox');
const courseContainer = document.querySelector('#course-container');

let MIN_GRADE = getScaleByName(CONSTANTS.DEFAULT).min;
let MAX_GRADE = getScaleByName(CONSTANTS.DEFAULT).max;
let GRADE_STEP = getScaleByName(CONSTANTS.DEFAULT).step;

// const MIN_FORECAST_SPAN = 1;
// const MAX_FORECAST_SPAN = 10;

// let MIN_WEIGHT_POINTS = 1;
// let MAX_WEIGHT_POINTS = 9999;

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

const addCourse = ({ name, goal, useIbGradingScale }) => {
	courses.push({
		id: Date.now(),
		name,
		goal,
		useIbGradingScale,
		isOpen: false,
		tolerance: 0,
		weightPoints: 1,
		courseEntries: [],
	});

	saveAndRenderCourses(courses);
};

const deleteCourse = (courseId) => {
	courses = courses.filter((course) => course.id !== courseId);

	saveAndRenderCourses(courses);
};

const addCourseEntry = ({ name, type, date, grade, weight }, courseId) => {
	findCourseById(courseId, (course) => {
		course.courseEntries.push({
			id: Date.now(),
			name,
			type,
			date,
			grade,
			weight,
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

// const changeForecastSpan = (courseId, value) => {
// 	findCourseById(courseId, (course) => {
// 		course.forecastSpan = value;
// 	});

// 	saveAndRenderCourses(courses);
// };

const changeTolerance = (courseId, value) => {
	findCourseById(courseId, (course) => {
		course.tolerance = value;
	});

	saveAndRenderCourses(courses);
};

const changeWeightPoints = (courseId, value) => {
	findCourseById(courseId, (course) => {
		course.weightPoints = value;
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
		getArrayLengthText(courses, 'course', 'courses')
	);

	courses.forEach((course) => {
		const {
			id: courseId,
			name,
			goal,
			courseEntries,
			tolerance = 1,
			weightPoints = 1,
			isOpen = false,
			useIbGradingScale = false,
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

		const currentAverage = getCurrentAverage(courseEntries);
		const neededAverage = getNeededAverage({
			courseEntries,
			goal,
			tolerance,
			weightPoints,
		});
		const aimedAverage = goal - tolerance;

		const displayedCurrentAverage = currentAverage.toFixed(2);
		const displayedNeededAverage =
			currentAverage <= aimedAverage ? neededAverage.toFixed(2) : '-';
		const displayedAimedAverage =
			goal === aimedAverage
				? aimedAverage.toFixed(2)
				: `${goal.toFixed(2)} ~ ${aimedAverage.toFixed(2)}`;

		setInnerText(courseClone, '#course-header-ca', displayedCurrentAverage);
		setInnerText(courseClone, '#course-header-aa', displayedAimedAverage);
		setInnerText(courseClone, '#course-header-na', displayedNeededAverage);

		setInnerText(
			courseClone,
			'#course-details-ca',
			displayedCurrentAverage
		);
		setInnerText(courseClone, '#course-details-aa', displayedAimedAverage);
		setInnerText(courseClone, '#course-details-na', displayedNeededAverage);

		// Forecast Input

		// const forecastSpanInput = courseClone.querySelector('#forecast-span');

		// forecastSpanInput.value = forecastSpan;

		// forecastSpanInput.addEventListener('change', (e) => {
		// 	const value = parseInt(e.target.value);

		// 	if (isBetween(value, MIN_FORECAST_SPAN, MAX_FORECAST_SPAN)) {
		// 		changeForecastSpan(courseId, value);
		// 	} else {
		// 		forecastSpanInput.value =
		// 			value > MAX_FORECAST_SPAN
		// 				? MAX_FORECAST_SPAN
		// 				: MIN_FORECAST_SPAN;
		// 		changeForecastSpan(courseId, parseInt(forecastSpanInput.value));
		// 	}
		// });

		// Tolerance Input

		const toleranceInput = courseClone.querySelector('#tolerance');

		toleranceInput.value = tolerance;

		const COURSE_MIN_GRADE = getScaleByBoolean(useIbGradingScale).min;
		const COURSE_MAX_GRADE = getScaleByBoolean(useIbGradingScale).max;

		const TOLERANCE_MAX = Math.abs(goal - COURSE_MIN_GRADE);
		const TOLERANCE_MIN = Math.abs(COURSE_MAX_GRADE - goal) * -1;

		toleranceInput.setAttribute('min', TOLERANCE_MIN);
		toleranceInput.setAttribute('max', TOLERANCE_MAX);

		toleranceInput.addEventListener('change', (e) => {
			const COURSE_MIN_GRADE = getScaleByBoolean(useIbGradingScale).min;
			const COURSE_MAX_GRADE = getScaleByBoolean(useIbGradingScale).max;

			const value = parseFloat(e.target.value);

			const TOLERANCE_MAX = Math.abs(goal - COURSE_MIN_GRADE);
			const TOLERANCE_MIN = Math.abs(COURSE_MAX_GRADE - goal) * -1;

			if (isBetween(value, TOLERANCE_MIN, TOLERANCE_MAX)) {
				changeTolerance(courseId, value);
			} else {
				toleranceInput.value =
					value > TOLERANCE_MAX ? TOLERANCE_MAX : TOLERANCE_MIN;
				changeTolerance(courseId, parseFloat(toleranceInput.value));
			}
		});

		// Weight Points Input

		const weightPointsInput = courseClone.querySelector('#weight-points');

		weightPointsInput.value = weightPoints;

		const MIN_WEIGHT_POINTS = getWeightSum(courseEntries) + 1;
		const MAX_WEIGHT_POINTS = 9999;

		weightPointsInput.setAttribute('min', MIN_WEIGHT_POINTS);
		weightPointsInput.setAttribute('max', MAX_WEIGHT_POINTS);

		if (!isBetween(weightPoints, MIN_WEIGHT_POINTS, MAX_WEIGHT_POINTS)) {
			return changeWeightPoints(
				courseId,
				weightPoints > MAX_WEIGHT_POINTS
					? MAX_WEIGHT_POINTS
					: MIN_WEIGHT_POINTS
			);
		}

		weightPointsInput.addEventListener('change', (e) => {
			const value = parseInt(e.target.value);

			if (isBetween(value, MIN_WEIGHT_POINTS, MAX_WEIGHT_POINTS)) {
				changeWeightPoints(courseId, value);
			} else {
				weightPointsInput.value =
					value > MAX_WEIGHT_POINTS
						? MAX_WEIGHT_POINTS
						: MIN_WEIGHT_POINTS;
				changeWeightPoints(courseId, parseInt(weightPointsInput.value));
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
		courseEntryGradeInput.setAttribute(
			'min',
			getScaleByBoolean(useIbGradingScale).min
		);
		courseEntryGradeInput.setAttribute(
			'max',
			getScaleByBoolean(useIbGradingScale).max
		);
		courseEntryGradeInput.setAttribute(
			'step',
			getScaleByBoolean(useIbGradingScale).step
		);

		const courseEntryWeightInput = courseClone.querySelector(
			'#course-item-weight'
		);
		courseEntryWeightInput.setAttribute(
			'max',
			9999 - 1 - getWeightSum(courseEntries)
		);

		if (courseEntries.length === 0) {
			addClass(courseClone, '#course-entry-table', 'hidden');
		}

		setInnerText(
			courseClone,
			'#course-entry-count',
			getArrayLengthText(courseEntries, 'course entry', 'course entries')
		);

		// Render Course Entries

		courseEntries
			.sort((entryA, entryB) => {
				return new Date(entryA.date) - new Date(entryB.date);
			})
			.forEach((entry) => {
				const {
					id: entryId,
					name,
					type,
					date,
					grade,
					weight = 1,
				} = entry;

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
				setInnerText(courseEntryClone, '#course-entry-weight', weight);

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
			const entryWeight = e.target.elements['weight'].value;

			addCourseEntry(
				{
					name: entryName,
					type: entryType,
					date: entryDate,
					grade: parseFloat(entryGrade),
					weight: parseInt(entryWeight),
				},
				courseId
			);
		});

		// Append Clone

		courseContainer.appendChild(courseClone);
	});
};

const changeGradingScale = (useIbGradingScale) => {
	MIN_GRADE = getScaleByBoolean(useIbGradingScale).min;
	MAX_GRADE = getScaleByBoolean(useIbGradingScale).max;
	GRADE_STEP = getScaleByBoolean(useIbGradingScale).step;

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
		addCourse({ name: courseName, goal: courseGoal, useIbGradingScale });

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
