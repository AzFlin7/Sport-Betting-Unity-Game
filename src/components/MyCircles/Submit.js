import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from 'react-loading';
import { withAlert } from 'react-alert'
import ToggleDisplay from 'react-toggle-display'
import CircleMutation from './CircleMutation'
import localizations from '../Localizations'
import Radium from 'radium'

import { colors } from '../../theme';

let styles

class Submit extends Component {

  constructor() {
    super();
    this.state = {
      isLoading: false,
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

	_changeLoadingStatus = (value) => {
		if (value !== this.state.isLoading) {
			this.setState({
				isLoading: value,
			})
		}
	}	
  _submitUpdate = () => {
    this._changeLoadingStatus(true);
    const viewer = this.props.viewer;
    const userIDVar = this.props.viewer.id;
    const idVar = null
    const nameVar = this.props.name;
    const subCirclesVar = this.props.subCircles.length > 0 ? this.props.subCircles : null;

    const circleTypes = ['ADULTS', 'CHILDREN', 'TEAMS', 'CLUBS', 'COMPANIES'];

    const sportVar = this.props.newCircleSport ? {
      sport: this.props.newCircleSport.id,
      levels: this.props.newCircleSport.levels.map(level => (level.id))
    } : null;

    CircleMutation.commit({
        viewer,
        userIDVar,
        idVar,
        nameVar,
        subCirclesVar,
        ownerVar: this.props.teamCreation ? this.props.selectedSubAccount.id : null,
        modeVar: this.props.newCirclePublic ? 'PUBLIC' : 'PRIVATE',
        typeVar: circleTypes[this.props.newCircleType],
        sportVar: sportVar,
        addressVar: this.props.newCircleAddress,
        isCircleUsableByMembersVar: this.props.newCircleShared,
        isCircleAccessibleFromUrlVar: this.props.newCircleInvitationWithLink,
      },
      {
        onFailure: error => {
          setTimeout(() => this.setState({ isLoading: false }), 1500)
          this.props.alert.show(localizations.popup_editCircle_update_failed, {
            timeout: 2000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
          
        },
        onSuccess: (response) => {
          setTimeout(() => this.setState({ isLoading: false }), 1500)
          this.props.alert.show(localizations.popup_editCircle_update_success, {
            timeout: 2000,
            type: 'success',
          });
          setTimeout(() => this.props.onClose(), 500)
        },
      }
    )
  }

	_validate = () => {
    if (this.props.name.length === 0) {
      this.props.alert.show(localizations.circle_new_error1, {
        timeout: 2000,
        type: 'error',
      });
      return false
    }
    
    if (this.props.teamCreation) {
      if (!this.props.selectedSubAccount) {
        this.props.alert.show(this.props.viewer.me.profileType === 'PERSON' ? localizations.circle_new_error3_child : localizations.circle_new_error3_team, {
          timeout: 2000,
          type: 'error',
        });
        return false
      }
      if (this.props.selectedSubAccount.circles && this.props.selectedSubAccount.circles.edges.filter(edge => edge.node.name === this.props.name).length > 0) {
        this.props.alert.show(localizations.circle_new_error2, {
          timeout: 2000,
          type: 'error',
        });
        return false
      }
    }
    else if (this.props.viewer.me && this.props.viewer.me.circles && this.props.viewer.me.circles.edges.filter(edge => edge.node.name === this.props.name).length > 0) {
      this.props.alert.show(localizations.circle_new_error2, {
        timeout: 2000,
        type: 'error',
      });
			return false
    }
    
		return true
	}

  _handleSubmit = () => {
    if(this._validate()) {
      this.props.onErrorChange(false)
      this._submitUpdate()
    } else {
      this.props.onErrorChange(true)
    }
  }

  render() {
		
    return(
      <section>
        <div style={styles.container}>
          <ToggleDisplay show={this.state.showConfirm}>
            <div>
              <span style={styles.confirm}>Do you want to edit this venue?</span>&nbsp;&nbsp;&nbsp;
              <span style={styles.linkYes} onClick={this._confirmSubmit}>Yes</span>&nbsp;&nbsp;&nbsp;
              <span style={styles.linkNo} onClick={this._cancelSubmit}>No</span> 
            </div>
          </ToggleDisplay>
          <ToggleDisplay show={this.state.showConfirmDelete}>
            <div>
              <span style={styles.error}>Do you want to delete this venue?</span>&nbsp;&nbsp;&nbsp;
              <span style={styles.linkYes} onClick={this._confirmDelete}>Yes</span>&nbsp;&nbsp;&nbsp;
              <span style={styles.linkNo} onClick={this._cancelDelete}>No</span> 
            </div>
          </ToggleDisplay>
          {
            this.state.isLoading === true 
            ? <div style={styles.loadingContainer}><Loading type='cylon' color={colors.blue} /></div>
            : <button onClick={this._handleSubmit} style={styles.submitButton}>{localizations.circles_save}</button>
          }          
        </div>
      </section>
    )
  }
}

Submit.propTypes = ({
  name: PropTypes.string.isRequired,
})

export default withAlert(Radium(Submit))

styles = {
  container: {
    //width: '80%',
  },
  submitButton: {
    width: '600px',
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
    '@media (max-width: 640px)': {
      width: '100%',
    },
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  }
}
