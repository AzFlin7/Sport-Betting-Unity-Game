import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';

import localizations from '../Localizations'
import styles from './Styles'

class CirclePaymentReference extends React.Component {
	constructor(props) {
        super(props)		
    }

    componentDidMount = () => {
        if (this.props.circleId) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                query: true,
                circleId: this.props.circleId
            }))
        }
    }

    render() {
        const {viewer} = this.props;

        return (
            <span style={styles.refContainer}>
                {viewer.circlePersonalReference 
                ?   localizations.circle_member_reference_number + ': ' + viewer.circlePersonalReference
                :   null}
            </span>
        )
	}
}

export default createRefetchContainer(CirclePaymentReference, {
//OK
    viewer: graphql`
        fragment CirclePaymentReference_viewer on Viewer @argumentDefinitions (
            circleId: {type: "String!", defaultValue: "_"}
            query: {type: "Boolean!", defaultValue: false}
        ){
            id
            circlePersonalReference(circleId: $circleId) @include(if: $query)
        }`
},
    graphql`
        query CirclePaymentReferenceRefetchQuery(
            $circleId: String!
            $query: Boolean!
        ) {
            viewer {
                ...CirclePaymentReference_viewer @arguments(
                    circleId: $circleId
                    query: $query
                )
            }
        }
    `,
);
				