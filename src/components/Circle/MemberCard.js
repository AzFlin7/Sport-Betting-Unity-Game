import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { colors, fonts, metrics } from '../../theme';
import Modal from 'react-modal';
import Radium from 'radium';
import { Link } from 'found';
import ReactLoading from 'react-loading';

import localizations from '../Localizations';

let styles, modalStyles;

class MemberCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      memberToRemove: null,
      isLmemboading: false,
    };
    this._handleOnRemove = this._handleOnRemove.bind(this);
    this._closeModal = this._closeModal.bind(this);
    this._confirmDelete = this._confirmDelete.bind(this);
  }

  componentDidMount() {
    Modal.setAppElement('#root');
  }

  _handleOnRemove(id) {
    this.setState({
      modalIsOpen: true,
      memberToRemove: id,
    });
  }

  _closeModal = () => {
    this.setState({
      modalIsOpen: false,
    });
  };

  _confirmDelete = () => {
    this.setState({ isLoading: true });
    this.props.onDeleteMember(this.state.memberToRemove);
  };

  render() {
    const {
      member,
      userCanRemoveMember,
      userFilledInfos,
      existingAskedInformation,
    } = this.props;

    return (
      <div style={styles.card}>
        <div style={styles.top}>
          {userCanRemoveMember && (
            <input
              type="checkbox"
              style={styles.checkBox}
              onChange={() => this.props.handleUserClicked(member)}
              checked={this.props.selectedUserList.indexOf(member.id) >= 0}
            />
          )}
          {userCanRemoveMember && (
            <div
              style={styles.remove}
              onClick={() => this._handleOnRemove(member.id)}
            >
              <i className="fa fa-times" style={styles.iconRemove} />
            </div>
          )}
        </div>
        <div style={styles.middle}>
          <Link to={`/profile-view/${member.id}`} style={styles.middleLeft}>
            <div style={styles.icon}>
              {/*<img src={member.avatar} style={styles.iconImage}/>*/}
              <div
                style={{
                  ...styles.iconImage,
                  backgroundImage: member.avatar
                    ? `url(${member.avatar})`
                    : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                }}
              />
            </div>
            <div style={styles.memberDetail}>
              <div style={styles.memberName}>{member.pseudo}</div>
              <div style={styles.memberSport}>
                {member.sports && member.sports.length > 0
                  ? member.sports.length > 6
                    ? member.sports
                        .map(
                          (sport, index) =>
                            index <= 6 &&
                            sport.sport.name[
                              localizations.getLanguage().toUpperCase()
                            ],
                        )
                        .filter(i => Boolean(i))
                        .join(', ') + '...'
                    : member.sports
                        .map(
                          sport =>
                            sport.sport.name[
                              localizations.getLanguage().toUpperCase()
                            ],
                        )
                        .join(', ')
                  : localizations.circle_no_sport_selected}
              </div>
              {member.sportunityNumber > 0 && (
                <div style={styles.memberEvent}>
                  <i className="fa fa-calendar-o" style={styles.iconItem} />
                  &nbsp;&nbsp;&nbsp;
                  {member.sportunityNumber +
                    ' ' +
                    localizations.circle_past_events}
                </div>
              )}
            </div>
          </Link>
        </div>

        <div style={styles.bottom}>
          {existingAskedInformation && (
            <span style={styles.memberFollowers}>
              <i
                className="fa fa-file-text"
                style={
                  userFilledInfos ? styles.iconItem : styles.iconItemDisabled
                }
                title={
                  userFilledInfos
                    ? localizations.circle_filledInfo
                    : localizations.circle_filledInfo_false
                }
              />
            </span>
          )}
          {!member.lastConnexionDate && (
            <span style={styles.memberFollowers}>
              <i
                className="fa fa-user-times"
                style={styles.iconNeverLoggedIn}
                title={localizations.circle_user_never_connected}
              />
            </span>
          )}
          {typeof member.followers !== 'undefined' && (
            <span style={styles.memberFollowers}>
              <i className="fa fa-heart" style={styles.iconItem} />
              {member.followers.length}
            </span>
          )}
        </div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this._closeModal}
          style={modalStyles}
          contentLabel={localizations.circle_removeMember}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalContent}>
                <div style={styles.modalText}>
                  {localizations.circle_removeMember} ?
                </div>
                <div style={styles.modalExplanation}>
                  {localizations.circle_removeMemberExplanation}
                </div>
                {this.state.isLoading ? (
                  <div style={styles.modalButtonContainer}>
                    <ReactLoading type="cylon" color={colors.blue} />
                  </div>
                ) : (
                  <div style={styles.modalButtonContainer}>
                    <button
                      style={styles.submitButton}
                      onClick={this._confirmDelete}
                    >
                      {localizations.circle_yes}
                    </button>
                    <button
                      style={styles.submitButton}
                      onClick={this._closeModal}
                    >
                      {localizations.circle_no}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

styles = {
  card: {
    width: 235,
    height: 235,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.white,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    overflow: 'hidden',
    fontFamily: 'Lato',
    margin: 10,
    //padding: 15,
    textDecoration: 'none',
    '@media (max-width: 420px)': {
      width: 'auto',
    },
  },
  top: {
    // flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: '10px',
    marginRight: '10px',
  },
  checkBox: {
    cursor: 'pointer',
    height: 14,
    width: 14,
    userSelect: 'all',
  },
  middle: {
    //flex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'space-between',
  },
  middleLeft: {
    //flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    textDecoration: 'none',
  },
  bottom: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    alignContent: 'flex-end',
  },
  icon: {
    width: 74,
    height: 74,
    //marginRight: 10,
    borderRadius: '50%',
    backgroundColor: colors.white,
    '@media (max-width: 768px)': {
      width: 'auto',
    },
  },
  iconImage: {
    color: colors.white,
    width: 75,
    height: 75,
    borderRadius: '50%',
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  memberDetail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // justifyContent: 'flex-start',
    //marginLeft: 10,
    //		width: 235,
    '@media (max-width: 768px)': {
      width: 'auto',
    },
  },
  memberName: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: '24px',
    color: 'rgba(0,0,0,0.65)',
  },
  memberSport: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '30px',
    color: 'rgba(0,0,0,0.65)',
  },
  memberEvent: {
    height: 19,
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '30px',
    color: 'rgba(0,0,0,0.65)',
    marginTop: 6,
  },
  memberFollowers: {
    height: 19,
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: '50px',
    color: 'rgba(0,0,0,0.65)',
    marginBottom: 0,
    marginRight: 8,
  },
  remove: {
    fontSize: 24,
    cursor: 'pointer',
    //padding: '10px 20px'
  },
  iconNeverLoggedIn: {
    color: colors.redGoogle,
    cursor: 'pointer',
  },
  iconItem: {
    color: colors.blue,
    marginRight: 3,
  },
  iconItemDisabled: {
    color: colors.black,
    marginRight: 3,
  },
  iconRemove: {
    color: '#A6A6A6',
    fontSize: '14px',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: 300,
    padding: 10,
    '@media (max-width: 768px)': {
      width: 'auto',
    },
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-center',
    justifyContent: 'flex-center',
  },
  modalTitle: {
    fontFamily: 'Lato',
    fontSize: 24,
    fontWeight: fonts.weight.medium,
    color: colors.blue,
    marginBottom: 20,
    flex: '2 0 0',
  },
  modalClose: {
    justifyContent: 'flex-center',
    paddingTop: 10,
    color: colors.gray,
    cursor: 'pointer',
  },
  modalText: {
    fontSize: 18,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    fontFamily: 'Lato',
  },
  modalExplanation: {
    fontSize: 16,
    color: colors.gray,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    fontFamily: 'Lato',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'justify',
  },
  modalButtonContainer: {
    fontSize: 18,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    fontFamily: 'Lato',
    marginTop: 30,
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
    margin: 10,
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
    margin: 10,
  },
};

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
};

export default createFragmentContainer(Radium(MemberCard), {
  viewer: graphql`
    fragment MemberCard_viewer on Viewer {
      id
    }
  `,
});
