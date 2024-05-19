import React, { Component } from 'react';
import Modal from 'react-modal';
import Radium, { StyleRoot } from 'radium';

import localizations from '../../Localizations';
import styles from './styles';

class CreateEventOptionsModal extends Component {
  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this.props.onClose();
    }
  };

  render() {
    const { isOpen, onClose, router } = this.props;
    return (
      <StyleRoot>
        <div
          ref={node => {
            this._containerNode = node;
          }}
        >
          <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={styles.modalStyle}
            contentLabel={localizations.circle_addMemberChild}
          >
            <div style={styles.container}>
              <h2 style={styles.heading}>
                {localizations.organize_modal_heading}
              </h2>
              <div style={styles.buttonsContainer}>
                <div
                  key="organizeExcel"
                  style={styles.buttonBox}
                  onClick={() => {
                    router.push('/datasheet-sportunities');
                    onClose();
                  }}
                >
                  <i
                    className="fa fa-table"
                    style={styles.buttonIcon}
                    aria-hidden="true"
                  />
                  <p style={styles.buttonText}>
                    {localizations.organize_modal_excel}
                  </p>
                </div>
                <div
                  key="organizeNormal"
                  style={styles.buttonBox}
                  onClick={() => {
                    router.push('/new-sportunity');
                    onClose();
                  }}
                >
                  <i
                    className="fa fa-list-ol"
                    style={{...styles.buttonIcon, fontSize: 100}}
                    aria-hidden="true"
                  />
                  <p style={styles.buttonText}>
                    {localizations.organize_modal_normal}
                  </p>
                </div>
              </div>
              <button style={styles.closeButton} onClick={onClose}>
                <i className="fa fa-times fa-3x" />
              </button>
              <h3 style={styles.bottomHeading}>
                {localizations.organize_modal_help_heading}
              </h3>
              <p style={styles.bottomText}>
                {localizations.organize_modal_help_text_1}
              </p>
              <p style={styles.bottomText}>
                {localizations.organize_modal_help_text_2}
              </p>
            </div>
          </Modal>
        </div>
      </StyleRoot>
    );
  }
}

export default Radium(CreateEventOptionsModal);
