export const getCurrentAverage = (courseEntries) => {
	const sum = courseEntries.reduce(
		(prevEntry, curEntry) => prevEntry + curEntry.grade,
		0
	);

	return courseEntries.length > 0 ? sum / courseEntries.length : 0;
};

export const getNeededAverage = (entries, goal, forecast, tolerance) => {
	const current = getCurrentAverage(entries);
	const length = entries.length;

	// Course Entries × Current Average + Forecast Span × [[Needed Average]]
	// --------------------------------------------------------------------- = Goal - Tolerance
	// Course Entries + Forecast Span

	return (
		(length * goal +
			forecast * goal -
			length * tolerance -
			forecast * tolerance -
			length * current) /
		forecast
	);
};
