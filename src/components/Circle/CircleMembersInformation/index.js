import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import Modal from 'react-modal'
import { withAlert } from 'react-alert'

import InputText from '../InputText'
import {styles, modalStyles} from './style'
import localizations from '../../Localizations'
import UpdateAskedInformationMutation from './UpdateAskedInformationMutation.js'
import MembersDetailledInformation from './CircleMembersDetailledInformation.js';
import UpdateMemberStatusMutation from "./UpdateMemberStatusMutation";
import {confirmModal} from '../../common/ConfirmationModal'

const backendTypeList = [null, "TEXT", "NUMBER", "BOOLEAN"]

class MembersInformation extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isMemberInformationActivated: true,//false,
            isParticipantModalVisible: false,
            isOwnerModalVisible: false,
            askedInformation: [],
            askedInformationTypeListIsOpen: false,
            newInformationType: 0,
            newInformationName: '',
            editItem: null,
            editItemName: ''
        };
    }

    componentDidMount = () => {
        this.setStateFromProps();
        if (this.props.circle.askedInformation && this.props.circle.askedInformation.length > 0) {
            this.setState({
                isMemberInformationActivated: true
            })
        }
    }

    _showParticipantModal = () => {
        if (this.props.circle && this.props.circle.askedInformation && this.props.circle.askedInformation.length > 0) {
            this.setState({
                isParticipantModalVisible: true,
            })
            this.setStateFromProps();
        }
        else {
            this.setState({
                isParticipantModalVisible: true
            })
            this._setDefaultInformation()
        }
    }

    _showOwnerModal = () => {
        if (this.props.circle && this.props.circle.askedInformation && this.props.circle.askedInformation.length > 0) {
            this.setState({
                isOwnerModalVisible: true,
            });
            this.setStateFromProps();
        }
        else {
            this.setState({
                isOwnerModalVisible: true,
            })
            this._setDefaultInformation()
        }
    }

    setStateFromProps = () => {
        this.setState({
            askedInformation: this.props.circle.askedInformation.map(item => ({
                id: item.id,
                name: item.name,
                type: backendTypeList.indexOf(item.type),
                filledByOwner: item.filledByOwner
            }))
        })
    }

    _setDefaultInformation = () => {
        this.setState({
            askedInformation: [
                {name: localizations.circle_defaultInfo_firstName, type: 1, filledByOwner: false},
                {name: localizations.circle_defaultInfo_lastName, type: 1, filledByOwner: false},
                {name: localizations.circle_defaultInfo_weight, type: 2, filledByOwner: false},
                {name: localizations.circle_defaultInfo_age, type: 2, filledByOwner: false},
                {name: localizations.circle_defaultInfo_licenceIsPaid, type: 3, filledByOwner: true}
            ]
        })
    }

    _removeItem = (index) => {
        let newState = this.state.askedInformation;
        newState.splice(index, 1);
        this.setState({
            askedInformation: newState
        })
    }

    _editItem = (index) => {
        this.setState({
            editItem: index,
            editItemName: this.state.askedInformation[index].name
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
            editItemName: ''
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

    _addParticipantItem = () => {
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
            filledByOwner: false
        })
        this.setState({
            askedInformation: newState,
            newInformationType: 0,
            newInformationName: ''
        })
    }

    _addOwnerItem = () => {
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
            filledByOwner: true
        })
        this.setState({
            askedInformation: newState,
            newInformationType: 0,
            newInformationName: ''
        })   
    }

    _handleSave = () => {
        const idVar = this.props.circle.id;
        const viewer = this.props.viewer ;

        let askedInformationVar = this.state.askedInformation.map(item => {
            item.type = backendTypeList[item.type]
            return item
        })

        UpdateAskedInformationMutation.commit({
              viewer,
              idVar,
              askedInformationVar
            },
            {
              onFailure: error => {
                this.props.alert.show(localizations.popup_editCircle_update_failed, {
                  timeout: 2000,
                  type: 'error',
                });
                let errors = JSON.parse(error.getError().source);
                console.log(errors);
                
              },
              onSuccess: (response) => {
                this.props.alert.show(localizations.popup_editCircle_update_success, {
                  timeout: 2000,
                  type: 'success',
                });
                this.setState({
                    isOwnerModalVisible: false,
                    isParticipantModalVisible: false,
                })
              },
            }
        )
    }

    _handleCheckboxChanged = () => {
        if (this.state.isMemberInformationActivated && this.props.circle.askedInformation && this.props.circle.askedInformation.length > 0) {
            confirmModal({
                title: localizations.circle_remove_title,
                message: localizations.circle_remove_all_data,
                confirmLabel: localizations.circle_remove_all_data_yes,
                cancelLabel: localizations.circle_remove_all_data_no,
                canCloseModal: true,
                onConfirm: () => {
                  this.deleteAskedInformation()
                },
                onCancel: () => {}        
            })
        }
        else {
            this.setState({
                isMemberInformationActivated: true
            })
        }
    }

    deleteAskedInformation = () => {
        const idVar = this.props.circle.id;
        const viewer = this.props.viewer ;

        let askedInformationVar = []

        UpdateAskedInformationMutation.commit({
              viewer,
              idVar,
              askedInformationVar
            },
            {
              onFailure: error => {
                this.props.alert.show(localizations.popup_editCircle_update_failed, {
                  timeout: 2000,
                  type: 'error',
                });
                let errors = JSON.parse(error.getError().source);
                console.log(errors);
                
              },
              onSuccess: (response) => {
                this.props.alert.show(localizations.popup_editCircle_update_success, {
                  timeout: 2000,
                  type: 'success',
                });
                this.setState({
                    isMemberInformationActivated: false,
                    askedInformation: []
                })
              },
            }
        )
    }

    render() {
        
        const { viewer, circle } = this.props;
        const typeList = ["", localizations.circle_infoType_text, localizations.circle_infoType_number, localizations.circle_infoType_bool]

        return (
            <div style={styles.container}>
                <div style={styles.title}>
                    {localizations.circle_title_members}
                </div>
                {/*
                <div style={styles.checkboxRow}>
                    <div style={styles.checkboxLabel}>
                        {localizations.circle_ask_info_activated}
                    </div>
                    <input style={styles.checkBox} 
                        type='checkbox' 
                        onChange={this._handleCheckboxChanged}
                        checked={this.state.isMemberInformationActivated}
                    />
                </div>
                */}

                <div style={styles.buttonRow}>
                    <div style={styles.buttonLabel} onClick={this.props.onLeave}>
                        {localizations.back}
                    </div>
                </div>

                {this.state.isMemberInformationActivated && 
                    <div>
                        {/*
                        <div style={styles.buttonRow}>
                            <div style={styles.buttonLabel} onClick={this._showParticipantModal}>
                                {localizations.circle_ask_info}
                            </div>
                        </div>

                        <div style={styles.buttonRow}>
                            <div style={styles.buttonLabel} onClick={this._showOwnerModal}>
                                {localizations.circle_add_info}
                            </div>
                        </div>
                        */}

                        {this.state.askedInformation.length > 0 && 
                            <MembersDetailledInformation
                                viewer={viewer}
                                circle={circle}
                            />
                        }
                    </div>
                }

                <Modal
                    isOpen={this.state.isParticipantModalVisible}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={() => {this.setState({isParticipantModalVisible: false}); this.setStateFromProps()}}
                    style={modalStyles}
                    contentLabel={localizations.circle_ask_info}
                >
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <div style={styles.modalTitle}>
                                {localizations.circle_ask_info}
                            </div>
                            <div style={styles.modalClose} onClick={() => {this.setState({isParticipantModalVisible: false});  this.setStateFromProps()}}>
                                <i className="fa fa-times fa-2x" />
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
                                <div style={styles.removeIcon}></div>
                            </div>
                        }
                        {
                            this.state.askedInformation.map((item, index) => (
                                !item.filledByOwner
                                ?   <div style={styles.row} key={index}>
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
                                : false
                            )).filter(i => Boolean(i))
                        }
                        <div style={styles.newInfoTitle}>
                            {localizations.circle_ask_new}
                        </div>
                        <div style={styles.row}>
                            <div style={styles.label}>
                                {localizations.circle_infoName}
                            </div>
                            <div style={styles.type}>
                                {localizations.circle_infoType}
                            </div>
                            <div style={styles.addButton}></div>
                        </div>
                        
                        <div style={styles.row}>
                            <div style={styles.column}>
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <div style={styles.label}>
                                        <InputText 
                                            maxLength={"25"}
                                            value={this.state.newInformationName}
                                            onChange={this._updateName}
                                        />
                                    </div>
                                    <div style={styles.typeListContainer}>
                                        <input
                                            onClick={this._openTypeList}
                                            style={styles.loadInput}
                                            value={typeList[this.state.newInformationType]}
                                        />
                                        <span style={styles.triangle} onClick={this._openTypeList}/>
                                        {this.state.askedInformationTypeListIsOpen && 
                                            <div style={styles.dropdown}>
                                                <ul>
                                                    <li style={styles.listItem} onClick={() => this._handleSelectType(1)}>{typeList[1]}</li>
                                                    <li style={styles.listItem} onClick={() => this._handleSelectType(2)}>{typeList[2]}</li>
                                                    <li style={styles.listItem} onClick={() => this._handleSelectType(3)}>{typeList[3]}</li>
                                                </ul>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>       
                            <div style={styles.addButton} onClick={this._addParticipantItem}>
                                <i className="fa fa-plus fa-2x" />
                            </div>
                        </div>                 
                        <button onClick={this._handleSave} style={styles.saveButton}>
                            {localizations.circles_save}
                        </button>
                    </div>        
                </Modal>

                <Modal
                    isOpen={this.state.isOwnerModalVisible}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={() => {this.setState({isOwnerModalVisible: false}); this.setStateFromProps()}}
                    style={modalStyles}
                    contentLabel={localizations.circle_add_info}
                >
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <div style={styles.modalTitle}>
                                {localizations.circle_add_info}
                            </div>
                            <div style={styles.modalClose} onClick={() => {this.setState({isOwnerModalVisible: false}); this.setStateFromProps()}}>
                                <i className="fa fa-times fa-2x" />
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
                                <div style={styles.removeIcon}></div>
                            </div>
                        }
                        {
                            this.state.askedInformation.map((item, index) => (
                                item.filledByOwner
                                ?   <div style={styles.row} key={index}>
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
                                : false
                            )).filter(i => Boolean(i))
                        }
                        <div style={styles.newInfoTitle}>
                            {localizations.circle_new_info}
                        </div>
                        <div style={styles.row}>
                            <div style={styles.label}>
                                {localizations.circle_infoName}
                            </div>
                            <div style={styles.type}>
                                {localizations.circle_infoType}
                            </div>
                            <div style={styles.addButton}></div>
                        </div>
                        
                        <div style={styles.row}>
                            <div style={styles.column}>
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <div style={styles.label}>
                                        <InputText 
                                            maxLength={"25"}
                                            value={this.state.newInformationName}
                                            onChange={this._updateName}
                                        />
                                    </div>
                                    <div style={styles.typeListContainer}>
                                        <input
                                            onClick={this._openTypeList}
                                            style={styles.loadInput}
                                            value={typeList[this.state.newInformationType]}
                                        />
                                        <span style={styles.triangle} onClick={this._openTypeList}/>
                                        {this.state.askedInformationTypeListIsOpen && 
                                            <div style={styles.dropdown}>
                                                <ul>
                                                    <li style={styles.listItem} onClick={() => this._handleSelectType(1)}>{typeList[1]}</li>
                                                    <li style={styles.listItem} onClick={() => this._handleSelectType(2)}>{typeList[2]}</li>
                                                    <li style={styles.listItem} onClick={() => this._handleSelectType(3)}>{typeList[3]}</li>
                                                </ul>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>       
                            <div style={styles.addButton} onClick={this._addOwnerItem}>
                                <i className="fa fa-plus fa-2x" />
                            </div>
                        </div>                 
                        <button onClick={this._handleSave} style={styles.saveButton}>
                            {localizations.circles_save}
                        </button>
                    </div>        
                </Modal>
            </div>
        )
    }
}

export default createFragmentContainer(Radium(withAlert(MembersInformation)), {
  viewer: graphql`
    fragment CircleMembersInformation_viewer on Viewer {
      id
      ...CircleMembersDetailledInformation_viewer
    }
  `
});