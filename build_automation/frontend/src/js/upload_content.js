import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
import AutoCompleteWithChips from './autocomplete.js';
import TextField from 'material-ui/TextField';
import { DatePicker } from 'material-ui-pickers';
import {APP_URLS} from "./url";
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import {ChevronLeft, ChevronRight} from 'material-ui-icons';
import axios from 'axios';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
});


class UploadContent extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            description: "",
            selectedCreators: [],
            selectedCoverage: [],
            selectedSubjects: [],
            selectedKeywords: [],
            selectedWorkareas: [],
            selectedLanguage: [],
            selectedCataloger: [],
            fieldErrors: {},
            updatedTime: '',
            selectedDate: new Date(),
            source: "",
            copyright: "",
            rightsStatement: "",
        };
        this.handleDateChange=this.handleDateChange.bind(this);
        this.handleTagAddition=this.handleTagAddition.bind(this);
        this.handleCreatorAddition=this.handleCreatorAddition.bind(this);
        this.handleCoverageAddition=this.handleCoverageAddition.bind(this);
        this.handleSubjectAddition=this.handleSubjectAddition.bind(this);
        this.handleKeywordAddition=this.handleKeywordAddition.bind(this);
        this.handleWorkareaAddition=this.handleWorkareaAddition.bind(this);
        this.handleLanguageAddition=this.handleLanguageAddition.bind(this);
        this.handleCatalogerAddition=this.handleCatalogerAddition.bind(this);
        this.handleTagDeletion=this.handleTagDeletion.bind(this);
        this.handleCreatorDeletion=this.handleCreatorDeletion.bind(this);
        this.handleCoverageDeletion=this.handleCoverageDeletion.bind(this);
        this.handleSubjectDeletion=this.handleSubjectDeletion.bind(this);
        this.handleKeywordDeletion=this.handleKeywordDeletion.bind(this);
        this.handleWorkareaDeletion=this.handleWorkareaDeletion.bind(this);
        this.handleLanguageDeletion=this.handleLanguageDeletion.bind(this);
        this.handleCatalogerDeletion=this.handleCatalogerDeletion.bind(this);
    }
    componentDidMount() {
        // this.loadData()
    }
    loadData() {
        const currInstance = this;
        axios.get(APP_URLS.TAG_LIST, {
            responseType: 'json'
        }).then(function (response) {
            currInstance.setState({
                tags: response.data
            })
        }).catch(function (error) {
            console.log(error);
            // TODO : Show the error message.
        });
    }
    handleTextFieldUpdate(stateProperty, evt) {
        const targetVal = evt.target.value;
        this.setState((prevState, props) => {
            const newState = {
                fieldErrors: prevState.fieldErrors,
                [stateProperty]: targetVal
            };
            newState.fieldErrors[stateProperty] = null;
            return newState;
        })
    }
    handleDateChange(date){
        this.setState({ selectedDate: date });
    };
    handleTagAddition(tag, tagType){
        console.log('Oh No!!!!!');
        this.setState((prevState, props) => {
            const tagKey = 'selected' + tagType;
            const selectedTags = prevState[tagKey];
            const fieldErrors = prevState.fieldErrors;
            selectedTags.push(tag.name);
            fieldErrors[tagType] = null;
            const value = {[tagKey]: selectedTags, fieldErrors};
            console.log('Here\'s the value of \'value!', value);
            return value;
        })
    }
    handleTagDeletion(tag, tagType){
        console.log('Oh No!!!!!');
        this.setState((prevState, props) => {
            const tagKey = 'selected' + tagType;
            const selectedTags = prevState[tagKey];
            selectedTags.splice(tag.name, 1);
            const value = {[tagKey]: selectedTags};
            console.log('Here\'s the value of \'value!', value);
            return value;
        })
    }
    handleCreatorAddition(creator){
        this.handleTagAddition(creator, 'Creators')
    }
    handleCoverageAddition(coverage){
        this.handleTagAddition(coverage, 'Coverage')
    }
    handleSubjectAddition(subject){
        this.handleTagAddition(subject, 'Subjects')
    }
    handleKeywordAddition(keyword){
        this.handleTagAddition(keyword, 'Keywords')
    }
    handleWorkareaAddition(workarea){
        this.handleTagAddition(workarea, 'Workareas')
    }
    handleLanguageAddition(language){
        this.handleTagAddition(language, 'Language')
    }
    handleCatalogerAddition(cataloger){
        this.handleTagAddition(cataloger, 'Cataloger')
    }
    handleCreatorDeletion(creator){
        this.handleTagDeletion(creator, 'Creators')
    }
    handleCoverageDeletion(coverage){
        this.handleTagDeletion(coverage, 'Coverage')
    }
    handleSubjectDeletion(subject){
        this.handleTagDeletion(subject, 'Subjects')
    }
    handleKeywordDeletion(keyword){
        this.handleTagDeletion(keyword, 'Keywords')
    }
    handleWorkareaDeletion(workarea){
        this.handleTagDeletion(workarea, 'Workareas')
    }
    handleLanguageDeletion(language){
        this.handleTagDeletion(language, 'Language')
    }
    handleCatalogerDeletion(cataloger){
        this.handleTagDeletion(cataloger, 'Cataloger')
    }

    render(){
        return (
            <Grid item xs={8}>
                <AppBar position="static" style={{ height: '50px', margin: 'auto'}}>
                    <Typography gutterBottom variant="subheading" style={{color: '#ffffff'}}>

                    </Typography>
                </AppBar>
                <div style={{marginTop: '20px'}}> </div>

                <TextField
                    id="name"
                    label="Name"
                    value={this.state.name}
                    required={true}
                    error={this.state.fieldErrors.name ? true : false}
                    onChange={evt => this.handleTextFieldUpdate('name', evt)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    id="description"
                    label="Description"
                    multiline
                    fullWidth
                    required={true}
                    error={this.state.fieldErrors.description ? true : false}
                    value={this.state.description}
                    onChange={evt => this.handleTextFieldUpdate('description', evt)}
                    margin="normal"
                />
                <div style={{marginTop: '20px'}}> </div>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker
                        id="updated_date"
                        label="Last Updated:"
                        value={this.state.selectedDate}
                        onChange={this.handleDateChange}
                        leftArrowIcon={<ChevronLeft/>}
                        rightArrowIcon={<ChevronRight/>}
                    />
                </MuiPickersUtilsProvider>
                <div style={{marginTop: '20px'}}> </div>
                <Typography gutterBottom variant="subheading">
                    Creator(s)
                </Typography>
                <span>
                            <AutoCompleteWithChips suggestions={this.props.allTags['creators']}
                                                   searchKey={'name'} selectedItem={this.state.selectedCreators}
                                                   onAddition={this.handleCreatorAddition} onDeletion={this.handleCreatorDeletion}/>
                        </span>
                <div style={{marginTop: '20px'}}> </div>
                <Typography gutterBottom variant="subheading">
                    Coverage
                </Typography>
                <span>
                            <AutoCompleteWithChips suggestions={this.props.allTags['coverages']}
                                                   searchKey={'name'} selectedItem={this.state.selectedCoverage}
                                                   onAddition={this.handleCoverageAddition} onDeletion={this.handleCoverageDeletion}/>
                        </span>
                <div style={{marginTop: '20px'}}> </div>
                <Typography gutterBottom variant="subheading">
                    Subject(s)
                </Typography>
                <span>
                            <AutoCompleteWithChips suggestions={this.props.allTags['subjects']}
                                                   searchKey={'name'} selectedItem={this.state.selectedSubjects}
                                                   onAddition={this.handleSubjectAddition} onDeletion={this.handleSubjectDeletion}/>
                        </span>
                <div style={{marginTop: '20px'}}> </div>
                <Typography gutterBottom variant="subheading">
                    Keywords
                </Typography>
                <span>
                            <AutoCompleteWithChips suggestions={this.props.allTags['keywords']}
                                                   searchKey={'name'} selectedItem={this.state.selectedKeywords}
                                                   onAddition={this.handleKeywordAddition} onDeletion={this.handleKeywordDeletion}/>
                        </span>
                <div style={{marginTop: '20px'}}> </div>
                <Typography gutterBottom variant="subheading">
                    Work Area(s)
                </Typography>
                <span>
                            <AutoCompleteWithChips suggestions={this.props.allTags['workareas']}
                                                   searchKey={'name'} selectedItem={this.state.selectedWorkareas}
                                                   onAddition={this.handleWorkareaAddition} onDeletion={this.handleWorkareaDeletion}/>
                        </span>
                <div style={{marginTop: '20px'}}> </div>
                <Typography gutterBottom variant="subheading">
                    Language
                </Typography>
                <span>
                            <AutoCompleteWithChips suggestions={this.props.allTags['languages']}
                                                   searchKey={'name'} selectedItem={this.state.selectedLanguage}
                                                   onAddition={this.handleLanguageAddition} onDeletion={this.handleLanguageDeletion}/>
                        </span>
                <div style={{marginTop: '20px'}}> </div>
                <Typography gutterBottom variant="subheading">
                    Cataloger
                </Typography>
                <span>
                            <AutoCompleteWithChips suggestions={this.props.allTags['catalogers']} searchKey={'name'}
                                                   selectedItem={this.state.selectedCataloger}
                                                   onAddition={this.handleCatalogerAddition} onDeletion={this.handleCatalogerDeletion}/>
                        </span>
                <TextField
                    id="source"
                    label="Source"
                    value={this.state.source}
                    required={true}
                    error={this.state.fieldErrors.source ? true : false}
                    onChange={evt => this.handleTextFieldUpdate('source', evt)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    id="copyright"
                    label="Copyright"
                    value={this.state.copyright}
                    required={true}
                    error={this.state.fieldErrors.copyright ? true : false}
                    onChange={evt => this.handleTextFieldUpdate('copyright', evt)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    id="rightsStatement"
                    label="Rights Statement"
                    value={this.state.rightsStatement}
                    required={true}
                    error={this.state.fieldErrors.rightsStatement ? true : false}
                    onChange={evt => this.handleTextFieldUpdate('rightsStatement', evt)}
                    fullWidth
                    margin="normal"
                />
                <div style={{marginTop: '20px'}}> </div>
                <input
                    accept="*"
                    className={'hidden'}
                    id="raised-button-file"
                    multiple
                    type="file"
                    ref={input => {this.fileInput = input;}}
                    onChange={e => console.log(this.fileInput.files)}
                />
                <label htmlFor="raised-button-file">
                    <Button variant="raised" component="span">
                        Browse
                    </Button>
                </label>
                <Button variant="raised" component="span">
                    Save
                </Button>

                <div style={{marginTop: '20px'}}> </div>

            </Grid>
        )
    }
}
module.exports = UploadContent;
