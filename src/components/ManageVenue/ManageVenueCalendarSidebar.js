import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import NewTimeSlot from './ManageVenueNewTimeSlot'


let styles

class CalendarSidebar extends React.Component {
  render() {
    return (
      <section style={styles.container}>
        <NewTimeSlot
          viewer={this.props.viewer}
          {...this.props}
          onRefresh={this._refresh}
        />
      </section>
    )
  }
}

styles = {
  container: {
    width: 220,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 20,
    marginRight: 20,
  },
}

export default createFragmentContainer(CalendarSidebar, {
  viewer: graphql`
    fragment ManageVenueCalendarSidebar_viewer on Viewer {
      ...ManageVenueNewTimeSlot_viewer
    }
  `,
});