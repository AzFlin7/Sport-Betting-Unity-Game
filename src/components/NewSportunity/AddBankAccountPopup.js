import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Relay from 'react-relay';
import Radium from 'radium';
import dateformat from 'dateformat'
import ReactLoading from 'react-loading'
import localizations from '../Localizations'

// import './popup.css'
import { colors } from '../../theme';
let styles;

class ConfirmCreationPopup extends PureComponent {
  constructor()  {
    super();

    this.state = {
      addressLine1: '',
      addressLine2: '',
      postalCode: '',
      city: '',
      country: '',
      ownerName: '',
      IBAN: '',
      BIC: ''
    }
  }

  _updateField = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  _handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.props.onConfirm(this.state);
  }

  render() {
    const { onConfirm, onClose, me, processing } = this.props ;
    return (
      <div style={styles.pageContainer}>
        <div style={styles.container} id="popupContainer">
          <span onClick={onClose} style={styles.closeCross}>
            <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
          </span>
          <div style={styles.title}>
            {localizations.newSportunity_add_bank_account_popup_title}
          </div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.newSportunity_add_bank_account_popup_details}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                <input
                  type="text"
                  style={styles.inputText}
                  value={this.state.addressLine1}
                  name="addressLine1"
                  onChange={this._updateField}
                  placeholder={localizations.newSportunity_add_bank_account_popup_address_line_1+'*'}
                />
                <input
                  type="text"
                  style={styles.inputText}
                  value={this.state.addressLine2}
                  name="addressLine2"
                  onChange={this._updateField}
                  placeholder={localizations.newSportunity_add_bank_account_popup_address_line_2}
                />
                <input
                  type="text"
                  style={styles.inputText}
                  value={this.state.postalCode}
                  name="postalCode"
                  onChange={this._updateField}
                  placeholder={localizations.newSportunity_add_bank_account_popup_zip_code+'*'}
                />
                <input
                  type="text"
                  style={styles.inputText}
                  value={this.state.city}
                  name="city"
                  onChange={this._updateField}
                  placeholder={localizations.newSportunity_add_bank_account_popup_city+'*'}
                />
                <input
                  type="text"
                  style={styles.inputText}
                  value={this.state.country}
                  name="country"
                  onChange={this._updateField}
                  placeholder={localizations.newSportunity_add_bank_account_popup_country+'*'}
                />
                <input
                  type="text"
                  style={styles.inputText}
                  value={this.state.ownerName}
                  name="ownerName"
                  onChange={this._updateField}
                  placeholder={localizations.newSportunity_add_bank_account_popup_owner_name+'*'}
                />
                <input
                  type="text"
                  style={styles.inputText}
                  value={this.state.IBAN}
                  name="IBAN"
                  onChange={this._updateField}
                  placeholder={localizations.newSportunity_add_bank_account_popup_IBAN+'*'}
                />
                <input
                  type="text"
                  style={styles.inputText}
                  value={this.state.BIC}
                  name="BIC"
                  onChange={this._updateField}
                  placeholder={localizations.newSportunity_add_bank_account_popup_BIC}
                />
              </div>
            </div>
          </div>
          <div style={styles.buttonContainer}>
            {
              processing ?
                <ReactLoading type='cylon' color={colors.white}/>
              :
                <button
                  style={styles.confirm}
                  title={localizations.newSportunity_add_bank_account_popup_add_button}
                  onClick={this._handleSubmit}>
                  {localizations.newSportunity_add_bank_account_popup_add_button}
              </button>
            }
          </div>
        </div>
      </div>
    )
  }
};


styles = {
  pageContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 2,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100vw',
    minHeight: '100vh',

    backgroundColor: colors.black,
    fontFamily: 'Lato',
    color: colors.white,
    fontSize: 16,
  },
  container: {
    width: 524,
    // height: 485,
    maxHeight: '90vh',
    backgroundColor: colors.blue,
    borderRadius: 25,
    paddingTop: 15,
    paddingBottom: 25,
    paddingLeft: 25,
    paddingRight: 25,
    position: 'relative',
    overflowY: 'auto'
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10
  },
  sportunityTitle: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 25
  },
  blocInfo: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 15,
    marginTop:35
  },
  blocLabel: {
    width: 100,
    flexShrink: 0
  },
  infos: {
    display: 'flex',
    flexDirection: 'column'
  },
  infoLine: {
    marginBottom: 13
  },
  inputText: {
    width: 280,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    fontFamily: 'Lato',
    paddingBottom: 5,
    fontSize: 16,
    lineHeight: 1,
    paddingLeft: 3,
    marginTop: 7
  },
  buttonContainer: {
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  confirm: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 230,
    height: 70,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    ':disabled': {
      cursor: 'not-allowed',
    },
  },

  addBankAccountButton: {
    cursor: 'pointer',
  },

  closeCross: {
    cursor: 'pointer',
    width: 30,
    height: 30,
    textAlign: 'center',
    position: 'absolute',
    right: 20
  },
  cancelIcon: {
    fontSize: 25,
    lineHeight: '29px'
  },

};

export default Radium(ConfirmCreationPopup);
