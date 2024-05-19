import React from 'react'
import Radium from 'radium';
import { withAlert } from 'react-alert'
import { withRouter } from 'found'
import Paper from '@material-ui/core/Paper';
import { colors, fonts, metrics } from '../../../theme'
import localizations from '../../Localizations'
import SearchModal from '../../common/SearchModal';
import Button from '@material-ui/core/Button';
import InputText from './InputText'
import Input from './Input'
import { connect } from 'react-redux';
const backendTypeList = [null, "CUSTOM", "TEXT", "NUMBER", "BOOLEAN", "ADDRESS", "DATE", "PHONE_NUMBER","DOCUMENT"]
let styles

class InformationForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            askedInformation: [],
            askedInformationTypeListIsOpen: false,
            showCustomInfo: false,
            customInfoListIsOpen: false,
            customFieldAnswersList: [],
            newInformationType: 0,
            newInformationName: '',
            newInformationFilledByOwner: false,
            editItem: null,
            editItemName: '',
            formName: '',
            selectedCircles: [], 
            askNewInfo: false,
            formSaveVisible: false,
            formChanged: false,
        }
    }

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);
        if (this.props.formToEdit)
            this.setStateFromProps();
        else 
            this._setDefaultInformation()
    }

    // _handleClickOutside = event => {
    //     if (!this._typeContainerNode.contains(event.target)) {
    //         this.setState({
    //             askedInformationTypeListIsOpen: false
    //         })
    //     }
    //     if (this._customInfoListContainerNode && !this._customInfoListContainerNode.contains(event.target)) {
    //         this.setState({
    //             customInfoListIsOpen: false
    //         })
    //     }
    // }

    setStateFromProps = () => {
        this.setState({
            formName: this.props.formToEdit.name,
            selectedCircles: this.props.formToEdit.circles && this.props.formToEdit.circles.edges
                ? this.props.formToEdit.circles.edges.map(edge => edge.node)
                : [],
            askedInformation: this.props.formToEdit.askedInformation.map(item => ({
                id: item.id,
                name: item.name,
                type: backendTypeList.indexOf(item.type),
                filledByOwner: item.filledByOwner
            })),
        })
    }

    _setDefaultInformation = () => {
        this.setState({
            askedInformation: [
                {name: localizations.circle_defaultInfo_firstName, type: 2, filledByOwner: false},
                {name: localizations.circle_defaultInfo_lastName, type: 2, filledByOwner: false},
                {name: localizations.register_birthday, type: 6, filledByOwner: false},
                {name: localizations.circle_infoType_phone, type: 7, filledByOwner: false},
                {name: localizations.info_address, type: 5, filledByOwner: false},
                {name: localizations.circle_defaultInfo_licenceIsPaid, type: 4, filledByOwner: true},
            ]
        })
    }

    _updateFormName = e => {
        this.setState({
            formName: e.target.value,
            formSaveVisible: true
        })
        this.props.formChanged();
    }

    _removeItem = (index) => {
        let newState = this.state.askedInformation;
        newState.splice(index, 1);
        this.setState({
            askedInformation: newState,
            formSaveVisible: true
        })
        this.props.formChanged();
    }

    _editItem = (index) => {
        this.setState({
            editItem: index,
            editItemName: this.state.askedInformation[index].name,
        })
    }

    _openTypeList = () => {
        this.setState({
            askedInformationTypeListIsOpen: !this.state.askedInformationTypeListIsOpen
        })
    }

    _openCustomInfoList = () => {
        this.setState({
            customInfoListIsOpen: !this.state.customInfoListIsOpen
        })
    }

    _updateName = (e) => {
        this.setState({
            newInformationName: e.target.value,
            addItemSaveVisible: !!this.state.newInformationType,

        })
    }

    _updateEditName = (e) => {
        this.setState({
            editItemName: e.target.value
        })
    }


    _handleCheckboxClicked = e => {
        this.setState({
            newInformationFilledByOwner: !e.target.checked
        })
    }

    _validationEditItem = (index) => {
        if (this.state.editItemName === '') {
            this.props.alert.show(localizations.circle_info_error, {
                timeout: 2000,
                type: 'error',
            });
            return ;
        }

        let newState = this.state.askedInformation;
        newState[index].name = this.state.editItemName ;
        this.setState({
            askedInformation: newState,
            editItem: null,
            editItemName: '',
            formSaveVisible: true
        })
        this.props.formChanged();
    }

    _cancelEdit = () => {
        this.setState({
            editItem: null,
            editItemName: ''
        })
    }

    _handleSelectType = (typeIndex) => {
        if (typeIndex === 1) {
            this.setState({
                newInformationType: typeIndex,
                askedInformationTypeListIsOpen: false,
                showCustomInfo: true,
            });
        }
        else
        {
            this.setState({
                newInformationType: typeIndex,
                askedInformationTypeListIsOpen: false,
                addItemSaveVisible: !!this.state.newInformationName,
                showCustomInfo: false,
                customInfoListIsOpen: false,
                customFieldAnswersList: [],
            });
        }
    }

    _addItem = () => {
        if (this.state.newInformationName === '' || this.state.newInformationType === 0) {
            this.props.alert.show(localizations.circle_info_error, {
                timeout: 2000,
                type: 'error',
            });
            return ;
        }

        let newState = this.state.askedInformation;
        if (this.state.newInformationType === 1) {
            newState.push({
                name: this.state.newInformationName,
                type: this.state.newInformationType,
                filledByOwner: this.state.newInformationFilledByOwner,
                answers: this.state.customFieldAnswersList
            })
        } else {
            newState.push({
                name: this.state.newInformationName,
                type: this.state.newInformationType,
                filledByOwner: this.state.newInformationFilledByOwner
            })
        }
        this.setState({
            askedInformation: newState,
            newInformationType: 0,
            newInformationName: '',
            newInformationFilledByOwner: false,
            askNewInfo: false,
            formSaveVisible: true,
            addItemSaveVisible: false,
            showCustomInfo: false,
            customInfoListIsOpen: false,
            customInfoList: []
        })
        this.props.formChanged();
    }

    _handleSave = () => {

        if (!this.state.formName || this.state.formName === '') {
            this.props.alert.show(localizations.circles_information_missing_form_name, {
                timeout: 2000,
                type: 'error',
            });
            return ;
        }
        if (!this.state.selectedCircles || this.state.selectedCircles.length === 0) {
            this.props.alert.show(localizations.circles_information_missing_form_circles, {
                timeout: 2000,
                type: 'error',
            });
            return ;
        }
        if (!this.state.askedInformation || this.state.askedInformation.length === 0) {
            this.props.alert.show(localizations.circles_information_missing_form_info, {
                timeout: 2000,
                type: 'error',
            });
            return ;
        }
        let askedInformationList = [];
        this.state.askedInformation.forEach(item => {
        console.log('fdsf',item)
          item.type = backendTypeList[item.type];
          askedInformationList.push(item);
        });

        let form = {
            id: this.props.formToEdit ? this.props.formToEdit.id : null,
            name: this.state.formName,
            circles: this.state.selectedCircles.map(circle => circle.id),
            askedInformation: askedInformationList,
        }
        this.props.onSave(form)
    }


    _updateInvitedCircles = circles => {
        this.setState({
            selectedCircles: circles,
            formSaveVisible: true
        });
    }

    _updateNewCustomAnswer = e => {
        this.setState(
          {
              newCustomAnswer: e.target.value
          }
        )
    }

    _addNewCustomAnswer = () => {
        let newCustomFieldAnswersList = this.state.customFieldAnswersList;
        if (this.state.newCustomAnswer) {
            if (newCustomFieldAnswersList.indexOf(this.state.newCustomAnswer) < 0) {
                newCustomFieldAnswersList.push(this.state.newCustomAnswer);
            }
            this.setState({
                customFieldAnswersList: newCustomFieldAnswersList,
                newCustomAnswer: '',
                addItemSaveVisible: true
            })
        }
    }

    _removeCustomAnswer = value => {
        let newCustomFieldAnswersList = this.state.customFieldAnswersList.filter(answer => value !== answer);
            this.setState({
                customFieldAnswersList: newCustomFieldAnswersList,
                newCustomAnswer: ''
            })

    }
    render() {
        const { showCustomInfo, customInfoListIsOpen, customFieldAnswersList } = this.state
        const typeList =
            ["",
            localizations.circle_infoType_custom,
            localizations.circle_infoType_text,
            localizations.circle_infoType_number,
            localizations.circle_infoType_bool,
            localizations.circle_infoType_address,
            localizations.circle_infoType_date,
            localizations.circle_infoType_phone,
            localizations.circle_infoType_document
        ]

        return(
          <div style={styles.container}>
                <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                  <div style={styles.pageHeader}>
                      {this.props.formToEdit ? localizations.circles_information_edit_form + this.props.formToEdit.name : localizations.circles_information_new_form}
                  </div>
                  <div>
                      <div style={{ display: 'inline-block', width: '50%', verticalAlign: 'top' }}>
                          <Input
                            containerStyle={styles.input}
                            placeholder={localizations.circles_information_form_placeholder}
                            onChange={this._updateFormName}
                            value={this.state.formName}
                            maxLength="25"
                            onRef={node => { this.textInputTitle = node }}
                            reference={this.textInputTitle}
                          />
                      </div>
                  </div>
                </Paper>

                <Paper zDepth={4} style={{ padding: "8px 70px 1px", marginTop: 25 }}>
                  <div>
                      <h1 style={styles.title}>
                          {localizations.circles_information_form_assign_groups}
                      </h1>
                      <hr style={{ marginBottom: 25, marginLeft: -70, marginRight: -70 }} />

                      <SearchModal
                        isModal={false}
                        isOpen={this.state.displaySearchModal}
                        viewer={this.props.viewer}
                        onClose={this.onCloseModal}
                        onValide={this._updateInvitedCircles}
                        tabs={["Groups"]}
                        openOnTab={"Groups"}
                        allowToSeeCircleDetails={false}
                        types={['ADULTS', 'CHILDREN']}
                        circleTypes={['MY_CIRCLES', 'CHILDREN_CIRCLES']}
                        queryCirclesOnOpen={true}
                        noNeedToValidate={true}
                        defaultCircleList={this.state.selectedCircles}
                        maxHeight={400}
                      />
                  </div>
                </Paper>

                <Paper zDepth={4} style={{ padding: "8px 70px 1px", marginTop: 25 }}>
                  <div>
                      <h1 style={styles.title}>
                          {localizations.circles_information_form_fields_to_fill}
                      </h1>
                      <hr style={{ marginBottom: 25, marginLeft: -70, marginRight: -70 }} />
                      {this.state.askedInformation.length > 0 &&
                      <div style={styles.headerRow}>
                          <div style={styles.label}>
                              {localizations.circle_infoName}
                          </div>
                          <div style={styles.type}>
                              {localizations.circle_infoType}
                          </div>
                          <div style={styles.checkBoxLabel}>
                              {localizations.circle_infoFilledByOwner}
                          </div>
                          <div style={{...styles.subRow, flex: 4}}></div>
                      </div>
                      }
                      {
                          this.state.askedInformation.map((item, index) => (
                            <div style={styles.row} key={index}>
                                <div style={styles.label}>
                                    {this.state.editItem === index
                                      ?   <InputText
                                        maxLength={"25"}
                                        value={this.state.editItemName}
                                        onChange={this._updateEditName}
                                      />
                                      :   item.name
                                    }
                                </div>
                                <div style={styles.type}>
                                    {typeList[item.type]}
                                </div>
                                <div style={styles.type}>
                                    {item.filledByOwner
                                      ? localizations.circle_no
                                      : localizations.circle_yes
                                    }
                                </div>
                                {this.state.editItem === index
                                  ?   <div style={styles.subRow}>
                                      <div style={styles.validateEditionIcon} onClick={() => this._validationEditItem(index)}>
                                          <i style={{marginLeft: 5}} className="fa fa-check fa-2x" />
                                      </div>
                                      <div style={styles.removeIcon} onClick={() => this._cancelEdit(index)}>
                                          <i style={{marginLeft: 5}} className="fa fa-times fa-2x" />
                                      </div>
                                  </div>
                                  :   <div style={styles.subRow}>
                                      <div style={styles.editIcon} onClick={() => this._editItem(index)}>
                                          <i style={{marginLeft: 5}} className="fa fa-pencil fa-2x" />
                                      </div>
                                      <div style={styles.removeIcon} onClick={() => this._removeItem(index)}>
                                          <i style={{marginLeft: 5}} className="fa fa-times fa-2x" />
                                      </div>
                                  </div>
                                }
                            </div>
                          ))
                      }
                      <div style={styles.newInfoTitle}>
                          {localizations.circle_ask_new}
                      </div>

                    <div style={styles.headerRow}>
                        <div style={styles.label}>
                            {localizations.circle_infoName}
                        </div>
                        <div style={styles.type}>
                            {localizations.circle_infoType}
                        </div>
                        {showCustomInfo &&
                        <div style={styles.customInfoLabel}>
                            {localizations.circles_information_form_add_answer_title}
                        </div>
                        }
                        <div style={styles.type}>
                            {localizations.circle_infoFilledByOwner}
                        </div>
                        <div style={{...styles.subRow, flex: '1 1 12%'}}></div>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.label}>
                          <InputText
                            maxLength={"25"}
                            value={this.state.newInformationName}
                            onChange={this._updateName}
                          />
                        </div>
                        <div style={styles.typeListContainer} ref={node => { this._typeContainerNode = node; }}>
                          <input
                            onClick={this._openTypeList}
                            style={styles.loadInput}
                            value={typeList[this.state.newInformationType]}
                          />
                          <span style={styles.triangle} onClick={this._openTypeList}/>
                          {this.state.askedInformationTypeListIsOpen &&
                          <div style={styles.dropdown}>
                              <ul>
                                  {typeList.map((type, index) => (
                                      
                                    index === 0
                                      ?   false
                                      :   index === 1
                                            ? <li key={index} style={styles.listItem} onClick={() => this._handleSelectType(index)}>
                                                {type}
                                                <i className="fa fa-question-circle-o" title={localizations.circles_information_form_add_answer_explanation}/>
                                            </li>
                                            : <li key={index} style={styles.listItem} onClick={() => this._handleSelectType(index)}>{type}</li>
                                  )).filter(i => Boolean(i))}
                              </ul>
                          </div>
                          }
                        </div>
                        {showCustomInfo &&
                            <div
                              style={styles.customInfoListContainer}
                              ref={node => { this._customInfoListContainerNode = node; }}
                            >
                                <input
                                  onClick={this._openCustomInfoList}
                                  style={styles.loadInput}
                                  value={""}
                                  onChange={() => {}}
                                  placeholder={localizations.circles_information_form_create_list}
                                />
                                <span style={styles.triangle} onClick={this._openCustomInfoList}/>
                                {customInfoListIsOpen &&
                                <div style={styles.dropdown}>
                                    <ul>
                                        <li style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <input
                                              style={styles.customInfoListInput}
                                              type='text'
                                              value={this.state.newCustomAnswer}
                                              placeholder={localizations.circles_information_form_add_answer}
                                              onChange={this._updateNewCustomAnswer}
                                              maxLength={30}
                                              width='100%'
                                            />
                                            <div style={styles.addFirstButton} onClick={this._addNewCustomAnswer}>
                                                <i className="fa fa-plus fa-2x" />
                                            </div>
                                        </li>
                                        {customFieldAnswersList.map((item, index) => (
                                          <li
                                            key={index}
                                            style={styles.customInfoListItem}
                                          >
                                              {item}
                                              <div onClick={() => this._removeCustomAnswer(item)}
                                                   style={styles.customInfoListItemDelete}>
                                                  {localizations.newSportunity_template_delete}
                                              </div>
                                          </li>
                                        ))
                                        }
                                    </ul>
                                </div>
                                }
                            </div>
                        }

                        <div style={styles.checkBoxContainer}>
                          <input style={styles.checkBox}
                                 type='checkbox'
                                 onChange={this._handleCheckboxClicked}
                                 checked={!this.state.newInformationFilledByOwner}
                          />
                        </div>
                        <div style={{...styles.subRow, flex: '1 1 12%', justifyContent: 'flex-end'}}>
                          {this.state.addItemSaveVisible && 
                               <Button
                              variant="contained"
                              color="primary"
                              onClick={this._addItem}>
                                {localizations.circles_information_form_save_field}
                            </Button>
                          }
                        </div>
                      </div>
                      <hr style={{ margin: '20px -70px' }} />
                      <div style={{ margin: "15px 0" }}>
                          <Button
                            variant="contained"
                            color="secondary"
                            style={{ marginRight: 12 }}
                            onClick={this.props.handleGoBack}>
                              {localizations.circles_back}
                          </Button>
                          {this.state.formSaveVisible &&
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={this._handleSave}>
                              {localizations.circles_save}
                          </Button>
                          }
                      </div>
                  </div>
                </Paper>

            </div>
        )
    }
}

styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      paddingRight: 70,
      width: '100%'
    },
    checkBox: {
        width: 18,
        height: 18,
        border: '2px solid #5E9FDF',
        display: 'block',
        cursor: 'pointer',
        margin: 'auto'
    },
    headerRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        paddingBottom: 3,
        borderBottom: '1px solid ' + colors.gray,
        color: colors.blueLight
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        color: colors.blue,
    },
    subRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 2
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 9
    },
    label: {
        fontFamily: 'Lato',
        fontSize: 15,
        flex: '1 1 20%'
    },
    customInfoLabel: {
        fontFamily: 'Lato',
        fontSize: 15,
        flex: '1 1 30%'
    },
    checkBoxContainer: {
        fontFamily: 'Lato',
        fontSize: 15,
        flex: '1 1 18%'
    },
    customInfoListContainer: {
        position: 'relative',
        flex: '1 1 30%',
        marginTop: 2,
        marginLeft: 5,
    },
    customInfoList: {
        //position: 'absolute',
        top: 70,
        left: 0,

        width: '100%',
        maxHeight: 300,

        backgroundColor: colors.white,

        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        border: '2px solid rgba(94,159,223,0.83)',
        padding: 20,

        overflowY: 'scroll',
        overflowX: 'hidden',

        zIndex: 100,
    },
    customInfoListItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'middle',
        paddingTop: 10,
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        cursor: 'pointer',
    },
    customInfoListItemDelete: {
        color: '#777777',
        fontSize: 16,
        padding: '10px 0',
        margin: '-10px 0px'
    },
    customInfoListInput: {
        borderWidth: 0,
        borderBottomWidth: 2,
        borderStyle: 'solid',
        borderColor: colors.blue,
        height: '32px',
        lineHeight: '32px',
        fontFamily: 'Lato',
        color: 'rgba(0,0,0,0.65)',
        display: 'block',
        background: 'transparent',
        width: '100%',
        fontSize: 18,
        outline: 'none',
        ':disabled': {
            borderColor: colors.gray,
        },
    },
    checkBoxLabel: {
        fontFamily: 'Lato',
        fontSize: 15,
        flex: '1 1 18%',
        marginLeft: 5
    },
    type: {
        fontFamily: 'Lato',
        fontSize: 15,
        flex: '1 1 20%',
        marginLeft: 5
    },
    removeIcon: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        color: colors.redGoogle,
        cursor: 'pointer',
    },
    editIcon: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        color: colors.blueLight,
        cursor: 'pointer',
        flex: 1
    },
    validateEditionIcon: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        color: colors.green,
        cursor: 'pointer',
        flex: 1
    },
    newInfoTitle: {
        fontFamily: 'Lato',
        fontSize: 15,
        color: colors.blueLight,
        marginTop: 20,
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
    },
    dropdown: {
        position: 'absolute',
        top: 31,
        left: 0,
        width: '100%',
        maxHeight: 250,
        backgroundColor: colors.white,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        border: '2px solid rgba(94,159,223,0.83)',
        padding: '7px 20px',
        overflowY: 'scroll',
        overflowX: 'hidden',
        zIndex: 100,
    },
    listItem: {
        paddingTop: 5,
        paddingBottom: 5,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        cursor: 'pointer',
    },
    loadInput: {
        borderWidth: 0,
        borderBottomWidth: 2,
        borderStyle: 'solid',
        borderColor: colors.blue,
        height: '30px',
        lineHeight: '36px',
        fontFamily: 'Lato',
        display: 'block',
        background: 'transparent',
        fontSize: 18,
        outline: 'none',
        cursor: 'pointer',
        width: '100%',
        color: '#515151',
    },
    typeListContainer: {
        position: 'relative',
        flex: '1 1 20%',
        marginTop: 2,
        marginLeft: 5,
    },
    triangle: {
        position: 'absolute',
        right: 3,
        top: 12,
        width: 0,
        height: 0,
        transition: 'border 100ms',
        transitionOrigin: 'left',
        color: colors.blue,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: `8px solid ${colors.blue}`,
        cursor: 'pointer',
    },
    addFirstButton: {
        textAlign: 'center',
        justifyContent: 'flex-center',
        color: colors.green,
        cursor: 'pointer',
        fontSize: 14
    },
    saveButton: {
        width: '500px',
        height: '50px',
        backgroundColor: colors.blue,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        borderRadius: '3px',
        display: 'inline-block',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        marginTop: 15,
        marginBottom: 10,
        cursor: 'pointer',
        lineHeight: '27px',
    },
    saveButtonContainer: {
        display: 'flex',
        justifyContent: 'center'
    },
    altButton: {
        fontSize: 20,
        width: 300,
        margin: 20
    },
    title: {
        marginBottom: 10,
        color: "#4E4E4E",
        fontFamily: "Lato",

        fontSize: 24,
        fontWeight: "bold"
    },
    input: {
        marginBottom: 25
    },
    pageHeader: {
        fontFamily: 'Lato',
        fontSize: 34,
        fontWeight: fonts.weight.large,
        color: colors.black,
        marginBottom: 30
    },
}

export default Radium(withAlert(withRouter(InformationForm)))
