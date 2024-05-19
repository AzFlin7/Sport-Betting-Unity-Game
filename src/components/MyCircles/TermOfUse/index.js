import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import { withAlert } from 'react-alert'
import localizations from '../../Localizations'
import colors from "../../../theme/colors";
import fonts from "../../../theme/fonts";
import TermOfUseModal from "./TermOfUseModal";
import NewTermOfUseMutation from './NewTermOfUseMutation';
import UpdateTermOfUseMutation from './UpdateTermOfUseMutation'
import DeleteTermOfUseMutation from "./DeleteTermOfUseMutation";
import RelaunchTermOfUseMutation from './RelaunchTermOfUseMutation';
import cloneDeep from 'lodash/cloneDeep';
import * as types from '../../../actions/actionTypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class TermOfUse extends React.Component{
  constructor(props) {
    super(props)

    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
    this.state = {
      selectedTermOfUse: null,
      isEdit: false,
      isCreate: false,
      modalIsOpen: false,
      termOfUseId: null,
      hideRelaunchButton: false
    }
  }

  componentDidMount() {
    this.props.relay.refetch(fragmentVariables => ({
      queryTerms: true,
      first: 20
    }))
  }

  _showNewTermOfUse = () => {
    this.setState({
      selectedTermOfUse: null,
      termOfUseId: null,
      isCreate: true,
      isEdit: false,
    });
    setTimeout(() => this.toggleModal());
  };

  _handleEditTermOfUse = (termOfUse) => {
    this.setState({
      selectedTermOfUse: termOfUse,
      termOfUseId: termOfUse.id,
      isEdit: true,
      isCreate: false,
    });
    setTimeout(() => this.toggleModal(), 150)
  }

  toggleModal = () => {
    this.setState({modalIsOpen: !this.state.modalIsOpen})
  };

  closeModal = () => {
    this.setState({

      selectedTermOfUse: null,
      isCreate: false,
      isEdit: false,
    })
    this.toggleModal();
  };

  _handleOnRemove = (termOfUse) => {
    const {viewer, user} = this.props ;

    DeleteTermOfUseMutation.commit({
        viewer,
        user, 
        idVar: termOfUse.id
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.popup_editCircle_update_failed, {
            timeout: 2000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: (response) => {
          this.props.alert.show(localizations.popup_editCircle_update_success, {
            timeout: 2000,
            type: 'success',
          });
          this.setState({
            deleteFormModalOpen: false,
            formToDelete: null
          })
        },
      }
    )
  };

  getMembers = (termOfUse) => {
    let members = [];
    termOfUse && termOfUse.circles && termOfUse.circles.edges.forEach(node => {
      node.node.members.forEach(member => {
        if (members.findIndex(id => member.id === id) < 0)
          members.push(member.id)
      })
    })
    return members 
  }

  getRateAccepted = (termOfUse) => {
    let members = this.getMembers(termOfUse)
    return ((termOfUse.acceptedBy ? termOfUse.acceptedBy.length : 0) + '/' + members.length)
  }

  relaunchMembers = termOfUse => {
    const {viewer, user} = this.props;
    this.setState({
      hideRelaunchButton: true
    })
    
    RelaunchTermOfUseMutation.commit({
        viewer,
        user,
        termOfUsesIdVar: termOfUse.id
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.popup_editCircle_update_failed, {
            timeout: 2000,
            type: 'error',
          });
        },
        onSuccess: (response) => {
          this.props.alert.show(localizations.circles_termOfUse_relaunch_success, {
            timeout: 2000,
            type: 'success',
          });
        },
      }
    )
  }

  _handleSubmitEdit = (state) => {
    const {viewer, user} = this.props;
    let termsOfUseVar = {
      id: this.state.termOfUseId,
      name: state.name,
      link: state.isText ? null : state.content,
      content: state.isText ? state.content : null,
      circles: state.selectedCircles.map(circle => circle.id)
    };
    UpdateTermOfUseMutation.commit({
        viewer,
        user,
        termsOfUseVar
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.popup_editCircle_update_failed, {
            timeout: 2000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: (response) => {
          this.props.alert.show(localizations.popup_editCircle_update_success, {
            timeout: 2000,
            type: 'success',
          });
          this.setState({
            deleteFormModalOpen: false,
            formToDelete: null
          })
        },
      }
    )
  };
  _handleSubmitCreate = (state) => {
    const viewer = this.props.viewer;
    let termsOfUseVar = {
      name: state.name,
      link: state.isText ? null : state.content,
      content: state.isText ? state.content : null,
      circles: state.selectedCircles.map(circle => circle.id)
    };
    
     NewTermOfUseMutation.commit({
        viewer,
        termsOfUseVar,
        user: this.props.user
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.popup_editCircle_update_failed, {
            timeout: 2000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: (response) => {
          this.props.alert.show(localizations.popup_editCircle_update_success, {
            timeout: 2000,
            type: 'success',
          });
          this.setState({
            deleteFormModalOpen: false,
            formToDelete: null
          })
          this.props.relay.refetch(fragmentVariables => ({
            queryTerms: true,
            first: 20
          }))
          this._updateTutorialSteps();
        },
      }
    )
  };

  _updateTutorialSteps = () => {
    const { tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);

    newTutorialSteps['addOfficialDocumentsStep'] = true;
    this.props._updateStepsCompleted(newTutorialSteps);
  }

  render() {
    const { user } = this.props;

    return (
    <div style={{width: '100%'}}>
      <div style={styles.pageHeader}>
        {localizations.circles_termOfUse}
      </div>
      <div style={styles.wrapper}>
        <div style={styles.bodyContainer}>
          <div style={styles.button} onClick={this._showNewTermOfUse}>
            {localizations.circles_termOfUse_new}
          </div>

          {this.state.modalIsOpen &&
            <TermOfUseModal
              user={user}
              isOpen={this.state.modalIsOpen}
              toggleModal={this.toggleModal}
              onCreate={this._handleSubmitCreate}
              onEdit={this._handleSubmitEdit}
              onClose={this.toggleModal}
              isEdit={this.state.isEdit}
              selectedTermOfUse={this.state.selectedTermOfUse}
            />
          }

          {
            user && user.termsOfUses && user.termsOfUses.length > 0
              ?
              <div style={styles.memberList} >
                <div style={styles.tableRowHeader}>
                  <div style={styles.tableRowHeaderText}>
                    {localizations.circles_termOfUse_name}
                  </div>
                  <div style={styles.tableRowHeaderCircleText}>
                    {localizations.circles_termOfUse_circles_applied}
                  </div>
                  <div style={styles.tableRowHeaderCircleText}>
                    {localizations.circles_termOfUse_accepted}
                  </div>
                  <div style={{flex: 4}}/>
                  <div style={{flex: 2}}/>
                </div>
                { user.termsOfUses.map((termOfUse, index) => (
                  <div style={styles.tableRow} key={termOfUse.id} >
                    <div style={styles.tableRowText}>
                      {termOfUse.name}
                    </div>
                    <div style={styles.tableRowCircleText}>
                      {termOfUse.circles && termOfUse.circles.edges && termOfUse.circles.edges.length > 0
                        ?   termOfUse.circles.edges.map(edge => (
                          edge.node.owner.id === user.id ? edge.node.name : edge.node.name + ' (' + edge.node.owner.pseudo + ')'
                        )).join(', ')
                        :   '-'
                      }
                    </div>
                    <div style={styles.tableRowCircleText}>
                      {termOfUse.circles && termOfUse.circles.edges && termOfUse.circles.edges.length > 0
                        ?   this.getRateAccepted(termOfUse)
                        :   '-'
                      }
                    </div>
                    <div style={styles.tableRowCircleButton}>
                      {!this.state.hideRelaunchButton && termOfUse.acceptedBy && termOfUse.acceptedBy.length <  this.getMembers(termOfUse).length
                      ? <span style={styles.tableRowCircleButtonText} onClick={() => this.relaunchMembers(termOfUse)}>
                          {localizations.circles_termOfUse_relaunch}
                        </span>
                      : null
                      }
                    </div>
                    <div style={styles.buttonContainer}>
                      <div style={styles.icon} onClick={() => this._handleEditTermOfUse(termOfUse)}>
                        <i key={"edit"+index} className="fa fa-pencil" style={styles.iconEdit}/>
                      </div>
                      <div style={styles.icon} onClick={() => this._handleOnRemove(termOfUse)}>
                        <i key={"delete"+index} className="fa fa-times" style={styles.iconRemove}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
	            :
	            <div style={styles.msgContainer}>
		            <p style={styles.msgText}>
			            {localizations.circles_noTermOfUse_text}
		            </p>
		            <img src={localizations.circles_noTermOfUse_img}
		                 style={{width: '80%'}}
		            />
	            </div>
          }
        </div>
      </div>
    </div>
    )
  }
}

let styles = {
  pageHeader: {
    fontFamily: 'Lato',
    fontSize: 34,
    fontWeight: fonts.weight.large,
    color: colors.blue,
    display: 'flex',
    maxWidth: 1400,
    margin: '30px auto 0px auto',
    flexDirection: 'row',
    alignItems: 'left',
    justifyContent: 'left',
    '@media (max-width: 900px)': {
      flexDirection: 'column',
      marginBottom: 0
    },
    '@media (max-width: 768px)': {
      paddingLeft: 20
    }
  },
  bodyContainer: {
    display: 'flex',
    width: '100%',
    margin: '0px 0 50px 0',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 600,
    padding: '0 15px'
  },
  button: {
    fontFamily: 'Lato',
    fontSize: 18,
    color: colors.blue,
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0 15px',
    position: 'relative'
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
    }
  },
  memberList: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 15,
    width: '100%',
    padding: 0,
    flexWrap: 'wrap',
    '@media (max-width: 1070px)': {
      justifyContent: 'center'
    }
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
      width: 'auto'
    }
  },
  tableRowHeaderText: {
    flex: 3,
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: 'rgba(0,0,0,0.65)'
  },
  tableRowHeaderCircleText: {
    flex: 8,
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: 'rgba(0,0,0,0.65)'
  },
  tableRow: {
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
    color: '#A6A6A6',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .15s',
    ':hover': {
      backgroundColor: '#F1F1F1',
      color: '#B6B6B6',
    },
    '@media (max-width: 768px)': {
      width: 'auto'
    }
  },
  tableRowText: {
    flex: 3,
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableRowCircleText: {
    flex: 8,
    marginRight: 10,
    fontSize: 16,
  },
  tableRowCircleButton: {
    flex: 4,
    marginRight: 10,
    fontSize: 16,
  },
  tableRowCircleButtonText: {
    cursor: 'pointer',
    color: colors.redGoogle
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end'
  },
  icon: {
    //flex: 1,
    fontSize: 24,
    cursor: 'pointer',
    textAlign: 'end',
    marginLeft: 10
  },
  iconRemove: {
    color: '#A6A6A6',
    ':hover': {
      color: colors.redGoogle
    }
  },
  iconEdit: {
    color: colors.blueLight,
    ':hover': {
      color: colors.blue
    }
  },
  msgContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 10
  },
  msgHeader: {
    fontSize: 22,
    color: '#838383',
    fontFamily: 'Lato',
    textAlign: 'center',
    lineHeight: '26px',
    fontWeight: 'bold'
  },
  msgText: {
    fontSize: 18,
    color: '#838383',
    fontFamily: 'Lato',
    textAlign: 'center',
    lineHeight: '26px',
    width: '75%',
    marginBottom: 10
  },
}

const _updateStepsCompleted = (steps) => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});

const dispatchToProps = (dispatch) => ({
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
});

const stateToProps = (state) => ({
  tutorialSteps: state.profileReducer.tutorialSteps,
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(TermOfUse);

export default createRefetchContainer(Radium(withAlert(ReduxContainer)), {
//OK
  user: graphql`
    fragment TermOfUse_user on User @argumentDefinitions(
      first: {type: "Int", defaultValue: 20},
      queryTerms: {type: "Boolean!", defaultValue: false}
    ){
      id
      termOfUseCircles: circles (last: $first) @include(if: $queryTerms) {
        edges {
          node {
            id 
            name
            members {
              id
            }
            type
            memberCount
          }
        }
      }
      termOfUseCirclesSuperUser: circlesSuperUser(first: $first) @include(if: $queryTerms) {
        edges {
          node {
            id 
            name
            members {
              id
            }
            type
            memberCount
            owner {
              id
              pseudo
              avatar
            }
          }
        }
      }
      termsOfUses @include(if: $queryTerms){
        id
        name
        link
        content
        acceptedBy {
          user {
            id
          }
        }
        circles (last: $first) {
          edges {
            node {
              id 
              name
              owner {
                id
                pseudo
              }
              members {
                id
              }
              type
              memberCount
            }
          }
        }
      }
    }
  `
},
graphql`
query TermOfUseRefetchQuery(
  $first: Int,
  $queryTerms: Boolean!
) {
  viewer {
    me {
      ...TermOfUse_user
      @arguments(
        first: $first,
        queryTerms: $queryTerms
      )
    }
  }
}
`,
);
