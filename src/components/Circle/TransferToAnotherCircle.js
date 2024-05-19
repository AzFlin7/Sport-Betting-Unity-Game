import React from 'react'
import { render } from 'react-dom';
import Modal from 'react-modal'
import Loading from 'react-loading';
import { fonts, colors } from '../../theme'
import Radium, {StyleRoot} from 'radium'

import Switch from '../common/Switch'
import SelectCircle from '../common/Inputs/SelectCircle';
import localizations from '../Localizations'

let styles, modalStyles, cantCloseModalStyles;

class TransferModal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          isLoading: false,
          open: false,
          selectedCircle: null,
          displayCirclesFromOtherTeams: false,
          keepMembersAfterTransfer: false
      }
    }

    componentDidMount() {
        if (this.props.isOpen)
            setTimeout(() => {this.setState({open: true})}, 50) 
    }

    _handleCloseRequest = () => {
        if (this.props.canCloseModal)
            this._closeModal()
    }

    _closeModal = () => {
        this.setState({ open: false });
    }

    _handleSelectCircle = circle => {
        this.setState({
            selectedCircle: circle
        })
    }

    _handleConfirm = () => {
        if (this.state.selectedCircle) {
            this.setState({isLoading: true})
            this.props.onConfirm(this.state.selectedCircle, !this.state.keepMembersAfterTransfer);
            setTimeout(() => {this.setState({isLoading: false}); this._closeModal()},4000)
        }
    }

    render() {
        return (
            <StyleRoot>
                <div>
                    <Modal
                        isOpen={this.state.open}
                        onRequestClose={this._handleCloseRequest}
                        style={this.props.canCloseModal ? modalStyles : cantCloseModalStyles}
                        contentLabel={this.props.title}
                    >
                        <div style={styles.modalContent}>
                            <div style={styles.modalHeader}>
                                <div style={styles.modalTitle}>{this.props.title}</div>
                                <div style={styles.modalClose} onClick={this._handleCloseRequest}>
                                <i className="fa fa-times fa-2x" />
                                </div>
                            </div>
                            
                            {!this.state.keepMembersAfterTransfer && 
                                <span style={styles.confirm}>{this.props.message}</span>
                            }

                            <div style={{...styles.buttonRow, marginTop: 15}}>
                                <label style={styles.label}>
                                    {this.state.keepMembersAfterTransfer ? localizations.circle_transfer_copy_paste : localizations.circle_transfer_cut}
                                </label>
                                <Switch 
                                    checked={this.state.keepMembersAfterTransfer}
                                    onChange={e => this.setState({keepMembersAfterTransfer: e})}
                                />
                            </div>

                            {this.props.circlesFromClub && this.props.circlesFromClub.length > 0 && this.props.profileType === 'ORGANIZATION' &&
                                <div style={styles.buttonRow}>
                                    <label style={styles.label}>
                                        {localizations.circle_transferMembers_otherTeam}
                                    </label>
                                    <Switch 
                                        checked={this.state.displayCirclesFromOtherTeams}
                                        onChange={e => this.setState({displayCirclesFromOtherTeams: e, selectedCircle: null})}
                                    />
                                </div>
                            }

                            <SelectCircle
                                label={localizations.circle_select}
                                list={this.state.displayCirclesFromOtherTeams 
                                    ? this.props.circlesFromClub.map(e => ({...e, name: e.name + ' ' + localizations.circle_owner + ' ' + e.owner.pseudo}))
                                    : this.props.circleList}
                                value={this.state.selectedCircle}
                                onChange={this._handleSelectCircle}
                                placeholder={localizations.circle_select}
                                term={this.state.selectedCircle
                                    ? this.state.selectedCircle.name
                                    : localizations.circle_select} 
                            />

                            {this.state.isLoading
                            ?   <div style={styles.loadingContainer}><Loading type='cylon' color={colors.blue}/></div>
                            :
                                <div style={styles.buttonRow}>
                                    {this.props.cancelLabel 
                                        ? <button onClick={this._handleCloseRequest} style={styles.redButton}>{this.props.cancelLabel}</button>
                                        : <span></span>
                                    }
                                    <button onClick={this._handleConfirm} style={styles.greenButton}>{this.props.confirmLabel}</button>
                                </div>
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
    label: {
        fontFamily: 'Lato', 
        fontSize: 16,
        color: colors.black,
        marginBottom: 15
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
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center'
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
        marginBottom: 15,
    },
};

export function transferModal(properties) {
    document.body.children[0].classList.add('react-confirm-alert-blur');
    const divTarget = document.createElement('div');
    divTarget.id = 'react-confirm-alert';
    document.body.appendChild(divTarget);
    render(<TransferModal {...properties} isOpen={true} />, divTarget);
}