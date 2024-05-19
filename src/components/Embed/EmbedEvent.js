import React, { Component } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';
import Sportunity from '../common/Sportunity/Sportunity';
import Loading from '../common/Loading/Loading';

export default class EmbedEvent extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EmbedEventQuery($id: ID!) {
            viewer {
              sportunity(id: $id) {
                ...Sportunity_sportunity
              }
            }
          }
        `}
        variables={{
          id: this.props.routeParams.eventId,
        }}
        render={({ error, props }) => {
          if (error) {
            return <div>{error.message}</div>;
          } else if (props) {
            return <Sportunity sportunity={props.viewer.sportunity} target="_blank" />;
          }
          return <Loading />;
        }}
      />
    );
  }
}
