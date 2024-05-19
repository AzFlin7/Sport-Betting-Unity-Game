import React from 'react'
import Radium from 'radium';
import Modal from 'react-modal'
import Switch from '../../common/Switch'
import localizations from "../../Localizations";
import { withAlert } from 'react-alert'
import {colors, fonts} from "../../../theme";
import InputText from "./InputText";
import MultiSelectCircle from "../../common/Inputs/MultiSelectCircle";
import Input from "./Input";

const isUrl = /(?:http|https):\/\/((?:[\w-]+)(?:\.[\w-]+)+)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/

class TermOfUseModal extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedCircles: [],
      name: '',
      isText: false,
      content: '',
    }
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
  }

  componentDidMount = () => {
    
    if (this.props.isEdit) {
      const termOfUse = this.props.selectedTermOfUse;
      this.setState({
        selectedCircles: termOfUse.circles && termOfUse.circles.edges ? termOfUse.circles.edges.map(node => node.node) : [],
        name: termOfUse.name,
        isText: termOfUse.content !== null ,
        content: termOfUse.content !== null ? termOfUse.content : termOfUse.link,
      })
    }
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.isEdit) {
      const termOfUse = nextProps.selectedTermOfUse;
      this.setState({
        selectedCircles: termOfUse.circles && termOfUse.circles.edges ? termOfUse.circles.edges.map(node => node.node) : [],
        name: termOfUse.name,
        isText: termOfUse.content !== null ,
        content: termOfUse.content !== null ? termOfUse.content : termOfUse.link,
      })
    }
  };

  _handleChangeSelectedCircles = circle => {
    let newList = this.state.selectedCircles;
    let index = newList.findIndex(item => item.id === circle.id);
    if (index >= 0)
      newList.splice(index, 1);
    else
      newList.push(circle)

    this.setState({
      selectedCircles: newList
    })
  };

  _updateName = (e) => {
    this.setState({
      name: e.target.value
    })
  };

  _changeContent = (e) => {
    this.setState({
      content: e.target.value
    })
  };

  switchContent = (isText) => {
    this.setState({
      isText,
      content: null
    })
  };

  _handleSave = () => {
    const {selectedCircles, name, content} = this.state;
    if (!selectedCircles || !name || !content) {
      this.props.alert.show(localizations.popup_termOfUse_missing, {
        timeout: 2000,
        type: 'error',
      });
    }
    else if (!this.state.isText && !isUrl.test(content)) {
      this.props.alert.show(localizations.popup_termOfUse_badUrl, {
        timeout: 2000,
        type: 'error',
      });
    }
    else
    {
      if (this.props.isEdit)
        this.props.onEdit(this.state);
      else
        this.props.onCreate(this.state);
      setTimeout(() => this.props.onClose(), 150)
    }
  };

  render() {
    const {user} = this.props;

    let circleList = user && user.termOfUseCircles && user.termOfUseCircles.edges ? user.termOfUseCircles.edges.map(edge => edge.node) : [];
    if (user.termOfUseCirclesSuperUser && user.termOfUseCirclesSuperUser.edges && user.termOfUseCirclesSuperUser.edges.length > 0) {
      user.termOfUseCirclesSuperUser.edges.forEach(edge => 
        circleList.push(edge.node)
      )
    }

    return (
    <Modal
      isOpen={this.props.isOpen}
      style={modalStyles}
      contentLabel={localizations.circles_termOfUse_label}
    >
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>
            {localizations.circles_termOfUse_label}
          </div>
          <div style={styles.modalClose} onClick={this.props.onClose}>
            <i className="fa fa-times fa-2x" />
          </div>
        </div>
        <div style={{...styles.row, marginBottom: 20}}>
          <div style={styles.label}>
            {localizations.circles_information_form_name}
          </div>
          <div style={{flex: 8}}>
            <InputText
              maxLength={"25"}
              value={this.state.name}
              onChange={this._updateName}
              placeholder={localizations.termsOfUse_name_placeholder}
            />
          </div>
        </div>
        <div style={{...styles.row, marginBottom: 20}}>
          <div style={styles.label}>
            {localizations.circles_information_form_circles}
          </div>
          <div style={{flex: 8}}>
            <MultiSelectCircle
              list={circleList}
              values={this.state.selectedCircles}
              term={this.state.selectedCircles && this.state.selectedCircles.length > 0 ? this.state.selectedCircles.map(item => item.name).join(', ') : ''}
              onChange={this._handleChangeSelectedCircles}
            />
          </div>
        </div>
        <div style={{...styles.row, marginBottom: 20}}>
            {!this.state.isText
                ?
                <div style={{...styles.row, flex: 10}}>
                    <div style={styles.label}>
                        {localizations.circles_termOfUse_formulaitre}
                    </div>
                    <div style={{flex: 8}}>
                        <InputText
                            value={this.state.content}
                            onChange={this._changeContent}
                            isError={this.state.content && !isUrl.test(this.state.content)}
                            placeholder={localizations.termsOfUse_link_placeholder}
                        />
                    </div>
                </div>
                :
                <div style={{flex: 8}}>
                    <Input
                        label={localizations.circles_termOfUse_formulaitre}
                        value={this.state.content}
                        onChange={this._changeContent}
                        type="textarea"
                        placeholder={localizations.termsOfUse_content_placeholder}
                    />
                </div>
            }
            <div style={{display: 'flex', alignItems: 'center', padding: 10, flex: 3}}>
                <div style={styles.label}>
                    {localizations.circles_termOfUse_useText}
                </div>
                <Switch
                    checked={this.state.isText}
                    onChange={(e) => this.switchContent(e)}
                />
            </div>
        </div>
        <button onClick={() => this._handleSave()} style={styles.saveButton}>
          {localizations.circles_save}
        </button>
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
    flexDirection: 'row',
    alignItems: 'flex-center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: 'Lato',
    fontSize:24,
    fontWeight: fonts.weight.medium,
    color: colors.blue,
    marginBottom: 20,
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
    color: colors.blue,
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

export default withAlert(Radium(TermOfUseModal))
