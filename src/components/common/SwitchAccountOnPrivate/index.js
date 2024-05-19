import React from 'react'
import { render } from 'react-dom';
import Modal from 'react-modal'
import { fonts, colors } from '../../../theme'
import Radium, {StyleRoot} from 'radium'

import localizations from '../../Localizations'

let styles, modalStyles, cantCloseModalStyles;

class ChooseAccountModal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          open: false
      }
    }

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);
        if (this.props.isOpen)
            setTimeout(() => {this.setState({open: true})}, 50) 
    }

    _closeModal = () => {
        this.props.onClose();
        setTimeout(() => {
            this.setState({ open: false });
        },400)        
    }

    switchAccount = (account) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', account.id)
        setTimeout(() => {
          window.location.reload()
        }, 200)
    }

    render() {
      
        return (
            <StyleRoot>
                <div ref={node => { this._containerNode = node; }}>
                    <Modal
                        isOpen={this.state.open}
                        onRequestClose={this._handleCloseRequest}
                        style={this.props.canCloseModal ? modalStyles : cantCloseModalStyles}
                        contentLabel={this.props.title}
                    >
                        <div style={styles.modalContent}>
                            <div style={styles.modalHeader}>
                                <div style={styles.modalTitle}>
                                    {this.props.title}
                                </div>
                                <div style={styles.modalClose} onClick={this._closeModal}>
                                    <i className="fa fa-times fa-2x" />
                                </div>
                            </div>
                            <span style={styles.confirm}>{this.props.message}</span>
                            {this.props.accounts.map((account, index) => (
                                <div key={index} onClick={() => this.switchAccount(account)} style={styles.accountLine}>
                                    <div style={{ ...styles.accountAvatar, backgroundImage: `url(${account.avatar})` }} />
                                    <span style={styles.accountPseudo}>{account.pseudo}</span>
                                </div>
                            ))}
                            {this.props.cancelLabel &&
                                <button onClick={this._closeModal} style={styles.redButton}>{this.props.cancelLabel}</button>
                            }   
                        </div>
                    
                    </Modal>
                </div>
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
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
    overflowY: 'visible',
    maxHeight: 500
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
    confirm: {
        color: colors.black,
        fontSize: 16,
        fontFamily: 'Lato',
        marginTop:20,
        marginBottom: 10,
    },
    accountLine: {
        display: 'flex',
        flexDirection: 'row',
        padding: '5px 10px',
        alignItems: 'center',
        cursor: 'pointer'
    },
    accountAvatar: {
        width: 39,
        height: 39,
        marginRight: 10,
        color: colors.blue,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '50%',
    },
    accountPseudo: {
        fontSize: 16,
        color: colors.blue,
        fontFamily: 'Lato',
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
};

export default Radium(ChooseAccountModal);

export function displayChooseAccountModal(properties) {
    document.body.children[0].classList.add('react-confirm-alert-blur');
    const divTarget = document.createElement('div');
    divTarget.id = 'react-confirm-alert';
    document.body.appendChild(divTarget);
    render(<ChooseAccountModal {...properties} isOpen={true} />, divTarget);
}