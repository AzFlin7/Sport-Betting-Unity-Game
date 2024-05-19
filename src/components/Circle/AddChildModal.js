import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { colors, fonts } from '../../theme'
import Modal from 'react-modal'
import InputText from './InputText'
import Submit from './SubmitAddChild'
import Switch from '../common/Switch';
import InputUserAutoCompleted from '../common/Inputs/InputUserAutocompleted';
import localizations from '../Localizations'

let styles
let modalStyles

class AddMemberModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    _handleInputChange = event => {
        if(this.props.value !== event.target.value) {
            this.props.onChange(event.target.value)
        }
    }

    _handleParent1InputChange = value => {
        this.props.onParent1Change(value)
    }

    _handleParent2InputChange = value => {
        this.props.onParent2Change(value)
    }

    render() {
        const { me, closeModal } = this.props;

        return(
            <Modal
                isOpen={this.props.modalIsOpen}
                onRequestClose={closeModal}
                style={modalStyles}
                contentLabel={localizations.circle_addMemberChild}
            >
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <div style={styles.modalTitle}>{localizations.circle_addMemberChild}</div>
                        <div style={styles.modalClose} onClick={closeModal}>
                            <i className="fa fa-times fa-2x" />
                        </div>
                    </div>
                    <div style={{marginBottom: 10}}>
                        <InputUserAutoCompleted 
                            viewer={this.props.viewer}
                            handleAutocompleteClicked={this._handleParent1InputChange}
                            label={localizations.circle_addChildParent1Email}
                            userType={'PERSON'}
                            parentsOnly={true}
                        />
                    </div>
                    <div style={{marginBottom: 10}}>
                        <InputUserAutoCompleted 
                            viewer={this.props.viewer}
                            handleAutocompleteClicked={this._handleParent2InputChange}
                            label={localizations.circle_addChildParent2Email}
                            userType={'PERSON'}
                            parentsOnly={true}
                        />
                    </div>
                    
                    <div style={{position:'relative'}}>
                        <InputText 
                            label={localizations.circle_addChildPseudo}
                            value={this.props.user && this.props.user}
                            placeholder={localizations.circle_addChildPlaceholder}
                            onChange={this._handleInputChange} 
                        />
                    </div>

                    {this.props.isError && 
                        <div style={styles.error}>
                            {localizations.event_fill_statistics_wrong_format}
                        </div>
                    }

                    <Submit  
                        onClose={closeModal} 
                        buttonLabel={localizations.circle_add}
                        {...this.props}
                        viewer={this.props.viewer}
                    />
                </div>
            </Modal>
        )
    }
}

modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    zIndex: 201
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'visible',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

styles = {
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: 400,
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: 'Lato',
    fontSize:24,
    fontWeight: fonts.weight.medium,
    color: colors.blue,
    marginBottom: 20,
    flex: '2 0 0',
  }, 
  modalClose: {
    justifyContent: 'flex-center',
    paddingTop: 10,
    color: colors.gray,
    cursor: 'pointer',
  },
  error: {
    color: colors.red, 
    fontSize: 16, 
    fontFamily: 'Lato',
    marginBottom: 10
  }
}

export default createFragmentContainer(AddMemberModal, {
  viewer: graphql`
    fragment AddChildModal_viewer on Viewer {
      ...SubmitAddChild_viewer
      ...InputUserAutocompleted_viewer
      me {
        id
      }
    }
  `,
});