import React from 'react';
import FileReaderInput from 'react-file-reader-input';
import Button from '@material-ui/core/Button';

import PureComponent from '../../common/PureComponent'
import localizations from '../../Localizations';

class DocumentViewHeader extends PureComponent {
    constructor(props) {
        super(props);
    }

    _handleChange = (e, results) => {
        results.forEach(result => {
            const [e, file] = result;
            this.props._updateDocument(file)
        });
    }

    render() {
        return (
            <div>
                <FileReaderInput 
                    as='url' 
                    id="my-file-input"
                    onChange={this._handleChange}
                >
                    <Button 
                        variant="contained" 
                        color="primary"
                        style={{ float: "right", marginBottom: "20px" }}
                    >
                        {localizations.document_upload}
                    </Button>
                </FileReaderInput>
            </div>
        );
    }
}

export default DocumentViewHeader;
