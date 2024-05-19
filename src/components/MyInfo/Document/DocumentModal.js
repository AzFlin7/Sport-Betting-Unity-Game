import React from 'react'
import { render } from 'react-dom';
import Modal from 'react-modal'
import Radium, {StyleRoot} from 'radium'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { Provider as AlertProvider } from 'react-alert';

import AlertTemplate from '../../common/Alert';
import { fonts, colors } from '../../../theme'
import localizations from '../../Localizations'
import Document from './index';

let styles, modalStyles, cantCloseModalStyles;



const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#5EA1D9',
        contrastText: '#fff',
      },
      secondary: {
        main: '#A6A6A6',
        contrastText: '#fff',
      },
    },
    typography: { useNextVariants: true },
});

  
class DocumentModal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          open: false,
          isLoading: false
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
        if (typeof this.props.closeModal !== 'undefined')
            this.props.closeModal()
    }

    render() {
      
        return (
            <MuiThemeProvider theme={theme}>
                <AlertProvider template={AlertTemplate}>
                    <StyleRoot>
                            <Modal
                                isOpen={this.state.open}
                                onRequestClose={this._handleCloseRequest}
                                style={this.props.canCloseModal ? modalStyles : cantCloseModalStyles}
                                contentLabel={localizations.document_select}
                            >
                                <div style={styles.modalContent} ref={node => { this._containerNode = node; }}>
                                    <div style={styles.modalHeader}>
                                        <div style={styles.modalTitle}>{localizations.document_select}</div>
                                        <div style={styles.modalClose} onClick={this._handleCloseRequest}>
                                        <i className="fa fa-times fa-2x" />
                                        </div>
                                    </div>
                                    <Document
                                        allowSelection={true}
                                        handleCloseModal={this._handleCloseRequest}
                                        {...this.props}
                                    />
                                </div>
                            
                            </Modal>
                    </StyleRoot>
                </AlertProvider>
            </MuiThemeProvider>
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
        '@media (max-width: 500px)': {
            display: 'block',
        }
    },
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
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

export default Radium(DocumentModal);

export function showSelectDocumentModal(properties) {
    document.body.children[0].classList.add('react-confirm-alert-blur');
    const divTarget = document.createElement('div');
    divTarget.id = 'react-confirm-alert';
    document.body.appendChild(divTarget);
    render(<DocumentModal {...properties} isOpen={true} />, divTarget);
}