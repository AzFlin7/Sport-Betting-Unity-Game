
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PureComponent, { pure } from '../common/PureComponent'
import { withRouter } from 'found';
import Radium from 'radium'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import AddSport from './AddSport'
// import IconTint from 'react-icon-tint'
import Modal from 'react-modal'
import localizations from '../Localizations'

import { metrics, colors, fonts } from '../../theme';

let styles
let modalStyles

class Sports extends PureComponent {

  state = {
    sport: '',
    openDeleteSport: false,
    sportIdToDelete: '',
  }

  _updateSports = (item) => {
    this.setState({
      sport: {
        sport: item.node.name.EN,
      },
    });
  }

  _goToSports = () => {
    this.props.router.push('/sports-update');
  }

  _onDeleteSport (e) {
    this.setState({
      sportIdToDelete: e,
      openDeleteSport: true,
    })
  }

  _handleCancel = () => {
    this.setState({
      openDeleteSport: false,
    })
  }

  _handleConfirm = () => {
    this.props.onDeleteSport(this.state.sportIdToDelete)
    this.setState({
      openDeleteSport: false,
    })
  }

  render() {
    const {  viewer } = this.props;
    return (
      <div style={styles.container}>
        <h2 style={styles.h2}>{localizations.profile_yourSports}</h2>

        <panel style={styles.sportList}>
          {
            this.props.sports && this.props.sports.length > 0
            ? this.props.sports.map((sport) => {
              return(
              <div
                style={styles.sportItem}
                key={sport.sport.id}
              >
                {/* <IconTint width='60' height='60' src={sport.sport.logo} color={colors.blue}/> */}


                <div style={styles.info}>
                  <div style={styles.nameLevel}>
                    <h4 style={styles.name}>
                      {sport.sport.name}
                    </h4>
                    <span style={styles.level}> - {sport.levelFrom.name}
                    { (sport.levelTo && sport.levelTo.value !== sport.levelFrom.value)
                      && ' '+localizations.profile_to+' ' + sport.levelTo.name
                    }</span>
                  </div>
                  <span style={styles.certificate}>
                    {!sport.positions.length ? '' : localizations.profile_positions + ': ' + sport.positions.map(position => position.name).join(', ')}
                  </span>
                  <span style={styles.certificate}>
                    {!sport.certificates.length ? '' : localizations.profile_certificates + ': ' + sport.certificates.map(certificate => certificate.name).join(', ')}
                  </span>
                  <span style={styles.certificate}>
                    {!sport.assistantType.length ? '' : localizations.profile_assistants + ': '+ sport.assistantType.map(type => type.name).join(', ')}
                  </span>
                </div>
                <div style={styles.cross}>
                  <div style={styles.close} onClick={this._onDeleteSport.bind(this, sport.sport.id)} >
                    <i className="fa fa-times"
                      style={styles.crossIcon}

                      aria-hidden="true" ></i>
                  </div>
                </div>


              </div>
            )
          })
          : <p style={styles.noSport_description}>{localizations.profile_yourSports_empty}</p>
          }
          <AddSport viewer={viewer} {...this.props} />
        </panel>
        <Modal isOpen={this.state.openDeleteSport}
                contentLabel='Delete Sport'
                style={modalStyles}>
          <div style={styles.modalContent}>
            <div style={styles.row}>
              Delete Sport?
            </div>
            <div style={styles.row}>
              <button style={styles.submitButton}
													onClick={this._handleConfirm}>Yes</button>&nbsp;&nbsp;&nbsp;&nbsp;
              <button style={styles.cancelButton}
													onClick={this._handleCancel}>No</button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

Sports.propTypes = ({
  meSports: PropTypes.array.isRequired,
});

modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    overlfow: 'scroll', // <-- This tells the modal to scrol
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
    padding                    : '30px 50px',

  },

}

export default createFragmentContainer(Radium(withRouter(Sports)), {
      viewer: graphql`
          fragment Sports_viewer on Viewer {
      ...AddSport_viewer
          }
      `,
  meSports: graphql`
    fragment Sports_meSports on SportDescriptor @relay(plural: true) {
      sport {
        id,
        name {
          EN
          FR
          DE
        },
        logo,
        levels {
          id,
          EN {
            skillLevel
            name
            description
          }
          FR {
            skillLevel
            name
            description
          }
          DE {
            skillLevel
            name
            description
          }
        }
        positions {
          EN
          FR
          DE
        }
        assistantTypes {
          id,
          name {
            EN,
            DE,
            FR
          }
        }
      }
    }
  `,
});

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: metrics.margin.large,
    color: colors.black,
  },
  sportIcon: {
    marginRight: metrics.margin.large,
    width: 35,
    height: 35,
    borderRadius: 35,
  },
  h2: {
    fontSize: fonts.size.xl,
    color: colors.blue,
    fontWeight: fonts.size.xl,
    marginBottom: metrics.margin.medium,
  },
  sportList: {
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: 'red',
  },
  sportItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.large,

  },
  info: {
    alignSelf: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    width:380,
    marginLeft: 20,
    '@media (max-width: 385)': {
      width: 320,
    },
  },
  cross: {
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  crossIcon: {

  },
  close: {

    transform: 'translateY(50%)',

    width: 20,
    height: 20,

    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: '50%',
    color: colors.white,
    marginRight: 10,
    backgroundColor: '#5E9FDF',
    boxShadow: '0 0 2px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24)',
  },
  nameLevel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: fonts.size.xl,
    marginRight: metrics.margin.small,
    marginBottom: metrics.margin.tiny,
  },
  level: {
    fontSize: fonts.size.small,
  },
  certificate: {
    fontSize: fonts.size.small,
    marginBottom:  metrics.margin.tiny,
  },
  edit: {
    fontSize: fonts.size.medium,
    color: colors.blue,
    marginLeft: 'auto',
  },
  addButton: {
    backgroundColor: colors.blue,
    color: colors.white,
    fontSize: fonts.size.small,
    padding: metrics.padding.tiny,
    borderRadius: metrics.radius.tiny,
    marginTop: metrics.margin.medium,
    alignSelf: 'flex-start',
    outline: 'none',
  },
  modalContent: {
    fontFamily: 'Lato',
    fontSize: 20,
    color: colors.black,
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display:'flex',
    alignSelf: 'center',
    marginTop: 20,
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
  noSport_description: {
    fontSize: 16,
    lineHeight: 1.2,
    marginBottom: 20,
  }
}
