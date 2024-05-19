import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import { connect } from 'react-redux';
import localizations from '../Localizations'
import { withAlert } from 'react-alert'
import Geosuggest from 'react-geosuggest'
import ReactLoading from 'react-loading'
import UpdateProfileMutation from './UpdateProfileMutation'
import RemoveCardMutation from './RemoveCardMutation'
import Modal from 'react-modal'

import mangoPay from 'mangopay-cardregistration-js-kit'

import styles from './Styles'
import RegisterCardDataMutation from '../EventView/RegisterCardDataMutation'
import { fonts, colors, appStyles, metrics } from '../../theme'

import { mangoPayUrl, mangoPayClientId } from '../../../constants.json';

mangoPay.cardRegistration.baseURL = mangoPayUrl;
mangoPay.cardRegistration.clientId = mangoPayClientId;

let inputStyles, modalStyles, style

class Payment extends React.Component {
	constructor(props) {
		super(props)
		this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
		this.state = {
      editMode: false,
			isSaveProfileProcessing: false,
			isAddCardProcessing: false,
			isCardRemoving: false,
			removeModalIsOpen: false,
			cardToBeRemoved: '',
			cardNumber: '',
			cardExpirationDate: '',
			cardCvx: '',
			cardType: 'CB_VISA_MASTERCARD',   
			firstName: this.props.user.firstName || '',
			lastName: this.props.user.lastName || '',
			address: this.props.user.address ? this.props.user.address.address || '' : '',
			city: this.props.user.address ? this.props.user.address.city || '' : '',
			country: this.props.user.address ? this.props.user.address.country || '' : '',
			zip: this.props.user.address ? this.props.user.address.zip || '' : '',
			cardJustAdded: false
		}
	}

	_updateCard = (cardRegistration, registrationData) => {
		RegisterCardDataMutation.commit({
        viewer: this.props.viewer,
        cardRegistration: cardRegistration,
        registrationData: registrationData,
      },{
        onSuccess: (res) => {
          this.props.alert.show(localizations.popup_addACard_success, {
              timeout: 2000,
              type: 'success',
            });
          this.setState({
            editMode: false,
						isSaveProfileProcessing: false,
						isAddCardProcessing: false,
						cardJustAdded: true
          })
					this.props.relay.refetch(fragmentVariables => ({
						...fragmentVariables,
						queryCardRegistration: false,
					}))
          
        },
        onFailure: (error) => {
          this.setState({
            process: false,
          });
          this.props.alert.show(localizations.popup_addACard_error, {
            timeout: 5000,
            type: 'error',
					});
        },
      }
    );
  }

	_isValidCard = () => {
    return (this.state.cardNumber 
					&& this.state.cardExpirationDate 
					&& this.state.cardCvx 
					&& this.state.cardType)   
  }

	_handleConfirmAddACard = () => {
    if (!this._isValidCard()) {
      this.props.alert.show(localizations.popup_addACard_required_fields, {
        timeout: 2000,
        type: 'error',
			});
      return; 
    }
    
    this.setState({ isAddCardProcessing: true }); 

		const { cardRegistration } = this.props.viewer
		const card = {
			cardNumber: this.state.cardNumber,
			cardExpirationDate: this.state.cardExpirationDate,
			cardCvx: this.state.cardCvx,
			cardType: this.state.cardType,
		}
    
    let that = this ;
    if(card)
      mangoPay.cardRegistration.init({
        Id: cardRegistration.cardRegistrationId,
        cardRegistrationURL: cardRegistration.cardRegistrationURL,
        accessKey: cardRegistration.accessKey,
        preregistrationData: cardRegistration.preregistrationData,
      });
      mangoPay.cardRegistration.registerCard(
          card, 
          function(res) {
              that._updateCard(cardRegistration, res.RegistrationData);
          },
          function(res) {
							// Handle error, see res.ResultCode and res.ResultMessage
							if (res.ResultCode === "105202")
								that.props.alert.show(localizations.popup_addACard_error_105202, {
									timeout: 4000,
									type: 'error',
								});
							else if (res.ResultCode === "105203")
								that.props.alert.show(localizations.popup_addACard_error_105203, {
									timeout: 4000,
									type: 'error',
								});
							else if (res.ResultCode === "105204")
								that.props.alert.show(localizations.popup_addACard_error_105204, {
									timeout: 4000,
									type: 'error',
								});
							else 
								that.props.alert.show(res.ResultMessage, {
									timeout: 4000,
									type: 'error',
								});

              that.setState({
                isAddCardProcessing: false,
							})
							
          }
      );
  }

	_updateState = (name, e) => {
		this.setState({
			[name]: e.target.value,
		})
	}

	_updateDateState = (name, e) => {
		this.setState({
			[name]: e.toDate(),
		})
	}

	_setEditMode = () => {
		if (this.state.cardJustAdded) {
			this.props.alert.show(localizations.popup_addACard_please_logout_to_add_a_new_card, {
        timeout: 2000,
        type: 'error',
			});
		}
		else {
			this.setState({
				editMode: true,
			})
			if(this._isProfileComplete()) {
				this.props.relay.refetch(fragmentVariables => ({
					...fragmentVariables,
					queryCardRegistration: true,
				}))
			}
		}
	}

	_locationSelected = ({label}) => {
    const splitted = label.split(', ');
    if (splitted.length < 3) {
      this.props.alert.show(localizations.popup_addACard_billing_address_error, {
        timeout: 2000,
        type: 'error',
			});
			this.setState({
				address: {
					address: '',
					country: '',
					city: '',
				}
			});
      return ;
    }
    const address = splitted.slice(0, splitted.length-2).join(', ') || '';
    const country = splitted[splitted.length - 1] || '';
    const city = splitted[splitted.length - 2] || '';

    this.setState({
			address,
			country,
			city,
    });
  }	

	_handleCancelProfile = () => {
		this.setState({
			editMode: false,
		})
	}

	_isProfileReady = () => {
		return (this.state.firstName && this.state.lastName && this.state.address)
	}

	_isProfileComplete = () => {
		const { user } = this.props
		return (user.isProfileComplete)
	}
	

	_handleSaveProfile = () => {
		
    if (this._isProfileReady()) {
			this.setState({
				isSaveProfileProcessing: true,
			}); 
			const address = {
				address: this.state.address,
				city: this.state.city,
				country: this.state.country,
				zip: this.state.zip,
			}
			UpdateProfileMutation.commit({
          viewer: this.props.viewer,
          userIDVar: this.props.viewer.me.id,
          lastNameVar: this.state.lastName,
          firstNameVar: this.state.firstName,
          addressVar: address,
					emailVar: this.props.user.email,
        },{
          onSuccess: (response) => {
            this.props.alert.show(localizations.popup_editProfile_success, {
                timeout: 2000,
                type: 'success',
              });
            this.setState({
              isSaveProfileProcessing: false,
            });
            this.props.relay.refetch(fragmentVariables => ({
							...fragmentVariables,
              queryCardRegistration: true,
						}))
          },
          onFailure: (error) => {
            this.setState({
              isSaveProfileProcessing: false,
            });
            this.props.alert.show(localizations.popup_editProfile_failed, {
              timeout: 4000,
              type: 'error',
            });
          },
        }
      );
    }
    else 
      this.props.alert.show(localizations.popup_editProfile_required_fields, {
        timeout: 2000,
        type: 'error',
			});
	}

	_handleCancelCard = () => {
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			queryCardRegistration: false,
		}))
		this.setState({
			editMode: false,
		})
	}

	_handleRemoveCard = (cardId) => {
		this.setState({
			cardToBeRemoved: cardId,
			removeModalIsOpen: true,
		})
	}

	_closeRemoveModal = () => {
		this.setState({
			cardToBeRemoved: '',
			removeModalIsOpen: false,
		})
	}

	_removeCard = () => {
		RemoveCardMutation.commit({
        viewer: this.props.viewer,
        paymentMethodIdVar: this.state.cardToBeRemoved,
      },{
        onSuccess: (res) => {
          this.props.alert.show(localizations.popup_addACard_card_removed_success, {
              timeout: 2000,
              type: 'success',
            });
          this.setState({
            removeModalIsOpen: false,
					})
          
        },
        onFailure: (error) => {
          this.props.alert.show(localizations.popup_addACard_card_removed_error, {
            timeout: 5000,
            type: 'error',
					});
        },
      }
    )
	}

	render() {
		const { editMode } = this.state
    const { user, isProfileComplete } = this.props
    return(
      <section>	
				<Modal
            isOpen={this.state.removeModalIsOpen}
            onRequestClose={this._closeBlockModal}
            style={modalStyles}
            contentLabel="Block User"
          >
            <div style={style.modalContent}>
              {localizations.payment_remove_card_confirm}
							<br />
							{localizations.payment_remove_card_confirm2}
              <div style={style.modalButtonRow}>
                <button style={style.submitButton} onClick={this._removeCard}>
									{localizations.payment_remove_card_validate}
								</button>&nbsp;&nbsp;&nbsp;&nbsp;
                <button style={style.cancelButton} onClick={this._closeRemoveModal}>
									{localizations.payment_remove_card_cancel}
								</button>
              </div>
            </div>
            
        </Modal>
				
				<div style={styles.rowHeader}>
					<div style={styles.pageHeader}>{localizations.payment_creditCard}</div>
					{ (!editMode && isProfileComplete) 
						&& <div style={styles.editButton} onClick={this._setEditMode}>{localizations.payment_add}</div> }
				</div>
        {!isProfileComplete
				?	<section>
						<div style={styles.completeInfoText}>
							{localizations.payment_complete_profile}
						</div>
						<div style={{...styles.completeInfoText, color: colors.red}}>
							{localizations.payment_complete_profile2}
						</div>
					</section>
				:	user.paymentMethods.length 
					? !editMode &&
							<section>
								<div style={styles.rowBold}>
									<div style={styles.cardType}>{localizations.payment_cardType}</div>
									<div style={styles.cardMask}>{localizations.payment_cardNumber}</div>
									<div style={styles.cardMask}>{localizations.payment_cardCurrency}</div>
									<div style={styles.cardExpiry}>{localizations.payment_validDates}</div>
									<div style={styles.cardRemove}></div>
								</div>
								{user.paymentMethods.map(payment =>
								<div style={styles.row} key={payment.id}>
									<div style={styles.cardType}>{payment.cardType}</div>
									<div style={styles.cardMask}>{payment.cardMask}</div>
									<div style={styles.cardMask}>{payment.currency}</div>
									<div style={styles.cardExpiry}>{payment.expirationDate}</div>
									<div style={styles.cardRemove}>
										<div style={styles.editButton} onClick={this._handleRemoveCard.bind(this, payment.id)}>{localizations.payment_remove_card}</div>
									</div>
								</div>
								)}
							</section>
					:	<div style={styles.noDataError}>
							{localizations.payment_no_card}
						</div>
        }
				{editMode &&
					<section>
						<div style={styles.rowBold}>
							<span style={styles.note}>
							{localizations.event_book_profile_mandatory_information}
							</span>
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.info_firstName}</label>
							{(editMode && user.firstName.length === 0)
							? <input 
									type='text' 
									style={styles.input} 
									value={this.state.firstName} 
									placeholder='first name'
									onChange={this._updateState.bind(this, 'firstName')} 
								/> 
							: <label style={styles.label}>{user.firstName}</label> 
							}
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.info_lastName}</label>
							{ (editMode && user.lastName.length === 0)
										? <input type='text' style={styles.input} 
														value={this.state.lastName} placeholder='last name'
														onChange={this._updateState.bind(this, 'lastName')} /> 
										: <label style={styles.label}>{user.lastName}</label> }
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.info_address}</label>
							{ (editMode && user.address && user.address.address.length === 0)
							? <Geosuggest 
								style={inputStyles(false)}  
								placeholder='Address'
								onSuggestSelect={this._locationSelected}
								initialValue={this.state.address}
								location={this.props.userLocation}
								radius={50000}
              />
							: <label style={styles.label}>{user.address.address}</label>
							}
						</div>
						{ !this._isProfileComplete() &&
						<div style={styles.row}>
							<label style={styles.label}></label>
							{	this.state.isSaveProfileProcessing ?
								<ReactLoading type='cylon' color={colors.blue} /> : 
								<section>
									<button style={appStyles.blueButton} onClick={this._handleSaveProfile}>{localizations.info_update}</button> 
									<button style={appStyles.grayButton} onClick={this._handleCancelProfile}>{localizations.info_cancel}</button>
								</section> }
						</div>
						}
						<div style={styles.rowBold}>
							<span style={styles.note}>
								{localizations.payment_cardInfo}
							</span>
						</div>
						<div style={styles.row}>
							<div style={styles.label}>
								{localizations.event_supported_cards}
							</div>
							<div style={styles.col}>
								<div style={styles.label}>
									{localizations.event_supported_cards_list}
								</div>
								<img style={styles.cardsIcon} src="/images/accepted_cards.png"/>
							</div>
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.payment_cardNumber}</label>
							<input type='text' style={styles.input} 
											value={this.state.cardNumber} placeholder={localizations.payment_cardNumber}
											onChange={this._updateState.bind(this, 'cardNumber')}
											disabled={!this._isProfileComplete()} /> 
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.payment_validDates}</label>
							<input type='text' style={styles.input} 
											value={this.state.validDates} placeholder={localizations.card_expiry}
											onChange={this._updateState.bind(this, 'cardExpirationDate')}
											disabled={!this._isProfileComplete()} /> 
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.payment_cvc}</label>
							<input type='text' style={styles.input} 
											value={this.state.cvc} placeholder='CVC'
											onChange={this._updateState.bind(this, 'cardCvx')}
											disabled={!this._isProfileComplete()} /> 
						</div>
						<div style={styles.row}>
							<label style={styles.label}></label>
							{	this.state.isAddCardProcessing ?
									<ReactLoading type='cylon' color={colors.blue} /> : 
									<section>
										<button style={appStyles.blueButton} onClick={this._handleConfirmAddACard}>{localizations.info_update}</button> 
										<button style={appStyles.grayButton} onClick={this._handleCancelCard}>{localizations.info_cancel}</button>
									</section> }
						</div>
					</section>
				
				}
      </section>
    )
	}
}

style = {
	modalButtonRow: {
    display:'flex',
    alignSelf: 'center',
    marginTop: 30,
  },
	submitButton: {
		width: 80,
		backgroundColor: colors.blue,
    color: colors.white,
    fontSize: fonts.size.small,
    borderRadius: metrics.radius.tiny,
    outline: 'none',
		border: 'none',
		padding: '10px',
		cursor: 'pointer',
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
	},
  cancelButton: {
		width: 80,
		backgroundColor: colors.gray,
    color: colors.white,
    fontSize: fonts.size.small,
    borderRadius: metrics.radius.tiny,
    outline: 'none',
		border: 'none',
		padding: '10px',
		cursor: 'pointer',
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
	},
  modalContent: {
		display: 'flex',
		flexDirection: 'column',
    justifyContent: 'flex-start',
    '@media (max-width: 480px)': {
      width: '300px',
    },
    fontFamily: 'Lato',
    fontSize: 16,
    color: colors.black,
    margin: 20,
	},
}

inputStyles = (isError) => {
  return {
    'input': {
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
			//marginBottom: '20px',
			//width: '100%',
			fontSize: fonts.size.medium,
			outline: 'none',
			width: 300,
		},
    'suggests': {
      width: 300,
    },
    'suggests--hidden': {
      width: '0',
      display: 'none',
    },
    'suggestItem': {
      marginHorizontal: metrics.margin.medium,
      padding: metrics.padding.medium,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.blue,
      color: colors.blue,
      fontFamily: 'Lato',
      fontSize: fonts.size.small,
      cursor: 'pointer',
      backgroundColor: colors.white,
    },
  }
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
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

const dispatchToProps = (dispatch) => ({
})

const stateToProps = (state) => ({
	userCountry: state.globalReducer.userCountry,
	userLocation: state.globalReducer.userLocation
})

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(Payment);

export default createRefetchContainer(withAlert(ReduxContainer), {
  user: graphql`
    fragment Payment_user on User {
			firstName
			lastName
			email
			isProfileComplete
			address {
					address
					city
					country
					zip
			}
			paymentMethods {
        id
        cardType
        cardMask
				expirationDate
				currency
      }
		}
  `,
	viewer: graphql`
    fragment Payment_viewer on Viewer @argumentDefinitions (
			queryCardRegistration: {type: "Boolean!", defaultValue: false}
		){
			me {
				id
			}	
			cardRegistration @include(if: $queryCardRegistration) {
        cardRegistrationId, 
        preregistrationData,
        accessKey,
        cardRegistrationURL
      }
		}
  `,
},	
	graphql`
		query PaymentRefetchQuery(
			$queryCardRegistration: Boolean!
		) {
			viewer {
    		...Payment_viewer @arguments(
					queryCardRegistration: $queryCardRegistration
    		)
			}
		}
	`,
);
