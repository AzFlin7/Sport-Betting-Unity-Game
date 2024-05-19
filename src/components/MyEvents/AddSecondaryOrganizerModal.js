import React from 'react'
import {render} from 'react-dom';
import Modal from 'react-modal'
import {colors, fonts} from '../../theme'
import Radium, {StyleRoot} from 'radium'
import Organizer from "./MyEventsOrganizer";
import AddOrganizerModal from "./AddOrganizerModal";
import FindOrganizerModal from "./MyEventsFindOrganizerModal";
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';

let styles, modalStyles, cantCloseModalStyles;

class AddSecondarOrganizerModal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          open: false,
          isLoading: false,
          selectedOrganizer: null,
	        showDropdown: false,
	        chosenModal: 0
      }
    }

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);
        if (this.props.isOpen) {
	        setTimeout(() => {
		        this.setState({open: true})
	        }, 50)
	        setTimeout(() => this.setState({showDropdown: true}), 200)
        }
    }

    componentWillReceiveProps = (nextProps) => {
      if (nextProps.isOpen !== this.state.open)
        this.setState({open: nextProps.isOpen})
    }

    componentWillUnmount() {
        window.removeEventListener('click', this._handleClickOutside);
    }

    _handleClickOutside = event => {
        if (this._containerNode && !this._containerNode.contains(event.target) && this.props.canCloseModal) {
            this._closeModal()
        }
    }

    _handleCloseRequest = () => {
        if (this.props.canCloseModal)
            this._closeModal()
    }

    _closeModal = () => {
        this.setState({ open: false });
        this.props.onClose()
    }

    _handleAddOrganizer = (assistant, sport) => {
	    let secondaryOrganizerType ;
	    if (sport) {
		    let userSport ;
		    assistant.sports.forEach(item => {
			    if (item.sport.id === sport.id)
				    userSport = item
		    });

		    if (sport.assistantTypes && sport.assistantTypes.length > 0) {
			    if (userSport && userSport.assistantType && userSport.assistantType.length > 0) {
				    secondaryOrganizerType = userSport.assistantType[0].id;
			    }
		    }
	    }
	    this.setState({
        selectedOrganizer: {
          organizer: assistant.id,
          secondaryOrganizerType,
          customSecondaryOrganizerType: null
        },
		    chosenModal: 0,
		    showDropdown: false,
	    })
    }

	_handleChooseFindModal = () => {
		this.setState({
			chosenModal: 0
		})
	}

	_handleChooseModal = (value) => {
		this.setState({
			chosenModal: value
		})
	}

	updateOrganizerRole = (value) => {
      if (this.state.selectedOrganizer)
        this.setState({selectedOrganizer: {
		        ...this.state.selectedOrganizer,
            secondaryOrganizerType: value,
          }
        })
  }

	updateOrganizerCustomRole = (value) => {
      if (this.state.selectedOrganizer)
        this.setState({selectedOrganizer: {
            ...this.state.selectedOrganizer,
		        customSecondaryOrganizerType: value,
          }
        })
  }

    render() {
        return (
            <StyleRoot>
                    <Modal
                        isOpen={this.state.open}
                        onRequestClose={this._handleCloseRequest}
                        style={this.props.canCloseModal ? modalStyles : cantCloseModalStyles}
                        contentLabel={this.props.title}
                    >
                        <div style={styles.modalContent} ref={node => { this._containerNode = node; }}>
                            <div style={styles.modalHeader}>
                                <div style={styles.modalTitle}>{this.props.title}</div>
                                <div style={styles.modalClose} onClick={this._handleCloseRequest}>
                                <i className="fa fa-times fa-2x" />
                                </div>
                            </div>
	                        {this.state.selectedOrganizer &&
			                        <Organizer
				                        organizer={this.state.selectedOrganizer}
				                        viewer={this.props.viewer}
				                        sport={this.props.sprotunities[0].sport.sport}
				                        updateRole={this.updateOrganizerRole}
				                        updateCustomRole={this.updateOrganizerCustomRole}
			                        />
	                        }
                          {this.state.showDropdown && this.state.chosenModal === 0 &&
			                        <AddOrganizerModal
				                        isOpen={true}
				                        closeModal={this._closeModal}
				                        chooseModal={this._handleChooseModal}
			                        />
	                        }
                          { this.state.chosenModal !== 0 &&
                            <FindOrganizerModal
                              viewer={this.props.viewer}
                              user={this.props.user}
                              sport={this.props.sprotunities[0].sport.sport}
                              isOpen={this.state.chosenModal !== 0}
                              openedModal={this.state.chosenModal}
                              closeModal={this._handleChooseFindModal}
                              addOrganizer={this._handleAddOrganizer}
                              isLoggedIn={true}
                            />
                          }
                            <div style={styles.buttonRow}>
                                {this.props.cancelLabel && !this.state.isLoading 
                                    ? <button onClick={() => {this.setState({isLoading: true}); this.props.onCancel && this.props.onCancel() ; this._closeModal()}} style={styles.redButton}>{this.props.cancelLabel}</button>
                                    : <span/>
                                }
                                {!this.state.isLoading && 
                                    <button onClick={() => {this.setState({isLoading: true}); this.props.onConfirm(this.state.selectedOrganizer); this._closeModal()}} style={styles.greenButton}>{this.props.confirmLabel}</button>
                                }
                            </div>
                        </div>
                    
                    </Modal>
            </StyleRoot>
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
    zIndex: 101
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

cantCloseModalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.9)',
    zIndex: 101
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
    container: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-between',
        fontFamily: 'Lato',
        lineHeight: 1,
        '@media (max-width: 500px)': {
            display: 'block',
        }
    },
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: 400,
        '@media (max-width: 400px)': {
            width: 320,
        }
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
        flex: '2 0 0',
    },
    modalClose: {
        justifyContent: 'flex-center',
        color: colors.gray,
        cursor: 'pointer',
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'space-between',
	    flexDirection: 'row-reverse'
    },
    greenButton: {
        backgroundColor: colors.green,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        borderRadius: '3px',
        display: 'inline-block',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        marginTop: 10,
        marginBottom: 10,
        cursor: 'pointer',
        lineHeight: '27px',
        padding: '10px 20px'
    },
    redButton: {
		backgroundColor: colors.redGoogle,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
        display: 'inline-block',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        marginTop: 10,
        marginBottom: 10,
        cursor: 'pointer',
        lineHeight: '27px',
        padding: '10px 20px'
    },
    confirm: {
        color: colors.black,
        fontSize: 16,
        fontFamily: 'Lato',
        marginTop:15,
        marginBottom: 10,
    },
};

export default createFragmentContainer(Radium(AddSecondarOrganizerModal), {
    viewer: graphql`
  fragment AddSecondaryOrganizerModal_viewer on Viewer {
      id
    ...MyEventsFindOrganizerModal_viewer
    ...MyEventsOrganizer_viewer
  }
`,
    user: graphql`
  fragment AddSecondaryOrganizerModal_user on User {
    pseudo
    ...MyEventsFindOrganizerModal_user
  }
`
});