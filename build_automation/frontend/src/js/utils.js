/*
 *  This builds a map from an array of objects.
 */
export function buildMapFromArray(array, key) {
    const retval = {};
    array.forEach(currObj => {
            retval[currObj[key]] = currObj;
    });
    return retval;
}
