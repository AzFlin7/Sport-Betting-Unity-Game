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

/*
const GET_PAID = 0;
const PARTICIPATE_AND_PAY = 1;
const PARTICIPATE_FOR_FREE = 2;
*/

let styles;
class Price extends PureComponent {
  state = {
    dropdownOpen: false,
    free: true,
    organizer: '',
    participatingOption: "0"
  }

  componentDidMount() {
    window.addEventListener('click', this._onClickOutside);
    if (this.props.price && this.props.price.cents > 0) {
      this.setState({free:false});
      if (this.props.organizerParticipates) {
        if (this.props.organizerParticipation > 0)
          this.setState({participatingOption:"1"})
        else
          this.setState({participatingOption:"2"})
      }
    }

  }


  componentWillUnmount() {
    window.removeEventListener('click', this._onClickOutside);
  }


  _onClickOutside = (event) => {
    const { dropdownOpen } = this.state;
    if (dropdownOpen) {
      if (!this._containerNode.contains(event.target)) {
        if (this.props.price.cents == 0) {
          this.setState({free: true});
        }
        this._closeDropdown();
      }
    }
  }

  _handleFreeChange = checked => {
    const { onPriceChange, onVenueChange, price, venue } = this.props;
    this.setState({ free: checked });

    onPriceChange({
      ...price,
      cents: 0,
    });

    onVenueChange({
      ...venue,
      cents: 0,
    });
  }


  _handlePriceChange = event => {
    const { onPriceChange, price } = this.props;
    onPriceChange({
      ...price,
      cents: Number(event.target.value),
    });
  }

  _handleVenueChange = event => {
    this.props.onVenueChange({
      ...this.props.venue,
      cents: event.target.value,
    });
  }

  _handleParticipatingOptionChange = (event) => {
    this.setState({
      participatingOption: event.target.id
    });

    if (event.target.id !== "1")
      this.props.onOrganizerParticipationChange(0);

    if (event.target.id !== "0")
      this.props.onOrganizerParticipateChange(true);
    else
      this.props.onOrganizerParticipateChange(false);
  }

  _handleOrganizerParticipationChange = event => {
    this.props.onOrganizerParticipationChange(Number(event.target.value))
  }


  _openDropdown = () => {
    this.refs._inputNode._focus();
    this.setState({ dropdownOpen: true });
  }


  _closeDropdown = () => {
    //this.refs._inputNode._onBlur();
    this.setState({ dropdownOpen: false });
  }


  _handleChange = () => {

  }

  _calcFinalPrice(price, participantRange) {

    if (this.props.disabled && !this.props.isModifying) return ;

    if (!participantRange) return price;

    if (this.state.free) return localizations.newSportunity_free;

    return `${price} ${this.props.userCurrency} / participant.`;
  }

  _renderSportunityFeesExplaination = () => {
    return (
      <span style={styles.policy} data-tip={localizations.event_confirmation_popup_cancellation_policy_details}>


      </span>
    )
  }

  _calculateMinMaxRevenue(price, participantRange, organizerParticipation, fees) {

    if (participantRange.from === participantRange.to) {
      return (
        <span>
          <ReactTooltip effect="solid" multiline={true}/>
          {localizations.newSportunity_revenues}: {(Math.round((participantRange.from * price * (1 - fees) + organizerParticipation) * 100) / 100).toFixed(2) + ' ' + this.props.userCurrency}.
          <br/>
          <span style={styles.policy} data-tip={localizations.newSportunity_sportunity_fees_explaination}>
            <i
              style={styles.policyIcon}
              className="fa fa-question-circle"
              aria-hidden="true"
            />
            {localizations.newSportunity_sportunity_fees_text}: {(Math.round((participantRange.from * price *  fees) * 100) / 100).toFixed(2) + ' ' + this.props.userCurrency}
          </span>
        </span>
      )
    }

    return (
      <span>
        <ReactTooltip effect="solid" multiline={true}/>
        {localizations.newSportunity_min_revenue} {(Math.round((participantRange.from * price * (1 - fees) + organizerParticipation) * 100 ) /100).toFixed(2) + ' ' + this.props.userCurrency}
        <br/>
        {localizations.newSportunity_max_revenue} {(Math.round((participantRange.to * price * (1 - fees) + organizerParticipation) * 100) / 100).toFixed(2) + ' ' + this.props.userCurrency}
        <br/>
        <span style={styles.policy} data-tip={localizations.newSportunity_sportunity_fees_explaination}>
            <i
              style={styles.policyIcon}
              className="fa fa-question-circle"
              aria-hidden="true"
            />
          {localizations.newSportunity_sportunity_fees_text}: {localizations.newSportunity_min} {(Math.round((participantRange.from * price *  fees) * 100) / 100).toFixed(2) + ' ' + this.props.userCurrency} - {localizations.newSportunity_max} {(Math.round((participantRange.to * price *  fees) * 100) / 100).toFixed(2) + ' ' + this.props.userCurrency}
        </span>
      </span>
    );
  }


  render() {
    const { price, fees, organizerParticipation, participantRange, placeholder, disabled, isModifying, required } = this.props;

    const triangleStyle = this.state.dropdownOpen ? styles.triangleOpen : styles.triangle ;
    const finalTriangleStyle = {
        ...triangleStyle,
        borderBottomColor: this.state.dropdownOpen ? colors.green : colors.blue
    }

    return (
      <div style={styles.container} ref={node => { this._containerNode = node; }}>
        <Input
          label={localizations.newSportunity_price}
          ref="_inputNode"
          placeholder={placeholder}
          disabled={disabled}
          onFocus={this._openDropdown}
          value={this._calcFinalPrice(price.cents, participantRange)}
          required={required}
          readOnly
        />
        <span style={finalTriangleStyle} onClick={this._openDropdown}/>
        {!this.state.free &&
          <div style={styles.revenues}>
            {this._calculateMinMaxRevenue(price.cents, participantRange, organizerParticipation, fees)}
          </div>
        }
        <Dropdown
          style={styles.dropdown}
          open={this.state.dropdownOpen}
        > 
          <div style={styles.dropdownContent} onKeyPress={e => e.key === 'Enter' && this._closeDropdown()}>
            <div style={styles.row}>
              <span style={styles.label}>{localizations.newSportunity_free}</span>
              <Switch
                containerStyle={styles.switch}
                checked={this.state.free}
                onChange={this._handleFreeChange}
              />
            </div>
            {this.state.free ||
              <div>
                <div style={styles.row}>
                  <span style={styles.label}>
                    {localizations.newSportunity_pricePer}:
                  </span>
                  <input
                    type="number"
                    style={styles.price}
                    value={price.cents}
                    onChange={this._handlePriceChange}
                  />
                </div>
              </div>
            }
          </div>
        </Dropdown>
      </div>
    );
  }
}

styles = {
  container: {
    width: '100%',
    position: 'relative',
    marginBottom: 25,
  },

  triangle: {
    position: 'absolute',
    right: 0,
    top: 35,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    cursor: 'pointer',

    color: colors.blue,

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px
     solid ${colors.blue}`,
  },
  triangleOpen: {
    position: 'absolute',
    right: 0,
    top: 35,
    width: 0, 
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    cursor: 'pointer',
    
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `8px solid ${colors.blue}`,
  },

  switch: {
    marginLeft: 20,
  },

  dropdown: {
    position: 'absolute',
    top: 70,
    width: '100%',
    overflow: 'hidden',
  },

  dropdownContent: {

  },

  row: {
    position: 'relative',
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  label: {
    fontSize: 18,
    fontFamily: 'Lato',
    color: '#515151',
  },

  organizer: {
    display: 'block',
    fontSize: 18,
    fontFamily: 'Lato',
    color: '#515151',
    marginBottom: 10,
  },

  price: {
    width: 96,
    height: 36,

    border: '2px solid #5E9FDF',
    borderRadius: '3px',
    textAlign: 'center',

    fontFamily: 18,
    lineHeight: 1,

    color: 'rgba(146,146,146,0.87)',
  },

  participation: {
    position: 'absolute',
    left: 250,
    top: 150,
    marginLeft: 20,

    width: 96,
    height: 36,

    border: '2px solid #5E9FDF',
    borderRadius: '3px',
    textAlign: 'center',

    fontFamily: 18,
    lineHeight: 1,

    color: 'rgba(146,146,146,0.87)',
  },

  revenues: {
    fontSize: 18,
    marginTop: 10,
    fontFamily: 'Lato',
    lineHeight: 1.5
  },

  cost: {
    color: colors.blue,
    fontFamily: 'Lato',
    fontSize: fonts.size.xl,
    marginLeft: 8,
    border: 'none',
    width: 96,
  },

  checkboxList: {
  },

  checkbox: {
    fontSize: 16,
    marginBottom: 10,
  },
  policy: {
    cursor: 'pointer'
  },
  policyIcon: {
    marginRight: 5
  },
};


const dispatchToProps = (dispatch) => ({
})
  
const stateToProps = (state) => ({
    userCurrency: state.globalReducer.userCurrency,
})

export default connect(
    stateToProps,
    dispatchToProps
)(Radium(Price));