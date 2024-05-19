import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium, {Style} from 'radium';
import { colors } from '../../theme';

let styles;

class Input extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      event: null,
      isFocused: false
    }
  }

  componentDidMount() {
    this.setState({
      value: this.props.value
    })
    this.props.onRef && this.props.onRef(this)
    window.addEventListener('click', this._handleClickOutside);
  }

  componentWillUnmount() {
    this.props.onRef && this.props.onRef(undefined)
    window.removeEventListener('click', this._handleClickOutside);
  }

  _handleTextChange = e => {
    this.setState({value: e.target.value, event: e})
    //if (this.props.livechange) {
      this.props.onChange({target:{value: e.target.value}})
      //setTimeout(() => this._focus(), 10); 
    //}
  }

  _focus() {
    this.setState({isFocused: true})
    if (!!this._inputNode)
      this._inputNode.focus();
    else if (!!this.props.reference) 
      this.props.reference.focus()
    
  }

  onValidate = (event) => {
    // if (event.key === 'Tab') {
    //   !!event && event.preventDefault();
    //   !!event && event.stopPropagation();
    //   this.props.onChange({target:{value: this.state.value}})
    //   this.setState({isFocused: false})
    // }
  }

  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      if (this.state.isFocused) {
        !!event && event.preventDefault();
        !!event && event.stopPropagation();
        this.setState({isFocused: false})

        if (this.state.value !== '' && this.props.value !== this.state.value) 
          this.props.onChange({target:{value: this.state.value}})
      }
    }
    else if (!this.state.isFocused)
      this._focus()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({value: nextProps.value})
    }
  }

  render() {

    const { label, value, containerStyle, placeholder, onChange, ref, onClick, onKeyPress, errorMessage, readOnly, onRef, error, disabled, rowed,color, livechange, ...rest } = this.props;
    const validLabel = typeof label === 'string' && !!label.trim().length;
    const finalContainerStyle = Object.assign({}, rowed ? styles.rowedContainer : styles.container, containerStyle);
    
    let errMsg;

    if (errorMessage) {
      errMsg = <div style={styles.errMsgStyle}> {errorMessage} </div>;
    } else {
      errMsg = <div> </div>;
    }

    if(color){
      styles.input.color = color ;
      styles.focusedInput.color = color ;
      styles.inputError.color = color ;
      styles.readOnlyInput.color = color ;
      
      } else{
      styles.input.color = 'rgba(0, 0, 0, 0.64)';
    }
    
    return (
      <div style={finalContainerStyle} ref={node => { this._containerNode = node; }}>
        {validLabel &&
          <label style={disabled ? styles.disabledLabel : styles.label}>{label}</label>
        }
        {disabled 
        ? <Style scopeSelector='.inputClass::-webkit-input-placeholder' rules={{color: '#BBB'}} /> 
        : null 
        }       

        {this.props.type === "textarea"
        ? <textarea
            className={disabled ? 'inputClass' : null}
            style={error ? styles.inputError : readOnly ? this.state.isFocused ? styles.focusedInput : styles.readOnlyInput : styles.input }
            value={this.state.value}
            placeholder={placeholder}
            onChange={this._handleTextChange}
            onKeyDown={e => e.key === 'Tab' && this.onValidate(e)}
            readOnly={readOnly}
            rows="4"
            disabled={disabled}
            onBlur={this._onBlur}
            onClick={onClick}
            ref={onRef ? onRef : (node) => {this._inputNode = node}}
            {...rest}
          />
        : this.props.type === "number"
          ? <input
              style={styles.number}
              type="number"
              value={this.state.value}
              onBlur={this._onBlur}
              onClick={onClick}
              onChange={this._handleTextChange}
              onKeyDown={e => e.key === 'Tab' && this.onValidate(e)}
              disabled={disabled}
              ref={onRef ? onRef : (node) => {this._inputNode = node}}
              {...rest}
            />
          : <input
              className={disabled ? 'inputClass' : null}
              style={error ? styles.inputError : readOnly ? this.state.isFocused ? styles.focusedInput : styles.readOnlyInput : styles.input }
              value={this.state.value}
              placeholder={placeholder}
              onChange={this._handleTextChange}
              readOnly={readOnly}
              disabled={disabled}
              onBlur={this._onBlur}
              onFocus={() => this.setState({isFocused: true})}
              onKeyDown={e => e.key === 'Tab' && this.onValidate(e)}
              onClick={onClick}
              ref={onRef ? onRef : (node) => {this._inputNode = node}}
              {...rest}
            />
        }
        {errMsg}
      </div>
    );
  }
}

Input.defaultProps = {
  placeholder: 'Select',
}


styles = {
  container: {
    width: '100%',
    fontFamily: 'Lato',
  },


  number: {
    display: 'inline-block',
    height: 35,
    width: 60,
    borderRadius: 3,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 18,
    lineHeight: 1,
    marginLeft: 10,
    color: 'rgba(146,146,146,0.87)',
    border: 'none',
    backgroundColor: '#E2E2E2',
  },

  rowedContainer: {
    width: '100%',
    fontFamily: 'Lato',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },

  label: {
    display: 'block',
    color: '#353535',
    fontSize: 15,
    lineHeight: 1,
    marginBottom: 8,
    flex: 1
  },
  disabledLabel: {
    display: 'block',
    color: '#D1D1D1',
    fontSize: 15,
    lineHeight: 1,
    marginBottom: 8,
    flex: 1
  },

  inputError: {
    width: '100%',
    flex: 1,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.red,
    paddingRight: 20,

    fontSize: 15,
    fontFamily: 'Lato',
    lineHeight: 1,
    color: 'rgba(0, 0, 0, 0.64)',

    paddingBottom: 8,

    outline: 'none',

    cursor: 'pointer',

    ':disabled': {
      borderBottomColor: '#D1D1D1',
      backgroundColor: 'transparent',
    },
  },

  readOnlyInput: {
    width: '100%',
    flex: 1,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    paddingRight: 20,

    fontSize: 15,
    fontFamily: 'Lato',
    lineHeight: 1,
    color: 'rgba(0, 0, 0, 0.64)',

    paddingBottom: 8,

    outline: 'none',

    cursor: 'pointer',

    ':disabled': {
      borderBottomColor: '#D1D1D1',
      backgroundColor: 'transparent',
    },
  },

  input: {
    width: '100%',
    flex: 1,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    paddingRight: 20,

    fontSize: 15,
    fontFamily: 'Lato',
    lineHeight: 1,
    color: 'rgba(0, 0, 0, 0.64)',

    paddingBottom: 8,

    outline: 'none',

    background: 'transparent',

    ':focus': {
      borderBottomColor: colors.green
    },

    ':disabled': {
      borderBottomColor: '#D1D1D1',
      backgroundColor: 'transparent',
    },
    '::-webkit-input-placeholder': {
      color: '#6D6D6D',
      fontSize: 10,
    },
    '::placeholder': {
      color: '#6D6D6D',
      fontSize: 10,
    },
    
  },
  focusedInput: {
    width: '100%',
    flex: 1,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.green,
    paddingRight: 20,

    fontSize: 15,
    fontFamily: 'Lato',
    lineHeight: 1,
    color: 'rgba(0, 0, 0, 0.64)',

    paddingBottom: 8,

    outline: 'none',

    cursor: 'pointer',

    ':disabled': {
      borderBottomColor: '#D1D1D1',
      backgroundColor: 'transparent',
    },
  },
  errMsgStyle: {
    color: colors.red,
    fontSize: 15,
  }
}


export default Radium(Input);
