import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import Modal from 'react-modal'
import { withAlert } from 'react-alert'

import InputText from '../InputText'
import {styles, modalStyles} from './style'
import localizations from '../../Localizations'
//import UpdateAskedInformationMutation from './UpdateAskedInformationMutation.js'
import MembersDetailledInformation from './MembersDetailledInformation.js';
import {confirmModal} from '../../common/ConfirmationModal'

const backendTypeList = [null, "TEXT", "NUMBER", "BOOLEAN"]

class MembersInformation extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        
        const { viewer, rows, columns, user } = this.props;

        return (
            <div style={styles.container}>
                <div style={styles.buttonRow}>
                    <div style={styles.buttonLabel} onClick={this.props.onLeave}>
                        {localizations.back}
                    </div>
                </div>

                <MembersDetailledInformation
                    viewer={viewer}
                    rows={rows}
                    user={user}
                    columns={columns}
                />
            </div>
        )
    }
}

export default createFragmentContainer(Radium(withAlert(MembersInformation)), {
  viewer: graphql`
    fragment MembersInformation_viewer on Viewer {
      id
      ...MembersDetailledInformation_viewer
    }
  `
});
