import React from "react";
import { createRefetchContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';
import { withAlert } from 'react-alert'
import Button from '@material-ui/core/Button';
import localizations from '../../Localizations';
import RemoveDocumentMutation from './RemoveDocumentMutation';
import styles from '../Styles.js';
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

class Document extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }


    // _removeDocument = (documentId) => {
    //     RemoveDocumentMutation.commit({
    //         documentId
    //     },
    //         {
    //             onSuccess: () => {
    //                 this.props.alert.show(localizations.popup_removeDocument_success, {
    //                     timeout: 3000,
    //                     type: 'success',
    //                 });
    //             },
    //             onFailure: error => {
    //                 let errors = JSON.parse(error.getError().source);
    //                 console.log(errors);
    //             },
    //         },
    //     )
    // }
    render() {
        // NST : List the documents contained in this.props.viewer.me.documents and allow to remove them with _removeDocument
        // const { documents } = this.props.viewer.me;
        // console.log('herere', documents)
        // const { show } = this.state;
        return (
            // <section style={{ margin: 30 }}>
            //     <div style={styles.pageHeader}>
            //         <h1>My Documents</h1>
            //     </div>
            //     <section>
            //         <Paper className={styles.container}>
            //             <Table className={styles.table}>
            //                 <TableHead>
            //                     <TableRow>
            //                         <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>Name of the Document</TableCell>
            //                         <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>Sent to</TableCell>
            //                         <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>Date of creation</TableCell>
            //                         <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>view Document</TableCell>
            //                         <TableCell style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Lato' }}>Delete</TableCell>
            //                     </TableRow>
            //                 </TableHead>
            //                 <TableBody>
            //                     {documents && documents.map(data => (
            //                         <TableRow key={data.id}>
            //                             <TableCell component="th" scope="row">
            //                                 {data && data.name}
            //                             </TableCell>
            //                             <TableCell >Group title</TableCell>
            //                             <TableCell >{data && data.creation_date}</TableCell>
            //                             <TableCell >
            //                                 <a href={data.link}
            //                                 ><VisibilityIcon variant="contained" color="primary" fontSize="small" /></a></TableCell>
            //                             <TableCell ><DeleteIcon variant="contained" color="primary" onClick={() => { this._removeDocument(data && data.id) }} fontSize="small" style={{ cursor: "pointer" }} /></TableCell>
            //                         </TableRow>
            //                     ))}
            //                 </TableBody>
            //             </Table>
            //             <Button variant="contained" color="primary"
            //                 style={{ float: "right", marginBottom: "20px" }}>
            //                 Create a Form
            //         </Button>
            //         </Paper>

            //     </section>

            // </section>
            <div>
                <h1>hello</h1>
            </div>
        );
    }
}

export default Document;
// export default createRefetchContainer(Radium(withAlert(Document)), {
//     viewer: graphql`
//       fragment UserDocumentRecord_viewer on Viewer {
//         id
//         me {
//           id
//           documents {
//             id,
//             name,
//             link,
//             creation_date
//           }
//         }
//       }
//     `
// },
//     graphql`
//     query UserDocumentRecordRefetchQuery {
//       viewer {
//         ...UserDocumentRecord_viewer
//       }
//     }
//   `,
// )
