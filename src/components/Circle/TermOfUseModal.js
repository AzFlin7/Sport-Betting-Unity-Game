import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import Modal from 'react-modal'
import localizations from "../Localizations";
import { withAlert } from 'react-alert'
import {colors, fonts} from "../../theme";
import Checkbox from "../common/Inputs/InputCheckbox";
import AcceptTermOfUseMutation from "./AcceptTermOfUseMutation";
import Loading from "../common/Loading/Loading";

class TermOfUseModal extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedCircles: [],
      name: null,
      isText: false,
      content: null,
      termsList: [],
      checkAll: false,
	    isLoading: false,
    }
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
  }

  componentDidMount = () => {
    let termsList = [];
    if (this.props.circle && this.props.circle.termsOfUses) {
      this.props.circle.termsOfUses.forEach(term => {
        termsList.push({ term, value: false, show: false})
      })
    }
    this.setState({termsList})
  };

  componentWillReceiveProps = (nextProps) => {
    let termsList = [];
    if (nextProps.circle && nextProps.circle.termsOfUses) {
      nextProps.circle.termsOfUses.forEach(term => {
        termsList.push({term, value: false, show: false})
      })
    }
    this.setState({termsList})
  };

  validTerm = (term) => {
    let termsList = this.state.termsList;
    let index = termsList.findIndex(tmpTerm => tmpTerm.term.id === term.term.id);
    if (index >= 0)
      termsList[index].value = !term.value;
    this.setState({termsList});
    setTimeout(() => this.checkAllTerm(), 150)
  };

  checkAllTerm = () => {
    let checkAll = true
    this.state.termsList.forEach(term => {
      checkAll = checkAll && term.value
    });
    this.setState({checkAll});
  };

  _handleAccept = (termsOfUseId, show) => {
    const {viewer} = this.props;
    AcceptTermOfUseMutation.commit({
        viewer,
        termsOfUseId,
        userId: this.props.viewer.me.id
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.popup_editCircle_update_failed, {
            timeout: 2000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: (response) => {
          if (show) {
	          this.props.alert.show(localizations.popup_editCircle_update_success, {
		          timeout: 2000,
		          type: 'success',
	          });
	          setTimeout(() => {
		          this.props.toggleTermModal()
	          }, 1000);
          }
        },
      }
    )
  };

  _handleValid = () => {
  	this.setState({isLoading: true})
    this.state.termsList.forEach((term, index) => {
      this._handleAccept(term.term.id, index >= this.state.termsList.length - 1)
    })
  };

  showContent = (term) => {
    if (term.term.link) {
      let win = window.open(term.term.link, '_blank')
      win.focus();
    }
    else {
      let termsList = this.state.termsList;
      let index = termsList.findIndex(tmpTerm => tmpTerm.term.id === term.term.id);
      if (index >= 0)
        termsList[index].show = !term.show;
      this.setState({termsList});
    }
  };

  render() {
    const {circle} = this.props;

    return (
    <Modal
      isOpen={this.props.isOpen}
      style={modalStyles}
      contentLabel={localizations.circles_termOfUse_label}
    >
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>
            {localizations.circles_termOfUse_accept_label}
          </div>
          <div style={styles.modalClose} onClick={this.props.onClose}>
              <i className="fa fa-times fa-2x" />
          </div>
        </div>
        <div style={styles.rowContainer}>
            {localizations.circles_termOfUse_accept_msg}
          </div>
        {
          this.state.termsList && this.state.termsList.map(term => (
            <div key={term.term.id} style={styles.rowContainer}>
              <div style={styles.row}>
                <Checkbox
                  value={term.value}
                  onChange={() => this.validTerm(term)}
                />
                <div>
                  {localizations.circles_termOfUse_byAccecpt}
                  <span style={{color: colors.blue, cursor: 'pointer'}} onClick={() => this.showContent(term)}>
                    {term.term.name}
                  </span>
                </div>
              </div>
              {term.term.content && term.show &&
                <textarea readOnly style={{width: '100%', height: 200}}>
                  {term.term.content}
                </textarea>
              }
            </div>
          ))
        }
	      {this.state.isLoading &&
	        <Loading type='cylon' color={colors.blue}/>
	      }
	      {this.state.checkAll && !this.state.isLoading &&
	        <button onClick={this._handleValid} style={styles.saveButton}>
		        {localizations.circle_subscribe_validate}
	        </button>
        }
      </div>
    </Modal>
    )
  }
}

let styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginTop: 15
  },
  rowContainer: {
    fontFamily: 'lato',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  checkBox: {
    width: 18,
    height: 18,
    border: '2px solid #5E9FDF',
    display: 'block',
    cursor: 'pointer',
    margin: 'auto'
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  buttonLabel: {
    fontFamily: 'Lato',
    fontSize: 16,
    color: colors.blue,
    cursor: 'pointer',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: 500,
    paddingBottom: 10
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row ',
    alignItems: 'flex-center',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
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
    paddingTop: 10,
    color: colors.gray,
    cursor: 'pointer',
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingBottom: 3,
    borderBottom: '1px solid ' + colors.gray,
    color: colors.blueLight
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  subRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 2
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 9
  },
  label: {
    fontFamily: 'Lato',
    fontSize: 15,
    flex: 5
  },
  checkBoxContainer: {
    fontFamily: 'Lato',
    fontSize: 15,
    flex: 3
  },
  checkBoxLabel: {
    fontFamily: 'Lato',
    fontSize: 15,
    flex: 3,
    marginLeft: 5
  },
  type: {
    fontFamily: 'Lato',
    fontSize: 15,
    flex: 5,
    marginLeft: 5
  },
  removeIcon: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    color: colors.redGoogle,
    cursor: 'pointer',
  },
  editIcon: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    color: colors.blueLight,
    cursor: 'pointer',
    flex: 1
  },
  validateEditionIcon: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    color: colors.green,
    cursor: 'pointer',
    flex: 1
  },
  newInfoTitle: {
    fontFamily: 'Lato',
    fontSize: 15,
    color: colors.blueLight,
    marginTop: 20,
    marginBottom: 10
  },
  dropdown: {
    position: 'absolute',
    top: 31,
    left: 0,
    width: '100%',
    maxHeight: 150,
    backgroundColor: colors.white,
    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: '7px 20px',
    overflowY: 'scroll',
    overflowX: 'hidden',
    zIndex: 100,
  },
  listItem: {
    paddingTop: 5,
    paddingBottom: 5,
    color: '#515151',
    fontSize: 20,
    fontWeight: 500,
    fontFamily: 'Lato',
    borderBottomWidth: 1,
    borderColor: colors.blue,
    borderStyle: 'solid',
    cursor: 'pointer',
  },
  loadInput: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '30px',
    lineHeight: '36px',
    fontFamily: 'Lato',
    display: 'block',
    background: 'transparent',
    fontSize: fonts.size.medium,
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    color: '#515151',
  },
  typeListContainer: {
    position: 'relative',
    flex: 5,
    marginTop: 2,
    marginLeft: 5,
  },
  triangle: {
    position: 'absolute',
    right: 3,
    top: 12,
    width: 0,
    height: 0,
    transition: 'border 100ms',
    transitionOrigin: 'left',
    color: colors.blue,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.blue}`,
    cursor: 'pointer',
  },
  addButton: {
    textAlign: 'center',
    justifyContent: 'flex-center',
    color: colors.green,
    cursor: 'pointer',
    flex: 1,
    marginBottom: 20
  },
  saveButton: {
    width: '500px',
    height: '50px',
    backgroundColor: colors.green,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 15,
    marginBottom: 10,
    cursor: 'pointer',
    lineHeight: '27px',
  },
}

let modalStyles = {
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
};

export default createFragmentContainer(Radium(withAlert(TermOfUseModal)),{
  circle: graphql`
    fragment TermOfUseModal_circle on Circle {
      id
      termsOfUses {
        id
        name
        link
        content
        acceptedBy {
          user {
            id
          }
        }
      }
    }
  `,
  viewer: graphql`
    fragment TermOfUseModal_viewer on Viewer {
      id
      me {
        id
      }
    }
  `
})