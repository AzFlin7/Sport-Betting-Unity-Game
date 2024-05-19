import React from 'react'
import { render } from 'react-dom';
import Modal from 'react-modal'
import { fonts, colors } from '../../theme'
import Radium, {StyleRoot} from 'radium'

import localizations from '../Localizations'
import OrganizerSelect from "./OrganizerSelect";

let styles, modalStyles, cantCloseModalStyles;

class RemoveSecondarOrganizerModal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          open: false,
          isLoading: false,
          selectedOrganizer: null
      }
    }

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);
        if (this.props.isOpen)
            setTimeout(() => {this.setState({open: true})}, 50) 
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
    }

    selectOrganizer = (item) => {
      this.setState({selectedOrganizer: item})
    }

    render() {
      let organiazerList = [];

      this.props.organizers.forEach(organizer => {
          organiazerList.push(organizer)
      })

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
                            <OrganizerSelect
                              list={organiazerList}
                              onSelectItem={this.selectOrganizer}
                              selectedItem={this.state.selectedOrganizer}
                            />
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

cantCloseModalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.9)',
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

export default Radium(RemoveSecondarOrganizerModal);

export function removeOrganizerModal(properties) {
    document.body.children[0].classList.add('react-confirm-alert-blur');
    const divTarget = document.createElement('div');
    divTarget.id = 'react-confirm-alert';
    document.body.appendChild(divTarget);
    render(<RemoveSecondarOrganizerModal {...properties} isOpen={true} />, divTarget);
}