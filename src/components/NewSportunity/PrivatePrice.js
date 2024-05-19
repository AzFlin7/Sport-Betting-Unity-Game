import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Switch from '../common/Switch';

import Input from './Input';
import Dropdown from './Dropdown';
import Radio from './Radio';
import localizations from '../Localizations'
import { colors, fonts } from '../../theme';

let styles;
class PrivatePrice extends PureComponent {
  constructor(props) {
    super(props);
  }

  tableRowRender = () => {
    if(this.props.priceList instanceof Array){
      return this.props.priceList.map((object, i) => (
        <tr key={i}>
          <td style={{display: "flex", alignItems: "center", justifyContent: "flex-start"}}>
            <div style={styles.buttonIcon}>
              <img src="/images/Group.svg" width="50px" height="50px"/>
              <div style={styles.numberContainer}>
                <span style={styles.numberInCircle}>
                  {object.circle && object.circle.memberCount}
                </span>
              </div>
            </div>
            <div style={styles.circleName}>{object.circle.name}</div> 
          </td> 
          <td style={styles.tableNumber}>
            <input
              style={styles.number}
              type="number"
              value={object.price.cents}
              onChange={(e) => this.props.priceValueChangeByCommunity(object.circle,i, e) }
              maxLength={3}
              ref={(node) => this.props.onRefC(i, node)}
            /> 
            <span style={styles.currency}>{object.price.currency}</span>
          </td> 
        </tr>  
      ))
    }
  }

  render() {
    const { price, fees, organizerParticipation, participantRange, priceList,onRef, priceValueChange, priceValueChangeByCommunity, currency } = this.props;
  
    return (
      <div style={styles.container} ref={node => { this._containerNode = node; }}>
        <div style={styles.col} >
          <table style={{width: '100%'}}>
            <thead>
              <tr style={styles.tableTh}> 
                <th style={styles.tableThCol}>{localizations.newSportunity_invitedCircles}</th> 
                <th style={styles.tableThCol}>{localizations.event_price} </th> 
              </tr>
            </thead>
            <tbody>
              {this.tableRowRender()}
            </tbody>
          </table>
        </div>
       </div>
    );
  }
}

styles = {
  container: {
    width: '100%',
    position: 'relative',
    marginBottom: 25,
    display: 'flex',
  },

  col:{
    flex: 1,
  },
  number: {
      height: 24,
      width: 54,
      border: '0px solid #5E9FDF',
      borderRadius: 3,
      textAlign: 'center',
      fontSize: 16,
      fontFamily: 18,
      lineHeight: 1,
      color: 'rgba(146,146,146,0.87)',
      marginLeft: 10,
      marginRight: 10,
      backgroundColor:'#E2E2E2',
  },
  tableNumber: {
    position: 'relative',
    verticalAlign: 'middle  '
  },
  row: {
    position: 'relative',
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
  },
  rowResume: {
    position: 'relative',
    marginBottom: 24,
    alignItems: 'center',
  },

  label: {
    fontSize: 20,
    fontFamily: 'Lato',
    color: '#515151',
  },
  currency:{
    fontSize: 16,
    fontFamily: 'Lato',
    color: 'rgba(146,146,146,0.87)',
  },
  singleResume:{
    fontSize: 16,
    fontFamily: 'Lato',
    color: 'rgba(146,146,146,0.87)',
  },
  buttonIcon: {
    color: colors.blue,
    position: 'relative',
    display: 'flex',
    marginRight: 20,
    color: '#333',
    padding: '8px 5px',
  },
  numberContainer: {
    position: 'absolute',
    top: '28px',
    left: '15px',
    width: 30,
    textAlign: 'center',
    color: colors.darkGray
  },
  numberInCircle: {
    fontSize: 19,
    fontWeight: 'bold'
  },
  tableTh: {
    fontSize: 20,
    fontFamily: 'Lato',
    color: '#515151',
  },
  circleName: {
    color: colors.blue,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: '3px',
    marginLeft: '10px',
  },
  tableThCol: {
    textAlign: 'left',
    paddingBottom: '20px',
    paddingTop: '20px',
  },
  multiResume: {
    margin: '19px',
  },
  singleResume: {
    marginBottom: '5px',
    marginBottom: '5px',
    fontSize: '16px',
    color: 'rgba(146,146,146,0.87)',
  },
  pricebox: {
    podition: 'relative',
    top: -140,
  },
};




export default Radium(PrivatePrice);