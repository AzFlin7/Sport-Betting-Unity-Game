import React from 'react'
import Radium from 'radium';
import Modal from 'react-modal'
import { withAlert } from 'react-alert'

import { colors, fonts, metrics } from '../../../theme'
import localizations from '../../Localizations'

import InputText from './InputText'
import MultiSelectCircle from '../../common/Inputs/MultiSelectCircle';

const backendTypeList = [null, "TEXT", "NUMBER", "BOOLEAN", "ADDRESS", "DATE", "PHONE_NUMBER"]
let styles
let modalStyles

class InformationFormsModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            askedInformation: [],
            askedInformationTypeListIsOpen: false,
            newInformationType: 0,
            newInformationName: '',
            newInformationFilledByOwner: false,
            editItem: null,
            editItemName: '',
            formName: '',
            selectedCircles: [], 
            askNewInfo: false,
            isSaveButtonVisible: false
        }
    }

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);
        if (this.props.formToEdit)
            this.setStateFromProps();
        else 
            this._setDefaultInformation()
    }
    
    
    componentWillUnmount() {
        window.removeEventListener('click', this._handleClickOutside);
    }

    _handleClickOutside = event => {
        if (this.state.askedInformationTypeListIsOpen && !this._containerNode.contains(event.target)) {
            this.setState({ askedInformationTypeListIsOpen: false });
        }
    }

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

    componentWillReceiveProps = (nextProps) => {
    }

    _setDefaultInformation = () => {
        this.setState({
            askedInformation: [
                {name: localizations.circle_defaultInfo_firstName, type: 1, filledByOwner: false},
                {name: localizations.circle_defaultInfo_lastName, type: 1, filledByOwner: false},
                {name: localizations.register_birthday, type: 5, filledByOwner: false},
                {name: localizations.circle_infoType_phone, type: 6, filledByOwner: false},
                {name: localizations.info_address, type: 4, filledByOwner: false},
                {name: localizations.circle_defaultInfo_licenceIsPaid, type: 3, filledByOwner: true},
            ]
        })
    }

    _updateFormName = e => {
        this.setState({
            formName: e.target.value,
            isSaveButtonVisible: true
        })
    }

    _removeItem = (index) => {
        let newState = this.state.askedInformation;
        newState.splice(index, 1);
        this.setState({
            askedInformation: newState,
            isSaveButtonVisible: true
        })
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

    _updateName = (e) => {
        this.setState({
            newInformationName: e.target.value
        })
    }

    _updateEditName = (e) => {
        this.setState({
            editItemName: e.target.value
        })
    }

    _handleChangeSelectedCircles = circle => {
        let newList = this.state.selectedCircles ;
        let index = newList.findIndex(item => item.id === circle.id);
        if (index >= 0)
            newList.splice(index, 1);
        else
            newList.push(circle)

        this.setState({
            selectedCircles: newList,
            isSaveButtonVisible: true
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
            isSaveButtonVisible: true
        })
    }

    _cancelEdit = () => {
        this.setState({
            editItem: null,
            editItemName: ''
        })
    }

    _handleSelectType = (typeIndex) => {
        this.setState({
            newInformationType: typeIndex,
            askedInformationTypeListIsOpen: false
        })
    }

    _addItem = () => {
        if (this.state.askNewInfo) {
            if (this.state.newInformationName === '' || this.state.newInformationType === 0) {
                this.props.alert.show(localizations.circle_info_error, {
                    timeout: 2000,
                    type: 'error',
                });
                return ;
            }

            let newState = this.state.askedInformation;
            newState.push({
                name: this.state.newInformationName,
                type: this.state.newInformationType,
                filledByOwner: this.state.newInformationFilledByOwner
            })
            this.setState({
                askedInformation: newState,
                newInformationType: 0,
                newInformationName: '',
                newInformationFilledByOwner: false,
                askNewInfo: false,
                isSaveButtonVisible: true
            })
        }
        else {
            this.setState({
                askNewInfo: true
            })
        }
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

        let form = {
            id: this.props.formToEdit ? this.props.formToEdit.id : null,
            name: this.state.formName,
            circles: this.state.selectedCircles.map(circle => circle.id),
            askedInformation: this.state.askedInformation.map(item => {
                item.type = backendTypeList[item.type]
                return item
            })
        }

        this.props.onSave(form)
    }

    render() {
        const { viewer, user } = this.props
        const typeList = 
            ["", 
            localizations.circle_infoType_text, 
            localizations.circle_infoType_number, 
            localizations.circle_infoType_bool,
            localizations.circle_infoType_address,
            localizations.circle_infoType_date,
            localizations.circle_infoType_phone
        ]

        let circleList = user.informationFormsCircles.edges.map(edge => edge.node) ;
        if (user.informationFormsCirclesCirclesSuperUser && user.informationFormsCirclesCirclesSuperUser.edges && user.informationFormsCirclesCirclesSuperUser.edges.length > 0)
            circleList = circleList.concat(user.informationFormsCirclesCirclesSuperUser.edges.map(edge => ({...edge.node, name: edge.node.name + ' ' + localizations.circle_owner + ' ' + edge.node.owner.pseudo})));

        circleList = circleList.filter(circle => circle.type === 'ADULTS' || circle.type === 'CHILDREN')

        return(
            <Modal
                isOpen={this.props.isModalVisible}
                style={modalStyles}
                contentLabel={localizations.circle_ask_info}
            >
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <div style={styles.modalTitle}>
                            {this.props.formToEdit 
                            ? localizations.circles_information_form_edit
                            : localizations.circles_information_form_new
                            }
                        </div>
                        <div style={styles.modalClose} onClick={this.props.onClose}>
                            <i className="fa fa-times fa-2x" />
                        </div>
                    </div>

                    <div style={{...styles.row, marginBottom: 20}}>
                        <div style={styles.label}>
                            {localizations.circles_information_form_name}
                        </div>
                        <div style={{flex: 8}}>
                            <InputText 
                                maxLength={"25"}
                                value={this.state.formName}
                                onChange={this._updateFormName}
                                placeholder={localizations.circles_information_form_placeholder}
                            />
                        </div>
                    </div>

                    <div style={{...styles.row, marginBottom: 20}}>
                        <div style={styles.label}>
                            {localizations.circles_information_form_circles}
                        </div>
                        <div style={{flex: 8}}>
                            <MultiSelectCircle
                                list={circleList}
                                values={this.state.selectedCircles}
                                term={this.state.selectedCircles.length > 0 ? this.state.selectedCircles.map(item => item.name).join(', ') : ''}
                                onChange={this._handleChangeSelectedCircles}
                            />
                        </div>
                    </div>

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
                    <div style={styles.newInfoTitle} onClick={this._addItem}>
                        {localizations.circle_ask_new}
                        {!this.state.askNewInfo &&
                            <div style={styles.addFirstButton}>
                                <i className="fa fa-plus fa-2x" />
                            </div>
                        }
                    </div>
                    {this.state.askNewInfo && 
                        <div style={styles.row}>
                            <div style={styles.label}>
                                {localizations.circle_infoName}
                            </div>
                            <div style={styles.type}>
                                {localizations.circle_infoType}
                            </div>
                            <div style={styles.checkBoxLabel}>
                                {localizations.circle_infoFilledByOwner}
                            </div>
                            <div style={styles.addButton}></div>
                        </div>
                    }
                    {this.state.askNewInfo && 
                        <div style={styles.row}>
                            <div style={styles.label}>
                                <InputText 
                                    maxLength={"25"}
                                    value={this.state.newInformationName}
                                    onChange={this._updateName}
                                />
                            </div>
                            <div style={styles.typeListContainer} ref={node => { this._containerNode = node; }}>
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
                                                :   <li key={index} style={styles.listItem} onClick={() => this._handleSelectType(index)}>{type}</li>
                                            )).filter(i => Boolean(i))}
                                        </ul>
                                    </div>
                                }
                            </div>
                            <div style={styles.checkBoxContainer}>
                                <input style={styles.checkBox} 
                                    type='checkbox' 
                                    onChange={this._handleCheckboxClicked}
                                    checked={!this.state.newInformationFilledByOwner}
                                />
                            </div>
                            <div style={styles.addButton} onClick={this._addItem}>
                                <i className="fa fa-plus fa-2x" />
                            </div>
                        </div>                 
                    }
                    {this.state.isSaveButtonVisible && 
                        <button onClick={this._handleSave} style={styles.saveButton}>
                            {localizations.circles_save}
                        </button>
                    }
                </div>        
            </Modal>
        )
    }
}

styles = {
	container: {
		width: '100%',
		display: 'flex',
        flexDirection: 'column',
        marginTop: 15
    },
    checkBox: {
        width: 18,
        height: 18,
        border: '2px solid #5E9FDF',
        display: 'block',
        cursor: 'pointer',
        margin: 'auto'
    },
    buttonRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    buttonLabel: {
        fontFamily: 'Lato',
        fontSize: 16, 
        color: colors.blue,
        cursor: 'pointer',
    },
    modalContent: {
		display: 'flex',
		flexDirection: 'column',
        justifyContent: 'flex-start',
        width: 500,
        paddingBottom: 10
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
        alignItems: 'flex-center',
		justifyContent: 'space-between',
	},
	modalTitle: {
		fontFamily: 'Lato',
		fontSize:24,
		fontWeight: fonts.weight.medium,
		color: colors.blue,
		marginBottom: 20,
		flex: '2 0 0',
	},
	modalClose: {
		justifyContent: 'flex-center',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
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
        flex: 5
    },
    checkBoxContainer: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 3
    },
    checkBoxLabel: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 3,
        marginLeft: 5
    },
    type: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 5,
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
        maxHeight: 150,    
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
        fontSize: fonts.size.medium,
        outline: 'none',
        cursor: 'pointer',
        width: '100%',
        color: '#515151',
    },
    typeListContainer: {
        position: 'relative',
        flex: 5,
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
    addButton: {
        textAlign: 'center',
        justifyContent: 'flex-center',
		color: colors.green,
        cursor: 'pointer',
        flex: 1,
        marginBottom: 20
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
        backgroundColor: colors.green,
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
}

modalStyles = {
    overlay : {
      position          : 'fixed',
      top               : 0,
      left              : 0,
      right             : 0,
      bottom            : 0,
      backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    },
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
      border                     : '1px solid #ccc',
      background                 : '#fff',
      overflow                   : 'visible',
      WebkitOverflowScrolling    : 'touch',
      borderRadius               : '4px',
      outline                    : 'none',
      padding                    : '20px',
    },
  }


export default withAlert(InformationFormsModal)
