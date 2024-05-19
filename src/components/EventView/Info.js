import React from 'react';
import Radium from 'radium';
import { createRefetchContainer, graphql } from 'react-relay';
import { Link } from 'found';
import cloneDeep from 'lodash/cloneDeep';
import ReactTooltip from 'react-tooltip';
import { withAlert } from 'react-alert';

import { formatDate } from './formatDate';
import InputText from './InputText';
import { colors } from '../../theme';

import VoteForManOfTheGame from './VoteForManOfTheGame';
import GameInformationRow from './GameInformationRow';
import TimeAndLocation from './TimeAndLocation';
import Price from './Price';
import FAQLinks from './FAQLinks';
import localizations from '../Localizations';
import CarPooling from './CarPooling';
import Comments from './Comments';
import Checkbox from '../common/Inputs/InputCheckbox';
import Invited from '../NewSportunity/Invited';
import Circle from './CircleRow';
import InvitedAnswersSurveyMutation from './mutations/InvitedAnswersSurveyMutation';
import OrganizerPickDateMutation from './mutations/OrganizerPickDateMutation';
import JoinCommunity from './JoinCommunity';
import UpdateSportunityOrganizerAccessMutation from './UpdateSportunityOrganizerAccessMutation';

const Title = ({ children }) => <h2 style={styles.title}>{children}</h2>;

const TitleBorderBottom = ({ children }) => (
  <h2 style={styles.titleBorder}>{children}</h2>
);

class Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoginError: false,
      userDates: [],
      organiserDates: [],
      canModify: false,
    };
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
  }

  _setLoginError = () => {
    this.setState({
      isLoginError: true,
    });
  };

  _editDescription = newDescription => {
    this.setState({
      editItem: 'description',
      editItemDescription: newDescription,
    });
  };
  _updateEditDescription = e => {
    this.setState({
      editItemDescription: e.target.value,
    });
  };

  _validationEditDescription = () => {
    if (this.state.editItemDescription === '') {
      this.props.alert.show(localizations.event_view_info_error, {
        timeout: 2000,
        type: 'error',
      });
      return;
    }
    this.props.onDescriptionUpdate(this.state.editItemDescription);
    this._cancelEdit();
  };

  _cancelEdit = () => {
    this.setState({
      editItem: null,
      editItemDescription: '',
    });
  };

  _handleUpdatePermissions = (id, permissions) => {
    const organizers = [];
    this.props.sportunity.organizers.map(i => {
      if (i.organizer.id === id) {
        organizers.push({
          ...i,
          organizer: i.organizer.id,
          secondaryOrganizerType: i.secondaryOrganizerType
            ? i.secondaryOrganizerType.id
            : null,
          permissions,
        });
      } else {
        organizers.push({
          ...i,
          secondaryOrganizerType: i.secondaryOrganizerType
            ? i.secondaryOrganizerType.id
            : null,
          organizer: i.organizer.id,
        });
      }
    });

    UpdateSportunityOrganizerAccessMutation.commit(
      {
        sportunityID: this.props.sportunity.id,
        sportunity: {
          organizers,
        },
      },
      {
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 2000,
            type: 'error',
          });
        },
        onSuccess: response => {
          this.props.alert.show(
            localizations.popup_editCircle_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
        },
      },
    );
  };

  componentWillReceiveProps = nextProps => {
    const { sportunity, viewer, userIsInvited, isAdmin } = nextProps;
    let canModify = false;
    if (
      sportunity.survey &&
      (userIsInvited || sportunity.kind === 'PUBLIC' || isAdmin)
    ) {
      let userDates = [];
      let organiserDates = [];
      sportunity.survey.surveyDates.forEach(date => {
        userDates.push({
          beginning_date: date.beginning_date,
          ending_date: date.ending_date,
          answer:
            date.answers.findIndex(
              answer =>
                answer.user.id === viewer.me.id && answer.answer === 'YES',
            ) >= 0,
        });
        organiserDates.push({
          beginning_date: date.beginning_date,
          ending_date: date.ending_date,
          answer: false,
        });
        canModify =
          canModify ||
          date.answers.findIndex(answer => answer.user.id === viewer.me.id) >=
            0;
      });

      userDates = userDates.sort(
        (a, b) => new Date(a.beginning_date) - new Date(b.beginning_date),
      );

      this.setState({ userDates, organiserDates, canModify: !canModify });
    }
  };

  _capitalizeFirstLetter = string =>
    string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

  statusStyle = status => {
    switch (status) {
      case 'RED':
        return styles.red;
      case 'YELLOW':
        return styles.yellow;
      case 'GREY':
        return styles.lightGreen;
      case 'BLACK':
        return styles.darkGreen;
      case 'GREEN':
        return styles.darkGreen;
      default:
        return styles.lightGreen;
    }
  };

  _shouldShowRequirements = sportunity =>
    !sportunity.sport.allLevelSelected ||
    sportunity.sport.certificates.length > 0 ||
    sportunity.sport.positions.length > 0 ||
    sportunity.sexRestriction !== 'NONE' ||
    sportunity.ageRestriction.from !== 0 ||
    sportunity.ageRestriction.to !== 100;

  _renderRequirements = sport => {
    const newSport = cloneDeep(sport);
    if (sport.levels && sport.levels.length > 0)
      newSport.levels = newSport.levels.sort(
        (a, b) => a.EN.skillLevel - b.EN.skillLevel,
      );

    return (
      <div style={{ marginBottom: 10 }}>
        {!sport.allLevelSelected && sport.levels.length > 0 && (
          <p>
            {`${localizations.event_levels}: `} {this.displayLevel(newSport)}
          </p>
        )}
        {sport.positions.length > 0 && (
          <p>
            {`${localizations.event_positions}: ${sport.positions.map(
              position =>
                ` ${position[localizations.getLanguage().toUpperCase()]}`,
            )}`}
          </p>
        )}
        {sport.certificates.length > 0 && (
          <p>
            {`${localizations.event_certificates}: ${sport.certificates.map(
              certificate =>
                ` ${
                  certificate.name[localizations.getLanguage().toUpperCase()]
                }`,
            )}`}
          </p>
        )}
      </div>
    );
  };

  _renderSexRestrictions = sexRestriction => {
    const translations = {
      NONE: localizations.newSportunity_sex_restriction_none,
      MALE: localizations.newSportunity_sex_restriction_male,
      FEMALE: localizations.newSportunity_sex_restriction_female,
    };
    if (sexRestriction === 'NONE') return null;
    return (
      <div style={{ marginBottom: 10 }}>
        {`${localizations.event_sexRestriction} : ${
          translations[sexRestriction]
        }`}
      </div>
    );
  };

  _renderAgeRestrictions = ageRestriction => {
    if (ageRestriction.from !== 0 || ageRestriction.to !== 100) {
      return (
        <div>
          {`${localizations.event_ageRestriction} : ${
            localizations.newSportunity_from
          } ${ageRestriction.from} ${localizations.newSportunity_to} ${
            ageRestriction.to
          } ${localizations.event_ageRestriction_years}`}
        </div>
      );
    }
    return null;
  };

  displayLevel = sport => {
    const sports = sport.levels.map(level => ({
      name: level[localizations.getLanguage().toUpperCase()].name,
      description:
        level[localizations.getLanguage().toUpperCase()].description,
    }));

    if (sport.allLevelSelected) {
      return <span>{localizations.event_allLevelSelected}</span>;
    } else if (sports.length === 1) {
      return (
        <span>
          {sports[0].name}
          {sports[0].description && (
            <i
              data-tip={sports[0].description}
              style={{ marginLeft: 10, cursor: 'pointer' }}
              className="fa fa-question-circle"
              aria-hidden="true"
            />
          )}
        </span>
      );
    }
    return (
      <span>
        {sports[0].name}
        {` ${localizations.find_to} `}
        {sports[sports.length - 1].name}
        {sports[0].description && sports[sports.length - 1].description && (
          <i
            data-tip={`${localizations.event_level_from}: ${
              sports[0].description
            }<br/>${localizations.event_level_to}: ${
              sports[sports.length - 1].description
            }`}
            style={{ marginLeft: 10, cursor: 'pointer' }}
            className="fa fa-question-circle"
            aria-hidden="true"
          />
        )}
      </span>
    );
  };

  _handleChangeSuggest = (checked, index) => {
    const { userDates } = this.state;
    userDates[index].answer = checked;
    this.setState({ userDates });
  };

  _handleChangeDate = (checked, index) => {
    const { organiserDates } = this.state;
    organiserDates.forEach((organiserDate, localIndex) => {
      organiserDates[localIndex].answer = false;
    });
    organiserDates[index].answer = checked;
    this.setState({ organiserDates });
  };

  _handleSubmitSuggest = () => {
    const answersVar = [];
    this.state.userDates.forEach(date => {
      answersVar.push({
        beginning_date: date.beginning_date,
        ending_date: date.ending_date,
        answer: date.answer ? 'YES' : 'WAITING',
      });
    });
    InvitedAnswersSurveyMutation.commit(
      {
        sportunity: this.props.sportunity,
        userIdVar: this.props.viewer.me.id,
        answersVar,
        viewer: this.props.viewer,
      },
      {
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 2000,
            type: 'error',
          });
        },
        onSuccess: response => {
          this.props.alert.show(
            localizations.popup_editCircle_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
        },
      },
    );
  };

  _handleSubmitDate = () => {
    const valideDate = [];
    this.state.organiserDates.forEach(date => {
      if (date.answer)
        valideDate.push({
          beginning_date: date.beginning_date,
          ending_date: date.ending_date,
          answer: 'YES',
        });
    });
    OrganizerPickDateMutation.commit(
      {
        sportunity: this.props.sportunity,
        answerVar: valideDate[0],
        viewer: this.props.viewer,
      },
      {
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 2000,
            type: 'error',
          });
        },
        onSuccess: response => {
          this.props.alert.show(
            localizations.popup_editCircle_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
        },
      },
    );
  };

  _handleModify = () => {
    this.setState({ canModify: !this.state.canModify });
  };

  availableSeats = carPoolings => {
    if (carPoolings && carPoolings.length > 0) {
      let availableSeatNumber = 0;
      carPoolings.forEach(
        carPooling =>
          (availableSeatNumber =
            availableSeatNumber +
            carPooling.number_of_sits -
            carPooling.passengers.length),
      );
      if (availableSeatNumber > 1)
        return (
          availableSeatNumber + ' ' + localizations.event_carPooling_seats
        );
      else
        return availableSeatNumber + ' ' + localizations.event_carPooling_seat;
    } else return;
  };

  render() {
    const {
      sportunity,
      status,
      showBook,
      showJoinWaitingList,
      enableBook,
      onBook,
      onCancel,
      onAdminModify,
      onAdminCancel,
      onAdminReOrganize,
      onDeclineInvitation,
      onOpponentBook,
      viewer,
      isActive,
      isPast,
      isSecondaryOrganizer,
      isPotentialSecondaryOrganizer,
      isAdmin,
      isAuthorizedAdmin,
      isPotentialOpponent,
      onSeeAsAdmin,
      props,
      isLogin,
      isCancelled,
      userIsInvited,
      userIsOnWaitingList,
      onAdminDisplayStatForm,
      userIsParticipant,
      organizers,
      isLoading,
      user,
    } = this.props;

    const tmpUser = [].concat(
      sportunity.invited.map(user => user.user),
      sportunity.organizers.map(user => user.organizer),
    );

    let invitedUser = [];
    let surveyDates = [];

    if (
      sportunity.survey &&
      sportunity.survey.surveyDates &&
      sportunity.survey.surveyDates.length > 1
    ) {
      tmpUser.forEach(user => {
        if (
          (sportunity.survey.surveyDates[0].answers.findIndex(
            answer => answer.user.id === user.id,
          ) >= 0 ||
            (viewer.me &&
              user.id === viewer.me.id &&
              (userIsInvited || isAdmin))) &&
          invitedUser.findIndex(invited => invited.id === user.id) < 0
        )
          invitedUser.push(user);
      });

      surveyDates = cloneDeep(sportunity.survey.surveyDates);
      surveyDates = surveyDates.sort(
        (a, b) => new Date(a.beginning_date) - new Date(b.beginning_date),
      );
    }

    if (
      viewer.me &&
      invitedUser.findIndex(invited => invited.id === viewer.me.id) < 0 &&
      sportunity.kind === 'PUBLIC'
    )
      invitedUser.push(viewer.me);

    const canValidDate =
      this.state.organiserDates.findIndex(date => date.answer === true) >= 0;
    const canValidSuggestion =
      this.state.userDates.findIndex(date => date.answer === true) >= 0;

    const organizerObject = organizers.find(item => item.isAdmin == true);

    return (
      <section>
        <ReactTooltip effect="solid" multiline={true} place='right'/>
        {/* {!isAdmin && !isSecondaryOrganizer && !isPotentialSecondayOrganizer && !userIsInvited && !userIsParticipant && !userIsOnWaitingList && <FAQLinks />} */}

        <div style={styles.organized}>
          <h2 style={styles.organizedTitle}>
            {this._capitalizeFirstLetter(status.displayStatus)}
            {!!status.status_information && 
              <p
                data-tip={localizations.formatString(
                  status.status_information,
                  sportunity.participantRange.from,
                )}
                style={styles.organizedTooltip}
              >
                <i className="fa fa-question-circle" aria-hidden="true" />
              </p>
            }
          </h2>
          <div style={styles.organizedDescription}>
            <h3 style={styles.informationText}>
              {localizations.event_information}
              {isAdmin && isActive && (
                <span
                  style={{ display: 'flex', alignItems: 'center' }}
                  onClick={() => this._editDescription(sportunity.description)}
                >
                  <i
                    style={styles.pencil}
                    className="fa fa-pencil"
                    aria-hidden="true"
                  />
                </span>
              )}
            </h3>
            {this.state.editItem === 'description' 
            ? <div style={styles.row}>
                <div style={styles.editDescription}>
                  <InputText
                    value={this.state.editItemDescription}
                    onChange={this._updateEditDescription}
                    type="textarea"
                  />
                </div>
                <div
                  style={styles.validateEditionIcon}
                  onClick={this._validationEditDescription}
                >
                  <i className="fa fa-check" aria-hidden="true" />
                </div>
                <div
                  style={styles.removeIcon}
                  onClick={() => this._cancelEdit()}
                >
                  <i className="fa fa-times" aria-hidden="true" />
                </div>
              </div>
            : <div>
                <p style={styles.organizedDescriptionText}>
                  {sportunity.description.split('\n').map(descLine => <p>{descLine}</p>)}
                </p>
                {/* <i
                  style={styles.nextDescription}
                  className="fa fa-chevron-right"
                  aria-hidden="true"
                /> */}
              </div>
            }
          </div>
        </div>
        <div style={styles.organizedDescription}>
          <VoteForManOfTheGame
            sportunity={sportunity}
            viewer={viewer}
            isParticipant={userIsParticipant}
            isOrganized={isAdmin}
            header={
              <h3 style={styles.informationText}>
                <div style={{ flex: 1 }}>
                  {localizations.event_VoteForManOfTheGame}
                </div>
              </h3>
            }
          />
        </div>

        {sportunity.survey &&
          sportunity.survey.surveyDates &&
          sportunity.survey.surveyDates.length > 1 && (
            <div style={{ fontFamily: 'Lato', fontSize: 20 }}>
              <Title>{localizations.sondage_title}</Title>
              <div style={{ width: '100%', overflow: 'auto', marginTop: 15 }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <td style={styles.headerText} />
                      {surveyDates.map((date, index) => (
                        <td key={index} style={styles.headerText}>
                          {formatDate(date.beginning_date, date.ending_date)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={styles.headerText}>
                        <div>
                          <p>
                            {`${localizations.sondage_row_participent_0} (${
                              sportunity.survey.surveyDates[0].answers
                                ? sportunity.survey.surveyDates[0].answers
                                    .length
                                : 0
                            })`}
                          </p>
                          <p>
                            {localizations.sondage_row_participent_1 +
                              (sportunity.invited &&
                              sportunity.survey.surveyDates[0].answers
                                ? sportunity.invited.length -
                                  sportunity.survey.surveyDates[0].answers
                                    .length
                                : 0) +
                              localizations.sondage_row_participent_2}
                          </p>
                        </div>
                      </td>
                      {surveyDates.map((date, index) => (
                        <td key={index} style={styles.headerText}>
                          <div>
                            <i
                              className="fa fa-check"
                              style={{ marginRight: 5 }}
                            />
                            {
                              date.answers.filter(
                                answer => answer.answer === 'YES',
                              ).length
                            }
                          </div>
                        </td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invitedUser.map((member, indexRow) => (
                      <tr key={indexRow}>
                        <td style={styles.firstCol}>
                          <div style={styles.firstColContent}>
                            <span
                              style={{
                                ...styles.iconImage,
                                backgroundImage: member.avatar
                                  ? `url(${member.avatar})`
                                  : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                              }}
                            />
                            {member.pseudo}
                            {viewer.me &&
                              member.id === viewer.me.id &&
                              !this.state.canModify &&
                              !sportunity.survey.isSurveyTransformed && (
                                <i
                                  className="fa fa-pencil"
                                  style={{
                                    cursor: 'pointer',
                                    marginLeft: 5,
                                  }}
                                  onClick={this._handleModify}
                                />
                              )}
                          </div>
                        </td>
                        {surveyDates.map((date, index) => (
                          <td
                            key={index}
                            style={
                              !this.state.canModify ||
                              member.id !== viewer.me.id
                                ? date.answers.findIndex(
                                    answer =>
                                      answer.user.id === member.id &&
                                      answer.answer === 'YES',
                                  ) >= 0
                                  ? {
                                      ...styles.cellContent,
                                      backgroundColor: colors.blue,
                                    }
                                  : {
                                      ...styles.cellContent,
                                      backgroundColor: colors.red,
                                    }
                                : styles.cellContent
                            }
                          >
                            <div style={styles.inputContainer}>
                              {!sportunity.survey.isSurveyTransformed &&
                              viewer.me &&
                              member.id === viewer.me.id &&
                              this.state.canModify ? (
                                <Checkbox
                                  checked={
                                    this.state.userDates[index]
                                      ? this.state.userDates[index].answer
                                      : null
                                  }
                                  onChange={e => {
                                    this._handleChangeSuggest(
                                      e.target.checked,
                                      index,
                                    );
                                  }}
                                />
                              ) : date.answers.findIndex(
                                  answer =>
                                    answer.user.id === member.id &&
                                    answer.answer === 'YES',
                                ) >= 0 ? (
                                <i
                                  className="fa fa-check"
                                  style={{ color: colors.white }}
                                />
                              ) : date.answers.findIndex(
                                  answer =>
                                    answer.user.id === member.id &&
                                    answer.answer !== 'YES',
                                ) >= 0 ? (
                                <i
                                  className="fa fa-times"
                                  style={{ color: colors.white }}
                                />
                              ) : null}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                    {!sportunity.survey.isSurveyTransformed && isAdmin && (
                      <tr>
                        <td style={styles.firstCol}>
                          <div style={styles.firstColContent}>
                            {localizations.sondage_selectDate}
                          </div>
                        </td>
                        {surveyDates.map((date, index) => (
                          <td key={index} style={styles.cellContent}>
                            <div style={styles.inputContainer}>
                              <Checkbox
                                checked={
                                  this.state.organiserDates[index]
                                    ? this.state.organiserDates[index].answer
                                    : null
                                }
                                onChange={e => {
                                  this._handleChangeDate(
                                    e.target.checked,
                                    index,
                                  );
                                }}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!sportunity.survey.isSurveyTransformed && (
                <div style={styles.buttonContainer}>
                  {isAdmin && canValidDate && (
                    <div
                      style={{
                        ...styles.button,
                        backgroundColor: colors.lightGray,
                      }}
                      onClick={this._handleSubmitDate}
                    >
                      {localizations.sondage_selectSondage['2']}
                    </div>
                  )}
                  {(userIsInvited ||
                    sportunity.kind === 'PUBLIC' ||
                    isAdmin) &&
                    this.state.canModify &&
                    !canValidDate && (
                      <div
                        style={{
                          ...styles.button,
                          backgroundColor: colors.green,
                          color: colors.white,
                        }}
                        onClick={this._handleSubmitSuggest}
                      >
                        {canValidSuggestion
                          ? localizations.sondage_valid
                          : localizations.sondage_valid_empty}
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

        <div style={styles.headerLocation}>
          <div style={styles.address}>
            <i
              style={styles.marker}
              className="fa fa-map-marker"
              aria-hidden="true"
            />
            <div style={styles.columnAddress}>
              <span style={styles.addressText}>
                {sportunity.address &&
                  (sportunity.address.address === sportunity.address.city
                    ? sportunity.address.city
                    : `${sportunity.address.address}, ${
                        sportunity.address.city
                      }`)}
              </span>
            </div>
          </div>
          {sportunity.carPoolings && sportunity.carPoolings.length > 0 && (
            <div style={styles.sportDetailPlaces}>
              <span style={styles.sportInfoText}>
                {sportunity.carPoolings.length}{' '}
                {sportunity.carPoolings.length > 1
                  ? localizations.event_carPooling_cars
                  : localizations.event_carPooling_car}
              </span>
              <span style={styles.sportInfoText}>
                {this.availableSeats(sportunity.carPoolings)}
              </span>
            </div>
          )}
        </div>
        <TimeAndLocation sportunity={sportunity} {...this.props} />

        <GameInformationRow
          sportunity={sportunity}
          language={() => localizations.getLanguage()}
        />

        <div style={styles.organizer}>
          <TitleBorderBottom>
            {localizations.event_organizer}
          </TitleBorderBottom>
          <Circle
            role={
              organizerObject && !organizerObject.isAdmin
                ? organizerObject.role
                : null
            }
            name={
              organizerObject.organizer
                ? organizerObject.organizer.pseudo
                : organizerObject.organizerPseudo || ''
            }
            link={
              organizerObject.organizer
                ? `/profile-view/${organizerObject.organizer.id}`
                : null
            }
            image={
              organizerObject.organizer
                ? organizerObject.organizer.avatar
                : 'https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png'
            }
            isAdmin={true}
          />
        </div>

        {organizers &&
          organizers.filter(organizer => !organizer.isAdmin).length > 0 && (
            <div style={styles.organizer}>
              <TitleBorderBottom>
                {organizers.filter(organizer => !organizer.isAdmin).length > 1
                  ? localizations.event_secondary_organizers
                  : localizations.event_secondary_organizer}
              </TitleBorderBottom>
              {organizers
                .filter(organizer => !organizer.isAdmin)
                .map(organizer => (
                  <Circle
                    role={
                      organizer.secondaryOrganizerType
                        ? organizer.secondaryOrganizerType.name[
                            localizations.getLanguage().toUpperCase()
                          ]
                        : organizer.customSecondaryOrganizerType
                    }
                    id={organizer.organizer.id}
                    name={
                      organizer.organizer
                        ? organizer.organizer.pseudo
                        : organizer.organizerPseudo || ''
                    }
                    link={
                      organizer.organizer
                        ? `/profile-view/${organizer.organizer.id}`
                        : null
                    }
                    image={
                      organizer.organizer
                        ? organizer.organizer.avatar
                        : 'https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png'
                    }
                    isAdmin={organizer.isAdmin}
                    permissions={organizer.permissions}
                    updatePermissions={this._handleUpdatePermissions}
                    showUpdatePermissions={isAdmin || isAuthorizedAdmin}
                  />
                ))}
            </div>
          )}

        <div style={styles.organizer}>
          <JoinCommunity
            {...this.props}
            refetchAfterSubscribeOrUnsubscribe={
              this.props.refetchAfterSubscribeOrUnsubscribe
            }
          />
        </div>

        {this._shouldShowRequirements(sportunity) && (
          <div style={styles.organizer}>
            <TitleBorderBottom>
              {localizations.event_additional_requirements}
            </TitleBorderBottom>
            <p
              style={{ ...styles.description, marginTop: 10, marginLeft: 20 }}
            >
              {this._renderRequirements(sportunity.sport)}
              {this._renderSexRestrictions(sportunity.sexRestriction)}
              {this._renderAgeRestrictions(sportunity.ageRestriction)}
            </p>
          </div>
        )}

        {!isAdmin &&
          !isSecondaryOrganizer &&
          isActive &&
          !userIsParticipant &&
          !isAuthorizedAdmin && (
            <Link
              to={!!user ? `/profile-view/${organizers[0].organizer.id}/chat` : `/profile-view/${organizers[0].organizer.id}`}
              style={styles.ask_question_container}
            >
              <button style={styles.ask_question}>
                {localizations.event_ask_a_question}
              </button>
            </Link>
          )}
        <div style={{ marginLeft: 15 }}>
          <Price
            sportunity={sportunity}
            viewer={viewer}
            isAdmin={isAdmin}
            {...props}
          />
        </div>
      </section>
    );
  }
}

let styles = {
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    '@media (max-width: 750px)': {
      flexDirection: 'column',
    },
  },
  editDescription: {
    display: 'flex',
    width: '100%'
  },
  removeIcon: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: colors.redGoogle,
    cursor: 'pointer',
    flex: 1,
    fontSize: 24
  },
  validateEditionIcon: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: colors.green,
    cursor: 'pointer',
    fontSize: 24
  },
  black: {
    color: colors.black,
  },
  gray: {
    color: colors.gray,
  },
  yellow: {
    color: colors.yellow,
  },
  red: {
    color: colors.red,
  },
  lightGreen: {
    color: colors.lightGreen,
  },
  darkGreen: {
    color: colors.darkGreen,
  },
  table: {
    boxShadow: '0 0 14px 0 rgba(0,0,0,0.12)',
    border: '2px solid #E7E7E7',
    fontSize: 18,
    lineHeight: '24px',
    fontFamily: 'Lato',
    margin: 'auto',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    minWidth: 120,
    textAlign: 'center',
    border: `1px solid ${colors.gray}`,
    backgroundColor: 'whitesmoke',
    verticalAlign: 'middle',
  },
  cellContent: {
    border: `1px solid ${colors.gray}`,
    padding: 7,
    verticalAlign: 'middle',
    textAlign: 'center',
    backgroundColor: 'whitesmoke',
  },
  iconImage: {
    color: colors.white,
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: '50%',
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    display: 'inline-block',
  },
  firstCol: {
    padding: '5px 10px',
    border: `1px solid ${colors.gray}`,
    backgroundColor: 'whitesmoke',
  },
  firstColContent: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'whitesmoke',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontFamily: 'Lato',
    color: colors.red,
    fontSize: 16,
    marginTop: 10,
    width: 180,
  },
  errorFeedback: {
    fontFamily: 'Lato',
    color: colors.red,
    fontSize: 16,
  },
  content: {
    flexGrow: '1',
    padding: '40px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    '@media (max-width: 700px)': {
      padding: '20px',
    },
  },
  headerImage: {
    width: '100%',
  },

  title: {
    display: 'flex',
    padding: '20px 40px',
    fontSize: 32,
    fontWeight: 500,
    color: '#000',
    borderBottom: `1px solid ${colors.lightGray}`,
    marginTop: 20,
  },

  description: {
    fontSize: 18,
    lineHeight: 1.2,
    marginBottom: 40,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    margin: '20px 40px',
  },
  book_container: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  book: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 230,
    // height: 70,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    padding: '13px 5px',

    position: 'relative',
    // left: 'calc(50% - 115px)',

    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },
  },
  modify: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 230,
    height: 70,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',

    position: 'relative',
    marginBottom: '10px',

    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },
  },
  ask_question_container: {
    display: 'flex',
    justifyContent: 'center',
    textDecoration: 'none',
    marginBottom: 20,
    marginTop: 20,
  },
  ask_question: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 290,
    height: 70,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',

    position: 'relative',
    // left: 'calc(50% - 145px)',

    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },
  },
  cancel: {
    backgroundColor: colors.red,
    color: colors.white,
    width: 230,
    // height: 70,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    padding: '13px 5px',

    position: 'relative',
    // left: 'calc(50% - 115px)',

    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: '5px 0px',
  },
  button: {
    padding: 10,
    margin: '5px 10px',
    borderRadius: 10,
    cursor: 'pointer',
  },
  policy: {
    cursor: 'pointer',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 50,
  },
  organized: {
    borderBottom: `1px solid ${colors.lightGray}`,
    borderBottomColor: colors.lightGray,
  },
  organizedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    padding: '20px 40px',
    color: '#17769b',
    borderBottom: `1px solid ${colors.lightGray}`,
    borderBottomColor: colors.lightGray,
    display: 'flex',
  },
  organizedDescription: {
    margin: '20px 40px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  organizedDescriptionText: {
    color: colors.black,
    fontSize: 16,
    marginTop: 15,
    width: '93%',
  },
  organizer: {
    marginTop: '0px', // VB: will be adjusted in the line height of the control instead
  },
  pencil: {
    fontSize: 20,
    color: colors.black,
    marginLeft: 10,
    cursor: 'pointer',
  },
  informationText: {
    fontSize: 22,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  nextDescription: {
    fontSize: 30,
    color: colors.black,
    fontWeight: '500',
    position: 'absolute',
    right: 0,
    top: 'calc(50% - 15px)',
  },
  organizedTooltip: {
    fontSize: 20,
    marginLeft: 5,
  },
  address: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  marker: {
    fontSize: 30,
    color: colors.black,
  },
  columnAddress: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 20,
    justifyContent: 'space-around',
  },
  addressText: {
    color: colors.black,
    fontSize: 20,
    margin: '5px 0',
  },
  headerLocation: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: '10px 40px',
  },
  sportInfoText: {
    color: colors.black,
    fontSize: 20,
    margin: '5px 0',
    fontWeight: 'bold',
  },
  sportDetailPlaces: {
    display: 'flex',
    flexDirection: 'column',
  },
  titleBorder: {
    display: 'flex',
    paddingLeft: '20px',
    height: '50px',
    lineHeight: '50px',
    fontSize: '25px',
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.65)',
    marginTop: 20,
  },
};

export default createRefetchContainer(Radium(withAlert(Info)), {
  sportunity: graphql`
    fragment Info_sportunity on Sportunity {
      id
      description
      kind
      ...TimeAndLocation_sportunity
      ...Price_sportunity
      ...GameInformationRow_sportunity
      ...VoteForManOfTheGame_sportunity
      survey {
        isSurveyTransformed
        surveyDates {
          beginning_date
          ending_date
          answers {
            user {
              id
              pseudo
              avatar
            }
            answer
          }
        }
      }
      carPoolings {
        id
        driver {
          id
          pseudo
          avatar
        }
        address {
          address
          city
          zip
          country
        }
        starting_date
        number_of_sits
        passengers {
          id
          pseudo
          avatar
        }
      }
      organizers {
        isAdmin
        role
        price {
          cents
          currency
        }
        organizer {
          id
          pseudo
          avatar
        }
        secondaryOrganizerType {
          id
          name {
            FR
            EN
            DE
            ES
          }
        }
        customSecondaryOrganizerType
        permissions {
          chatAccess {
            view
            edit
          }
          memberAccess {
            view
            edit
          }
          carPoolingAccess {
            view
            edit
          }
          imageAccess {
            view
            edit
          }
          detailsAccess {
            view
            edit
          }
          compositionAccess {
            view
            edit
          }
        }
      }
      invited {
        user {
          id
          avatar
          pseudo
        }
      }
      invited_circles(last: 10) {
        edges {
          node {
            ...MyCirclesCircleItem_circle
            id
            name
            mode
            type
            memberCount
            members {
              id
            }
            owner {
              id
              pseudo
              avatar
            }
          }
        }
      }
      participants {
        id
        pseudo
        avatar
      }
      participantRange {
        from
        to
      }
      address {
        address
        city
        position {
          lat
          lng
        }
      }
      images
      sexRestriction
      ageRestriction {
        from
        to
      }
      sport {
        allLevelSelected
        levels {
          id
          EN {
            name
            skillLevel
            description
          }
          FR {
            name
            skillLevel
            description
          }
          DE {
            name
            skillLevel
            description
          }
        }
        certificates {
          name {
            EN
            FR
            DE
          }
        }
        positions {
          EN
          FR
          DE
        }
      }
    }
  `,
  viewer: graphql`
    fragment Info_viewer on Viewer {
      id
      ...Price_viewer
      ...VoteForManOfTheGame_viewer
      me {
        id
        pseudo
        avatar
        profileType
      }
    }
  `,
  user: graphql`
    fragment Info_user on User {
      areStatisticsActivated
      profileType
    }
  `,
});
