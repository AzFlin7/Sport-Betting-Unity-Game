import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loading from 'react-loading';
import { withAlert } from 'react-alert'
import ToggleDisplay from 'react-toggle-display'

import { colors } from '../../theme';
import * as types from '../../actions/actionTypes.js';
import VenueUpdateMutation from './VenueUpdateMutation'
import NewVenueMutation from './NewVenueMutation';
import Radium from 'radium'
import localizations from '../Localizations'

let styles;

class Submit extends Component {

  constructor() {
    super();
    this.state = {
      isLoading: false,
      isError: false,
			isDuplicateName: false,
      showConfirm: false,
      showConfirmDelete: false,
    }
    this.alertOptions = {
      offset: 14,
      position: 'top right',
      theme: 'light',
      timeout: 100,
      transition: 'fade',
    };
  }

  _changeLoadingStatus = (bool) => {
    this.setState({
      isLoading: bool,
    });
  }

  _validateData = () => {
    this.props.setErrorStatus('isNameError', !this.props.name)
    this.props.setErrorStatus('isAddressError', !this.props.address)
    this.props.setErrorStatus('isCityError', !this.props.city)
    this.props.setErrorStatus('isCountryError', !this.props.country)
		let duplicateName = false;
    
		if(this.props.name
      && this.props.viewer.me.venues.edges
            .filter(edge => edge.node.name === this.props.name && edge.node.id !== this.props.id).length > 0) {
			this.props.setErrorStatus('isNameDuplicateError', true)
			duplicateName = true;
		}

		let error = !this.props.name || !this.props.address || !this.props.city || !this.props.country
    this.setState({
      isError: error,
			isDuplicateName: duplicateName,
    })

		
    return error || duplicateName
  }

  _confirmSubmit = () => {
    this._submitUpdate()
  }

  _cancelSubmit = () => {
    this.setState({
      showConfirm: false,
    })
  }

  _confirmDelete = () => {
    this.setState({
      showConfirmDelete: false,
    })
  }

  _cancelDelete = () => {
    this.setState({
      showConfirmDelete: false,
    })
  }

  _deleteVenue = () => {
    this.setState({
      showConfirmDelete: true,
    })
  }

  _submitUpdate = () => {
    this._changeLoadingStatus(true);
    const viewer = this.props.viewer;
    const userIDVar = this.props.viewer.id;
    const idVar = this.props.id;
    const nameVar = this.props.name;
    const addressVar = this.props.address;
    const cityVar = this.props.city;
    const countryVar = this.props.country;
    
    if (idVar) {
      VenueUpdateMutation.commit({
          viewer,
          userIDVar,
          idVar,
          nameVar,
          addressVar,
          cityVar,
          countryVar,
        },
        {
          onFailure: error => {
            this._changeLoadingStatus(false);
            this.props.alert.show(localizations.popup_updateVenue_error, {
              timeout: 2000,
              type: 'error',
            });
            let errors = JSON.parse(error.getError().source);
            console.log(errors);
            
          },
          onSuccess: (response) => {
            console.log(response);
            this._changeLoadingStatus(false);
            this.props.alert.show(localizations.popup_updateVenue_success, {
              timeout: 2000,
              type: 'success',
            });
            this.props.onClose();
          },
        }
      )
    }
    else {
      NewVenueMutation.commit({
        viewer,
        userIDVar,
        nameVar,
        addressVar,
        cityVar,
        countryVar,
      },
      {
        onFailure: error => {
          this._changeLoadingStatus(false);
          this.props.alert.show(localizations.popup_updateVenue_error, {
            timeout: 2000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
          
        },
        onSuccess: (response) => {
          console.log(response);
          this._changeLoadingStatus(false);
          this.props.alert.show(localizations.popup_updateVenue_success, {
            timeout: 2000,
            type: 'success',
          });
          this.props.onClose();
        },
      }
    )
    }
  }

  _updateVenueProfile = () => {
    if(this._validateData()) {
      return
    }
    if (this.props.id) {
      this.setState({
        showConfirm: true,
      })
    } else {
      this._submitUpdate()
    }
    
  }

  render() {
		
    return(
      <section>
        <div style={styles.container}>
          {
            this.state.isLoading === true &&
              <Loading type='spinningBubbles' color='#e3e3e3' />
          }
          <ToggleDisplay show={this.state.isError}>
            <div style={styles.error}>{localizations.manageVenue_fullfil_error}</div>
          </ToggleDisplay>
          <ToggleDisplay show={this.state.isDuplicateName}>
            <div style={styles.error}>{localizations.manageVenue_nameExists}</div>
          </ToggleDisplay>
          <ToggleDisplay show={this.state.showConfirm}>
            <div>
              <div style={styles.confirm}>{localizations.manageVenue_modify_confirm}</div>&nbsp;&nbsp;&nbsp;
              <span style={styles.linkYes} onClick={this._confirmSubmit}>{localizations.manageVenue_confirm_yes}</span>&nbsp;&nbsp;&nbsp;
              <span style={styles.linkNo} onClick={this._cancelSubmit}>{localizations.manageVenue_confirm_no}</span> 
            </div>
          </ToggleDisplay>
          <ToggleDisplay show={this.state.showConfirmDelete}>
            <div>
              <div style={styles.error}>{localizations.manageVenue_delete_confirm}</div>&nbsp;&nbsp;&nbsp;
              <span style={styles.linkYes} onClick={this._confirmDelete}>{localizations.manageVenue_confirm_yes}</span>&nbsp;&nbsp;&nbsp;
              <span style={styles.linkNo} onClick={this._cancelDelete}>{localizations.manageVenue_confirm_no}</span> 
            </div>
          </ToggleDisplay>
          <button onClick={this._updateVenueProfile} style={styles.submitButton}>{localizations.manageVenue_save}</button>
          { this.props.displayDelete &&
            <div>
              <button style={styles.redButton} onClick={this._deleteVenue}>{localizations.manageVenue_delete}</button>
            </div>
          }
        </div>
      </section>
    )
  }
}

Submit.propTypes = ({
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  city: PropTypes.array.isRequired,
  country: PropTypes.string.isRequired,
})

// REDUX //

const _resetVenueFormAction = () => ({
  type: types.VENUE_RESET_FORM,
})

const stateToProps = (state) => ({
  name: state.venueReducer.name,
  address: state.venueReducer.address,
  city: state.venueReducer.city,
  country: state.venueReducer.country,
  id: state.venueReducer.id,
});

const dispatchToProps = (dispatch) => ({
  _resetVenueFormAction: bindActionCreators(_resetVenueFormAction, dispatch),
});

export default connect(
  stateToProps,
  dispatchToProps
)(withAlert(Radium(Submit)));

styles = {
  container: {
    width: '80%',
  },
  submitButton: {
    width: '400px',
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
    marginTop: 10,
    marginBottom: 10,
    cursor: 'pointer',
		lineHeight: '27px',
    '@media (max-width: 480px)': {
      width: '300px',
    }
  },
  redButton: {
		width: '400px',
		height: '50px',
		backgroundColor: colors.redGoogle,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 10,
    marginBottom: 10,
    cursor: 'pointer',
		lineHeight: '27px',
    '@media (max-width: 320px)': {
      width: '300px',
    }
  },
  error: {
    color: colors.red,
    fontSize: 16,
    fontFamily: 'Lato',
    width: 300,
    margin:0,
  },
  confirm: {
    color: colors.green,
    fontSize: 16,
    fontFamily: 'Lato',
    width: 300,
    marginTop:20,
    marginBottom: 10,
  },
  linkYes: {
    color: colors.blue,
    fontSize: 16,
    fontFamily: 'Lato',
    marginTop:10,
    marginBottom: 20,
    width:40,
    cursor:'pointer',
  },
  linkNo: {
    color: colors.gray,
    fontSize: 16,
    fontFamily: 'Lato',
    marginTop:10,
    marginBottom: 20,
    width:40,
    cursor:'pointer',
  },
}
