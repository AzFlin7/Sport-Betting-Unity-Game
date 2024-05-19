import React from "react";
import { render } from 'react-dom';
import { createRefetchContainer, graphql, QueryRenderer } from 'react-relay';
import Radium, {StyleRoot} from 'radium';
import Modal from 'react-modal'
import { withAlert } from 'react-alert'
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';

import environment from 'sportunity/src/createRelayEnvironment'; 
import localizations from '../../Localizations';
import { fonts, colors } from '../../../theme'
import DocumentUploadButton from './DocumentUploadButton';
import UpdateUserDocumentMutation from './UpdateUserDocumentMutation';
import RemoveDocumentMutation from './RemoveDocumentMutation';
import styles from '../Styles.js';

class Document extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      selected: null
    }
  }

  _updateDocument = (file) => {
    UpdateUserDocumentMutation.commit({
        name: file.name
      },
      {
        onSuccess: () => {
          this.props.relay.refetch()
          this.props.alert.show(localizations.popup_updateVenue_success, {
            timeout: 3000,
            type: 'success',
          });
        },
        onFailure: error => {
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
      },
      file
    );
  }

  _removeDocument = (documentId) => {
    RemoveDocumentMutation.commit({
        documentId
      },
      {
        onSuccess: () => {
          this.props.relay.refetch()
          this.props.alert.show(localizations.popup_removeDocument_success, {
            timeout: 3000,
            type: 'success',
          });
        },
        onFailure: error => {
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
      },
    )
  }

  handleSelectDocument = (data) => {
    this.props.selectDocument(data);
    this.props.handleCloseModal();
  }

  render() {
    const documents = this.props.viewer && this.props.viewer.me ? this.props.viewer.me.documents : [] ;
    const allowSelection = this.props.allowSelection ? true : false

    return (
      <section style={{ margin: 30 }}>
        {!allowSelection && 
          <div style={styles.pageHeader}>
            <h1>{localizations.info_document_title}</h1>
          </div>
        }
        <section>
          {!allowSelection && 
            <div style={styles.pagedocument}>
              {localizations.document_information1}
            </div>
          }
          <DocumentUploadButton
            _updateDocument={this._updateDocument}
          />
          <section>
            <br />
            <Paper className={styles.container}>
              <Table className={styles.table}>
                <TableHead>
                  <TableRow>
                    {allowSelection &&
                      <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>
                        {localizations.document_select}
                      </TableCell>
                    }
                    <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>
                      {localizations.document_name}
                    </TableCell>
                    <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>
                      {localizations.document_sentTo}
                    </TableCell>
                    <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>
                      {localizations.document_creation_date}
                    </TableCell>
                    <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>
                      {localizations.document_see}
                    </TableCell>
                    {!allowSelection && 
                      <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>
                        {localizations.document_delete}
                      </TableCell>
                    }
                  </TableRow>
                </TableHead>
                <TableBody>

                  {documents && documents.map(data => (
                    <TableRow key={data.id}>
                      {allowSelection && 
                        <TableCell>
                          <Radio
                            onClick={() => this.handleSelectDocument(data)}
                          />
                        </TableCell>
                      }
                      <TableCell component="th" scope="row">
                        {data && data.name}
                      </TableCell>
                      <TableCell>
                        Group title
                      </TableCell>
                      <TableCell>
                        {data && data.creation_date}
                      </TableCell>
                      <TableCell>
                        <a href={data.link} target="_blank">
                          <VisibilityIcon variant="contained" color="primary" fontSize="small" />
                        </a>
                      </TableCell>
                      {!allowSelection && 
                        <TableCell>
                          <DeleteIcon 
                            variant="contained" 
                            color="primary" 
                            onClick={() => this._removeDocument(data && data.id)} 
                            fontSize="small" 
                            style={{ cursor: "pointer" }}
                          />
                        </TableCell>
                      }
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </section>
        </section>
      </section>
    );
  }
}

const DocumentRelay = createRefetchContainer(Radium(withAlert(Document)), {
  viewer: graphql`
      fragment Document_viewer on Viewer {
        id
        me {
          id
          documents {
            id,
            name,
            link,
            creation_date
          }
        }
      }  
    `
},
  graphql`
    query DocumentRefetchQuery {
      viewer {
        ...Document_viewer
      }
    }
  `,  
)

class DocumentClass extends React.Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query DocumentQuery {
            viewer {
              ...Document_viewer
            }
          }
        `}
        render={({error, props}) => {
          if (props) {
            return <DocumentRelay query={props} viewer={props.viewer} {...this.props}/>;
          } 
          else {
            return (
              <DocumentRelay query={props} viewer={null} {...this.props}/>
            )
          }
        }}
      />
    )
  }
}

export default DocumentClass