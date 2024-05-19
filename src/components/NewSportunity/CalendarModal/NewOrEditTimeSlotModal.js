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

import { colors, fonts } from '../../../theme'
import Switch from '../../common/Switch'
import MultiSelectCircle from '../../common/Inputs/MultiSelectCircle'
import OnOff from './OnOff'
import Input from './Input'
import Submit from './Submit'
import localizations from '../../Localizations'
import DatePicker from "react-datepicker";
import moment from "moment";
import Radium from "radium";

let styles 
let modalStyles

var Style = Radium.Style;

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
// TODO props.relay.* APIs do not exist on compat containers
        this.props.relay.refetch({
            queryDetails: true
        })
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
        else if (this.props.isOpen) {
            this.setState({
                modalIsOpen: true,
                start: dateformat(moment(), 'yyyy-mm-dd'),
                end: dateformat(moment(), 'yyyy-mm-dd'),
                from: null,
                to: null,
                currency: 0,
                cents: 0,
                authorizedUsers: [],
                authorizedCircles: [],
                isRepeated: false,
                repetitionNumber: 1,
                updateSerie: false,
                isModifying: false
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
        if (this.props.selectedFacility) {
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
            [name]: event.target ? event.target.value : event,
        })
    }

    _updateTimeField(name, event) {
      if (event.target.value.length === 2)
        this.setState({
            [name]: event.target.value+':',
        })
      else
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
// TODO props.relay.* APIs do not exist on compat containers
            this.props.relay.refetch({
                autocompletion_required: true,
                pseudo_autocomplete: this.isValidEmailAddress(event.target.value) ? null : event.target.value,
                email_autocomplete: this.isValidEmailAddress(event.target.value) ? event.target.value : null
            })
            this.setState({userAutocompletionListOpen: true})
        }
        else {
// TODO props.relay.* APIs do not exist on compat containers
            this.props.relay.refetch({
                autocompletion_required: false,
                pseudo_autocomplete: '_',
                email_autocomplete: null
            })
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

// TODO props.relay.* APIs do not exist on compat containers
        this.props.relay.refetch({
            pseudo: node.pseudo,
        }, readyState => {
            if (readyState.done) {
                setTimeout(() => {// Needed to wait for Relay to re-fetch data in this.props.viewer
                    if (this.props.viewer.timeSlotUserExists) {
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
            }
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
            this.props.relay.refetch({
                autocompletion_required: false,
                pseudo_autocomplete: '_'
            });
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
        else if (nextProps.isOpen !== this.props.isOpen)
        	this.setState({
		        modalIsOpen: true,
		        start: dateformat(moment(), 'yyyy-mm-dd'),
		        end: dateformat(moment(), 'yyyy-mm-dd'),
		        from: null,
		        to: null
	        })
    }

	_handleKeyDown = (event, field) => {
		if (event.keyCode === 8 && (field === 'to' || field === 'from')) {
			if (this.state[field].length === 3) {
				let text = this.state[field];
				text = text.slice(0,1)
				this.setState({
					field: text
				})
				event.preventDefault();
				event.stopPropagation();
			}
		}
	}

	_isValidHour = (hour) => {
		var time = /\d\d:\d\d/;
		if (!time.test(hour)) return false;

		if (hour.substr(0, hour.indexOf(':')) >= 24 || hour.substr(0, hour.indexOf(':')) < 0)
			return false;
		if (hour.substr(hour.indexOf(':')+1, hour.length) >= 60 || hour.substr(hour.indexOf(':')+1, hour.length) < 0)
			return false;

		return true;
	}

	_handleBlurBeginningTime = event => {
		if (this.state.from.length === 1) {
			this.setState({
				from: '0' + this.state.from + ':00'
			})
		}
		else if (this.state.from.length === 3 && this.state.from[this.state.from.length - 1] === ':') {
			this.setState({
				from: this.state.from + '00'
			})
		}
		setTimeout(() => {
			if (this._isValidHour(this.state.from) && !this.state.to) {
				let to = Number(this.state.from.substr(0, this.state.from.indexOf(':'))) +1 ;
				if (to >= 24)
				  to = '00';
				if (to.toString().length === 1)
				  to = '0'+to;
				to = to+':'+ this.state.from.substr(this.state.from.indexOf(':')+1, this.state.from.length)
				this.setState({
					to
				})
			}
		}, 50)
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
                <div>
                  <Style scopeSelector=".datetime-hours" rules={{
                    ".rdtPicker": {borderRadius: '3px', width: '100px', border: '2px solid #5E9FDF'},
                    ".form-control": styles.time,
                  }}
                  />
                  <Style scopeSelector=".datetime-day" rules={{
                    "input": styles.date,
                  }}
                  />
                  <Style scopeSelector=".react-datepicker" rules={{
                    "div": {fontSize: '1.4rem'},
                    ".react-datepicker__current-month": {fontSize: '1.5rem'},
                    ".react-datepicker__month": {margin: '1rem'},
                    ".react-datepicker__day": {width: '2rem', lineHeight: '2rem', fontSize: '1.4rem', margin: '0.2rem'},
                    ".react-datepicker__day-names": {width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5},
                    ".react-datepicker__header": {padding: '1rem', display: 'flex', flexDirection: 'column',alignItems: 'center'}
                  }}
                  />
                  <Style scopeSelector=".react-datepicker-popper" rules={{
                    zIndex: 2
                  }}/>
                </div>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{localizations.newSportunity_from}</label>
                    <input
                      type="text"
                      value={from}
                      onChange={this._updateTimeField.bind(this, 'from')}
                      style={{width: 80, textAlign:'center'}}
                      onBlur={this._handleBlurBeginningTime}
                      onKeyDown={e => this._handleKeyDown(e, 'from')}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{localizations.newSportunity_to}</label>
                    <input
                      type="text"
                      value={to}
                      onChange={this._updateTimeField.bind(this, 'to')}
                      style={{width: 80, textAlign:'center'}}
                      onBlur={this._handleBlurBeginningTime}
                      onKeyDown={e => this._handleKeyDown(e, 'to')}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{localizations.newSportunity_date}</label>
                    <div className="datetime-day">
                      <DatePicker
                        dateFormat="DD/MM/YYYY"
                        todayButton={localizations.newSportunity_today}
                        selected={moment(start)}
                        onChange={this._updateField.bind(this, 'start')}
                        minDate={moment()}
                        locale={localizations.getLanguage().toLowerCase()}
                        nextMonthButtonLabel=""
                        previousMonthButtonLabel=""
                      />
                    </div>
                  </div>
                </div>
                {!isModifying
                  ? <div>
                    <div style={styles.repeatRow}>
                      <label style={styles.label}>{localizations.newSportunity_repeat}</label>
                      <Switch
                        checked={isRepeated}
                        onChange={this._handleRepeatSwitch}
                      />
                    </div>
                    {
	                    isRepeated
                        ? <div style={styles.repeatRow}>
                          <label style={styles.label}>{localizations.newSportunity_repetitions}</label>
                          <span style={styles.repeat}>
                            <input
                              style={styles.repeatInput}
                              type="number"
                              min="1"
                              max="52"
                              name="repeat"
                              value={repetitionNumber}
                              onChange={this._updateField.bind(this, 'repetitionNumber')}
                            />
                            {localizations.formatString(localizations.newSportunity_repeatTimes, 52)}

                          </span>
                        </div>
                        : ""
                    }
                    {isRepeated && repetitionNumber > 0 &&
                    <div style={{...styles.row, marginBottom: 10}}>
                      <label style={styles.label}>
                        {localizations.newSportunity_schedule_last_date}
                      </label>
                      <span style={styles.note}>
                        {format(new Date(new Date(start).getTime()+repetitionNumber*7*24*3600*1000), 'DD/MM/YYYY')}
                      </span>
                    </div>
                    }
                  </div>
                  : <div style={styles.repeatRow}>
                    <span style={styles.repeat}>
                      {localizations.newSportunity_schedule_total_number_of_iteration + ': ' + repetitionNumber}
                    </span>
                  </div>
                }
                <Submit {...this.state} {...this.props} onClick={() => this._handleClick()} selectSlot={(slot) => {this.props.selectSlot(slot); this._closeModal();}} viewer={viewer} />

                
            </Modal>
        )
    }
}

styles = {
    modalContent: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: colors.white,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
      border: '2px solid rgba(94,159,223,0.83)',
      padding: 20,

      overflow: 'visible',
      width: 340,
      zIndex: 100,
	},
	container: {
		position: 'absolute',
		top: 50,

		zIndex: '100',
	},

	tip: {
		position: 'absolute',
		top: -50,
		left: 50,

		width: 0,
		height: 0,
		borderLeft: '12px solid transparent',
		borderRight: '12px solid transparent',
		borderBottom: '12px solid rgba(94,159,223,0.83)',
		zIndex: 101,
	},

	innerTip: {
		position: 'absolute',
		width: 0,
		height: 0,
		borderLeft: '10px solid transparent',
		borderRight: '10px solid transparent',
		borderBottom: '10px solid red',
		zIndex: 102,
	},

	content: {
		position: 'relative',
	},

	row: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 20,
	},

	repeat: {
		fontSize: '16px',
	},

	repeatRow: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: 20,
	},

	inputGroup: {
		display: 'flex',
		alignItems: 'center',
	},

	label: {
		fontFamily: 'Lato',
		fontSize: '18px',
		//textAlign: 'right',
		lineHeight: 1,
		color: '#316394',
		display: 'block',
		marginRight: 20,
		flex: 1
	},

	time: {
		width: '91px',
		height: '35px',
		backgroundColor: '#FFFFFF',
		border: '2px solid #5E9FDF',
		borderRadius: '3px',

		textAlign: 'center',
		fontFamily: fonts.size.xl,
		color: 'rgba(146,146,146,0.87)',
	},

	date: {
		backgroundColor: '#FFFFFF',
		border: '2px solid #5E9FDF',
		borderRadius: '3px',
		marginLeft: 3,

		height: 35,

		textAlign: 'center',
		fontFamily: fonts.size.xl,
		color: 'rgba(146,146,146,0.87)',
	},

	note: {
		fontSize: 14,
		fontFamily: 'Lato',
		marginLeft: 10,
		color: '#316394'
	},

	repeatInput: {
		backgroundColor: '#FFFFFF',
		border: '2px solid #5E9FDF',
		borderRadius: '3px',
		marginLeft: 3,

		height: 35,

		textAlign: 'center',
		fontFamily: fonts.size.xl,
		color: 'rgba(146,146,146,0.87)',
		width: 50,
		marginRight: 2
	},

	add: {
		marginTop: 12,
		width: '100%',
		height: 32,

		backgroundColor: colors.green,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
		borderStyle: 'none',

		color: colors.white,
		fontSize: '16px',

		cursor: 'pointer',
	},

	error: {
		color:colors.error,
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
        zIndex            : 200
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
    fragment NewOrEditTimeSlotModal_viewer on Viewer @argumentDefinitions (
        pseudo: {type: "String", defaultValue: "_"}
        email: {type: "String", defaultValue: "_"}
        pseudo_autocomplete: {type: "String", defaultValue: "_"}
        email_autocomplete: {type: "String", defaultValue: null}
        autocompletion_required: {type: "Boolean!", defaultValue: false}
        queryDetails: {type: "Boolean!", defaultValue: false}
        ){        
      me {
        id
        circles (last:100) @include(if: $queryDetails) {
            edges {
                node {
                    id
                    name
                    memberCount
                }
            }
        }
      }
      ...Submit_viewer
      timeSlotUserExists: userExists (pseudo: $pseudo, email: $email) 
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
query NewOrEditTimeSlotModalRefetchQuery(
    $pseudo: String
    $email: String
    $pseudo_autocomplete: String
    $email_autocomplete: String
    $autocompletion_required: Boolean!
    $queryDetails: Boolean!
) {
viewer {
    ...NewOrEditTimeSlotModal_viewer
    @arguments(
        pseudo: $pseudo
        email: $email
        pseudo_autocomplete: $pseudo_autocomplete
        email_autocomplete: $email_autocomplete
        autocompletion_required: $autocompletion_required
        queryDetails: $queryDetails
    )
}
}
`,
);
