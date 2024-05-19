import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Modal from 'react-modal'
import { colors, fonts } from '../../theme'
import InputText from './InputText'
import InputSelect from './InputSelect'
import MergeCircles from './MergeCircles';
import Submit from './Submit'
import localizations from '../Localizations'
import NewCircleAdvanced from './NewCircleAdvanced'

import Radium from 'radium';
import SportList from "../Facility/SportList";
import { Button } from '@material-ui/core';

let styles
let modalStyles

class NewCircle extends Component {

  constructor(props) {
    super(props)
    this.state = {
      modalIsOpen: false,
      selectedSubAccount: null,
      displayAdvanced: false
    }
  }

  componentDidMount = () => {
    if (this.props.activeSection == 'subAccounts' && this.props.isNewCircleModalOpen) {
      this.setState({
        modalIsOpen: true
      })
    }
  }

  _openModal = () => {
    this.setState({ modalIsOpen: true })
    this.props.openNewCircle();
  }

  _closeModal = () => {
    this.setState({ modalIsOpen: false });
    this.props._closeNewCircle();
  }

  _updateName = (e) => {
    if(this.props.value !== e.target.value) {
      this.props.onChange(e.target.value)
    }
    if(e.target.value.length && this.props.isError) {
      this.props.onErrorChange(false)
    } else if (!e.target.value.length && !this.props.isError) {
      this.props.onErrorChange(true)
    }
  }

  _onSelectSubAccount = subAccount => {
    this.setState({
      selectedSubAccount: subAccount
    })
  }

  toggleAdvanced = () => {
    this.setState({
      displayAdvanced: !this.state.displayAdvanced
    })
  }
 
  render() {
    const {viewer, user, teamCreation, me, superMe} = this.props;

    let circles = [];
    if (me && me.circles && me.circles.edges && me.circles.edges.length > 0)
      circles = circles.concat(me.circles.edges.map(circle => circle.node));
    if (me && me.circlesSuperUser && me.circlesSuperUser.edges && me.circlesSuperUser.edges.length > 0)
      circles = circles.concat(me.circlesSuperUser.edges.map(circle => circle.node));

    const memberTypeList = me && me.profileType === 'PERSON'
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
        <div style={styles.button}>
          <Button onClick={this._openModal} style={styles.createCircleButton}>{this.props.label}</Button>
          {/* <div style={styles.buttonText}>{this.props.label}</div> */}
          {/* <div style={styles.buttonIcon}>
            <i className="fa fa-plus fa-align-right" />
          </div> */}
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
                isError={this.props.isError}
                label={localizations.circles_name}
                value={this.props.name}
                placeholder={localizations.circles_nameHolder}
                onChange={this._updateName} />
              {teamCreation && me &&
                <InputSelect
                  viewer={viewer}
                  superMe={superMe}
                  isDisabled={false}
                  list={me.subAccounts.map(subAccount => ({name: subAccount.pseudo, id: subAccount.id, circles: subAccount.circles}))}
                  onSelectItem={this._onSelectSubAccount}
                  selectedItem={this.state.selectedSubAccount}
                  label={me.profileType === 'PERSON' ? localizations.circles_select_child : localizations.circles_select_team}
                />
              }
              {/*circles.length > 1 &&
                <MergeCircles
                  viewer={viewer}
                  circles={circles}
                  subCircles={this.props.subCircles}
                  updateSubCircles={this.props.updateSubCircles}
                  />
              */}
              <div style={styles.checkboxRow}>
                  <div style={styles.checkboxLabel}>
                      <div><span style={styles.checkboxTitle}>{localizations.circles_member_type + ': '}</span></div>
                  </div>
                  <InputSelect
                    isDisabled={false} 
                    list={memberTypeList}
                    onSelectItem={e => this.props.onChangeNewCircleType(e.key)}
                    selectedItem={memberTypeList.find(item => item.key ===this.props.newCircleType)} 
                    placeholder={localizations.newSportunity_organizerChoose}
                  />
              </div>

              <div style={styles.advancedButton} onClick={this.toggleAdvanced}>
                {localizations.circles_advanced}{this.state.displayAdvanced ? <i style={styles.arrow} className="fa fa-angle-down" /> : <i style={styles.arrow} className="fa fa-angle-right" />}
              </div>
              {this.state.displayAdvanced && 
                <NewCircleAdvanced
                  viewer={viewer}
                  newCirclePublic={this.props.newCirclePublic}
                  newCircleInvitationWithLink={this.props.newCircleInvitationWithLink}
                  newCircleShared={this.props.newCircleShared}
                  onChangeNewCirclePrivacy={this.props.onChangeNewCirclePrivacy}
                  onChangeNewCircleInvitationWithLink={this.props.onChangeNewCircleInvitationWithLink}
                  onChangeNewCircleShared={this.props.onChangeNewCircleShared}
                  {...this.props}
                />
              }

              <Submit 
                onClose={this._closeModal} 
                {...this.props}
                selectedSubAccount={this.state.selectedSubAccount}
              />
            </div>
        
        </Modal>
      </div>
    );
  }
}

export default createFragmentContainer(Radium(NewCircle), {
  viewer: graphql`
    fragment MyCirclesNewCircle_viewer on Viewer {
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
  createCircleButton: {
    color: colors.white,
    backgroundColor: colors.blue,
    fontWeight: 'bold',
    fontSize: '16px',
    width: '200px'
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-center',
    width: 200,
    maxWidth: '100%',
    height: 50,
    backgroundColor: colors.white,
    // boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    // border: '1px solid #E7E7E7',
//    borderRadius: 4,
    fontFamily: 'Lato',
    fontSize: 28,
    lineHeight: '42px',
    cursor: 'pointer',
//  paddingTop: 14,
//  marginTop: '20px',
    color: colors.blue,
    '@media (max-width: 1024px)': {
      width: 'auto',
    },
    '@media (max-width: 480px)': {
      width: '94%',
    },
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
    cursor: 'pointer'
  },
  arrow: {
    marginLeft: 5
  },
  checkboxRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
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
