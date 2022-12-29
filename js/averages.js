export const getGradeSum = (courseEntries) => {
	return courseEntries.reduce(
		(accumulator, entry) => accumulator + entry.grade * entry.weight,
		0
	);
};

export const getWeightSum = (courseEntries) => {
	return courseEntries.reduce(
		(accumulator, entry) => accumulator + entry.weight,
		0
	);
};

export const getCurrentAverage = (courseEntries) => {
	const gradeSum = getGradeSum(courseEntries);
	const weightSum = getWeightSum(courseEntries);

	return courseEntries.length > 0 ? gradeSum / weightSum : 0;
};

export const getNeededAverage = ({
	courseEntries,
	goal,
	tolerance,
	weightPoints,
}) => {
	const gradeSum = getGradeSum(courseEntries);
	const weightSum = getWeightSum(courseEntries);

	const weightLeft = weightPoints - weightSum;
	const aimedAverage = goal - tolerance;

	const neededAverage = (aimedAverage * weightPoints - gradeSum) / weightLeft;

	// Grade Sum + (Weight Points - Weight Sum) * [[Needed Average]]
	// -------------------------------------------------------------- = Goal - Tolerance
	// Weight Points

	return neededAverage;
};
