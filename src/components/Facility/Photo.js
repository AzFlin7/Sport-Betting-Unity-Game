import React from 'react'
import { appStyles, fonts, colors, metrics } from '../../theme'
import request from 'superagent'
import { withAlert } from 'react-alert'

import * as types from '../../actions/actionTypes.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FileReaderInput from 'react-file-reader-input';
import localizations from '../Localizations'

let styles 
class Photo extends React.Component {
  constructor() {
    super();
    this.state = {
      logoUrl: ''
    } 
    this.alertOptions = {
      offset: 14,
      position: 'top right',
      theme: 'light',
      timeout: 100,
      transition: 'fade',
    };
  }
 
  componentDidMount () {
    this.setState({
      logoUrl: this.props.photo
    });
  }

  _updatePhoto = (e, results) => {
    results.forEach(result => {
      const [e, file] = result;
      if (file.size / 1000000 > 1) {
        this.props.alert.show(localizations.popup_editProfile_avatar_too_big, {
          timeout: 4000,
          type: 'error',
        });
      }
      else {
        this.setState({logoUrl: e.target.result})
        this.props._setPhotoAction(file)
      }
    });
  }

	render() {
    const { photo } = this.props;

		return(
			<section style={styles.container}>
				<div 
          style={{...styles.avatar, backgroundImage: this.state.logoUrl ? 'url('+ this.state.logoUrl +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} 
        />
        <FileReaderInput 
          as='url' 
          id="my-file-input"
          onChange={this._updatePhoto}>
            <button style={appStyles.blueButton}>
              {photo ? localizations.manageVenue_facility_uploadAvatar_update : localizations.manageVenue_facility_uploadAvatar_new}
            </button>
        </FileReaderInput>
			</section>
		)
	}
}

const stateToProps = (state) => ({
  photo: state.facilityReducer.photo,
});

const _setPhotoAction = (photo) => ({
	type: types.FACILITY_SET_PHOTO,
  photo: photo,
})

const dispatchToProps = (dispatch) => ({
  _setPhotoAction: bindActionCreators(_setPhotoAction, dispatch),
});

const ReduxContainer = connect(
  stateToProps,
	dispatchToProps
)(Photo);


export default withAlert(ReduxContainer)

styles = {
	container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  h2: {
    fontSize: fonts.size.xl,
    color: colors.blue,
    fontWeight: fonts.size.xl,
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 80,
    marginTop: metrics.margin.medium,
    marginBottom: metrics.margin.medium,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  buttonContainer: {

  },

}