import React, { Component } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';
import MyCircle from '../MyCircles/MyCirclesCircleItem';
import Loading from '../common/Loading/Loading';

export default class EmbedCircle extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EmbedCircleQuery($id: ID!) {
            viewer {
              circle(id: $id) {
                id
                ...MyCirclesCircleItem_circle
              }
            }
          }
        `}
        variables={{
          id: this.props.routeParams.circleId,
        }}
        render={({ error, props }) => {
          if (error) {
            return <div>{error.message}</div>;
          } else if (props) {
            return (
              <MyCircle
                viewer={props.viewer}
                link={`/circle/${props.viewer.circle.id}`}
                target="_blank"
                circle={props.viewer.circle}
                circleIsMine={true}
              />
            );
          }
          return <Loading />;
        }}
      />
    );
  }
}
