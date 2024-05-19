import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PureComponent, { pure } from '../common/PureComponent'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { connect } from 'react-redux';
import debounce from 'lodash.debounce'
import ProfileUpdateMutation from './ProfileUpdateMutation';
import Header from '../common/Header/Header.js'
import Footer from '../common/Footer/Footer'
import Loading from '../common/Loading/Loading'
import Avatar from './Avatar.js';
import Inputs from './Inputs.js';
import Languages from './Languages.js';
import Sports from './Sports.js';
import Birthday from './Birthday.js'
import Address from './Address.js';
import PublicAddress from './PublicAddress.js'
import Submit from './Submit.js';
import * as types from '../../actions/actionTypes.js';
import { bindActionCreators } from 'redux';
import { metrics, colors, fonts } from '../../theme';
import ToggleDisplay from 'react-toggle-display'
import localizations from '../Localizations'

import Radium from 'radium'

let styles;

class Profile extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      sports: [],
      loading: true,
      language: localizations.getLanguage(),
      avatarFile: null
    }
	}

  _handleUpdateAvatar = (file) => {
    this.setState({
      avatarFile: file
    });
  }

  _setLanguage = (language) => {
    this.setState({ language: language })
  }

  componentDidMount () {
    this.setSports();
    setTimeout(() => {
      this.setState({ loading: false })
    }
    , 1500);
  }

  setSports = () => {
    if (this.props.viewer && this.props.viewer.me)
      this.setState({
        sports: this._convert(this.props.viewer.me.sports),
      })
    else
      setTimeout(() => this.setSports(), 400)
  }

  _addSport = (sport) => {
    this.setState({
      sports: [...this.state.sports, sport],
    })
  }

  _deleteSport = (id) => {
    const deletedSports = this.state.sports.filter(sport => sport.sport.id !== id)
    this.setState({
      sports: deletedSports,
    })
  }

  _convert = (sports) => {
    console.log("convert", sports);
    let res = sports.map(sport => { return {
      sport: {
        id: sport.sport.id,
        logo: sport.sport.logo,
        name: sport.sport.name[localizations.getLanguage().toUpperCase()],
      },
      levels: sport.levels.map(level => { return {
        id: level.id,
        name: level[localizations.getLanguage().toUpperCase()].name,
      }}),
      levelFrom: sport.levels.length && {
        value: sport.levels[0].id,
        name: sport.levels[0][localizations.getLanguage().toUpperCase()].name,
      },
      levelTo: sport.levels.length && {
        value: sport.levels[sport.levels.length - 1].id,
        name: sport.levels[sport.levels.length - 1][localizations.getLanguage().toUpperCase()].name,
      },
      positions: sport.positions.map(position => { return {
        value: position.id,
        name: position[localizations.getLanguage().toUpperCase()],
      }}),
      certificates: sport.certificates.map(certificate => ({value: certificate.certificate.id, name: certificate.certificate.name[localizations.getLanguage().toUpperCase()]})),
      assistantType: sport.assistantType.map(assistantType => ({
        value: assistantType.id, 
        name: assistantType.name[localizations.getLanguage().toUpperCase()]
      }))
    }})

    return res
  }

  render() {
    const { viewer } = this.props ;
    const { me } = viewer ;

    return (
      <div style={styles.container}>
        {this.state.loading && <Loading />}
        {viewer && viewer.me 
        ? <div style={{backgroundColor: colors.white}}>
            <div style={styles.title}>
              <h1 style={styles.h1}>{localizations.profile_title}</h1>
              <h6 style={styles.span}>({localizations.profile_subTitle})</h6>
            </div>
            <div style={styles.panel}>
              <ToggleDisplay show={!(me.sex && me.publicAddress && me.sports && me.sports.length > 0)}>
                <div style={styles.headerMessage}>{localizations.profile_note}</div>
                <div style={styles.headerMessage}>{localizations.profile_node_2}</div>
              </ToggleDisplay>
            </div>
            <div style={styles.panel}>
              <section style={styles.leftContainer}>
                <Avatar
                  _updateAvatar={this._handleUpdateAvatar}
                  avatarUrl={viewer.me.avatar}
                />
                <Inputs
                  userID={viewer.me.id}
                  user={viewer.me}
                  {...this.state}
                />
                {viewer.me.profileType === 'PERSON' &&
                  <Birthday
                    user={viewer.me}
                  />
                }
                <PublicAddress
                  publicAddress={viewer.me.publicAddress}
                />

                <Languages
                  languages={viewer.languages}
                  meLanguages={viewer.me.languages}
                  {...this.state}
                />

              </section>

              <section style={styles.rightContainer}>
                <Sports
                  meSports={viewer.me ? viewer.me.sports : []}
                  sports={this.state.sports}
                  viewer={viewer}
                  onAddSport={this._addSport}
                  onDeleteSport={this._deleteSport}
                  {...this.state}
                />
                <Submit
                  viewer={viewer}
                  user={viewer.me}
                  sports={this.state.sports}
                  avatarFile={this.state.avatarFile}
                  {...this.state}
                />
              </section>
            </div>
          </div>
          : <div></div>
        }
      </div>
    );
  }
}

Profile.propTypes = ({
  // viewer: PropTypes.object.isRequired,
});

const stateToProps = (state) => ({
  isProfileFromLogin: state.loginReducer.isProfileFromLogin,
})

const _updateIsProfilFromLogin = (value) => ({
  type: types.UPDATE_IS_PROFILE_FROM_LOGIN,
  value,
})

const dispatchToProps = (dispatch) => ({
  _updateIsProfilFromLogin: bindActionCreators(_updateIsProfilFromLogin, dispatch),
})

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(Radium(Profile));

// Container
// This is higher orther component connected to router, it will get viewer from router
// Viewer will be updated by the data we query here
// This is where you write queries
// ...Languages_languages is taking fragment from Languages component
// Languages component will be updated after query ( we need to pass languages={viewer.languages}) line 45
export default createFragmentContainer(Radium(ReduxContainer), {
  viewer: graphql`
    fragment Profile_viewer on Viewer {
      id,
      ...Sports_viewer,
      languages {
        ...Languages_languages,
      },
      me {
        id
        pseudo,
        email,
        avatar,
        firstName,
        lastName
        description,
        sex,
        profileType
        birthday,
        hideMyAge,
        address {
          ...Address_address,
        }
        publicAddress {
          ...PublicAddress_publicAddress
        }
        languages {
          id
          code
          name
          ...Languages_languages,
        }
        sports  {
          ...Sports_meSports,
          sport {
            id
            type
            logo
            name {
              EN
              DE
              FR
            }
          }
          levels {
            id
            EN {
              name
            }
            DE {
              name
            }
            FR {
              name
            }
          }
          positions {
            id
            EN
            DE
            FR
          }
          certificates {
            certificate {
              id
              name {
                EN,
                FR,
                DE
              }
            }
          }
          assistantType {
            id,
            name {
              EN,
              DE,
              FR
            }
          }
        }
      }
    }
  `,
});

styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    fontFamily: 'Lato',
  },
  headerMessage: {
    color: colors.error,
    fontFamily: 'Lato',
    fontSize: 16,
    marginBottom: 30,
  },
  title: {
    display: 'flex',
    alignItems: 'flex-end',
    margin: metrics.margin.xxxl,
    '@media (max-width: 600px)': {
      margin: '3%',
    }
  },
  h1: {
    fontSize: fonts.size.xxl,
    color: colors.blue,
    fontWeight: fonts.weight.xxl,

  },
  span: {
    fontSize: 15,
    color: colors.blue,
    marginLeft: metrics.margin.tiny,
    marginBottom: 3,
  },
  panel: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    '@media (max-width: 600px)': {
      width: '100%',
      display: 'block',
    }
  },
  leftContainer: {
    fontFamily: 'Lato',
    width: '30%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginRight: metrics.margin.medium,
    '@media (max-width: 768px)': {
      width: '42%',
    },
    '@media (max-width: 600px)': {
      width: '94%',
      margin: '0 auto',
    }
  },
  rightContainer: {
    fontFamily: 'Lato',
    width: '30%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: metrics.margin.medium,
    '@media (max-width: 768px)': {
      width: '42%',
    },
    '@media (max-width: 600px)': {
      width: '94%',
      margin: '0 auto',
    }
  },
}

// <Address
//   viewer={viewer}
//   address={viewer.me.address}
// />

// <Account
//   email={viewer.me.email}
// />

// <Birthday
//   birthday={viewer.me.birthday}
// />
