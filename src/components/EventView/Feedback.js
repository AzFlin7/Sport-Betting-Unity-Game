import React, {Component} from 'react'
import Radium from 'radium'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { withAlert } from 'react-alert'
import StarRatingComponent from 'react-star-rating-component';

import { colors } from '../../theme'
import localizations from '../Localizations'
import UpdateUserFeedbackMutation from './UpdateUserFeedbackMutation.js';

var Style = Radium.Style;

let styles;

class Feedback extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showFeedBack: false,
            rating: 5, 
            commentText: '',
            selectedUser: ''
        }
        this.alertOptions = {
            offset: 60,
            position: 'top right',
            theme: 'light',
            transition: 'fade',
        };
    }

    componentDidMount = () => {
        if (this.props.sportunity && this.props.sportunity.organizers && this.props.sportunity.organizers.length > 0) {
            this.setState({
                selectedUser: this.props.sportunity.organizers[0].organizer.id
            })
        }
    }

    onChangeSelectedUser = (value) => {
        this.setState({
            selectedUser: value
        })
    }

    onStarClick(nextValue, prevValue, name) {
        this.setState({rating: nextValue});
    }

    renderStarIcon = () => {
        return (
            <i style={styles.starIcon} className="fa fa-star" aria-hidden="true"></i>
        )
    }

    writingComment = (event) => {
        if (event.target.value.length <= 100)
            this.setState({commentText: event.target.value})
    }

    hasAlreadyPostedAFeedback = (organizer, me) => {
        let result = false ;
        organizer.feedbacks.feedbacksList.edges.forEach(feedback => {
        if (feedback.node.author.id === me.id)
            result = true;
        })
        return result;
    }

    leaveAFeedback = () => {
        if (this.state.commentText.length === 0) {
            this.props.alert.show(localizations.event_leave_feedback_empty_text, {
                timeout: 3000,
                type: 'info',
            }); 
            return ;
        }

        if (this.state.selectedUser === this.props.viewer.me.id) {
            this.props.alert.show(localizations.event_leave_feedback_self, {
                timeout: 3000,
                type: 'info',
            }); 
            return ;
        }
        
        let organizer = this.props.sportunity.organizers.find(organizer => organizer.organizer.id === this.state.selectedUser);
        if (this.hasAlreadyPostedAFeedback(organizer.organizer, this.props.viewer.me)) {
            this.props.alert.show(localizations.event_leave_feedback_already_sent, {
                timeout: 3000,
                type: 'info',
            }); 
            return ;
        }

        const params = {
            text: this.state.commentText,
            rating: this.state.rating,
            createdAt: new Date(),
            author: this.props.viewer.me.id,
            viewer: this.props.viewer,
            userID: this.state.selectedUser
        }

        const callbacks = {
            onFailure: (error) => {
                this.props.alert.show(localizations.event_leave_feedback_failed, {
                    timeout: 3000,
                    type: 'error',
                }); 
                console.error(error.getError())
            },
            onSuccess: () => {
                this.props.alert.show(localizations.event_leave_feedback_success, {
                    timeout: 3000,
                    type: 'success',
                }); 
                setTimeout(() => {
                    this.setState({
                        showFeedBack: false
                    })
                }, 1000)
            },
        };

        UpdateUserFeedbackMutation.commit(params, callbacks);
    }
  
    render() {
        const { viewer, sportunity } = this.props ;
        
        return(
        <div style={styles.content}>
            <button
                style={styles.feedback}
                onClick={() => this.setState({showFeedBack: true})}
            >
                {localizations.event_leave_feedback}
            </button>
            {this.state.showFeedBack && 
                <div style={styles.modalContainer}>
                    <div style={styles.modal}>
                        <div style={styles.modalTitle}>
                            {localizations.event_leave_feedback}
                        </div>
                        <span onClick={() => this.setState({showFeedBack: false})} style={styles.closeCross}>
                            <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
                        </span> 

                        <div style={styles.bloc}>
                            <div style={styles.blocLabel}>
                                {localizations.event_leave_feedback_to}
                            </div>
                            <select style={styles.userSelect} onChange={this.onChangeSelectedUser} value={this.state.selectedUser}>
                                {sportunity.organizers.map((organizer, index) => (
                                    <option key={index} value={organizer.organizer.id}>{organizer.organizer.pseudo}</option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.bloc}>
                            <div style={styles.blocLabel}>
                                {localizations.event_leave_feedback_rating}
                            </div>
                            <StarRatingComponent 
                                name="rating" 
                                starCount={5} 
                                value={this.state.rating}
                                onStarClick={this.onStarClick.bind(this)}
                                renderStarIcon={this.renderStarIcon}
                            />
                        </div>

                        <div style={styles.bloc}>
                            <div style={styles.blocLabel}>
                                {localizations.event_leave_feedback_comment}
                            </div>
                            <textarea 
                                rows={4} 
                                cols={35} 
                                value={this.state.commentText}
                                onChange={this.writingComment}
                            />
                        </div>

                        <div style={styles.validateButton} onClick={this.leaveAFeedback}>
                            {localizations.event_leave_feedback_validate}
                        </div>                    
                    </div>
                </div>
            }    
        </div>
        ) 
    }
}


styles = {
    content: {
        fontFamily: 'Lato',
        marginTop: 30,
        '@media (max-width: 700px)': {
            padding: '20px',
        },
    },
    feedback: {
        fontSize: 16,
        color: colors.black,
        textDecoration: 'none',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        float: 'right',
    },
    modalContainer: {
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
    modal: {
        width: 524,
        maxHeight: '90vh',
        backgroundColor: colors.blue,
        borderRadius: 25,
        paddingTop: 15,
        paddingBottom: 25,
        paddingLeft: 25,
        paddingRight: 25,
        position: 'relative',
        overflowY: 'auto',
    },
    modalTitle: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 35
    },
    closeCross: {
        cursor: 'pointer',
        width: 30,
        height: 30,
        textAlign: 'center',
        position: 'absolute',
        right: 20,
        top: 15
    },
    cancelIcon: {
        fontSize: 25,
        lineHeight: '29px'
    },
    bloc: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30
    },
    blocLabel: {
        fontSize: 18,
        width: 120
    },
    userSelect: {
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
    starIcon: {
        fontSize: 25,
        margin: '0 5px'
    },
    validateButton: {
        backgroundColor: colors.green,
        color: colors.white,
        width: 230,
        height: 50,
        borderRadius: 100,
        borderStyle: 'none',
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        fontSize: 22,
        cursor: 'pointer',
        position: 'relative',
        left: 'calc(50% - 115px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        ':disabled': {
            cursor: 'not-allowed',
            backgroundColor: colors.gray,
        },
    }
};


export default createFragmentContainer(withAlert(Radium(Feedback)), {
  viewer: graphql`
    fragment Feedback_viewer on Viewer {
      id
      me {
          id
      }
    }
  `,
  sportunity: graphql`
    fragment Feedback_sportunity on Sportunity {
        organizers {
          isAdmin,
          organizer {
              id,
              pseudo
              feedbacks {
                  feedbacksList (last: 100) {
                      edges {
                          node {
                              author {
                                  id
                              }
                          }
                      }
                  }
              }
          }
        }
    }
  `
});
