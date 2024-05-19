import React, { Component } from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';  
import ReactTooltip from 'react-tooltip';
import Button from './Button';
import localizations from '../Localizations';
import Circle from './Circle';

// import '../NewSportunity/popup.css';
import { colors } from '../../theme';

let styles;
 
class ConfirmParticipantPopup extends Component{

  render() {

    const {
      sportunity, 
      onClose,  
      shouldGoToJoinWaitingList, 
      participant,
      onConfirm
    } = this.props;

    return (
      <div style={styles.pageContainer}>
        <ReactTooltip 
          effect="solid" 
          multiline={true}
        />
        <div 
          style={styles.container} 
          id="popupContainer"
        >
          <span 
            onClick={onClose} 
            style={styles.closeCross}
          >
            <i 
              className="fa fa-times" 
              style={styles.cancelIcon} 
              aria-hidden="true"
            ></i>
          </span> 
          <div style={styles.title}>
            {shouldGoToJoinWaitingList ? localizations.event_confirmation_popup_participant : localizations.event_annulation_popup_participant}
          </div>
          <div style={styles.sportunityTitle}>
            {sportunity.title}
          </div>  
          <div style={styles.blocUser}>
            <div style={styles.blocLabel}>
              {localizations.profile_title}
            </div>
            <div style={styles.users}>
              <div style={styles.infoLine}>
                <div>
                  <Circle
                    name={''}
                    link={`/profile-view/${participant.id}`}
                    image={participant.avatar}
                    type={'popup'} 
                  />
                </div>
              </div>
            </div>
          </div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.profile_pseudo}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                <div>{participant.pseudo}</div>
              </div>
            </div>
          </div> 
          <div style={styles.buttonContainer}> 
            <Button              
              style={shouldGoToJoinWaitingList ? styles.confirm : styles.cancel}
              text={shouldGoToJoinWaitingList ? localizations.event_confirmation_popup_participant : localizations.event_annulation_popup_participant}
              onClick={()=>onConfirm(participant)}
            />
          </div>
        </div> 
      </div> 
    );
  }
}
 
styles = {
  pageContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 200,

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
    maxHeight: '90vh',
    backgroundColor: colors.blue,
    borderRadius: 25,
    paddingTop: 15,
    paddingBottom: 25,
    paddingLeft: 20,
    paddingRight: 25,
    position: 'relative',
    overflowY: 'auto',
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
    marginBottom: 25
  },
  blocLabel: {
    width: 120,
    flexShrink: 0
  },
  infos: {
    display: 'flex',
    flexDirection: 'column'
  },
  infoLine: {
    marginBottom: 13
  }, 
  calendarIcon: {
    fontSize: 18,
    marginRight: 11,
  },
  markerIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  sportIcon: {
    borderRadius: '50%',
    width: 20,
    height: 20,
    filter: 'invert(1)',
     backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'inline-block',
    marginRight: 11
  }, 
  cardLine:{
    display: 'flex',
    alignItems: 'center',
    marginBottom: 8
  },
  cardIcon: {
    width: 40,
    marginRight: 15
  }, 
  cardSelect: {
    width: 300,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    fontFamily: 'Lato',
    paddingBottom: 5,
    fontSize: 16,
    lineHeight: 1,
    paddingLeft: 3
  }, 
  addACardButton: {
    cursor: 'pointer',
    width: 300,
    textAlign: 'center',
    textDecoration: 'underline'
  }, 
  buttonContainer: {
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10
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
  blocUser: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 25
  },
  users: {
    display: 'flex',
    flexDirection: 'column'
  },
  confirm: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 180,
    height: 57,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 15,
    cursor: 'pointer', 
  },
  cancel: {
    backgroundColor: colors.red,
    color: colors.white,
    width: 180,
    height: 57,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 15,
    cursor: 'pointer',  
  },
};

export default createFragmentContainer(Radium(ConfirmParticipantPopup), {
  sportunity: graphql`
    fragment ConfirmParticipantPopup_sportunity on Sportunity {
      title,
      address {
        address,
        city
      },
      participants {
        id
      },
      participantRange {
        from,
        to,
      },
      beginning_date,
      ending_date,
      price {
        cents, 
        currency
      },
      sport {
        sport {
          logo
          name {
            EN
            DE
            FR
          }
        }
      }
    }
  `,
});