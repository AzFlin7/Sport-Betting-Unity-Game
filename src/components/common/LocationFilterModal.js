import React from 'react';
import Radium from 'radium';
import Modal from 'react-modal';

import localizations from '../Localizations';
import { colors } from '../../theme';

const LocationFilterModal = ({ visible, applyLocationFilter, focusOnLocationInput, onCloseModal }) => (
  <Modal
    isOpen={visible}
    contentLabel="Use your location"
    style={styles.modalStyle}
    shouldCloseOnOverlayClick={true}
    shouldCloseOnEsc={true}
  >
    <div>
      <h2 style={styles.heading}>
        {localizations.current_location_modal_title}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button
          style={styles.button}
          onClick={applyLocationFilter}
        >
          {localizations.current_location_modal_confirm}
        </button>

        <button
          style={[styles.button, { marginLeft: '10px' }]}
          onClick={focusOnLocationInput}
        >
          {localizations.current_location_modal_enter_location}
        </button>
      </div>

      <button
        style={{ position: 'absolute', right: '10px', top: '10px', borderWidth: 0, background: 'none', cursor: 'pointer' }}
        onClick={onCloseModal}
      >
        <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
      </button>
    </div>
  </Modal>
);

const styles = {
	modalStyle: {
		overlay : {
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: 'rgba(55, 55, 55, 0.75)',
			zIndex: 201
		},
		content : {
			top: '50%',
			left: '50%',
			right: 'auto',
			bottom: 'auto',
			marginRight: '-50%',
			transform: 'translate(-50%, -50%)',
			border: '1px solid #ccc',
			background: colors.lightGray,
			overflow: 'auto',
			WebkitOverflowScrolling: 'touch',
			borderRadius: '4px',
			outline: 'none',
			padding: '20px 40px',
		},
	},
	heading: {
		marginTop: 15,
		marginBottom: '10px',
		fontFamily: 'Lato',
		fontSize: '22px',
		fontWeight: 'bold',
		lineHeight: '30px',
		textAlign: 'center',
		color: colors.darkGray,
	},
	button: {
		fontFamily: 'Lato',
		color: colors.blue,
		textDecoration: 'none',
		cursor: 'pointer',
		padding: '5px 15px',
		backgroundColor: colors.lightGray,
		fontSize: '15px',
		fontWeight: 'bold',
		borderWidth: 0,
		boxShadow: 'none',
	},
	cancelIcon: {
		color: colors.darkGray,
		fontSize: 18
	}
}

export default Radium(LocationFilterModal);
