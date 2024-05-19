import React from 'react';
import PureComponent from '../common/PureComponent';
import Radium from 'radium';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';
import Sportunity from '../common/Sportunity/Sportunity';
import NoResult from './NoResult';
import { colors } from '../../theme';
import localizations from '../Localizations';

let styles;

class Events extends PureComponent {
  render() {
    const { viewer } = this.props;

    const hasNextPage = this.props.sportunities
      ? this.props.sportunities.pageInfo.hasNextPage
      : false;

    let sportunities = this.props.sportunities
      ? this.props.selectedLevels.length === 0
        ? this.props.sportunities.edges
        : this.props.sportunities.edges
            .map(event => {
              if (event.node.sport.allLevelSelected) {
                return event;
              }
              const matched = event.node.sport.levels.filter(
                level =>
                  this.props.selectedLevels.findIndex(
                    e =>
                      e[localizations.getLanguage().toUpperCase()]
                        .skillLevel ===
                      level[localizations.getLanguage().toUpperCase()]
                        .skillLevel,
                  ) >= 0,
              );
              if (matched.length > 0) return event;
              return false;
            })
            .filter(i => Boolean(i))
      : [];
console.log(sportunities.length > 0);
    return (
      <div style={styles.container}>
        {sportunities.length > 0 ? (
          sportunities.map(edge => (
            <div key={edge.node.id} style={styles.itemContainer}>
              <Sportunity
                key={edge.node.id}
                sportunity={edge.node}
                {...this.props}
              />
            </div>
          ))
        ) : (
          <NoResult viewer={viewer} />
        )}
        {this.props.queryIsLoading ? (
          <div style={styles.loadingSpinner}>
            <ReactLoading type="cylon" color={colors.blue} />
          </div>
        ) : (
          hasNextPage && (
            <div style={styles.loadMore} onClick={this.props.onLoadMore}>
              {localizations.find_loadSportunities}
            </div>
          )
        )}
      </div>
    );
  }
}

styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 25,
    height: '100%',
    flexDirection: 'row',
    alignContent: 'flex-start',
    minHeight: 600,
    width: '100%',

    '@media (maxWidth: 767px)': {
      padding: '25px 5px',
      minHeight: '100%',
    },
  },
  itemContainer: {
    width: '98%',
    marginRight: '2%',
    marginTop: 0,
    '@media (maxWidth: 650px)': {
      width: '100%',
    },
  },
  loadMore: {
    width: '100%',
    fontFamily: 'Lato',
    fontSize: 16,
    color: colors.blue,
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
    cursor: 'pointer',
  },
  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
};

const stateToProps = state => ({
  sportId: state.sportunitySearchReducer.sportId,
  sportName: state.sportunitySearchReducer.sportName,
  locationName: state.sportunitySearchReducer.locationName,
  locationLat: state.sportunitySearchReducer.locationLat,
  locationLng: state.sportunitySearchReducer.locationLng,
});

const ReduxContainer = connect(stateToProps)(Radium(Events));

export default createFragmentContainer(Radium(ReduxContainer), {
  viewer: graphql`
    fragment Events_viewer on Viewer {
      me {
        id
        profileType
      }
      ...Sportunity_viewer
    }
  `,
  sportunities: graphql`
    fragment Events_sportunities on SportunityConnection {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          ...Sportunity_sportunity
          id
          title
          beginning_date
          ending_date
          sport {
            sport {
              name {
                EN
                FR
                DE
              }
              logo
              levels {
                EN {
                  name
                  skillLevel
                }
                FR {
                  name
                  skillLevel
                }
                DE {
                  name
                  skillLevel
                }
              }
            }
            allLevelSelected
            levels {
              id
              EN {
                name
                skillLevel
              }
              FR {
                name
                skillLevel
              }
              DE {
                name
                skillLevel
              }
            }
          }
          venue {
            name
          }
          address {
            address
            city
            country
            position {
              lat
              lng
            }
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
          status
        }
      }
    }
  `,
});
