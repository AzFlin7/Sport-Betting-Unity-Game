import React from 'react'
import { render } from 'react-dom';
import Modal from 'react-modal'
import { fonts, colors } from '../../../theme'
import Radium, {StyleRoot} from 'radium'

import localizations from '../../Localizations'
import InputText from "./InputText";

let styles, modalStyles, cantCloseModalStyles;

class FilterModal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          isLoading: false
      }
    }

    // componentDidMount() {
    //     window.addEventListener('click', this._handleClickOutside);
    // }
    //
    //
    // componentWillUnmount() {
    //     window.removeEventListener('click', this._handleClickOutside);
    // }

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
        this.props.toggleModal()
    }

    render() {
        return (
          <Modal
            isOpen={this.props.isOpen}
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
              <InputText
                value={this.props.name ? this.props.name : ''}
                onChange={this.props.updateName} />
              <div style={styles.buttonRow}>
                {this.props.cancelLabel && !this.state.isLoading &&
                <button onClick={() => {this.setState({isLoading: true}); this.props.onCancel() ; setTimeout(() => {this._closeModal()},200)}} style={styles.redButton}>{this.props.cancelLabel}</button>
                }
                {!this.state.isLoading &&
                <button onClick={() => {this.setState({isLoading: true}); this.props.onConfirm(); setTimeout(() => {this._closeModal()},2000)}} style={styles.greenButton}>{this.props.confirmLabel}</button>
                }
              </div>
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
    overflow                   : 'auto',
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
    overflow                   : 'auto',
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
        '@media (maxWidth: 500px)': {
            display: 'block',
        }
    },
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: 400,
        '@media (maxWidth: 400px)': {
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
        justifyContent: 'space-between'
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
        marginTop:20,
        marginBottom: 10,
    },
};

export default Radium(FilterModal);

// export function filterModal(properties) {
//     document.body.children[0].classList.add('react-confirm-alert-blur');
//     const divTarget = document.createElement('div');
//     divTarget.id = 'react-confirm-alert';
//     document.body.appendChild(divTarget);
//     render(<FilterModal {...properties} isOpen={true} />, divTarget);
// }