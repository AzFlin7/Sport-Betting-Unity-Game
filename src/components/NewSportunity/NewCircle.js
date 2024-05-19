import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Modal from 'react-modal'
import { colors, fonts } from '../../theme'
import InputText from '../common/Inputs/InputText'
import InputSelect from '../MyCircles/InputSelect'
import Submit from '../MyCircles/Submit'
import NewCircleAdvanced from '../MyCircles/NewCircleAdvanced'
import localizations from '../Localizations'

import Radium from 'radium';

let styles
let modalStyles

class NewCircle extends Component {

  constructor(props) {
    super(props)
    this.state = {
      modalIsOpen: false,
      selectedSubAccount: null,
      name: '',
      newCircleType: 0,
      newCirclePublic: false,
      newCircleInvitationWithLink: true, 
      newCircleShared: true,
      displayAdvanced: false
    }
  }

  _openModal = () => {
    this.setState({ modalIsOpen: true })
    this.props.openNewCircle();
  }

  _closeModal = () => {
    this.setState({ 
      modalIsOpen: false,
      name: '',
      newCircleType: 0,
      newCirclePublic: false,
      newCircleInvitationWithLink: true, 
      newCircleShared: false,
      displayAdvanced: false
    });
    this.props._closeNewCircle();
  }

  toggleAdvanced = () => {
    this.setState({
      displayAdvanced: !this.state.displayAdvanced
    })
  }

  _updateName = (e) => {
    this.setState({name: e.target.value})
  }
  _updateNewCircleType = e => {
    this.setState({
      newCircleType: e
    }) 
  }
    
  _updateNewCirclePrivacy = e => {
    this.setState({
      newCirclePublic: e,
      newCircleInvitationWithLink: e ? true : this.state.newCircleInvitationWithLink
    })
  }

  _updateNewCircleInvitationWithLink = e => {
    this.setState({
      newCircleInvitationWithLink: e
    })
  }

  _updateNewCircleShared = e => {
    this.setState({
      newCircleShared: e
    })
  }

  render() {
    const {viewer, user} = this.props;

    const memberTypeList = user && user.profileType === 'PERSON'
    ?   [
            {key: 0, name: localizations['circles_member_type_'+0]},
            {key: 1, name: localizations['circles_member_type_'+1]},
        ]
    :   [
        {key: 0, name: localizations['circles_member_type_'+0]},
        {key: 1, name: localizations['circles_member_type_'+1]},
        {key: 2, name: localizations['circles_member_type_'+2]},
        {key: 3, name: localizations['circles_member_type_'+3]},
        {key: 4, name: localizations['circles_member_type_'+4]}
    ];

    return (
      <div>
        <div onClick={this._openModal} style={styles.button}>
          <div style={styles.buttonText}>
              {localizations.newSportunity_invitedList_modal_createCircle}
          </div>
        </div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={modalStyles}
          contentLabel={localizations.circles_newCircle}
        >
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <div style={styles.modalTitle}>{localizations.circles_newCircle}</div>
                <div style={styles.modalClose} onClick={this._closeModal}>
                  <i className="fa fa-times fa-2x" />
                </div>
              </div>
              <InputText 
                label={localizations.circles_name}
                value={this.state.name}
                placeholder={localizations.circles_nameHolder}
                onChange={this._updateName} />

              <div style={styles.checkboxRow}>
                <div style={styles.checkboxLabel}>
                    <div><span style={styles.checkboxTitle}>{localizations.circles_member_type + ': '}</span></div>
                </div>
                <InputSelect
                  isDisabled={false} 
                  list={memberTypeList}
                  onSelectItem={e => this._updateNewCircleType(e.key)}
                  selectedItem={memberTypeList.find(item => item.key ===this.state.newCircleType)} 
                  placeholder={localizations.newSportunity_organizerChoose}
                />
              </div>
              
              <div style={styles.advancedButton} onClick={this.toggleAdvanced}>
                {localizations.circles_advanced}{this.state.displayAdvanced ? <i style={styles.arrow} className="fa fa-angle-down" /> : <i style={styles.arrow} className="fa fa-angle-right" />}
              </div>
              {this.state.displayAdvanced && 
                <NewCircleAdvanced
                  viewer={viewer}
                  newCircleType={this.state.newCircleType}
                  newCirclePublic={this.state.newCirclePublic}
                  newCircleInvitationWithLink={this.state.newCircleInvitationWithLink}
                  newCircleShared={this.state.newCircleShared}
                  onChangeNewCircleType={this._updateNewCircleType}
                  onChangeNewCirclePrivacy={this._updateNewCirclePrivacy}
                  onChangeNewCircleInvitationWithLink={this._updateNewCircleInvitationWithLink}
                  onChangeNewCircleShared={this._updateNewCircleShared}
                />
              }

              <Submit 
                onClose={this._closeModal} 
                name={this.state.name}
                newCircleType={this.state.newCircleType}
                newCirclePublic={this.state.newCirclePublic}
                newCircleInvitationWithLink={this.state.newCircleInvitationWithLink}
                newCircleShared={this.state.newCircleShared}
                {...this.props}
                subCircles={[]}
                onErrorChange={() => {}}
              />
            </div>
        
        </Modal>
      </div>
    );
  }
}

//export default Radium(NewCircle) ;
export default createFragmentContainer(Radium(NewCircle), {
  viewer: graphql`
    fragment NewCircle_viewer on Viewer {
      ...NewCircleAdvanced_viewer
    }
  `,
});


modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    zIndex: 200
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
    overflow                  : 'visible',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

styles =  {
  button: {
    border: 'none',
    backgroundColor: colors.blue,
    color: colors.white,

    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1,

    padding: '8.5px 13px 7.5px',

    cursor: 'pointer',

    borderRadius: 3,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
	},
	buttonText: {
		flex: '2 0 0',
		textDecoration: 'none',
	},
	buttonIcon: {
		color: colors.blue,
	},
  modalContent: {
		display: 'flex',
		flexDirection: 'column',
    justifyContent: 'flex-start',
    width: 600,
    '@media (max-width: 600px)': {
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
		marginBottom: 20,
		flex: '2 0 0',
	},
	modalClose: {
		justifyContent: 'flex-center',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
	},
  greenButton: {
		width: '400px',
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
    marginTop: 10,
    marginBottom: 10,
    cursor: 'pointer',
		lineHeight: '27px',
  },
  advancedButton: {
    color: colors.blue,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    fontSize: 18, 
    fontFamily: 'Lato',
    cursor: 'pointer',
    marginTop: 15
  },
  arrow: {
    marginLeft: 5
  },
  checkboxRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  checkboxLabel: {
    fontFamily: 'Lato',
    fontSize: 14, 
    color: colors.blue,
    flex: 5,
    marginRight: 10
  },
  checkboxTitle: {
    fontWeight: 'bold'
  },
}
