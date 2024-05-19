import React, { Component } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';
import MyCircle from '../MyCircles/MyCirclesCircleItem';
import Loading from '../common/Loading/Loading';

export default class EmbedUserCircles extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EmbedUserCirclesQuery($id: String!) {
            viewer {
              user(id: $id) {
                id
                circles {
                  edges {
                    node {
                      id
                      ...MyCirclesCircleItem_circle
                    }
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
          } else if (props) {
            const list = props.viewer.user.circles.edges.map(i => (
              <MyCircle
                key={i.node.id}
                viewer={props.viewer}
                link={`/circle/${i.node.id}`}
                target="_blank"
                circle={i.node}
                circleIsMine={true}
              />
            ));
            return <div>{list}</div>;
          }
          return <Loading />;
        }}
      />
    );
  }
}
