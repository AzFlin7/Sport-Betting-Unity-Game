import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import StarRatingComponent from 'react-star-rating-component';
import moment from 'moment'

import localizations from '../Localizations'
import { colors, fonts, metrics } from '../../theme'

let styles

class Feedbacks extends PureComponent {

    render() {
        return (
            this.props.user && this.props.user.feedbacks && this.props.user.feedbacks.count > 0 ?
            <div style={styles.container}>
                <h2 style={styles.title}>{localizations.profileView_feedbacks}</h2>
                <div style={styles.globalRating}>
                    <span style={styles.globalRatingTitle}>{localizations.profileView_globalRating} :</span>
                    <StarRatingComponent
                        name="rating"
                        starCount={5}
                        editing={false}
                        value={this.props.user.feedbacks.averageRating}
                        renderStarIcon={this.renderStarIcon}
                    />
                </div>
                {this.props.user.feedbacks.feedbacksList.edges.map((feedback, index) => (
                    <div key={index} style={index >= 1 ? styles.commentLinedRow : styles.commentRow}>
                        <div style={{...styles.commentAuthorAvatar, backgroundImage: feedback.node.author.avatar ? 'url('+ feedback.node.author.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
                        <div style={styles.commentDetails}>
                            <span>
                                <span style={styles.commentAuthorPseudo}>{feedback.node.author.pseudo+': '}</span>
                                {feedback.node.text}
                            </span>
                            <div style={styles.commentDate}>
                                {moment(feedback.node.createdAt).fromNow()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            : null
        );
    }
}

styles = {
    container: {
        marginTop: 35,
        fontSize: 18,
        marginBottom: 25
    },
    title: {
        fontSize: 32,
        fontWeight: 500,
        marginBottom: 15,
    },
    globalRating: {
        display: 'flex',
    },
    globalRatingTitle:{
        marginRight: 15,
    },
    commentRow: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 15,
        maxWidth: 400
    },
    commentLinedRow: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        maxWidth: 400,
        borderTop: '1px solid #ddd'
    },
    commentDetails: {
        display: 'flex',
        flexDirection: 'column',
        fontSize: 16,
        lineHeight: '20px'
    },
    commentAuthorAvatar: {
        width: 45,
        height: 45,
        borderRadius: '50%',
        marginRight: 15,
        backgroundPosition: '50% 50%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    },
    commentAuthorPseudo:{
        fontWeight: 'bold'
    },
    commentDate:{
        fontStyle: 'italic',
    }
}

export default createFragmentContainer(Radium(Feedbacks), {
  user: graphql`
    fragment Feedbacks_user on User {
      feedbacks {
          count,
          averageRating,
          feedbacksList(first: 5){
              edges {
                  node {
                      id,
                      text,
                      rating,
                      createdAt,
                      author{
                          id,
                          pseudo,
                          avatar
                      }
                  }
              }
          }
      }
    }
  `
});
