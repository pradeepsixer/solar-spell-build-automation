/*
 * This function converts a valid filter criteria string with only one operator joining all the tags into a list of tags and the operator.
 * For example, for the input '((1 OR 2) OR 3)', the output will be
 *      {
 *          operator: 'OR',
 *          tags: [1, 2, 3]
 *      }
 */
export function parse_filter_criteria_string(filter_criteria_string) {
    const expression_regex = /((?:\d+)|[()]|(?:OR)|(?:AND))/g
    const matching_tokens = filter_criteria_string.match(expression_regex)
    if (matching_tokens) {
        const tagIds = [];
        var operator = null;
        var token = null;
        for (var i=0; i<matching_tokens.length; i++){
            token = matching_tokens[i];
            if (token == 'AND' || token == 'OR') {
                operator = token;
            } else if (token.match(/\d+/g)) {
                tagIds.push(parseInt(token));
            }
        }
        return {
            operator: operator ? operator : 'AND',
            tags: tagIds
        }
    }
    return null;
}

/*
 * This function coverts a list of tags into the filter criteria string using the specific operator.
 * For example, for inputs tags=[1, 2, 3] and operator='AND', the result will be
 * `((1 AND 2) AND 3)`
 */
export function convert_tags_to_filter_criteria_string(tags, operator) {
    if (tags.length == 0) {
        return null;
    } else {
        var filter_criteria_string = '';
        var stack = [];
        for (var i=0; i<tags.length; i++) {
            stack.push(tags[i].id);
            if (stack.length > 1) {
                var secondOperand = stack.pop();
                var firstOperand = stack.pop();
                stack.push('(' + firstOperand + ' ' + operator + ' ' + secondOperand + ')');
            }
        }
        return stack.pop() + '';
    }
}
