import React, { Component } from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'

import Footer from '../Footer/Footer.js'
import Loading from '../Loading/Loading.js'
import colors from '../../../theme/colors'

let styles;

class LoadUrl extends Component {

  render() {
    const { viewer } = this.props

    return (
      <div style={styles.container}>
        {<Loading />}
      </div>

    );
  }
}

styles = {
    container: {
    }
}

export default createFragmentContainer(Radium(LoadUrl), {
  viewer: graphql`
    fragment LoadUrl_viewer on Viewer {
      me {
          id
      }
    }
  `
});