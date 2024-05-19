import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { Link } from 'found';
import Radium from 'radium';
import platform from 'platform';
import { withRouter } from 'found';
import ReactLoading from 'react-loading';
import isEqual from 'lodash/isEqual';
import ReactTooltip from 'react-tooltip';
import Helmet from 'react-helmet';
import { withAlert } from 'react-alert';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as types from '../../actions/actionTypes.js';

import ConfirmationModal, { confirmModal } from '../common/ConfirmationModal';
import { displayChooseAccountModal } from '../common/SwitchAccountOnPrivate';
import { displayChooseSubAccountModal } from '../common/SubAccountsListModal';
import { colors, fonts } from '../../theme';
import { appUrl } from '../../../constants.json';

import Wrapper from './Wrapper';
import Header from './CircleHeader';
import TabHeader from './TabHeader';
import Details from './Tabs/Details';
import Activities from './Tabs/Activities';
import Members from './Tabs/Members';
import Chat from './Tabs/ChatContainer';
import MembersInformation from './CircleMembersInformation/';
import Subscribe from './Subscribe';
import AddMember from './AddMember';
import AddMyChild from './AddMyChild';
import EditCircle from './EditCircle';
import CircleMutation from './AddCircleMemberMutation';
import AddMembersMutation from './AddMembersMutation';
import RelaunchMembersMutation from './CircleMembersInformation/RelaunchMembersMutation.js';
import DeleteMemberMutation from './DeleteMemberMutation';
import AcceptOrRefusedCircleMembersMutation from './AcceptOrRefusedCircleMembersMutation';
import localizations from '../Localizations';
import { transferModal } from './TransferToAnotherCircle';
import CircleStats from './CircleStats';
import TermOfUseModal from './TermOfUseModal';
import Paginate from '../common/Paginate';
import Button from '@material-ui/core/Button';
import UnsubscribeFromCircleMutation from '../MyCircles/mutation/UnsubscribeFromCircle';
import cloneDeep from 'lodash/cloneDeep';

let styles;

class Circle extends React.Component {
  static contextTypes = {
    relay: PropTypes.shape({
      variables: PropTypes.object,
    }),
  };
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      isError: false,
      user: null,
      parent1: '',
      parent2: '',
      language: localizations.getLanguage(),
      displayPrivateCirclePopup: false,
      isQueryingForPrivateCircle: false,
      isCurrentUserAMember: false,
      isCurrentUserTheOwner: false,
      isCurrentUserCoOwner: false,
      isCurrentUserAParent: false,
      isCurrentUserAChild: false,
      displayAndroidOpenApp: false,
      displayDetailledMemberInformation: false,
      activeTab: 'details',
      activeSection: 'members',
      rowMembers: true,
      columns: [],
      rows: [],
      isRelaunchButtonVisible: false,
      selectedUserList: [],
      showParents: false,
      isTermOfUseCheck: true,
      isCurrentUserWantToBeMember: false,
      membersPerPage: 5,
      membersPage: 0,
      queryCircle:  true
    };
  }

  _setLanguage = language => {
    this.setState({ language });
  };

  componentDidMount = () => {
    if (
      this.props.viewer.me &&
      this.props.viewer.me.id !== this.props.viewer.circle.owner.id
    ) {
      this.setState({ rowMembers: false, queryCircle: true });
    }
    if (this.props.createProfileFrom) {
      this.props._updateRegisterFromAction(null);
      const superToken = localStorage.getItem('superToken');
      const userToken = localStorage.getItem('userToken');

      this.props.relay.refetch(
        fragmentVariables => ({
          ...this.context.relay.variables,
          queryAuthorizedAccounts: !!userToken,
          querySuperMe: !!superToken,
          superToken,
          userToken,
          queryCircle: true,
        }),
        null,
        () => {
          setTimeout(() => {
            this.setState({ queryCircle: false });
          }, 50);
        },
      );

      this._checkIfUserIsAuthorized(this.props);
      setTimeout(() => this.setState({ loading: false }), 200);
    } else {
      const superToken = localStorage.getItem('superToken');
      const userToken = localStorage.getItem('userToken');

      this.props.relay.refetch(
        fragmentVariables => ({
          ...this.context.relay.variables,
          queryAuthorizedAccounts: !!userToken,
          querySuperMe: !!superToken,
          superToken,
          userToken,
          queryCircle: true,
        }),
        null,
        () => {
          setTimeout(() => {
            this.setState({ queryCircle: false });
          }, 50);
        },
      );
      this._checkIfUserIsAuthorized(this.props);
      setTimeout(() => this.setState({ loading: false }), 200);
    }

    // this.setState({
    //   rowMembers: this.props.viewer.circle.owner.profileType !== 'PERSON',
    // });

    setTimeout(() => {
      if (
        this.props.match.location.pathname.indexOf('join-circle') >= 0 &&
        !this.state.isCurrentUserAMember
      ) {
        this._handleSubscribe();
      }
      if (this.props.match.location.hash === '#chat') {
        this.setState({
          activeTab: 'chat',
        });
      }
      if (this.props.match.location.pathname.indexOf('statistics') >= 0 && this.props.viewer.circle.owner.profileType === 'PERSON') {
        this.setState({
          activeTab: 'statistics',
        });
      }
    }, 50);
  };

  componentWillReceiveProps = nextProps => {
    this._checkIfUserIsAuthorized(nextProps);

    if (nextProps.activeTab) {
      const tabList = ['profile', 'event', 'chat', 'statistics'];
      if (tabList.findIndex(tab => tab === this.props.activeTab) >= 0)
        this.setState({
          activeTab: nextProps.activeTab,
        });
    }

    if (
      this.state.rowMembers &&
      (!isEqual(nextProps.viewer.circle, this.props.viewer.circle) ||
        this.state.columns.length === 0)
    ) {
      const columns = [];
      columns.push({
        type: 'STATUS',
        name: 'Status',
        id: 'SERKET',
        filledByOwner: true,
      });
      if (nextProps.viewer.circle.type === 'CHILDREN') {
        columns.push({
          type: 'PARENTS',
          name: 'Parents',
          id: 'PARENTS',
          acceptedBy: false,
        });
      }
      nextProps.viewer.circle.termsOfUses.forEach(term => {
        columns.push({
          type: 'TERM',
          name: term.name,
          id: term.id,
          acceptedBy: term.acceptedBy,
        });
      });
      nextProps.viewer.circle.askedInformation &&
        nextProps.viewer.circle.askedInformation.map(askedInfo => {
          // VB: we don't need extra columns in members tab.
          columns.push(askedInfo);
        });

      // To-do VB: adding a temp column. Not sure yet how it will come.
      // columns.push({
      //   name: 'Participation condition',
      //   type: 'OTHER',
      //   id: 'participationId',
      // });

      const rows = [];
      const statusList = [];

      nextProps.viewer.circle.memberStatus &&
        nextProps.viewer.circle.memberStatus.forEach(status => {
          const index = statusList.findIndex(
            tmpStatus => tmpStatus.member.id === status.member.id,
          );
          if (index < 0) {
            statusList.push(status);
          } else if (statusList[index].starting_date < status.starting_date)
            statusList[index] = status;
        });
      nextProps.viewer.circle.members &&
        nextProps.viewer.circle.members.map(member => {
          const answers = [];
          statusList.map(status => {
            if (status.member.id === member.id) {
              answers.push({ askedInfo: columns[0], answer: status.status });
            }
          });
          if (answers.length < 1)
            answers.push({ askedInfo: columns[0], answer: 'ACTIVE' });

          if (nextProps.viewer.circle.type === 'CHILDREN') {
            answers.push({
              askedInfo: columns[1], answer: this.getMemberParentsString(member, nextProps.viewer.circle)
            })
          }

          columns.forEach(col => {
            if (col.type === 'TERM')
              answers.push({
                askedInfo: col,
                answer:
                  col.acceptedBy.findIndex(
                    accept => accept.user.id === member.id,
                  ) >= 0,
              });
          });
          nextProps.viewer.circle.askedInformation &&
            nextProps.viewer.circle.askedInformation.map(askedInfo => {
              let answer;
              nextProps.viewer.circle.membersInformation.map(info => {
                if (
                  info.user.id === member.id &&
                  askedInfo.id === info.information
                ) {
                  if (askedInfo.type === 'NUMBER')
                    answer = parseInt(info.value);
                  else if (askedInfo.type === 'BOOLEAN')
                    answer = info.value !== 'false';
                  else answer = info.value;
                }
              });
              answers.push({ askedInfo, answer });
            });
          rows.push({ user: member, answers });
        });

        nextProps.viewer.circle.waitingMembers &&
        nextProps.viewer.circle.waitingMembers.map(member => {
          const answers = [];
          answers.push({ askedInfo: columns[0], answer: "PENDING" });
          columns.forEach(col => {
            if (col.type === 'TERM')
              answers.push({
                askedInfo: col,
                answer:
                  col.acceptedBy.findIndex(
                    accept => accept.user.id === member.id,
                  ) >= 0,
              });
          });
          rows.push({ user: member, answers });
        })

        nextProps.viewer.circle.refusedMembers &&
        nextProps.viewer.circle.refusedMembers.map(member => {
          const answers = [];
          answers.push({ askedInfo: columns[0], answer: "REFUSED" });
          rows.push({ user: member, answers });
        })

      this.setState({ rows, columns });
    }

    if (
      this.props.subAccountCreation &&
      this.props.viewer.superMe &&
      this.props.viewer.superMe.subAccounts &&
      this.props.viewer.superMe.subAccounts.length <
        nextProps.viewer.superMe.subAccounts.length
    ) {
      this.props._updateSubAccountCreation(false);
      this._handleOpenSubAccountList(nextProps);
    }
  };

  _checkIfUserIsAuthorized = props => {
    if (
      props.viewer.circle &&
      props.viewer.circle.members &&
      !this.state.displayPrivateCirclePopup
    ) {
      const {
        viewer: { circle, me },
      } = props;
      const isCurrentUserTheOwner = !!me && circle.owner.id === me.id;
      const isCurrentUserCoOwner =
        !!me &&
        circle.coOwners.findIndex(coOwner => coOwner.id === me.id) >= 0;
      const isCurrentUserAMember =
        !!me &&
        circle.members &&
        circle.members.length > 0 &&
        circle.members.findIndex(member => member.id === me.id) >= 0;
      const isCurrentUserAddedAsParent =
        !!me &&
        circle.memberParents &&
        circle.memberParents.length > 0 &&
        circle.memberParents.findIndex(parent => parent.id === me.id) >= 0;
      const isCurrentUserAParent =
        !!me && !me.isSubAccount && me.profileType === 'PERSON';
      const isCurrentUserAChild =
        !!me && me.isSubAccount && me.profileType === 'PERSON';

      this.setState({
        isCurrentUserTheOwner,
        isCurrentUserAMember,
        isCurrentUserCoOwner,
        isCurrentUserAParent,
        isCurrentUserAChild,
        isRelaunchButtonVisible: isCurrentUserTheOwner,
      });
      if (
        !circle.isCircleAccessibleFromUrl &&
        ((!isCurrentUserTheOwner &&
          !isCurrentUserCoOwner &&
          !isCurrentUserAddedAsParent &&
          !isCurrentUserAMember) ||
          !me)
      ) {
        if (!me) {
          this.setState({
            displayPrivateCirclePopup: true,
          });
          confirmModal({
            title: localizations.circle_alert_circle_is_private_title,
            message: localizations.circle_alert_circle_is_private_message,
            confirmLabel: localizations.circle_alert_circle_is_private_ok,
            canCloseModal: false,
            onConfirm: () => {
              this.props.router.push({
                pathname: this.props.viewer.me ? 'my-circles' : '/my-events',
              });
            },
          });
        } else if (!this.state.isQueryingForPrivateCircle) {
          this.setState({
            isQueryingForPrivateCircle: true,
          });
          this.waitForDataSuperMe();
        }
      } else if (platform.name.indexOf('Firefox') < 0) {
        if (platform.os.family === 'iOS') {
          if (typeof window !== 'undefined')
            window.location.href = `sportunity://circle/${circle.id}`;
        } else if (platform.os.family === 'Android') {
          this.setState({ displayAndroidOpenApp: true });
        }
      }

      if ((isCurrentUserAMember || this.state.isCurrentUserWantToBeMember) && circle.termsOfUses) {
        let isTermOfUseCheck = true;

        circle.termsOfUses.forEach(term => {
          let acceptedTerm = false;
          term.acceptedBy.forEach(accepted => {
            if (accepted.user.id === me.id)
              acceptedTerm = true;
          });
          isTermOfUseCheck = acceptedTerm && isTermOfUseCheck;
        });
        this.setState({ isTermOfUseCheck });
      }
    }
  };

  toggleTermModal = () => {
    this.props.relay.refetch(fragmentVariables => (
      {...fragmentVariables}),
      null,
      () => {
        if (!this.state.isCurrentUserAMember)
          this._handleSubscribe();
        else
          this.setState({ isTermOfUseCheck: true })
      }
    )
  };

  _handleWantToBe = () => {
    const { circle } = this.props.viewer;
    if (this.props.viewer.me && circle.termsOfUses && circle.termsOfUses.length > 0) {
      this.setState({
        isCurrentUserWantToBeMember: true,
      });
    }
    else this._handleSubscribe();
  };

  waitForDataSuperMe = () => {
    if (
      this.props.viewer &&
      this.props.viewer.superMe &&
      this.props.viewer.superMe.id &&
      this.props.viewer.authorizedAccounts &&
      this.props.viewer.authorizedAccounts.id
    ) {
      const accounts = [];

      if (
        this.props.viewer.superMe.subAccounts &&
        this.props.viewer.superMe.subAccounts.length > 0
      )
        this.props.viewer.superMe.subAccounts.forEach(subAccount => {
          accounts.push(subAccount);
        });

      if (
        this.props.viewer.authorizedAccounts.accounts &&
        this.props.viewer.authorizedAccounts.accounts.length > 0
      )
        this.props.viewer.authorizedAccounts.accounts.forEach(account => {
          if (accounts.findIndex(item => item.id === account.id) < 0)
            accounts.push(account);
        });

      if (
        accounts.findIndex(item => item.id === this.props.viewer.superMe.id) <
        0
      )
        accounts.push({
          id: this.props.viewer.superMe.id,
          pseudo: this.props.viewer.superMe.pseudo,
          avatar: this.props.viewer.superMe.avatar,
          token: localStorage.getItem('superToken'),
        });

      if (
        accounts.findIndex(
          item => item.id === this.props.viewer.authorizedAccounts.id,
        ) < 0
      )
        accounts.push({
          id: this.props.viewer.authorizedAccounts.id,
          pseudo: this.props.viewer.authorizedAccounts.pseudo,
          avatar: this.props.viewer.authorizedAccounts.avatar,
          token: localStorage.getItem('userToken'),
        });

      if (accounts.length > 1) {
        this.setState({
          displayPrivateCirclePopup: true,
        });
        displayChooseAccountModal({
          title: localizations.circle_alert_circle_is_private_title,
          message: localizations.circle_alert_circle_is_private_message_switch,
          cancelLabel:
            localizations.circle_alert_circle_is_private_message_switch_cancel,
          accounts,
          canCloseModal: false,
          onClose: () => {
            this.props.router.push({
              pathname: this.props.viewer.me ? '/my-circles' : '/my-events',
            });
          },
        });
      } else {
        this.setState({
          displayPrivateSportunityPopup: true,
        });
        confirmModal({
          title: localizations.circle_alert_circle_is_private_title,
          message: localizations.circle_alert_circle_is_private_message,
          confirmLabel: localizations.circle_alert_circle_is_private_ok,
          canCloseModal: false,
          onConfirm: () => {
            this.props.router.push({
              pathname: this.props.viewer.me ? '/my-circles' : '/my-events',
            });
          },
        });
      }
    } else {
      setTimeout(() => this.waitForDataSuperMe(), 100);
    }
  };

  unSubscribe = () => {
    const callback = () => {
      this.props.alert.show(
        `${localizations.circles_unsubscribe_success} ${
          this.props.viewer.circle.name
        }`,
        {
          timeout: 2000,
          type: 'success',
        },
      );
      this.props.relay.refetch();
    };
    // this.props.unSubscribe(this.props.viewer.circle, callback);
    confirmModal({
      title: localizations.circles_unsubscribe,
      message: `${localizations.circles_unsubscribe_validation} ${
        this.props.viewer.circle.name
      } ?`,
      confirmLabel: localizations.circle_remove_all_data_yes,
      cancelLabel: localizations.circle_remove_all_data_no,
      canCloseModal: true,
      onConfirm: () => {
        const params = {
          circleIdVar: this.props.viewer.circle.id,
          userIdVar: this.props.viewer.me.id,
          viewer: this.props.viewer,
        };

        UnsubscribeFromCircleMutation.commit(params, {
          onFailure: error => {
            console.log(error.getError());
            this.props.alert.show(localizations.circles_unsubscribe_error, {
              timeout: 2000,
              type: 'error',
            });
          },
          onSuccess: response => {
            callback();
          },
        });
      },
      onCancel: () => {},
    });
  };

  _setIsError = value => {
    this.setState({
      isError: value,
    });
  };

  _handleChange = user => {
    if (!this.state.user || (this.state.user && user !== this.state.user)) {
      this.setState({
        user,
      });
    }
  };

  _handleParent1Change = parent => {
    if (
      !this.state.parent1 ||
      (this.state.parent1 && parent !== this.state.parent1)
    ) {
      this.setState({
        parent1: parent,
      });
    }
  };

  _handleParent2Change = parent => {
    if (
      !this.state.parent2 ||
      (this.state.parent2 && parent !== this.state.parent2)
    ) {
      this.setState({
        parent2: parent,
      });
    }
  };

  _handleSubscribe = () => {
    if (this.state.isLoading)
      return ;

    if (this.props.viewer.me) {
      this.setState({ isLoading: true });
      CircleMutation.commit(
        {
          viewer: this.props.viewer,
          idVar: this.props.viewer.circle.id,
          newUserIdVar: this.props.viewer.me.id,
          circle: this.props.viewer.circle,
        },
        {
          onFailure: error => {
            this.props.alert.show(error.getError().source.errors[0].message, {
              timeout: 2000,
              type: 'error',
            });
            this.setState({ isLoading: false });
          },
          onSuccess: response => {
            this.props.alert.show(this.props.viewer.circle.shouldValidateNewUser ? localizations.circle_subscribe_pending_success : localizations.circle_subscribe_success, {
              timeout: 2000,
              type: 'success',
            });
            setTimeout(() => {
              this.setState({
                isLoading: false,
                isTermOfUseCheck: true,
                isCurrentUserWantToBeMember: false,
              });
            }, 1500);
            this._updateTutorialSteps(this.props.viewer.circle);
          },
        },
      );
    }
    else {
      this.props.alert.show(localizations.circle_subscribe_login, {
        timeout: 2000,
        type: 'info',
      });
      setTimeout(() => {
        this.props._loggedFromPage(`/circle/${this.props.viewer.circle.id}`);
        localStorage.setItem(
          'registerFrom',
          `/circle/${this.props.viewer.circle.id}`,
        );
        this.props.router.push({
          pathname: '/register',
        });
      }, 2000);
    }
  };

  _updateTutorialSteps = (circle) => {
    const { tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);

    if (circle && circle.mode === "PUBLIC")
      newTutorialSteps['joinAPublicCircleStep'] = true;
    else if (circle && circle.mode === "PRIVATE")
      newTutorialSteps['joinAPrivateCircleStep'] = true;

    this.props._updateStepsCompleted(newTutorialSteps);
  }

  _handleOpenSubAccountList = props => {
    const accounts = [];

    if (
      props.viewer.superMe.subAccounts &&
      props.viewer.superMe.subAccounts.length > 0
    )
      props.viewer.superMe.subAccounts.forEach(subAccount => {
        accounts.push(subAccount);
      });

    displayChooseSubAccountModal({
      title: localizations.circle_addMyChild,
      message: localizations.circle_addMyChild_text,
      cancelLabel:
        localizations.circle_alert_circle_is_private_message_switch_cancel,
      accounts,
      showNewAccountButton: true,
      canCloseModal: true,
      onSelect: e => {
        CircleMutation.commit(
          {
            viewer: this.props.viewer,
            idVar: this.props.viewer.circle.id,
            newUserIdVar: e.id,
            circle: this.props.viewer.circle,
          },
          {
            onFailure: error => {
              this.props.alert.show(
                error.getError().source.errors[0].message,
                {
                  timeout: 2000,
                  type: 'error',
                },
              );
              this.setState({ isLoading: false });
            },
            onSuccess: response => {
              this.props.alert.show(
                localizations.popup_editCircle_update_success,
                {
                  timeout: 2000,
                  type: 'success',
                },
              );
              setTimeout(() => {
                this.setState({ isLoading: false });
              }, 1500);
            },
          },
        );
      },
      onSelectNew: () => {
        this.props._updateRegisterFromAction(
          `/circle/${this.props.viewer.circle.id}`,
        );
        this.props._updateSubAccountCreation(true);
        this.props.router.push({
          pathname: '/register',
        });
      },
      onClose: () => {},
    });
  };

  _resetMemberName = () => {
    this.setState({
      user: null,
      parent1: null,
      parent2: null,
    });
  };

  openAndroidApp = () => {
    document.location = `sportunity://circle/${this.props.viewer.circle.id}`;
  };

  switchToTab = tab => this.setState({ activeTab: tab });

  _changeSection = name => {
    this.setState({
      activeSection: name,
    });
  };

  isUserAsked = (user, question, responses) => {
    const result = responses
      .filter(response => response.user.id === user.id)
      .find(response => question.id === response.information);

    return result;
  };

  isUserFilledInformation = (user, circle) =>
    circle.askedInformation
      .filter(askedInfo => !askedInfo.filledByOwner)
      .reduce(
        (mem, question) =>
          mem && !!this.isUserAsked(user, question, circle.membersInformation),
        true,
      );

  isUserMemberOfMergedCircle = (user, circle) => {
    if (
      circle.subCircles &&
      circle.subCircles.edges &&
      circle.subCircles.edges.length > 0
    ) {
      let result = false;
      circle.subCircles.edges.forEach(edge => {
        if (
          edge.node.members &&
          edge.node.members.length > 0 &&
          edge.node.members.map(member => member.id).indexOf(user.id) >= 0
        )
          result = true;
      });
      return result;
    }
    return false;
  };

  getMemberParentsString = (member, circle) => {
    if (
      circle.memberParents && 
      circle.memberParents.length > 0 && 
      circle.memberParents.findIndex(parent => 
        parent.subAccounts && 
        parent.subAccounts.findIndex(sub => 
          sub.id === member.id
        ) >= 0
      ) >= 0
    ) {
      let result = '-';
      circle.memberParents.forEach(parent => {
        if (parent.subAccounts.findIndex(sub => sub.id === member.id) >= 0)
          result = result === '-' ? parent.pseudo : result + ', ' + parent.pseudo
      })
      return result
    }
    else return '-';
  }

  _displayRowsOrCards = () => {
    if (
      !this.state.rowMembers &&
      (this.state.columns.length === 0 || this.state.rows.length === 0)
    ) {
      const columns = [];
      columns.push({
        type: 'STATUS',
        name: 'Status',
        id: 'SERKET',
        filledByOwner: true,
      });
      if (this.props.viewer.circle.type === 'CHILDREN') {
        columns.push({
          type: 'PARENTS',
          name: 'Parents',
          id: 'PARENTS',
          acceptedBy: false,
        });
      }
      this.props.viewer.circle.termsOfUses.forEach(term => {
        columns.push({
          type: 'TERM',
          name: term.name,
          id: term.id,
          acceptedBy: term.acceptedBy,
        });
      });
      this.props.viewer.circle.askedInformation.map(askedInfo => {
        columns.push(askedInfo);
      });

      const rows = [];
      const statusList = [];

      this.props.viewer.circle.memberStatus.forEach(status => {
        const index = statusList.findIndex(
          tmpStatus => tmpStatus.member.id === status.member.id,
        );
        if (index < 0) {
          statusList.push(status);
        } else if (statusList[index].starting_date < status.starting_date)
          statusList[index] = status;
      });
      this.props.viewer.circle.members.map(member => {
        const answers = [];
        statusList.map(status => {
          if (status.member.id === member.id) {
            answers.push({ askedInfo: columns[0], answer: status.status });
          }
        });
        if (answers.length < 1)
          answers.push({ askedInfo: columns[0], answer: 'ACTIVE' });

        if (this.props.viewer.circle.type === 'CHILDREN') {
          answers.push({
            askedInfo: columns[1], answer: this.getMemberParentsString(member, this.props.viewer.circle)
          })
        }

        columns.forEach(col => {
          if (col.type === 'TERM')
            answers.push({
              askedInfo: col,
              answer:
                col.acceptedBy.findIndex(
                  accept => accept.user.id === member.id,
                ) >= 0,
            });
        });
        this.props.viewer.circle.askedInformation.map(askedInfo => {
          let answer;
          this.props.viewer.circle.membersInformation.map(info => {
            if (
              info.user.id === member.id &&
              askedInfo.id === info.information
            ) {
              if (askedInfo.type === 'NUMBER') answer = parseInt(info.value);
              else if (askedInfo.type === 'BOOLEAN')
                answer = info.value !== 'false';
              else answer = info.value;
            }
          });
          answers.push({ askedInfo, answer });
        });
        rows.push({ user: member, answers });
      });

      this.props.viewer.circle.waitingMembers &&
        this.props.viewer.circle.waitingMembers.map(member => {
          const answers = [];
          answers.push({ askedInfo: columns[0], answer: "PENDING" });
          columns.forEach(col => {
            if (col.type === 'TERM')
              answers.push({
                askedInfo: col,
                answer:
                  col.acceptedBy.findIndex(
                    accept => accept.user.id === member.id,
                  ) >= 0,
              });
          });
          rows.push({ user: member, answers });
        })

        this.props.viewer.circle.refusedMembers &&
        this.props.viewer.circle.refusedMembers.map(member => {
          const answers = [];
          answers.push({ askedInfo: columns[0], answer: "REFUSED" });
          rows.push({ user: member, answers });
        })

      this.setState({ rows, columns });
    }

    this.setState({ rowMembers: !this.state.rowMembers });
  };

  _relaunchMembers = () => {
    const idVar = this.props.viewer.circle.id;
    const viewer = this.props.viewer;

    RelaunchMembersMutation.commit(
      {
        viewer,
        idVar,
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.popup_editCircle_update_failed, {
            timeout: 2000,
            type: 'error',
          });
          const errors = JSON.parse(error.getError().source);
        },
        onSuccess: response => {
          this.props.alert.show(
            localizations.popup_editCircle_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
          this.setState({ isRelaunchButtonVisible: false });
        },
      },
    );
  };

  getType = (type, isSubAccount) => {
    if (type === null) return '';
    const list = [
      [localizations.circle_adult, localizations.circle_child],
      [localizations.circle_club, localizations.circle_teams],
    ];
    if (
      type !== 'PERSON' &&
      type !== 'ORGANIZATION' &&
      type !== 'ADULTS' &&
      type !== 'CLUBS'
    )
      return type.toLowerCase();
    const categorie = type === 'ADULTS' || type === 'PERSON' ? 0 : 1;
    const index = isSubAccount ? 1 : 0;
    return list[categorie][index];
  };

  _deleteMember = (member, hideConfirmationPopup, shouldFetch) => {
    this.setState({ isLoading: true });
    const viewer = this.props.viewer;
    const userIDVar = this.props.viewer.id;
    const idVar = this.props.viewer.circle.id;
    const removedUserIdVar = member;

    DeleteMemberMutation.commit(
      {
        viewer,
        userIDVar,
        idVar,
        removedUserIdVar,
        circle: this.props.viewer.circle,
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.circle_removeMemberFail, {
            timeout: 2000,
            type: 'error',
          });
          this.setState({ isLoading: false });
          const errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: response => {
          if (!hideConfirmationPopup) {
            this.props.alert.show(localizations.circle_removeMemberSuccess, {
              timeout: 2000,
              type: 'success',
            });
          }
          //     if (shouldFetch)
          // TOCHECK props.relay.* APIs do not exist on compat containers
          //     this.props.relay.forceFetch()
          // this.setState({isLoading: false})
        },
      },
    );
  };

  _acceptDenyMember = (member, hideConfirmationPopup, shouldFetch) => {
    this.setState({ isLoading: true });
    const viewer = this.props.viewer;
    const circleId = this.props.viewer.circle.id;
    let successMsg = ""
    let members = [];

    if (member.refusedUsers) {
      members = {refusedUsers: member.refusedUsers.map(a => a.id)} ;

      successMsg = localizations.circle_denyMemberSuccess
    }
    else {
      members = {acceptedUsers: member.acceptedUsers.map(a => a.id)} ;

      successMsg = 
        member.acceptedUsers.length > 1 
        ? localizations.circle_acceptMembersSuccess
            .replace('{0}', member.acceptedUsers.length)
            .replace('{1}', member.acceptedUsers.map(a => a.pseudo).join(', '))
            .replace('{2}', this.props.viewer.circle.name)
        : localizations.circle_acceptMemberSuccess
            .replace('{1}', member.acceptedUsers[0].pseudo)
            .replace('{2}', this.props.viewer.circle.name)
    }

    AcceptOrRefusedCircleMembersMutation.commit(
      {
        viewer,
        circleId,
        member: members
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.circle_removeMemberFail, {
            timeout: 3000,
            type: 'error',
          });
          this.setState({ isLoading: false });
          const errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: response => {
          if (!hideConfirmationPopup) {
            this.props.alert.show(successMsg, {
              timeout: 3000,
              type: 'success',
            });
          }
        },
      },
    );
  };

  _handleUserClicked = member => {
    const userList = this.state.selectedUserList;
    const index = userList.indexOf(member.id);
    if (index >= 0) userList.splice(index, 1);
    else userList.push(member.id);

    this.setState({
      selectedUserList: userList,
    });
  };

  _handleTransfer = () => {
    transferModal({
      canCloseModal: true,
      title: localizations.circle_transferMembers_validation,
      message: localizations.circle_transferMembers_explanation,
      cancelLabel: localizations.info_cancel,
      confirmLabel: localizations.info_update,
      profileType: this.props.viewer.me.profileType,
      circleList: this.props.viewer.me.meCircles.edges
        .map(edge => edge.node)
        .filter(node => node.id !== this.props.viewer.circle.id),
      circlesFromClub:
        this.props.viewer.me.meCirclesCirclesFromClub &&
        this.props.viewer.me.meCirclesCirclesFromClub.edges &&
        this.props.viewer.me.meCirclesCirclesFromClub.edges.length > 0
          ? this.props.viewer.me.meCirclesCirclesFromClub.edges
              .map(edge => edge.node)
              .filter(node => node.id !== this.props.viewer.circle.id)
          : [],
      onCancel: () => {},
      onConfirm: (circle, deleteMembers) =>
        this.transferUsersToCircle(circle, deleteMembers),
    });
  };

  transferUsersToCircle = (circle, deleteMembers) => {
    const newUsersVar = this.state.selectedUserList;

    AddMembersMutation.commit(
      {
        viewer: this.props.viewer,
        idVar: circle.id,
        newUsersVar,
        circle: this.props.viewer.circle,
      },
      {
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 2000,
            type: 'error',
          });
          this.setState({ isLoading: false });
        },
        onSuccess: response => {
          if (deleteMembers) {
            this.state.selectedUserList.forEach((user, index) => {
              if (index === this.state.selectedUserList.length - 1)
                this._deleteMember(user, true, true);
              else this._deleteMember(user, true, false);
            });
          }
          this.props.alert.show(
            localizations.popup_editCircle_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
          this.setState({ selectedUserList: [] });
        },
      },
    );
  };

  _handleCopyURL = () => {
    this.synchronizeLink.disabled = false;
    this.synchronizeLink.select();
    document.execCommand('copy');
    this.synchronizeLink.disabled = true;
    this.props.alert.show(localizations.popup_copyCircle_link, {
      timeout: 2000,
      type: 'success',
    });
  };

  renderMetaTags = circle => (
    <Helmet>
      <title>
        {`Sportunity - Groupe ${circle.name} de ${circle.owner.pseudo}`}
      </title>
      <meta name="robots" content="noindex" />
      <meta name="description" content={localizations.meta_description} />
      <meta property="fb:app_id" content="1759806787601548" />
      <meta property="og:type" content="article" />
      <meta
        property="og:title"
        content={`Sportunity - Groupe ${circle.name} de ${
          circle.owner.pseudo
        }`}
      />
      <meta
        property="og:description"
        content={
          (!circle.isCircleAccessibleFromUrl ? 'Groupe privé' + '\n' : '') +
          localizations.circle_slogan
        }
      />
      <meta property="og:url" content={`${appUrl}circle/${circle.id}`} />
      <meta
        property="og:image"
        content={`${appUrl}images/icon_circle@3x.png`}
      />
      <meta property="og:image:width" content="250" />
      <meta property="og:image:height" content="250" />
    </Helmet>
  );

  render() {
    const {
      viewer,
      viewer: { circle },
    } = this.props;
    const {
      isCurrentUserTheOwner,
      isCurrentUserAMember,
      isCurrentUserCoOwner,
      isCurrentUserAChild,
      isCurrentUserAParent,
      columns,
      rows,
    } = this.state;

    const statusList = ['ACTIVE', 'INJURED', 'INACTIVE', 'OTHER'];
    const members =
      circle && circle.members ? circle.members.filter(e => true) : [];
    if (members && this.state.rowMembers && rows.length > 0) {
      members.sort((a, b) => {
        const rowA = rows.find(row => a.id === row.user.id);
        const rowB = rows.find(row => b.id === row.user.id);

        if (!rowA || !rowB) return 0;

        const indexA = statusList.findIndex(
          status => status === rowA.answers[0].answer,
        );
        const indexB = statusList.findIndex(
          status => status === rowB.answers[0].answer,
        );
        return indexA - indexB;
      });
    }
    const profileType = viewer.me ? viewer.me.profileType : null;
    const isSubAccount = viewer.me ? viewer.me.isSubAccount : null;
    const listType = {
      adults: localizations.circles_member_type_0,
      children: localizations.circles_member_type_1,
      teams: localizations.circles_member_type_2,
      clubs: localizations.circles_member_type_3,
      companies: localizations.circles_member_type_4,
    };

    return (
      <div style={styles.mainContainer}>
        {this.renderMetaTags(circle)}
        <ReactTooltip effect="solid" multiline />


        {/* <Link to={'/my-circles'} style={styles.back}>
		      {localizations.circles_back}
	      </Link> */}

        {this.state.displayAndroidOpenApp && (
          <ConfirmationModal
            isOpen
            title={localizations.android_open_appTitle}
            message={localizations.android_open_appText}
            confirmLabel={localizations.android_open_appConfirm}
            cancelLabel={localizations.android_open_appCancel}
            canCloseModal
            onConfirm={this.openAndroidApp}
            onCancel={() => {}}
          />
        )}

        {(!this.state.isTermOfUseCheck ||
          this.state.isCurrentUserWantToBeMember) && (
          <TermOfUseModal
            isOpen
            circle={this.props.viewer.circle}
            viewer={this.props.viewer}
            toggleTermModal={this.toggleTermModal}
            onClose={() => {
              this.setState({
                isCurrentUserWantToBeMember: false,
                isTermOfUseCheck: true,
              });
            }}
          />
        )}

        {!this.state.displayPrivateCirclePopup && (
          <Wrapper style={styles.wrapper}>
            <Header
              viewer={viewer}
              circle={circle}
              user={viewer.me}
              isLogin={viewer.me !== null}
              isLoading={this.state.isLoading}
              isCurrentUserTheOwner={isCurrentUserTheOwner}
              isCurrentUserCoOwner={isCurrentUserCoOwner}
              isCurrentUserAMember={isCurrentUserAMember}
              activeTab={this.state.activeTab}
              switchToTab={this.switchToTab}
              router={this.props.router}
              match={this.props.match}
              addMemberComponent={
                <AddMember
                  viewer={viewer}
                  circle={circle}
                  onRef={ref => (this.addMemberRef = ref)}
                  circleId={this.props.viewer.circle.id}
                  isError={this.state.isError}
                  user={this.state.user}
                  parent1={this.state.parent1}
                  parent2={this.state.parent2}
                  onChange={this._handleChange}
                  onParent1Change={this._handleParent1Change}
                  onParent2Change={this._handleParent2Change}
                  onErrorChange={this._setIsError}
                  onCloseModal={this._resetMemberName}
                  isLoggedIn={!!viewer.me}
                  superMe={viewer.superMe}
                  me={viewer.me}
                  handleTransfer={this._handleTransfer}
                  selectedUserList={this.state.selectedUserList}
                  {...this.state}
                />
              }
              joinGroupComponent={() => (
                <div>
                  {(this.state.activeTab === 'details' ||
                    this.state.activeTab === 'members' ||
                    this.state.activeTab === 'activities') &&
                    (!isSubAccount ||
                      (circle &&
                        ((circle.type === 'CHILDREN' &&
                          profileType === 'PERSON') ||
                          (circle.type === 'TEAMS' &&
                            profileType === 'ORGANIZATION'))) ||
                      (isCurrentUserTheOwner || isCurrentUserCoOwner)) && (
                      <div>
                        {circle.type === 'CHILDREN' &&
                        !isCurrentUserTheOwner &&
                        !isCurrentUserCoOwner &&
                        isCurrentUserAParent 
                        ? <AddMyChild
                            onClick={() =>
                              this._handleOpenSubAccountList(this.props)
                            }
                          />
                        : !this.state.isCurrentUserAMember &&
                          circle && 
                          circle.waitingMembers && 
                          circle.waitingMembers.findIndex(waiting => viewer.me && waiting.id === viewer.me.id) < 0 && 
                          circle.refusedMembers && 
                          circle.refusedMembers.findIndex(refused => viewer.me && refused.id === viewer.me.id) < 0 && 
                          ((viewer.me &&
                            ((circle.type === 'ADULTS' &&
                              viewer.me.profileType === 'PERSON') ||
                              (circle.type === 'CHILDREN' &&
                                isCurrentUserAChild) ||
                              ((circle.type === 'TEAMS' ||
                                circle.type === 'CLUBS') &&
                                viewer.me.profileType === 'ORGANIZATION') ||
                              (circle.type === 'COMPANIES' &&
                                (viewer.me.profileType === 'BUSINESS' ||
                                  viewer.me.profileType === 'SOLETRADER')))) ||
                            !viewer.me) && (
                            <Subscribe
                              viewer={viewer}
                              circleId={this.props.viewer.circle.id}
                              isError={this.state.isError}
                              user={this.state.user}
                              onChange={this._handleChange}
                              onErrorChange={this._setIsError}
                              onCloseModal={this._resetMemberName}
                              isLoggedIn={!!viewer.me}
                              onSubscribe={this._handleWantToBe}
                              {...this.state}
                            />
                          )
                        }
                        {circle && 
                          circle.waitingMembers && 
                          circle.waitingMembers.findIndex(waiting => viewer.me && waiting.id === viewer.me.id) >= 0 && 
                          <Button
                            onClick={() => {}}
                            variant="outlined"
                            color="primary"
                            style={{ marginRight: 40 }}
                          >
                            {localizations.circle_subscription_pending}
                          </Button>
                        }
                        {isCurrentUserAMember && (
                          <Button
                            onClick={this.unSubscribe}
                            variant="outlined"
                            color="primary"
                            style={{ marginRight: 40 }}
                          >
                            {localizations.circles_unsubscribe}
                          </Button>
                        )}
                      </div>
                    )}
                </div>
              )}
            />
            <TabHeader
              viewer={viewer}
              circle={circle}
              isCurrentUserTheOwner={isCurrentUserTheOwner}
              isCurrentUserCoOwner={isCurrentUserCoOwner}
              isCurrentUserAMember={isCurrentUserAMember}
              activeTab={this.state.activeTab}
              switchToTab={tab => this.switchToTab(tab)}
            />

            <div style={styles.bodyContainer}>
              {this.state.activeTab === 'details' && (
                <Details
                  viewer={viewer}
                  circle={circle}
                  isCurrentUserTheOwner={isCurrentUserTheOwner}
                  isCurrentUserCoOwner={isCurrentUserCoOwner}
                  switchToTab={tab => this.switchToTab(tab)}
                />
              )}

              {this.state.activeTab === 'activities' && (
                <Activities
                  viewer={viewer}
                  user={viewer.me}
                  circle={circle}
                  isCurrentUserTheOwner={isCurrentUserTheOwner}
                  isCurrentUserCoOwner={isCurrentUserCoOwner}
                  switchToTab={tab => this.switchToTab(tab)}
                  querySportunities
                />
              )}

              {this.state.activeTab === 'members' &&
                this.state.activeSection === 'members' && (
                  <div>
                    <Paginate data={members} dataKey="members" displayContent={true}>
                      <Members
                        viewer={viewer}
                        user={viewer.me}
                        circle={circle}
                        activeSection={this.state.activeSection}
                        isCurrentUserTheOwner={isCurrentUserTheOwner}
                        isCurrentUserCoOwner={isCurrentUserCoOwner}
                        isCurrentUserAMember={isCurrentUserAMember}
                        rowMembers={this.state.rowMembers}
                        switchToSection={section => this.setState({ activeSection: section })}
                        switchToTab={tab => this.switchToTab(tab)}
                        swtichToSection={section => this.setState({ activeSection: section })}
                        selectedUserList={this.state.selectedUserList}
                        isRelaunchButtonVisible={this.state.isRelaunchButtonVisible}
                        _displayRowsOrCards={this._displayRowsOrCards}
                        _deleteMember={this._deleteMember}
                        _acceptDenyMember={this._acceptDenyMember}
                        _handleUserClicked={this._handleUserClicked}
                        isUserFilledInformation={this.isUserFilledInformation}
                        _relaunchMembers={this._relaunchMembers}
                        isUserMemberOfMergedCircle={this.isUserMemberOfMergedCircle}
                        rows={rows}
                        columns={columns}
                        members={members}
                        waitingMembers={circle.waitingMembers}
                        refusedMembers={circle.refusedMembers}
                        allMembers={circle.members}
                        onLink={this._handleCopyURL}
                        addMember={
                          this.addMemberRef
                            ? circle.type === 'CHILDREN'
                              ? this.addMemberRef._openChildModal
                              : this.addMemberRef._openModal
                            : null
                        }
                        onSubscribe={this._handleWantToBe}
                        queryCircle={this.state.queryCircle}
                        router={this.props.router}
                      />
                    </Paginate>
                  </div>
                )}

              {this.state.activeSection === 'information' &&
                this.state.activeTab === 'members' && (
                  <MembersInformation
                    viewer={viewer}
                    circle={circle}
                    onLeave={() => this.setState({ activeSection: 'members' })}
                  />
                )}

              {this.state.activeTab === 'settings' && (
                <EditCircle
                  viewer={viewer}
                  meCircles={viewer.me.meCircles}
                  circle={circle}
                  circleId={circle.id}
                  {...this.state}
                  onLeave={() =>
                    this.setState({
                      activeSection: 'members',
                      activeTab: 'members',
                    })
                  }
                  router={this.props.router}
                />
              )}

              {this.state.activeTab === 'statistics' && (
                <CircleStats
                  viewer={this.props.viewer}
                  user={circle.owner}
                  userId={circle.owner.id}
                  circleId={circle.id}
                  queryCircle={this.state.queryCircle}
                />
              )}

              {this.state.activeTab === 'chat' && (
                <Chat
                  viewer={viewer}
                  circle={circle}
                  isCurrentUserAMember={isCurrentUserAMember}
                  isCurrentUserCoOwner={isCurrentUserCoOwner}
                  isCurrentUserTheOwner={isCurrentUserTheOwner}
                  router={this.props.router}
                />
              )}

              <table id="table-to-xls" style={{ display: 'none' }}>
                <tr>
                  <td>Pseudo</td>
                  {columns.map(info => (
                    <td key={info.id}>{info.name}</td>
                  ))}
                  {/* <td>Acceptance</td> */}
                </tr>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{row.user.pseudo}</td>
                    {row.answers && row.answers.length > 0 && 
                      row.answers.map((answer, answerIndex) => (
                        <td key={answerIndex}>
                          {answer.askedInfo.type === 'BOOLEAN'
                          ? answer.answer 
                            ? localizations.circle_yes 
                            : answer.answer === false 
                              ? localizations.circle_no 
                              : ''
                          : answer.askedInfo && answer.askedInfo.type === 'TERM' || (answer.askedInfo.askedInfo && answer.askedInfo.askedInfo.type === 'TERM')
                            ? answer.answer 
                              ? localizations.circle_termOfUse_isAccepted 
                              : localizations.circle_termOfUse_isNotAccepted
                            : answer.answer
                          }
                        </td>
                      ))
                    }
                  </tr>
                ))}
              </table>
            </div>
          </Wrapper>
        )}
      </div>
    );
  }
}

styles = {
  mainContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pageHeader: {
    fontFamily: 'Lato',
    fontSize: 34,
    fontWeight: fonts.weight.large,
    color: colors.blue,
    display: 'flex',
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    width: 1665,
    '@media (max-width: 1930px)': {
      width: 1245,
    },
    '@media (max-width: 1490px)': {
      width: 825,
    },
    '@media (max-width: 1070px)': {
      width: '100%',
    },
    '@media (max-width: 900px)': {
      flexDirection: 'column',
      marginBottom: 0,
    },
    '@media (max-width: 768px)': {
      paddingLeft: 20,
    },
  },
  param: {
    fontSize: 18,
    color: colors.black,
    marginRight: 20,
  },
  iconEdit: {
    cursor: 'pointer',
    color: colors.blueLight,
    fontSize: 18,
    ':hover': {
      color: colors.blue,
    },
  },
  policyIcon: {
    marginLeft: 5,
    color: colors.gray,
  },
  bodyContainer: {
    display: 'flex',
    // width: 'calc(100% - 250px)',

    margin: '0px 0 50px 0',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 600,
    // padding: '0 15px',
    '@media (max-width: 677px)': {
      width: '97%',
      margin: 'auto',
    },
  },
  newMemberSection: {
    display: 'flex',
    alignItems: 'center',
  },
  ownerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  smallAvatar: {
    width: 30,
    height: 30,
    marginRight: 10,
    color: colors.blue,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: '50%',
  },
  ownerName: {
    color: colors.gray,
    fontSize: 22,
    fontWeight: 'normal',
  },
  memberList: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 15,
    width: '100%',
    padding: 0,
    flexWrap: 'wrap',
    '@media (max-width: 1070px)': {
      justifyContent: 'center',
    },
  },
  memberListRow: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 15,
    width: '100%',
    padding: 0,
    flexWrap: 'wrap',
  },
  navLink: {
    color: colors.blue,
    textDecoration: 'none',
    marginRight: '10px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 1665,
    '@media (max-width: 1930px)': {
      width: 1245,
    },
    '@media (max-width: 1490px)': {
      width: 825,
    },
    '@media (max-width: 1070px)': {
      width: '100%',
    },
  },
  headerRowFullWidth: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  buttonSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  icon: {
    cursor: 'pointer',
    color: colors.gray,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    borderRadius: 20,
    marginLeft: 5,
    ':hover': {
      backgroundColor: colors.gray,
      color: colors.white,
    },
  },
  textButton: {
    cursor: 'pointer',
    color: colors.gray,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    border: 'none',
    marginLeft: 5,
    fontFamily: 'Lato',
    fontSize: 14,
    lineHeight: '16px',
    padding: '5px 10px',
    ':hover': {
      borderRadius: '5px',
      backgroundColor: colors.gray,
      color: colors.white,
    },
  },
  button: {
    cursor: 'pointer',
    color: colors.gray,
    display: 'flex',
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    border: 'none',
    margin: '20px auto',
    padding: '5px 10px',
    ':active': {
      border: 'none',
    },
    ':hover': {
      borderRadius: '5px',
      backgroundColor: colors.gray,
      color: colors.white,
    },
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 15,
  },
  label: {
    fontFamily: 'Lato',
    fontSize: 16,
    color: colors.blue,
    marginRight: 10,
  },
  bigLabel: {
    fontFamily: 'Lato',
    fontSize: 20,
    color: colors.blue,
    marginRight: 10,
    marginTop: 25,
  },
  switchContainer: {
    marginLeft: 15,
  },
  wrapper: {
    margin: '35px auto',
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'Lato',
    '@media (max-width: 960px)': {
      width: '100%',
    },
    '@media (max-width: 580px)': {
      display: 'block',
    },
  },
  tableRowHeader: {
    width: '100%',
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: colors.white,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    overflow: 'hidden',
    fontFamily: 'Lato',
    margin: '1px 0',
    padding: 15,
    textDecoration: 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      width: 'auto',
    },
  },
  tableRowHeaderPseudo: {
    flex: 3,
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: 'rgba(0,0,0,0.65)',
  },
  tableRowHeaderTitle: {
    flex: 2,
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: 'rgba(0,0,0,0.65)',
  },
  msgContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  msgIcon: {
    fontSize: '1.5em',
    color: '#a6a6a6',
    verticalAlign: 'sub',
  },
  msgHeader: {
    fontSize: 22,
    color: colors.blue,
    fontFamily: 'Lato',
    textAlign: 'center',
    lineHeight: '26px',
    fontWeight: 'bold',
  },
  msgText: {
    fontSize: 18,
    color: '#838383',
    fontFamily: 'Lato',
    textAlign: 'center',
    lineHeight: '26px',
    width: '75%',
  },
  msgLink: {
    color: colors.blue,
    textDecoration: 'none',
  },
  separator: {
    height: 1,
    width: '10%',
    backgroundColor: '#000',
    margin: '20px 0px',
  },
  shareButton: {
    marginLeft: 20,
    fontFamily: 'Lato',
    fontSize: 18,
    color: colors.blue,
    cursor: 'pointer',
  },
  shareIcon: {
    color: colors.darkGray,
    marginRight: 5,
    fontSize: 20,
  },
  back: {
    fontSize: fonts.size.large,
    textDecoration: 'none',
    color: colors.blue,
    margin: '0px 10px 10px',
    fontFamily: 'lato',
  },
};

const _updateStepsCompleted = (steps) => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});


const _updateRegisterFromAction = text => ({
  type: types.UPDATE_REGISTER_FROM,
  text,
});

const _updateSubAccountCreation = value => ({
  type: types.UPDATE_REGISTER_SUBACCOUNT_CREATION,
  value,
});

const _loggedFromPage = value => ({
  type: types.LOGGED_IN_FROM_PAGE,
  value,
});

const stateToProps = state => ({
  createProfileFrom: state.registerReducer.createProfileFrom,
  subAccountCreation: state.registerReducer.subAccountCreation,
  tutorialSteps: state.profileReducer.tutorialSteps
});

const dispatchToProps = dispatch => ({
  _updateRegisterFromAction: bindActionCreators(
    _updateRegisterFromAction,
    dispatch,
  ),
  _updateSubAccountCreation: bindActionCreators(
    _updateSubAccountCreation,
    dispatch,
  ),
  _loggedFromPage: bindActionCreators(_loggedFromPage, dispatch),
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),

});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(Circle));

export default createRefetchContainer(
  withRouter(withAlert(ReduxContainer)),
  {
    // OK
    viewer: graphql`
      fragment Circle_viewer on Viewer
        @argumentDefinitions(
          userToken: { type: "String", defaultValue: null }
          queryAuthorizedAccounts: { type: "Boolean!", defaultValue: false }
          superToken: { type: "String", defaultValue: null }
          querySuperMe: { type: "Boolean!", defaultValue: false }
          circleId: { type: "ID" }
        ) {
        id
        ...CircleStats_viewer
        ...AddMember_viewer
        ...Subscribe_viewer
        ...EditCircle_viewer
        ...MemberCard_viewer
        ...MemberRow_viewer
        ...CircleMembersInformation_viewer
        ...CircleHeader_viewer
        ...Activities_viewer
        ...ChatContainer_viewer
        ...TermOfUseModal_viewer
        me {
          ...CircleHeader_user
          ...Activities_user
          id
          pseudo
          avatar
          profileType
          isSubAccount
          meCircles: circles(last: 20) {
            edges {
              node {
                id
                name
                memberCount
              }
            }
          }
          meCirclesCirclesFromClub: circlesFromClub(last: 100) {
            edges {
              node {
                id
                name
                owner {
                  id
                  pseudo
                  avatar
                }
                memberCount
                members {
                  id
                  pseudo
                  avatar
                }
              }
            }
          }
        }
        authorizedAccounts(userToken: $userToken)
          @include(if: $queryAuthorizedAccounts) {
          id
          avatar
          pseudo
          accounts {
            id
            avatar
            token
            pseudo
          }
        }
        superMe(superToken: $superToken) @include(if: $querySuperMe) {
          id
          pseudo
          avatar
          profileType
          subAccounts {
            id
            avatar
            pseudo
            token
          }
        }
        circle(id: $circleId) {
          ...CircleHeader_circle
          ...Details_circle
          ...Activities_circle
          ...TermOfUseModal_circle
          circleSportunities: sportunities {
            edges {
              node {
                status
              }
            }
          }
          termsOfUses {
            id
            name
            link
            content
            acceptedBy {
              user {
                id
              }
            }
          }
          memberStatus {
            member {
              id
            }
            status
            starting_date
          }
          description
          id
          name
          address {
            address
            city
            country
            position {
              lat
              lng
            }
          }
          owner {
            id
            pseudo
            avatar
            ...CircleStats_user
            profileType
          }
          coOwners {
            id
          }
          memberCount
          mode
          type
          isCircleUpdatableByMembers
          isCircleUsableByMembers
          isCircleAccessibleFromUrl
          shouldValidateNewUser
          isChatActive
          circlePreferences {
            isChildrenCircle
          }
          waitingMembers {
            id
            pseudo
            firstName
            lastName
            avatar
            lastConnexionDate
          }
          refusedMembers {
            id
            pseudo
            firstName
            lastName
            avatar
            lastConnexionDate
          }
          members {
            id
            pseudo
            firstName
            lastName
            avatar
            lastConnexionDate

            sports {
              sport {
                id
                name {
                  EN
                  FR
                  DE
                }
              }
            }
            circlesUserIsIn(last: 20) {
              edges {
                node {
                  id
                  name
                  owner {
                    id
                    pseudo
                    avatar
                  }
                  mode
                  isCircleUpdatableByMembers
                  isCircleUsableByMembers
                  memberCount
                }
              }
            }
            sportunityNumber
            followers {
              id
            }
          }
          sport {
            sport {
              id
              logo
              name {
                EN
                FR
              }
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
              }
            }
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
            }
          }
          memberParents {
            subAccounts {
              id
            }
            id
            pseudo
            firstName
            lastName
            avatar
            lastConnexionDate
            sports {
              sport {
                id
                name {
                  EN
                  FR
                  DE
                }
              }
            }
            sportunityNumber
            followers {
              id
            }
          }
          subCircles(last: 20) {
            edges {
              node {
                id
                members {
                  id
                }
              }
            }
          }
          askedInformation {
            id
            name
            type
            filledByOwner
          }
          membersInformation {
            id
            information
            user {
              id
            }
            value
            document {
              id,
              name
            }
            validationStatus
            comment
          }
        }
      }
    `,
  },
  graphql`
    query CircleRefetchQuery(
      $userToken: String
      $queryAuthorizedAccounts: Boolean!
      $superToken: String
      $querySuperMe: Boolean!
      $circleId: ID
    ) {
      viewer {
        ...Circle_viewer
          @arguments(
            userToken: $userToken
            queryAuthorizedAccounts: $queryAuthorizedAccounts
            superToken: $superToken
            querySuperMe: $querySuperMe
            circleId: $circleId
          )
      }
    }
  `,
);
