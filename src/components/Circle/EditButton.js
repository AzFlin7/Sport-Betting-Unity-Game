import React, { Component } from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import ReactLoading from 'react-loading'
import Modal from 'react-modal'
import {  Button } from '@material-ui/core';
import { withAlert } from 'react-alert'
import ToggleDisplay from 'react-toggle-display'
import UpdateCircleMutation from './UpdateCircleMutation'
import DeleteCircleMutation from './DeleteCircleMutation'
import localizations from '../Localizations'
import { colors } from '../../theme';


let styles, modalStyles

class EditButton extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isProcessing: false,
      isError: false,
			isDuplicateName: false,
			isEmptyName: false,
      showConfirmEdit: false,
      showConfirmDelete: false,
      mode: props.mode ? props.mode : 'view'
    }

    this.alertOptions = {
      offset: 14,
      position: 'top right',
      theme: 'light',
      timeout: 100,
      transition: 'fade',
    };
  }
  // don't need it here, the circle is not here anymore
  // _submitUpdate = () => {
  //   this.setState({ isProcessing: true })
  //   //this._changeLoadingStatus(true);
  //   const viewer = this.props.viewer
  //   const userIDVar = this.props.viewer.id
  //   const idVar = this.props.circleId
  //   const nameVar = this.props.circleName
  //   const modeVar = this.props.isCirclePublic ? 'PUBLIC' : 'PRIVATE';
  //   const isCircleUpdatableByMembersVar = this.props.isCircleUpdatableByMembers;

  //   UpdateCircleMutation.commit({
  //       viewer,
  //       userIDVar,
  //       idVar,
  //       nameVar,
  //       modeVar,
  //       isCircleUpdatableByMembersVar
  //     },
  //     {
  //       onFailure: error => {
  //         setTimeout(() => {
  //           this.setState({ isProcessing: false })
  //           this.props.onClose();}, 1500)
  //         this.props.alert.show(localizations.popup_editCircle_update_failed, {
  //           timeout: 2000,
  //           type: 'error',
  //         });
  //         let errors = JSON.parse(error.getError().source);
  //         console.log(errors);
  //       },
  //       onSuccess: (response) => {
  //         console.log(response);
  //         //this._changeLoadingStatus(false);
  //         setTimeout(() => {
  //           this.setState({ isProcessing: false })
  //           this.props.onClose();}, 1500)
  //         this.props.alert.show(localizations.popup_editCircle_update_success, {
  //           timeout: 2000,
  //           type: 'success',
  //         });

  //       },
  //     }
  //   )
  // }

  _submitDelete = () => {
    this.setState({ isProcessing: true })
    //this._changeLoadingStatus(true);
    const viewer = this.props.viewer
    const userIDVar = this.props.viewer.id
    const idVar = this.props.circleId

    DeleteCircleMutation.commit({
        viewer,
        userIDVar,
        idVar,
      },
      {
        onFailure: error => {
          setTimeout(() => {
            this.setState({ isProcessing: false })
            this.props.onClose('fail');}, 1500)
          this.props.alert.show(localizations.popup_editCircle_update_failed, {
            timeout: 2000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);

        },
        onSuccess: (response) => {
          console.log(response);
          //this._changeLoadingStatus(false);
          setTimeout(() => {
            this.props.router.push(`/my-circles`)
          }, 1500)
          this.props.alert.show(localizations.popup_editCircle_update_success, {
            timeout: 2000,
            type: 'success',
          });
        },
      }
    )
  }

  _checkName = () => {
    if(this.props.circleName.length) {
      //this.props.onErrorChange(false);
      this.setState({isEmptyName: false});
      return true;
    } else {
      //this.props.onErrorChange(true);
      this.setState({isEmptyName: true});
      return false
    }
  }

  _checkDuplicate = () => {
    const { viewer } = this.props
    if(this.props.circles.edges
      .filter(edge => edge.node.name === this.props.circleName && edge.node.id !== this.props.circle.id).length > 0) {
        this.setState({
          isDuplicateName: true,
        })
        return true
    }
    else {
      this.setState({
        isDuplicateName: false,
      })
      return false
    }
  }

  _handleEdit = () => {
    if(this._checkName()) {
      this.setState({
        mode: 'view'
      });
      this.props.receiveAction('save');
    }
    else {
      console.log(this._checkName(), this._checkDuplicate());

    }
  }

  _handleDelete = () => {
    this.setState({
      showConfirmDelete: true,
    })
  }

  _confirmEdit = () => {
    this._submitUpdate()
  }

  _cancelEdit = () => {
    this.setState({
      showConfirmEdit: false,
    })
  }

  _confirmDelete = () => {
    this.setState({
      showConfirmDelete: false,
    });
    this._submitDelete()
  }

  _cancelDelete = () => {
    this.setState({
      showConfirmDelete: false,
    })
  }

  render() {
    return(
      <section>
        <div style={styles.container}>
          {
            this.state.isProcessing
            ? <div style={{margin: 'auto',display: 'flex', justifyContent: 'center'}}><ReactLoading type='cylon' color={colors.blue} /></div>
            : <section>
                {/* <ToggleDisplay show={this.state.isDuplicateName}>
                  <div style={styles.error}>The circle name already exists.</div>
                </ToggleDisplay> */}
                <ToggleDisplay show={this.state.isEmptyName}>
                  <div style={styles.error}>This name is empty.</div>
                </ToggleDisplay>
                <ToggleDisplay show={this.state.showConfirmEdit}>
                  <div>
                    <span style={styles.confirm}>{localizations.circles_editConfirm}</span>&nbsp;&nbsp;&nbsp;
                    <span style={styles.linkYes} onClick={this._confirmEdit}>{localizations.circle_yes}</span>&nbsp;&nbsp;&nbsp;
                    <span style={styles.linkNo} onClick={this._cancelEdit}>{localizations.circle_no}</span>
                  </div>
                </ToggleDisplay>
                  <Modal
                    style={modalStyles}
                    isOpen={this.state.showConfirmDelete}
                  >

                    <div>
                      <span style={styles.error}>{localizations.circles_deleteConfirm}</span>&nbsp;&nbsp;&nbsp;
                      <span style={styles.linkYes} onClick={this._confirmDelete}>{localizations.circle_yes}</span>&nbsp;&nbsp;&nbsp;
                      <span style={styles.linkNo} onClick={this._cancelDelete}>{localizations.circle_no}</span>
                    </div>
                  </Modal>

                <div style={{ marginLeft: '7%', marginTop: '20px', marginBottom: '20px' }}>

                        {this.state.mode === 'view' &&
                        <div>
                        <Button style={ styles.dataCellButton } variant='contained' onClick={() => {
                          this.setState({ mode: 'edit'});
                          this.props.receiveAction('edit');
                        }}>{ localizations.circles_edit }</Button>
                        <Button variant='contained'
                        style={styles.dataCellDeleteButton} //#c61331
                        onClick={this._handleDelete}>{localizations.circles_delete}</Button>
                        </div>
                        }
                          { this.state.mode === 'edit' &&
                            <div><Button variant='contained'
                            style={styles.dataCellButton}
                            onClick={this._handleEdit}
                            >{localizations.circles_save}</Button>
                            <Button variant='contained'
                              style={styles.dataCellDeleteButton} //#c61331
                              onClick={() => {
                                this.setState({ mode: 'view'});
                                this.props.receiveAction('cancel');
                              }}
                            >{localizations.info_cancel}</Button>
                            </div>
                            }

                        </div>


                {/* <button onClick={this._handleEdit} style={styles.editButton}>{localizations.circles_save}</button>
                <button onClick={this._handleDelete} style={styles.deleteButton}>{localizations.circles_delete}</button> */}
              </section>
          }

        </div>
      </section>
    )
  }
}

modalStyles = {
	overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.75)',
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		border: '1px solid #ccc',
		background: '#fff',
		overflow: 'auto',
		WebkitOverflowScrolling: 'touch',
		borderRadius: '4px',
		outline: 'none',
		padding: '20px',
	},
}

styles = {
  container: {
    width: '80%',
  },
	dataCellButton: {
		backgroundColor: colors.blue,
		width: '160px',
		marginLeft: '30px',
		color: colors.white,
		fontSize: '16px',
		fontFamily: 'Lato'
   },

  editButton: {
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
  dataCellDeleteButton: {
    backgroundColor: '#c61331',
    width: '160px',
    marginLeft: '30px',
    color: colors.white,
    fontSize: '16px',
    fontFamily: 'Lato'
 },
  deleteButton: {
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


export default withAlert(EditButton);
