import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import Loading from 'react-loading';

import localizations from '../../Localizations'
import { colors, fonts } from '../../../theme'
import Sportunity from '../../common/Sportunity/Sportunity';
import { Link } from 'found';

let styles;

class ActivitiesTab extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        if (this.props.circle) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                querySportunities: true,
            }), 
            null,
            () => {
                setTimeout(() => this.setState({ isLoading: false }), 50);
            }
            )
        }
        else {
            this.setState({ isLoading: false })
        }
    }

    render() {
        const { viewer, isCurrentUserTheOwner, user, circle } = this.props;

        return (
            <div style={styles.container}>
                <div style={styles.title}>
                    {localizations.circle_title_activities}
                </div>
                {this.state.isLoading && 
                    <div style={styles.loadingContainer}><Loading type='spinningBubbles' color={colors.blue} /></div>
                }
                {circle.activitiesCircleSportunities && circle.activitiesCircleSportunities.edges && circle.activitiesCircleSportunities.edges.length > 0 
                ?   <div style={styles.events}>
                        {circle.activitiesCircleSportunities.edges.map((edge, index) => 
                            <div style={styles.sportunityContainer} key={index}>
                                <Sportunity
                                    sportunity={edge.node}
                                    key={edge.node.id}
                                    staticDisplay={true}
                                    userId={user ? user.id : null}
                                    viewer={viewer}
                                />
                            </div>
                        )}
                    </div>
                :   !this.state.isLoading && <div style={styles.noActivity}>
                        {localizations.circle_no_sportunities}
                        {isCurrentUserTheOwner &&
                          <Link to='/new-sportunity' style={{textDecoration: 'none', color: colors.blue}}>
                            {localizations.circle_no_sportunities_link}
                          </Link>
                        }
                    </div>
                }
            </div>
        )
    }
}

styles = {
    container: {

    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 22,
        fontFamily: 'Lato',
        color: colors.darkGray,
        margin: '25px 0px'
    },
    noActivity: {
        fontSize: 18,
        fontFamily: 'Lato',
        color: colors.darkGray,
        marginTop: 30,
        marginLeft: 10
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    },
    events: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    sportunityContainer: {
        width: '50%',
        paddingRight: '10px',
        '@media (max-width: 850px)': {
          width: '100%',
        },
    },
}

export default createRefetchContainer(Radium(ActivitiesTab), {
//OK
    circle: graphql`
        fragment Activities_circle on Circle @argumentDefinitions(
            querySportunities: {type: "Boolean!", defaultValue: false}
        ){
            id
            activitiesCircleSportunities: sportunities @include (if: $querySportunities) {
                edges {
                    node {
                        id
                        ...Sportunity_sportunity
                    }
                }
            }
        }
    `,
    viewer: graphql`
        fragment Activities_viewer on Viewer {
            id
            ...Sportunity_viewer
        }
    `,
    user: graphql`
        fragment Activities_user on User {
            id
        }
    `
},
graphql`
    query ActivitiesRefetchQuery(
    $querySportunities: Boolean!
    ) {
        viewer{
            ...Activities_viewer
            circle {
                ...Activities_circle
                @arguments(
                    querySportunities: $querySportunities
                )
            }
        }
    }
`,
);
