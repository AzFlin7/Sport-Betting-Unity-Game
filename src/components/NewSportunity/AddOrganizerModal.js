import React from 'react';
import Relay from 'react-relay';
import Radium, {StyleRoot} from 'radium'
import { colors, fonts } from '../../theme';
import Modal from 'react-modal'

import Input from './Input';
import localizations from '../Localizations'

let styles, modalStyles, cantCloseModalStyles;

class AddOrganizerModal extends React.Component {

    _handleClickOutside = event => {
        if (!this._containerNode.contains(event.target)) {
            this._closeModal()
        }
    }   

    _closeModal = () => {
        this.props.closeModal()
    }

    render() {
        return (
            <StyleRoot>
                <div ref={node => { this._containerNode = node; }}>
                    <Modal
                        isOpen={this.props.isOpen}
                        onRequestClose={this._closeModal}
                        style={modalStyles}
                        contentLabel={localizations.newSportunity_addOrganizersModal}
                    >
                        <div style={styles.modalContent}>
                            <div style={styles.modalHeader}>
                                <div style={styles.modalTitle}>{localizations.newSportunity_addOrganizersModal}</div>
                                <div style={styles.modalClose} onClick={this._closeModal}>
                                <i className="fa fa-times fa-2x" />
                                </div>
                            </div>

                            <div style={styles.buttons}>
                                {/*<div style={styles.squaredButtonContainer} key="square1" onClick={() => this.props.chooseModal(1)}>
                                    <i style={styles.icon} className="fa fa-search" aria-hidden="true" />
                                    <span style={styles.buttonLabel}>
                                        {localizations.newSportunity_organizerFind}
                                    </span>
                                </div>*/}

                                <div style={styles.squaredButtonContainer} key="square2" onClick={() => this.props.chooseModal(2)}>
                                    <i style={styles.icon} className="fa fa-search" aria-hidden="true" />
                                    <span style={styles.buttonLabel}>
                                        {localizations.newSportunity_organizerSelect}
                                    </span>
                                </div>
                                
                                <div style={styles.squaredButtonContainer} key="square3" onClick={() => this.props.chooseModal(3)}>
                                    <i style={styles.icon} className="fa fa-users" aria-hidden="true" />
                                    <span style={styles.buttonLabel}>
                                        {localizations.newSportunity_organizerSelectCommunity}
                                    </span>
                                </div>

                                <div style={styles.squaredButtonContainer} key="square4" onClick={() => this.props.chooseModal(4)}>
                                    <img width="70px" src="/images/icon_circle@3x.png"/>
                                    <span style={styles.buttonLabel}>
                                        {localizations.newSportunity_organizerSelectCircles}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Modal>
                </div>
            </StyleRoot>
        );
    }
}

styles = {
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: 600,
        '@media (max-width: 400px)': {
            width: '96%',
        }
    },
    modalHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-center',
        justifyContent: 'space-between',
        marginBottom: 10
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
        color: colors.redGoogle,
        cursor: 'pointer',
        position: 'absolute',
        right: 15,
        top: 10
    },
    buttons: {
        display: 'flex',
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        '@media (max-width: 400px)': {
            flexDirection: 'column',
        }
    },
    squaredButtonContainer: {
        width: 150,
        height: 150,
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '10px 10px',
        borderRadius: 2,
        color: colors.blue,
        cursor: 'pointer',
        ':hover': {
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.25)',
        },
        '@media (max-width: 400px)': {
            marginTop: 15
        }
    },
    icon: {
        fontSize: 60
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: '300',
        fontFamily: 'Lato',
        textAlign: 'center'
    }
};

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
        border                     : '1px solid '+colors.blue,
        background                 : '#fff',
        overflow                   : 'auto',
        WebkitOverflowScrolling    : 'touch',
        borderRadius               : '4px',
        outline                    : 'none',
        padding                    : '20px 35px',
        boxShadow                  : '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        '@media (max-width: 400px)': {
            padding: '30px 15px'
        }
    },
}


export default Radium(AddOrganizerModal);