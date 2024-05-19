import React, { Component } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';
import Sportunity from '../common/Sportunity/Sportunity';
import Loading from '../common/Loading/Loading';

export default class EmbedUserEvents extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EmbedUserEventsQuery($id: String!) {
            viewer {
              sportunities(userId: $id, last: 10, filter: {status: Organized}) {
                edges {
                  node {
                    id
                    ...Sportunity_sportunity
                  }
                }
              }
            }
          }
        `}
        variables={{
          id: this.props.routeParams.userId,
        }}
        render={({ error, props }) => {
          if (error) {
            return <div>{error.message}</div>;
          } 
          else if (props) {
            const list = props.viewer.sportunities.edges.map(i => (
              <Sportunity key={i.node.id} sportunity={i.node} target="_blank" />
            ));
            return <div>{list}</div>;
          }
          return <Loading />;
        }}
      />
    );
  }
}
