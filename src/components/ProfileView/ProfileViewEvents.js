import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import localizations from '../Localizations'
import Sportunity from '../common/Sportunity/Sportunity';
import ReactLoading from 'react-loading';
import { colors } from '../../theme';

let styles;

class Events extends PureComponent {
  render() {
    const {
      sportunities,
      title,
      user,
      shouldQueryUserStatus,
      loadMoreQueryIsLoading
    } = this.props;

    const hasNextPage = sportunities ? sportunities.pageInfo.hasNextPage	: false;

    return(
          sportunities && sportunities.edges && sportunities.edges.length > 0 &&
            <div>
            <h2 style={styles.title}>{title}{this.props.user.pseudo}</h2>
            <div style={styles.events}>
              {
                sportunities && sportunities.edges && sportunities.edges.length > 0
                ? sportunities.edges.map((edge,index) => {
                    return (
                      edge.node.title ?
                        <div style={styles.sportunityContainer} key={index}>
                          <Sportunity
                            sportunity={edge.node}
                            key={edge.node.id}
                            staticDisplay={true}
                            userId={shouldQueryUserStatus ? user.id : null}
                            viewer={this.props.viewer}
                          />
                        </div>
                      : null
                    )}
                  )
                : <p style={styles.description}>{this.props.user.pseudo} {localizations.profileView_no_sportunity}</p>
              }
              {loadMoreQueryIsLoading
                ? <div style={styles.loadingSpinner}>
                    <ReactLoading type='cylon' color={colors.blue} />
                  </div>
                : hasNextPage &&
                  <div style={styles.loadMore} onClick={this.props.onLoadMore}>{localizations.find_loadSportunities}</div>
              }
            </div>
          </div>
    )
  }
}

styles = {
  sportunityContainer: {
    width: '50%',
    paddingRight: '10px',
    '@media (maxWidth: 850px)': {
      width: '100%',
    },
  },
  events: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
	title: {
    fontSize: 32,
    fontWeight: 500,
    marginBottom: 30,
  },
  description: {
    fontSize: 18,
    lineHeight: 1.2,
    marginBottom: 40,
  },
  loadingSpinner:{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  loadMore: {
		width: '100%',
		fontFamily: 'Lato',
		fontSize: 16,
		color: colors.blue,
		display: 'flex',
		justifyContent: 'center',
		marginTop: 10,
		marginBottom: 30,
		cursor: 'pointer',
	},
};

export default createFragmentContainer(Radium(Events), {
  viewer: graphql`
    fragment ProfileViewEvents_viewer on Viewer {
      ...Sportunity_viewer,
    }
  `,
  sportunities: graphql`
    fragment ProfileViewEvents_sportunities on SportunityConnection {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          ...Sportunity_sportunity,
          id
          title
          beginning_date
          ending_date
          venue {
            name
          }
          participants {
            id
          }
          price {
            currency
            cents
          }
          mode
          kind
        }
      }
    }
  `,
});
