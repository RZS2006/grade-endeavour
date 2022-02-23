export const getCurrentAverage = (courseEntries) => {
	const sum = courseEntries.reduce(
		(prevEntry, curEntry) => prevEntry + curEntry.grade,
		0
	);

	return courseEntries.length > 0 ? sum / courseEntries.length : 0;
};

export const getNeededAverage = (courseEntries, goal, forecastSpan) => {
	const currentAverage = getCurrentAverage(courseEntries);

	// Course Entries × Current Average + Forecast Span × [[Needed Average]]
	// --------------------------------------------------------------------- = Goal
	// Course Entries + Forecast Span

	return (
		(forecastSpan * goal +
			goal * courseEntries.length -
			currentAverage * courseEntries.length) /
		forecastSpan
	);
};
