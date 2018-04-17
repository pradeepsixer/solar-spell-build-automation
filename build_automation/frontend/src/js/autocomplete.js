import PropTypes from 'prop-types';
import React from 'react';

import Downshift from 'downshift';
import keycode from 'keycode';

import Chip from 'material-ui/Chip';
import { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';


const MAX_COUNT = 10;

/*
 * This file is a modified version of https://github.com/mui-org/material-ui/blob/e61ffeab3c432506829d118fb173b0dc336e224a/docs/src/pages/demos/autocomplete/IntegrationDownshift.js
 */

function renderInput(inputProps) {
    const { InputProps, classes, ref, ...other } = inputProps;

    return (
        <TextField InputProps={{ inputRef: ref, classes: { root: classes.inputRoot, }, ...InputProps, }} {...other} />
    );
}

function renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItem, searchKey }) {
    const isHighlighted = highlightedIndex === index;
    const isSelected = (selectedItem || '').indexOf(suggestion[searchKey]) > -1;

    return (
        <MenuItem {...itemProps} key={suggestion[searchKey]} selected={isHighlighted} component="div" style={{ fontWeight: isSelected ? 500 : 400, }}>
            {suggestion[searchKey]}
        </MenuItem>
    );
}

renderSuggestion.propTypes = {
    highlightedIndex: PropTypes.number,
    index: PropTypes.number,
    itemProps: PropTypes.object,
    selectedItem: PropTypes.string,
    suggestion: PropTypes.shape({ label: PropTypes.string }).isRequired,
};

function getSuggestions(suggestions, inputValue, maxCount, searchKey) {
    let count = 0;

    return suggestions.filter(suggestion => {
        const keep =
        (!inputValue || suggestion[searchKey].toLowerCase().indexOf(inputValue.toLowerCase()) !== -1) &&
            count < maxCount;

        if (keep) {
            count += 1;
        }

        return keep;
    });
}

class AutoCompleteWithChips extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
            selectedItem: props.selectedItem,
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            inputValue: '',
            selectedItem: props.selectedItem
        })
    }

    handleKeyDown(evt) {
        const { inputValue, selectedItem } = this.state;
        if (selectedItem.length && !inputValue.length && keycode(evt) === 'backspace') {
            this.setState({
                selectedItem: selectedItem.slice(0, selectedItem.length - 1),
            });
        }
    };

    handleInputChange(evt) {
        this.setState({ inputValue: evt.target.value });
    };

    handleChange(item) {
        let { selectedItem } = this.state;

        if (selectedItem.indexOf(item) === -1) {
            if (this.props.onAddition) {
                var selectedSuggestion = null;
                for (var i=0; i<this.props.suggestions.length; i++) {
                    if(this.props.suggestions[i][this.props.searchKey] == item) {
                        selectedSuggestion = this.props.suggestions[i];
                        break;
                    }
                }
                this.props.onAddition(selectedSuggestion);
            } else {
                selectedItem = [...selectedItem, item];
                this.setState({inputValue: '', selectedItem});
            }
        }
    };

    handleDelete(item) {
        if (this.props.onDeletion) {
            var removedChip = null;
            for (var i=0; i<this.props.suggestions.length; i++) {
                if(this.props.suggestions[i][this.props.searchKey] == item) {
                    removedChip = this.props.suggestions[i];
                }
            }
            this.props.onDeletion(removedChip);
        } else {
            const selectedItem = [...this.state.selectedItem];
            selectedItem.splice(selectedItem.indexOf(item), 1);
            this.setState({ selectedItem });
        }
    };

    render() {
        const { classes } = this.props;
        const { inputValue, selectedItem } = this.state;

        return (
            <Downshift inputValue={inputValue} onChange={this.handleChange} selectedItem={selectedItem}>
                {({
                getInputProps,
                getItemProps,
                isOpen,
                inputValue: inputValue2,
                selectedItem: selectedItem2,
                highlightedIndex,
                }) => (
                    <div className={classes.container}>
                        {
                            renderInput({
                                fullWidth: true,
                                classes,
                                InputProps: getInputProps({
                                startAdornment: selectedItem.map(item => (
                                    <Chip
                                        key={item}
                                        tabIndex={-1}
                                        label={item}
                                        className={classes.chip}
                                        onDelete={evt => this.handleDelete(item)}
                                    />
                                )),
                                onChange: this.handleInputChange,
                                onKeyDown: this.handleKeyDown,
                                placeholder: this.props.placeholder,
                                id: this.props.id,
                                required: this.props.required,
                                error: this.props.errorMsg ? true : false
                                }),
                            })
                        }
                        {
                            isOpen ? (
                                <Paper className={classes.paper} square>
                                    {
                                        getSuggestions(this.props.suggestions, inputValue2, this.props.maxCount || MAX_COUNT, this.props.searchKey).map((suggestion, index) =>
                                            renderSuggestion({
                                                suggestion,
                                                index,
                                                itemProps: getItemProps({ item: suggestion[this.props.searchKey] }),
                                                highlightedIndex,
                                                selectedItem: selectedItem2,
                                                searchKey: this.props.searchKey || 'label',
                                            }),
                                        )
                                    }
                                    {
                                        this.props.onAddNew && this.state.inputValue.length > 0 &&
                                            <MenuItem style={{ backgroundColor: '#3F51B5', color: 'white' }} onClick={evt=>this.props.onAddNew(this.state.inputValue)} selected={true} component="div">
                                                Add New
                                            </MenuItem>
                                    }
                                </Paper>
                            ) : null
                        }
                    </div>
                )}
            </Downshift>
        );
    }
}

AutoCompleteWithChips.propTypes = {
    classes: PropTypes.object.isRequired,
    suggestions: PropTypes.array,
    onAddition: PropTypes.func,
    onDeletion: PropTypes.func,
    onAddNew: PropTypes.func,
    required: PropTypes.bool,
    errorMsg: PropTypes.string
};

AutoCompleteWithChips.defaultProps = {
    required: false,
    errorMsg: null
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: 250,
  },
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  inputRoot: {
    flexWrap: 'wrap',
  },
});

export default withStyles(styles)(AutoCompleteWithChips);
