import React from 'react'
import Modal from 'react-modal'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import dateformat from 'dateformat'
import format from 'date-fns/format'
import ToggleDisplay from 'react-toggle-display'
import { withAlert } from 'react-alert'

import { colors, fonts } from '../../theme'
import Switch from '../common/Switch'
import MultiSelectCircle from './MultiSelectCircle'
import OnOff from './OnOff'
import Input from './Input'
import Submit from './ManageVenueSubmit'
import localizations from '../Localizations'

let styles 
let modalStyles

class NewOrEditTimeSlotModal extends React.Component {
    constructor(props) {
        super(props);
        this.alertOptions = {
          offset: 60,
          position: 'top right',
          theme: 'light',
          transition: 'fade',
        };
    
        this.state = {
          modalIsOpen: false,
          flexible: false,
          errors: [],
          from: '',
          to: '',
          start: dateformat(new Date, 'yyyy-mm-dd'),
          end: dateformat(new Date, 'yyyy-mm-dd'),
          isMon: false,
          isTue: false,
          isWed: false,
          isThu: false,
          isFri: false,
          isSat: false,
          isSun: false,
          isRepeated: false,
          repetitionNumber: 1,
          currency: 0,
          cents: 0,
          inputContent: '',
          userAutocompletionListOpen: false,
          isCircleListOpen: false,
          authorizedUsers: [],
          authorizedCircles: [],
          updateSerie: false,
          isModifying: false
        }
    }

    componentDidMount = () => {
        if (this.props.selectedSlot) {
            this.setState({
                modalIsOpen: true,
                start: dateformat(this.props.selectedSlot.from, 'yyyy-mm-dd'),
                end: dateformat(this.props.selectedSlot.end, 'yyyy-mm-dd'),
                from: dateformat(this.props.selectedSlot.from,'HH:MM'),
                to: dateformat(this.props.selectedSlot.end,'HH:MM'),
                currency: this.props.selectedSlot.price ? this.props.selectedSlot.price.currency : 0,
                cents: this.props.selectedSlot.price ? this.props.selectedSlot.price.cents : 0,
                authorizedUsers: this.props.selectedSlot.usersSlotIsFor || [],
                authorizedCircles: this.props.selectedSlot.circlesSlotIsFor && this.props.selectedSlot.circlesSlotIsFor.edges 
                    ? this.props.selectedSlot.circlesSlotIsFor.edges.map(edge => edge.node)
                    : [],
                isRepeated: this.props.selectedSlot.is_repeated,
                repetitionNumber: this.props.selectedSlot.is_repeated ? this.props.selectedSlot.number_of_occurences - this.props.selectedSlot.is_repeated_occurence_number : 1,
                updateSerie: this.props.selectedSlot.is_repeated,
                isModifying: this.props.selectedSlot.id && true
            })
        }
        window.addEventListener('click', this._handleClickOutside);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this._handleClickOutside);
    }

    _handleClickOutside = (event) => {
        if (this.state.userAutocompletionListOpen && this._inputNode && !this._inputNode.contains(event.target)) {
            this.setState({ 
                userAutocompletionListOpen: false,
            });
        }
    }

    _openModal = () => {
        if (this.props.facilityId) {
            this.setState({
                modalIsOpen: true,
            }) 
        } else {
            alert('Please select facility')
        }
    }

    _closeModal = () => {
        this.setState({
            modalIsOpen: false,
            flexible: false,
            errors: [],
            from: '',
            to: '',
            start: dateformat(new Date, 'yyyy-mm-dd'),
            end: dateformat(new Date, 'yyyy-mm-dd'),
            isMon: false,
            isTue: false,
            isWed: false,
            isThu: false,
            isFri: false,
            isSat: false,
            isSun: false,
            isRepeated: false,
            repetitionNumber: 1,
            currency: 0,
            cents: 0,
            inputContent: '',
            userAutocompletionListOpen: false,
            authorizedUsers: [],
            authorizedCircles: []
        });
        this.props.onClose();
    }

    _handleChange = (value) => {
        this.setState({
            flexible: value,
        })
    }
    
    _validateInput = () => {
        let errors = []
        if (!this.state.from) {
            errors.push(localizations.manageVenue_newSlot_err1)
        }

        if (!this.state.to) {
            errors.push(localizations.manageVenue_newSlot_err2)
        }

        if (this.state.from && this.state.to && (this.state.from >= this.state.to)) {
            errors.push(localizations.manageVenue_newSlot_err3)
        }

        if (!this.state.start) {
            errors.push(this.state.flexible ? localizations.manageVenue_newSlot_err4 : localizations.manageVenue_newSlot_err5)
        }

        if (!this.state.end && this.state.flexible) {
            errors.push(localizations.manageVenue_newSlot_err6)
        }

        if (this.state.flexbile && this.state.start && this.state.end && (this.state.start >= this.state.end)) {
            errors.push(localizations.manageVenue_newSlot_err7)
        }

        if (this.state.start && 
            (new Date(this.state.start) < new Date(new Date().toDateString()) || 
            (new Date(this.state.start).toDateString() === new Date().toDateString() && 
            (parseInt(this.state.to.substring(0,2)) <= new Date().getHours() || 
            parseInt(this.state.from.substring(0,2)) <= new Date().getHours())))) {
            errors.push(localizations.manageVenue_newSlot_err8)
        }

        if(this.state.flexible 
            && !this.state.isMon 
            && !this.state.isTue
            && !this.state.isWed 
            && !this.state.isThu 
            && !this.state.isFri 
            && !this.state.isSat 
            && !this.state.isSun ) {
                errors.push(localizations.manageVenue_newSlot_err9)
            }

            this.setState({
            errors: errors,
            })

        return errors.length === 0
    }

    _handleClick = () => {
        return this._validateInput()
    }

    _updateField(name, event) {
        if (name === 'repetitionNumber' && parseInt(event.target.value) > 52)
            return 

        this.setState({
            [name]: event.target.value,
        })
    }

    _updateCheckbox(name, e) {
        this.setState({
            [name]: e.target.checked,
        })
    }

    _handleRepeatSwitch = checked => {
        this.setState({ isRepeated: checked, repetitionNumber: 1 });
    }

    isValidEmailAddress(address) {
        let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
        return re.test(address)
    }
    
    _handleInputChange = event => {
        this.setState({
            inputContent: event.target.value,
        })
        if (event.target.value.length > 3 && this.props.viewer.me) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                autocompletion_required: true,
                pseudo_autocomplete: this.isValidEmailAddress(event.target.value) ? null : event.target.value,
                email_autocomplete: this.isValidEmailAddress(event.target.value) ? event.target.value : null
            }))
            this.setState({userAutocompletionListOpen: true})
        }
        else {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables, 
                autocompletion_required: false,
                pseudo_autocomplete: '_',
                email_autocomplete: null
            }))
            this.setState({userAutocompletionListOpen: false})
        }
    }

    _handleOpenUserList = () => {
        if (this.state.inputContent) {
            this.setState({userAutocompletionListOpen: true})
        }
    }

    _handleAddUserClick = (node) => {
        if (!this.state.inputContent) { return; }
        
        if (this.state.authorizedUsers && this.state.authorizedUsers.find((element) => element.pseudo.toLowerCase() === node.pseudo.toLowerCase())) {
            this.props.alert.show(localizations.manageVenue_user_already_auth_err, {
                timeout: 3000,
                type: 'info',
            });
            this.setState({
                inputContent: ''
            })
            return;
        }

        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            pseudo: node.pseudo,
        }),
        null,
        () => {
            setTimeout(() => {// Needed to wait for Relay to re-fetch data in this.props.viewer
                if (this.props.viewer.manageVenueNewOrEditTimeSlotModalUserExists) {
                    if (node.pseudo) {
                        let authorizedUsers = this.state.authorizedUsers ;
                        authorizedUsers.push(node);
                        this.setState({ inputContent: '', authorizedUsers})
                    }
                }
                else {
                    this.props.alert.show(localizations.manageVenue_user_doesnt_exist, {
                        timeout: 3000,
                        type: 'info',
                    });
                }
            }, 50);
        });    
    }

    removeAuthorizedUser = (index) => {
        let authorizedUsers = this.state.authorizedUsers ;
        authorizedUsers.splice(index, 1);
        this.setState({ authorizedUsers})
    }

    _handleAutocompleteClicked = (node) => {
        this.setState({
            inputContent: node.pseudo,
        })
        setTimeout(() => {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                autocompletion_required: false,
                pseudo_autocomplete: '_'
            }));
            this._handleAddUserClick(node);
        }, 200);
    }

    _handleAddCircleClick = (circle) => {
        if (this.state.authorizedCircles && this.state.authorizedCircles.find((element) => element.id.toLowerCase() === circle.id.toLowerCase())) {
            this.props.alert.show(localizations.manageVenue_user_already_auth_err, {
                timeout: 3000,
                type: 'info',
            });
            return;
        }
        else {
            let authorizedCircles = this.state.authorizedCircles ;
            authorizedCircles.push(circle);
            this.setState({ authorizedCircles})
        }
    }

    _handleRemoveCircleClick = (index) => {
        let authorizedCircles = this.state.authorizedCircles ;
        authorizedCircles.splice(index, 1);
        this.setState({ authorizedCircles})
    }

    _clearCircleList = () => {
        this.setState({ authorizedCircles: []})
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.selectedTimeSlot && nextProps.selectedTimeSlot.start && nextProps.selectedTimeSlot.end &&
            (nextProps.selectedTimeSlot.start !== this.props.selectedTimeSlot.start || nextProps.selectedTimeSlot.end !== this.props.selectedTimeSlot.end)) {
            this.setState({
                modalIsOpen: true,
                start: dateformat(nextProps.selectedTimeSlot.start, 'yyyy-mm-dd'),
                end: dateformat(nextProps.selectedTimeSlot.end, 'yyyy-mm-dd'),
                from: dateformat(nextProps.selectedTimeSlot.start,'HH:MM'),
                to: dateformat(nextProps.selectedTimeSlot.end,'HH:MM')
            })
        }
    }

  render() {
        const { viewer } = this.props;
        const {flexible, start, end, from, to, cents, inputContent, authorizedUsers, authorizedCircles, repetitionNumber, isRepeated, isModifying} = this.state;

		return(
            <Modal
                isOpen={this.state.modalIsOpen}
                onRequestClose={this._closeModal}
                style={modalStyles}
                contentLabel={
                    isModifying 
                    ? isRepeated 
                        ? localizations.manageVenue_updateScheduleSerie 
                        : localizations.manageVenue_updateSchedule 
                    : localizations.manageVenue_addSchedule}
            >
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <div style={styles.modalTitle}>{isModifying 
                            ? isRepeated 
                                ? localizations.manageVenue_updateScheduleSerie 
                                : localizations.manageVenue_updateSchedule  
                            : localizations.manageVenue_addSchedule}</div>
                        <div style={styles.modalClose} onClick={this._closeModal}>
                            <i className="fa fa-times fa-2x" onClick={this._closeModal}/>
                        </div>
                    </div>
                    <div style={styles.subTitle}>
                        {localizations.manageVenue_slotDetails}
                    </div>
                    <div style={styles.row}>
                        <label style={styles.label}>
                        {flexible ? localizations.manageVenue_start : localizations.manageVenue_date}
                        </label>
                        <div style={styles.inputContainer}>
                        <input type='date' 
                                style={styles.inputDate} 
                                value={start}
                                onChange={this._updateField.bind(this, 'start')}/>
                        </div>
                    </div>

                    {/*<ToggleDisplay show={flexible} >
                            <div style={styles.row}>
                            <label style={styles.label}>{localizations.manageVenue_end}</label>
                            <input type='date' 
                                    style={styles.inputDate} 
                                    value={end}
                                    onChange={this._updateField.bind(this, 'end')}/>
                            </div>
                    </ToggleDisplay>*/}
                    {/*<div style={styles.row}>
                        <div style={styles.label}>{localizations.manageVenue_fix}</div> 
                        <OnOff checked={flexible} onChange={this._handleChange}/> 
                        <div style={styles.label}>{localizations.manageVenue_flexible}</div> 
                    </div>*/}
                    {/*<ToggleDisplay show={flexible} >
                        <div style={styles.row}>
                        <label style={styles.day}>{localizations.manageVenue_monday}</label>
                        <input type='checkbox' 
                                                        style={styles.checkbox} 
                                                        onChange={this._updateCheckbox.bind(this, 'isMon')}/>
                        </div>
                        <div style={styles.row}>
                        <label style={styles.day}>{localizations.manageVenue_tuesday}</label>
                        <input type='checkbox' 
                                                        style={styles.checkbox} 
                                                        onChange={this._updateCheckbox.bind(this, 'isTue')}/>
                        </div>
                        <div style={styles.row}>
                        <label style={styles.day}>{localizations.manageVenue_wednesday}</label>
                        <input type='checkbox' 
                                                        style={styles.checkbox} 
                                                        onChange={this._updateCheckbox.bind(this, 'isWed')}/>
                        </div>
                        <div style={styles.row}>
                        <label style={styles.day}>{localizations.manageVenue_thursday}</label>
                        <input type='checkbox' 
                                                        style={styles.checkbox} 
                                                        onChange={this._updateCheckbox.bind(this, 'isThu')}/>
                        </div>
                        <div style={styles.row}>
                        <label style={styles.day}>{localizations.manageVenue_friday}</label>
                        <input type='checkbox' 
                                                        style={styles.checkbox} 
                                                        onChange={this._updateCheckbox.bind(this, 'isFri')}/>
                        </div>
                        <div style={styles.row}>
                        <label style={styles.day}>{localizations.manageVenue_saturday}</label>
                        <input type='checkbox' 
                                                        style={styles.checkbox} 
                                                        onChange={this._updateCheckbox.bind(this, 'isSat')}/>
                        </div>
                        <div style={styles.row}>
                        <label style={styles.day}>{localizations.manageVenue_sunday}</label>
                        <input type='checkbox' 
                                                        style={styles.checkbox} 
                                                        onChange={this._updateCheckbox.bind(this, 'isSun')}/>
                        </div>
                    </ToggleDisplay>*/}
                
                    <div style={styles.row}>
                        <label style={styles.label}>
                            {localizations.manageVenue_from}
                        </label>
                        <div style={styles.inputContainer}>
                            <input type='time' 
                                style={styles.inputHour} 
                                value={from}
                                onChange={this._updateField.bind(this, 'from')} />
                            <label style={styles.label1}>
                                {localizations.manageVenue_to}
                            </label>
                            <input type='time' 
                                style={styles.inputHour} 
                                value={to}
                                onChange={this._updateField.bind(this, 'to')} />
                        </div>
                    </div>

                    {((isModifying && isRepeated) || !isModifying) && 
                        <div style={styles.row}>
                            <label style={styles.label}>
                                {isModifying ? localizations.newSportunity_confirmation_popup_repeatition_number : localizations.newSportunity_confirmation_popup_repeat}
                            </label>
                            <div style={styles.inputContainer}>
                                {isModifying
                                ?   <label style={styles.label1}>{repetitionNumber}</label>
                                :   <Switch
                                        checked={isRepeated}
                                        onChange={this._handleRepeatSwitch}
                                    />
                                }
                            </div>
                        </div>
                    }
                    
                    {isRepeated && !isModifying && 
                        <div style={styles.row}>
                            <label style={styles.labelCents}>
                                {localizations.newSportunity_repetitions}
                            </label>
                            <div style={styles.inputContainer}>
                                <input style={styles.inputPrice} 
                                    value={repetitionNumber}
                                    onChange={this._updateField.bind(this, 'repetitionNumber')} 
                                    min="1"
                                    max="52"/>
                                <span style={styles.note}>{localizations.formatString(localizations.newSportunity_repeatTimes, 52)}</span>
                            </div>
                        </div>
                    }

                    {isRepeated && repetitionNumber > 0 &&
                        <div style={{...styles.row, marginBottom: 10}}>
                            <label style={styles.labelCents}>
                                {localizations.newSportunity_schedule_last_date}
                            </label>
                            <div style={styles.inputContainer}>
                                <span style={styles.note}>
                                    {format(new Date(new Date(start).getTime()+repetitionNumber*7*24*3600*1000), 'DD/MM/YYYY')}
                                </span>
                            </div>
                        </div>
                    }

                    <div style={styles.row}>
                        <label style={styles.labelCents}>
                            {localizations.manageVenue_price}
                        </label>
                        <div style={styles.inputContainer}>
                            {/*<input style={styles.inputPrice} 
                                value={cents}
                                onChange={this._updateField.bind(this, 'cents')} />*/}
                            <label style={styles.label1}>{localizations.slotPrice_Unavailable}</label>
                        </div>
                    </div>

                    <div style={styles.subTitle}>
                        {localizations.manageVenue_slotAffectation}
                    </div>

                    <div style={{...styles.row, marginBottom: 10}}>
                        <label style={styles.label}>
                            {localizations.manageVenue_users}
                        </label>
                        <div style={styles.inputContainer} ref={node => { this._inputNode = node }}>
                            <Input
                                placeholder={localizations.profile_pseudo + " / Email"}
                                value={inputContent}
                                onChange={this._handleInputChange}
                                onClick={this._handleOpenUserList}
                            /> 
                            {this.state.userAutocompletionListOpen && this.props.viewer && this.props.viewer.users && this.props.viewer.users.edges.length > 0 &&
                                <div style={styles.autocompletion_dropdown}>
                                <ul>
                                    {
                                        this.props.viewer && this.props.viewer.users && this.props.viewer.users.edges.map((el, index) => {
                                            return (<li
                                                key={index}
                                                style={styles.listItemClickable}
                                                onClick={() => this._handleAutocompleteClicked(el.node)}
                                            >
                                                <div style={{ ...styles.avatar, backgroundImage: `url(${el.node.avatar})` }} />
                                                {el.node.pseudo}
                                            </li>)
                                        })
                                    }
                                </ul>
                                </div>
                            }
                        </div>
                    </div>
                    {authorizedUsers && authorizedUsers.length > 0 &&
                        <div style={styles.row}>
                        <label style={styles.label}>  </label>
                        <ul style={styles.list}>
                            {authorizedUsers.map((el, index) => {
                                return (<li
                                    key={index}
                                    style={styles.listItem}
                                >
                                    {el.pseudo}
                                    <span style={styles.removeCross} onClick={() => this.removeAuthorizedUser(index)}>
                                        <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
                                    </span>
                                </li>)
                            })
                            }
                        </ul>
                        </div>
                    }     


                    {viewer.me.circles && viewer.me.circles.edges && viewer.me.circles.edges.length > 0 &&
                        <div style={{...styles.row, marginBottom: 10}}>
                            <label style={styles.label}>
                                {localizations.manageVenue_circles}
                            </label>
                            <div style={{flex: 2}}>
                                <MultiSelectCircle
                                    list={viewer.me.circles.edges.map(edge => edge.node)}
                                    values={authorizedCircles}
                                    onChange={this._handleAddCircleClick}
                                    clearSelection={this._clearCircleList}
                                    term={localizations.header_menu_my_circles}
                                />
                            </div>
                        </div>
                    }
                    {authorizedCircles && authorizedCircles.length > 0 &&
                        <div style={styles.row}>
                        <label style={styles.label}>  </label>
                        <ul style={styles.list}>
                            {authorizedCircles.map((el, index) => {
                                return (<li
                                    key={index}
                                    style={styles.listItem}
                                >
                                    {el.name}
                                    <span style={styles.removeCross} onClick={() => this._handleRemoveCircleClick(index)}>
                                        <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
                                    </span>
                                </li>)
                            })
                            }
                        </ul>
                        </div>
                    }     

                    <Submit {...this.state} {...this.props} onClick={() => this._handleClick()} onClose={this._closeModal} viewer={viewer} />
                </div>
                
            </Modal>
        )
    }
}

styles = {
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        zIndex: 100,
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
        alignItems: 'flex-center',
		justifyContent: 'flex-center',
        zIndex: 100,
	},
	modalTitle: {
		fontFamily: 'Lato',
		fontSize:30,
		fontWeight: fonts.weight.medium,
		color: colors.blue,
		marginBottom: 20,
		flex: '2 0 0',
        zIndex: 100,
	},
	modalClose: {
		justifyContent: 'flex-center',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
        zIndex: 100,
    },
    subTitle: {
        fontFamily: 'Lato',
		fontSize: 18,
		color: colors.darkBlue,
		margin: '12px 0',
		flex: '2 0 0',
        zIndex: 100,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 7,
        marginBottom: 7,
        //zIndex: 100,
    },
    label: {
        fontFamily: 'Lato',
        fontSize: '17px',
        textAlign: 'left',
        //lineHeight: '22px',
        color: colors.blue,
        zIndex: 100,
        flex: 1
    },
	label1: {
        //height: '22px',
        fontFamily: 'Lato',
        fontSize: '17px',
        textAlign: 'left',
        //lineHeight: '22px',
        color: colors.blue,
        zIndex: 100,
        flex: 1,
        margin: '0 15px'
    },
    labelCents: {
        //height: '22px',
        fontFamily: 'Lato',
        fontSize: '17px',
        textAlign: 'left',
        //lineHeight: '22px',
        color: colors.blue,
        zIndex: 100,
        flex: 1
    },
    inputContainer: {
        flex: 2,
        position: 'relative'
    },
    inputHour: {
        width: '80px',
        height: 35,
        backgroundColor: '#FFFFFF',
        border: '2px solid ' + colors.blue,
        borderRadius: '3px',
        color: colors.black,
        zIndex: 100,
    },
    inputPrice: {
        width: '60px',
        height: 35,
        backgroundColor: '#FFFFFF',
        border: '2px solid ' + colors.blue,
        borderRadius: '3px',
        color: colors.black,
        zIndex: 100,
    },
    inputDate: {
        width: '115px',
        height: 35,
        backgroundColor: '#FFFFFF',
        border: '2px solid ' + colors.blue,
        borderRadius: '3px',
        color: colors.black,
        zIndex: 100,
    },
    day: {
        flex: 8,
        fontFamily: 'Lato',
        fontSize: '18px',
        lineHeight: '22px',
        color: 'rgba(0,0,0,0.87)',
        zIndex: 100,
    },
    checkbox: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '18px',
        height: '18px',
        backgroundColor: '#5E9FDF',
        zIndex: 100,
    },
    note: {
        fontSize: 14, 
        fontFamily: 'Lato',
        marginLeft: 10,
        color: '#316394'
    },
    autocompletion_dropdown: {
        position: 'absolute',
        top: 40,
        left: 0,

        width: '100%',
        maxHeight: 220,

        backgroundColor: colors.white,

        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        border: '2px solid rgba(94,159,223,0.83)',
        padding: 20,

        overflowY: 'scroll',
        overflowX: 'hidden',

        zIndex: 100,
    },  
    list: {
        flex: 2
    },
    listItem: {
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 5
    },
    listItemClickable: {
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 5,
        cursor: 'pointer'
    },
    avatar: {
        width: 39,
        height: 39,
        marginRight: 10,
        color: colors.blue,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '50%',
    },
    removeCross: {
        float: 'right',
        width: 0,
        color: colors.gray,
        marginRight: '15px',
        cursor: 'pointer',
        fontSize: '16px',
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

export default createRefetchContainer(withAlert(NewOrEditTimeSlotModal), {
//OK
  viewer: graphql`
    fragment ManageVenueNewOrEditTimeSlotModal_viewer on Viewer @argumentDefinitions (
        pseudo: {type: "String", defaultValue: "_"}
        email: {type: "String", defaultValue: "_"}
        pseudo_autocomplete: {type: "String", defaultValue: "_"}
        email_autocomplete: {type: "String", defaultValue: null}
        autocompletion_required: {type: "Boolean!", defaultValue: false}
        ){        
      me {
        id
        circles (last:100) {
            edges {
                node {
                    id
                    name
                    memberCount
                }
            }
        }
      }
      ...ManageVenueSubmit_viewer
      manageVenueNewOrEditTimeSlotModalUserExists: userExists (pseudo: $pseudo, email: $email) 
      users (pseudo: $pseudo_autocomplete, email: $email_autocomplete, first: 10) @include(if: $autocompletion_required) {
        edges {
          node {
            id
            pseudo
            avatar
          }
        }
      }
    }
  `,
},
    graphql`
    query ManageVenueNewOrEditTimeSlotModalRefetchQuery(
        $pseudo: String
        $email: String
        $pseudo_autocomplete: String
        $email_autocomplete: String
        $autocompletion_required: Boolean!
    ) {
    viewer {
        ...ManageVenueNewOrEditTimeSlotModal_viewer
        @arguments(
            pseudo: $pseudo
            email: $email
            pseudo_autocomplete: $pseudo_autocomplete
            email_autocomplete: $email_autocomplete
            autocompletion_required: $autocompletion_required
        )
    }
    }
    `,
);