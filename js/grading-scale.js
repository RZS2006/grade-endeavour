export const GRADING_SCALES = {
	default: {
		max: 10,
		min: 4,
		step: 0.25,
	},
	ib: {
		max: 7,
		min: 1,
		step: 1,
	},
};

export const CONSTANTS = {
	DEFAULT: 'default',
	IB: 'ib',
};

export const getScaleByName = (name) => {
	return GRADING_SCALES[name];
};

export const getScaleByBoolean = (useIbGradingScale) => {
	return GRADING_SCALES[useIbGradingScale ? 'ib' : 'default'];
};
