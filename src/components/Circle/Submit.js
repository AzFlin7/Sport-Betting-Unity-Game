import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from 'react-loading';
import { withAlert } from 'react-alert'
//import ToggleDisplay from 'react-toggle-display'
import CircleMutation from './AddCircleMemberMutation'
import AddMembersMutation from './AddMembersMutation';
import { colors } from '../../theme'
import localizations from '../Localizations'


let styles

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

  isValidEmailAddress(address) {
    let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
    return re.test(address)
  }

  _submitUpdate = () => {
    //this._changeLoadingStatus(true);
    const viewer = this.props.viewer
    const userIDVar = this.props.viewer.id
    const idVar = this.props.circleId
    this.setState({isLoading: true})

    if (this.props.inviteFromCirclesFromOtherTeams) {
      const newUsersVar = this.props.selectedUserList;

      AddMembersMutation.commit({
          viewer,
          userIDVar,
          idVar,
          newUsersVar,
          circle: this.props.circle
        },
        {
          onFailure: error => {
            this.props.alert.show(error.getError().source.errors[0].message, {
              timeout: 2000,
              type: 'error',
            });
            this.setState({isLoading: false})
          },
          onSuccess: (response) => {
            this.props.alert.show(localizations.popup_editCircle_update_success, {
              timeout: 2000,
              type: 'success',
            });
            setTimeout(() => {
              this.setState({isLoading: false})
              this.props.onClose();
            }, 1500);
          },
        }
      )
    }
    else {
      const nameVar = this.props.user.pseudo
      const newUserIdVar = this.props.user.id;

      if (this.props.user.id) {
        CircleMutation.commit({
            viewer,
            userIDVar,
            idVar,
            newUserIdVar: newUserIdVar,
            circle: this.props.circle
          },
          {
            onFailure: error => {
              this.props.alert.show(error.getError().source.errors[0].message, {
                timeout: 2000,
                type: 'error',
              });
              this.setState({isLoading: false})
            },
            onSuccess: (response) => {
              console.log(response);
              this.props.alert.show(localizations.popup_editCircle_update_success, {
                timeout: 2000,
                type: 'success',
              });
              setTimeout(() => {
                this.setState({isLoading: false})
                this.props.onClose();
              }, 1500);
            },
          }
        )
      }
      else {
        let isEmail = this.isValidEmailAddress(nameVar);
        this.props.checkUserExistence(isEmail ? {email: nameVar} : {pseudo: nameVar}, () => {
          CircleMutation.commit({
              viewer,
              userIDVar,
              idVar,
              nameVar: !isEmail ? nameVar : '',
              emailVar: isEmail ? nameVar : '',
              newUserIdVar: null,
              circle: this.props.circle
            },
            {
              onFailure: error => {
                this.props.alert.show(error.getError().source.errors[0].message, {
                  timeout: 2000,
                  type: 'error',
                });
                this.setState({isLoading: false})
              },
              onSuccess: (response) => {
                console.log(response);
                this.props.alert.show(localizations.popup_editCircle_update_success, {
                  timeout: 2000,
                  type: 'success',
                });
                setTimeout(() => {
                  this.setState({isLoading: false})
                  this.props.onClose();
                }, 1500);
              },
            }
          )
        }, () => {
          this.props.alert.show(localizations.manageVenue_user_doesnt_exist, {
            timeout: 2000,
            type: 'error',
          });
          this.props.onErrorChange(true)
          this.setState({isLoading: false})
        });
      }
    }
  }

  _handleSubmit = () => {
    if (this.props.inviteFromCirclesFromOtherTeams) {
      if (this.props.selectedUserList && this.props.selectedUserList.length > 0) {
        this.props.onErrorChange(false)
        this._submitUpdate()
      }
      else {
        this.props.onErrorChange(true)
      }
    }
    else if(this.props.user && this.props.user.pseudo && this.props.user.pseudo.length) {
      this.props.onErrorChange(false)
      this._submitUpdate()
    } 
    else {
      this.props.onErrorChange(true)
    }
  }

  render() {
    return(
      <section>
        <div style={styles.container}>
          {this.state.isLoading === true 
          ? <Loading type='cylon' color={colors.blue}/>
          : <button onClick={this._handleSubmit} style={styles.submitButton}>{this.props.buttonLabel}</button>
          }
        </div>
      </section>
    )
  }
}

Submit.propTypes = ({
})

export default withAlert(Submit)

styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 'auto'
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
}
