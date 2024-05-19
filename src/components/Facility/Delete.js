import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loading from 'react-loading';
import { withAlert } from 'react-alert'
import ToggleDisplay from 'react-toggle-display'

import DeleteFacilityMutation from './Mutations/DeleteFacilityMutation.js'
import * as types from '../../actions/actionTypes.js';
import { colors } from '../../theme';
import localizations from '../Localizations'

let styles;

class Delete extends Component {

    constructor() {
        super();
        this.state = {
           isLoading: false,
           showConfirmDelete: false
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

    _confirmDelete = () => {
        this.setState({
            showConfirmDelete: true
        })
    }

    _deleteFacility = () => {
        DeleteFacilityMutation.commit({
                viewer: this.props.viewer,
                facilityIdVar: this.props.facilityId,
            },
            {
                onFailure: error => {
                    this.props.alert.show(localizations.popup_facility_update_failed, {
                        timeout: 2000,
                        type: 'error',
                    });
                    let errors = JSON.parse(error.getError().source);
                    console.log(errors);
                    this._changeLoadingStatus(false);
                },
                onSuccess: (response) => {
                    console.log(response);
                    this._changeLoadingStatus(false);
                    this.props.alert.show(localizations.popup_facility_update_success, {
                        timeout: 2000,
                        type: 'success',
                    });
                    this.props.onClose();
                },
            }
        );
    }

    _cancelDelete = () => {
        this.setState({
            showConfirmDelete: false    
        })
    }

    render() {
		return(
            <div style={styles.container}>
                <ToggleDisplay show={this.state.showConfirmDelete}>
                    <div>
                      <span style={styles.error}>{localizations.manageVenue_facility_delete_confirmation}</span>&nbsp;&nbsp;&nbsp;
                      <span style={styles.linkYes} onClick={this._deleteFacility}>{localizations.manageVenue_confirm_yes}</span>&nbsp;&nbsp;&nbsp;
                      <span style={styles.linkNo} onClick={this._cancelDelete}>{localizations.manageVenue_confirm_no}</span> 
                    </div>
                </ToggleDisplay>
                {this.state.isLoading === true 
                ?   <Loading type='spinningBubbles' color='#e3e3e3' />
                :   <button onClick={this._confirmDelete} style={styles.submitButton}>
                        {localizations.manageVenue_facility_delete}
                    </button>
                }
            </div>
        )
    }
}

// REDUX //

const stateToProps = (state) => ({
    venueId: state.facilityReducer.venueId,
	venue: state.facilityReducer.venue,
	facilityId: state.facilityReducer.facilityId,
});

const dispatchToProps = (dispatch) => ({
});

export default connect(
    stateToProps,
    dispatchToProps
)(withAlert(Delete));

styles = {
    container: {
        width: '100%',
    },
    submitButton: {
        width: '100%',
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
    linkYes: {
        color: colors.gray,
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
