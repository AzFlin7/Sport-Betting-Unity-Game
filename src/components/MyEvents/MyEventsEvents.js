import React from 'react'
import PureComponent, { pure } from '../common/PureComponent'
import { fonts } from '../../theme'
import Radium from 'radium'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { connect } from 'react-redux'
import ReactLoading from 'react-loading';

import { colors } from '../../theme';
import NoResult from './NoResult';
import Sportunity from '../common/Sportunity/Sportunity'
import localizations from '../Localizations'

let styles

class Events extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      loadedSportunities: 0
    }
  }

  increaseLoadedSportunities = () => {
    this.setState({loadedSportunities: this.state.loadedSportunities + 1})
  }

  render() {
    const { sportunities,
      filter,
      queryIsLoading,
      loadMoreQueryIsLoading,
      viewer,
     } = this.props

    const hasNextPage = sportunities? sportunities.pageInfo.hasNextPage	: false

    const active = sportunities ? sportunities.edges : []

    return(
      <div style={styles.container}>
        {queryIsLoading && (active && active.length > 0) && 
         <div style={styles.loadingSpinner}>
            <ReactLoading type='cylon' color={colors.blue} />
          </div>
        }
        
        <section>
          {active && active.length > 0
          ?   active
                
                .map((edge, index) => 
                  <Sportunity 
                    key={index} 
                    sportunity={edge.node} 
                    increaseLoadedSportunities={this.increaseLoadedSportunities} 
                    checked={this.props.sportunitySelected && this.props.sportunitySelected.findIndex(selected => selected.id === edge.node.id) >= 0}
                    {...this.props}
                  />)
          :   <NoResult me={viewer.me}/>
          }

          {loadMoreQueryIsLoading
            ? <div style={styles.loadingSpinner}>
                <ReactLoading type='cylon' color={colors.blue} />
              </div>
            : hasNextPage &&
              <div style={styles.loadMore} onClick={this.props.onLoadMore}>{localizations.find_loadSportunities}</div>
          }
        </section>
        
      </div>
    )
  }
}

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 20,
    paddingRight: 6,
    width: '100%',
    flex: 1
  },
  h1: {
    fontSize: fonts.size.large,
    fontWeight: fonts.weight.xl,
    color: 'rgba(0,0,0,0.65)',
    marginBottom: 20,
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
}

const stateToProps = (state) => ({
  filter: state.myEventFilterReducer.filter,
});

const ReduxContainer = connect(
  stateToProps,
)(Events);

export default createFragmentContainer(Radium(ReduxContainer), {
  viewer: graphql`
    fragment MyEventsEvents_viewer on Viewer {
      id
      ...Sportunity_viewer
      me {
        profileType
      }
    }
  `,
  sportunities: graphql`
    fragment MyEventsEvents_sportunities on SportunityConnection {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
          status
          beginning_date
          ...Sportunity_sportunity
        }
      }
    }

  `
});
