import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import * as types from '../../../actions/actionTypes';
import { bindActionCreators } from 'redux';

import { colors } from '../../../theme';

let styles;

class TutorialModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  componentDidMount() {
    this.shouldDisplayTutorial(this.props);
  }

  componentWillUnmount() {
    this.props._updateCurrentTutorial(null);
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.isOpen && !nextProps.isOpen) {
      this._closeModal();
    }
    if (
      (!this.props.isOpen &&
        nextProps.isOpen &&
        !this.props.currentlyDisplayedTutorial) ||
      this.props.tutorialNumber !== nextProps.tutorialNumber
    ) {
      this.shouldDisplayTutorial(nextProps);
    }
    if (
      this.props.currentlyDisplayedTutorial &&
      !nextProps.currentlyDisplayedTutorial
    ) {
      this.shouldDisplayTutorial(nextProps);
    }
  };

  shouldDisplayTutorial = props => {
    let shouldDisplayTutorial = true;
    if (props.shownTutorial && props.shownTutorial.length > 0) {
      if (props.shownTutorial.indexOf(props.tutorialNumber) >= 0)
        shouldDisplayTutorial = false;
    }

    if (
      props.tutorialNumber > 1 &&
      (props.shownTutorial.length === 0 ||
        props.shownTutorial.indexOf(props.tutorialNumber - 1) < 0)
    )
      shouldDisplayTutorial = false;

    if (
      !props.currentlyDisplayedTutorial &&
      props.isOpen &&
      JSON.parse(localStorage.getItem('neverShowSmallTutorialAgain')) !==
        true &&
      shouldDisplayTutorial
    ) {
      setTimeout(() => {
        this.setState({ open: true });
        this.props._updateCurrentTutorial(props.tutorialName);
      }, 50);
    } else this.setState({ open: false });
  };

  _closeModal = () => {
    const newState = this.props.shownTutorial;
    newState.push(this.props.tutorialNumber);
    this.props._updateShowTutorials(newState);
    this.props._updateCurrentTutorial(null);
    if (typeof this.props.onPass !== 'undefined') {
      this.props.onPass();
    }
  };

  neverShowAgain = () => {
    localStorage.setItem('neverShowSmallTutorialAgain', JSON.stringify(true));
    this._closeModal();
  };

  render() {
    // this module is disabled for now
    // if (!this.state.open) 
      return null;
    return (
      <div style={[styles.modalContent, this.props.position]}>
        <span style={[styles.arrow, this.props.arrowPosition]} />
        <span style={styles.message}>{this.props.message}</span>
        <div style={styles.buttonRow}>
          {this.props.hideLabel ? (
            <button onClick={this.neverShowAgain} style={styles.hideButton}>
              {this.props.hideLabel}
            </button>
          ) : (
            <span />
          )}
          {this.props.confirmLabel && (
            <button onClick={this._closeModal} style={styles.nextButton}>
              {this.props.confirmLabel}
            </button>
          )}
        </div>
      </div>
    );
  }
}

styles = {
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: 400,
    backgroundColor: 'whitesmoke',
    position: 'absolute',
    zIndex: 100,
    borderRadius: 5,
    padding: 20,
    border: '1px solid #ccc',
    boxShadow: '0 0 10px 0 rgba(0,0,0,0.12), 0 2px 10px 0 rgba(0,0,0,0.24)',
  },
  arrow: {
    content: '',
    position: 'absolute',
    borderBottom: '8px solid whitesmoke',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
  },
  buttonRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  hideButton: {
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '14px',
    textAlign: 'center',
    color: colors.gray,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
  },
  nextButton: {
    backgroundColor: colors.blue,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    cursor: 'pointer',
    padding: '10px 20px',
  },
  message: {
    color: colors.blue,
    fontSize: 16,
    fontFamily: 'Lato',
    marginBottom: 10,
  },
};

const _updateShowTutorials = value => ({
  type: types.UPDATE_SHOWN_TUTORIAL,
  value,
});

const _updateCurrentTutorial = value => ({
  type: types.UPDATE_CURRENT_TUTORIAL,
  value,
});

const dispatchToProps = dispatch => ({
  _updateShowTutorials: bindActionCreators(_updateShowTutorials, dispatch),
  _updateCurrentTutorial: bindActionCreators(_updateCurrentTutorial, dispatch),
});

const stateToProps = state => ({
  shownTutorial: state.tutorialReducer.shownTutorial,
  currentlyDisplayedTutorial: state.tutorialReducer.currentlyDisplayedTutorial,
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(TutorialModal));

export default Radium(ReduxContainer);
