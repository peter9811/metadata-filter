/**
 * Create a new MetadataFilter instance from a given filter set.
 *
 * @param {Object} filterSet Filter set
 *
 * @return {MetadataFilter} MetadataFilter instance
 */
export function createFilter(filterSet) {
	return new MetadataFilter(filterSet);
}

/**
 * Base filter object that filters metadata fields by given filter set.
 *
 * The filter set is an object containing properties (fields) with filter
 * functions. Each field can contain a single filter function, or an array of
 * filter functions.
 *
 * The filter function is a pure function which takes a non-empty string and
 * returns a modified string.
 *
 * These filter functions will be applied to a field value passed in
 * `MetadataFilter.filterField` method.
 */
export class MetadataFilter {
	/**
	 * @constructor
	 *
	 * @param {Object} filterSet Set of filters
	 *
	 * @throws {TypeError} Throw an error if no filter set is specified
	 */
	constructor(filterSet) {
		if (!filterSet) {
			throw new TypeError('No filter set is specified!');
		}

		/** @private */
		this.mergedFilterSet = {};
		this.appendFilters(filterSet);
	}

	/**
	 * Filter the field value using filters for the given field.
	 *
	 * @param {String} field Metadata field
	 * @param {String} fieldValue Field value to be filtered
	 *
	 * @return {String} Filtered string
	 *
	 * @throws {TypeError} Throw an error if an invalid field is specified
	 */
	filterField(field, fieldValue) {
		if (!(field in this.mergedFilterSet)) {
			throw new TypeError(`Invalid filter field: ${field}`);
		}

		return this.filterText(fieldValue, this.mergedFilterSet[field]);
	}

	/**
	 * Append a new filter set.
	 *
	 * @param {Object} filterSet Set of filters
	 *
	 * @return {MetadataFilter} Current instance
	 */
	append(filterSet) {
		this.appendFilters(filterSet);
		return this;
	}

	/**
	 * Extend the filter by a filter set from a given filter.
	 *
	 * @param {Object} filter Filter object
	 *
	 * @return {MetadataFilter} Current instance
	 */
	extend(filter) {
		this.appendFilters(filter.mergedFilterSet);
		return this;
	}

	/**
	 * Check if the filter contains filter functions for a given field.
	 *
	 * @param {String} field Field to check
	 *
	 * @return {Boolean} Check result
	 */
	canFilterField(field) {
		return field in this.mergedFilterSet;
	}

	/**
	 * Return a list of fields that the filter can filter.
	 *
	 * @return {String[]} List of fields
	 */
	getFields() {
		return Object.keys(this.mergedFilterSet);
	}

	/**
	 * Filter text using given filters.
	 *
	 * @param {String} text String to be filtered
	 * @param {Function[]} filters Array of filter functions
	 *
	 * @return {String} Filtered string
	 *
	 * @private
	 */
	filterText(text, filters) {
		if (!text) {
			return text;
		}

		let filteredText = text;
		for (const filter of filters) {
			filteredText = filter(filteredText);
		}

		return filteredText;
	}

	/**
	 * Convert given filters into array of filters.
	 *
	 * @param {Function[]|Function} filters Array of filter functions or filter function
	 *
	 * @return {Function[]} Array of filter funcions
	 *
	 * @private
	 */
	createFilters(filters) {
		if (Array.isArray(filters)) {
			for (const filterFn of filters) {
				MetadataFilter.assertFilterFunctionIsValid(filterFn);
			}
			return filters;
		}

		const filterFn = filters;
		MetadataFilter.assertFilterFunctionIsValid(filterFn);

		return [filterFn];
	}

	/**
	 * Add given filters to current ones.
	 *
	 * @param {Object} filterSet Set of filters
	 *
	 * @throws {TypeError} Throw an error if a field of filter set is invalid
	 * @throws {TypeError} Throw an error if a filter function is not a function
	 *
	 * @private
	 */
	appendFilters(filterSet) {
		for (const field in filterSet) {
			if (!(field in this.mergedFilterSet)) {
				this.mergedFilterSet[field] = [];
			}

			this.mergedFilterSet[field].push(
				...this.createFilters(filterSet[field])
			);
		}
	}

	/**
	 * Throw an error if the given filter function is not a valid function.
	 *
	 * @param  {Object} fn Object to check
	 *
	 * @throws {TypeError} Throw an error if the given argument is not a function
	 *
	 * @private
	 */
	static assertFilterFunctionIsValid(fn) {
		if (typeof fn !== 'function') {
			throw new TypeError(`Invalid filter function: expected 'function', got '${typeof fn}'`);
		}
	}
}
