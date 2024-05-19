import React from 'react';
import Radium, {StyleRoot} from 'radium'
import {createFragmentContainer, graphql} from 'react-relay';
import ReactTooltip from 'react-tooltip';
import Modal from 'react-modal'
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Button from '@material-ui/core/Button';
import { withAlert } from 'react-alert';
import { withRouter } from 'found';

import { colors, fonts } from '../../../theme';
import localizations from '../../Localizations'
import ImportActivitiesMutation from './ImportActivitiesMutation';

let styles, modalStyles, cantCloseModalStyles;

class ImportActivitiesModal extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            showAddLinkBar: false,
            icsLink:[]
        }
    }

    _closeModal = () => {
        this.props.closeModal()
    }

    chooseModal = (modelNo) => {
        this.setState({
            showImportExcel: modelNo === 1,
            showAddLinkBar: modelNo === 3
        })
    }

    _handleLinkImport = () => {
        ImportActivitiesMutation.commit(
            {
                userID: this.props.user.id,
                icsLinks: this.state.icsLink
            },
            {
                onSuccess: () => {
                    this.props.alert.show(localizations.data_imported, {
                        timeout: 2000,
                        type: 'success',
                    });
                    setTimeout(() => {
                        if (this.props.isFromMenu) {
                            this.props.router.push({pathname: '/datasheet-sportunities'})
                        }
                        this._closeModal()
                    }, 1000);
                },
                onFailure: (error) => {
                    this.props.alert.show(localizations.datasheet_error_occurred, {
                        timeout: 4000,
                        type: 'error',
                    });
                }
            }
        )
    }

    _handleFileImport = files => {
        if (this.props.isFromMenu) {
            this.props.router.push({pathname: '/datasheet-sportunities', files})
            this._closeModal()
        }
        else {
            this.props.handleUpload(files)
        }
    }

    render() {
        return (
            <StyleRoot>
                <div ref={node => { this._containerNode = node; }}>
                    <Modal
                        isOpen={this.props.isOpen}
                        onRequestClose={this._closeModal}
                        style={modalStyles}
                        contentLabel={localizations.import_your_activities}
                    >
                        <ReactTooltip effect="solid" multiline />
                        <div style={styles.modalContent}>
                            <div style={styles.modalHeader}>
                                <div style={styles.modalTitle}>
                                    {localizations.import_your_activities}
                                </div>
                                <div style={styles.modalClose} onClick={this._closeModal}>
                                    <i className="fa fa-times fa-2x" />
                                </div>
                            </div>

                            <div style={styles.buttons}>
                                <div style={styles.buttonGroup} data-tip={localizations.available_soon}>
                                    <div id='test-table-xls-button' style={styles.squaredButtonContainer} key="square2">
                                        <img style={styles.fileUploadImage} width="70px" src="/images/excel.png"/>
                                        <span style={styles.buttonLabel}>
                                            {localizations.import_an_excel}
                                        </span>
                                    </div>
                                </div>
                                
                                <div 
                                    style={styles.squaredButtonContainer} 
                                    key="square4" 
                                    onClick={() => this.chooseModal(2)}
                                    data-tip={localizations.tip_import_ics_file}
                                >
                                    <label htmlFor='file-upload' style={styles.inputLabel}>
                                        <img style={styles.fileUploadImage} width="70px" src="/images/icon_ics.png"/>
                                        <span style={styles.buttonLabel}>
                                            {localizations.import_an_ics_file}
                                        </span>
                                    </label>
                                    <input 
                                        id="file-upload" 
                                        type="file" 
                                        style={styles.fileUpload} 
                                        accept=".ics"
                                        onChange={e => this._handleFileImport(e.target.files)}
                                    />
                                </div>

                                <div 
                                    style={styles.squaredButtonContainer} 
                                    key="square3" 
                                    onClick={() => this.chooseModal(3)}
                                    data-tip={localizations.tip_import_ics_link}
                                >
                                    <img style={styles.fileUploadImage} width="70px" src="/images/link.png"/>
                                    <span style={styles.buttonLabel}>
                                        {localizations.import_an_ics_link}
                                    </span>
                                </div>
                            </div>
                            {this.state.showAddLinkBar === true && (
                                <div style={styles.showAddLinkBar}>
                                   <Paper style={styles.root}>
                                        <InputBase
                                            style={styles.input}
                                            placeholder={localizations.copy_ics_link}
                                            inputProps={{ 'aria-label': 'Search Google Maps' }}
                                            onChange={(e) => this.setState({icsLink: e.target.value})}
                                        />
                                        <Button color="primary" variant="contained" size="large" style={styles.importButton} onClick={() => this._handleLinkImport()}>
                                            {localizations.header_import}
                                        </Button>
                                    </Paper>
                                </div>
                                
                            )}
                        </div>
                    </Modal>
                </div>
            </StyleRoot>
        );
    }
}

styles = {
    importButton: {
        borderRadius: 0
    },
    showAddLinkBar: {
        display: 'flex',
        justifyContent: 'center',
    },
    root: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: 0
    },
    input: {
        marginLeft: 8,
        flex: 1,
    },
    fileUploadImage: {
        marginRight: 'auto',
        marginLeft: 'auto',
        paddingBottom: 15
    },
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
            // display: 'block'
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
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    fileUpload: {
        display: 'none'
    },
    inputLabel: {
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer'
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

export default createFragmentContainer(Radium(withRouter(withAlert(ImportActivitiesModal))), {
    viewer: graphql`
        fragment ImportActivitiesModal_viewer on Viewer {
            user {
                id
                icsLinks
            }
        }
    `,
  });

