import React from 'react'
import { render } from 'react-dom';
import Modal from 'react-modal'
import { fonts, colors } from '../../theme'
import Radium, {StyleRoot} from 'radium'

import localizations from '../Localizations'

let styles, modalStyles, cantCloseModalStyles;

class NewFilterModal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          open: false,
          isLoading: false
      }
    }


    _handleCloseRequest = () => {
            this._closeModal()
    }

    _closeModal = () => {
        this.props.onClose();
    }

    render() {
      
      return (
        <StyleRoot>
          <Modal
            isOpen={this.props.open}
            onRequestClose={this._handleCloseRequest}
            style={modalStyles}
            contentLabel={localizations.filter_title}
          >
            <div style={styles.modalContent} ref={node => { this._containerNode = node; }}>
              <div style={styles.modalHeader}>
                <div style={styles.modalTitle}>{localizations.filter_title}</div>
                <div style={styles.modalClose} onClick={this._handleCloseRequest}>
                  <i className="fa fa-times fa-2x" />
                </div>
              </div>
              <div style={styles.subTitle}>{localizations.filter_subTitle}</div>
              <ol type='1' style={{marginLeft: 20, listStyle: 'decimal'}}>
                <li style={styles.confirm}>{localizations.filter_text1}</li>
                <li style={styles.confirm}>{localizations.filter_text2}</li>
                <li style={styles.confirm}>{localizations.filter_text3}</li>
              </ol>
              <div style={styles.buttonRow}>
	              {!this.state.isLoading &&
                <button onClick={() => {this.props.onConfirm(); setTimeout(() => {this._closeModal()},200)}} style={styles.greenButton}>
                  <i
                    className='fa fa-check'
                    style={{marginRight: 5}}
                  />
                  {localizations.filter_valid}
                </button>
	              }
                {!this.state.isLoading &&
                <button onClick={() => {this.props.onCancel() ; setTimeout(() => {this._closeModal()},200)}} style={styles.redButton}>
	                <i
		                className='fa fa-times'
		                style={{marginRight: 5}}
	                />
                  {localizations.filter_cancel}
                </button>
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
	subTitle: {
	  fontSize: fonts.size.small,
    fontFamily: 'lato',
    marginTop: 5,
    color: '#0004'
  },
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
        fontWeight: fonts.weight.large,
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
      maarginLeft: 20,
        marginBottom: 10,
    },
};

export default Radium(NewFilterModal);