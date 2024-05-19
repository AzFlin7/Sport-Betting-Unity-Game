import React from 'react'
import { appStyles, colors } from '../../theme'
import ToggleDisplay from 'react-toggle-display'
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
let styles

class MultiSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      openOptions: false,
      selectedLabels: '',
    }
  }

  _onFocus = () => {
    this.setState({ openOptions: true })
  }

  _onSave = () => {
    this.setState({ openOptions: false })
    this._setSelectedLabels()
  }

  _selectedChanged = (value) => {
    //this.setState({ selectedValues: value })
    this.props.onChange(value)
    this._setSelectedLabels()
  }

  _setSelectedLabels = () => {
    let list = this.props.allOptions.filter(option => 
      this.props.selectedOptions.indexOf(option.value) > -1)
      .map(elem => elem.label).join(', ')
    this.setState({
      selectedLabels: list,
    })
  }

  componentDidMount = () => {
    this._setSelectedLabels()
  }

  render() {
    const { props } = this
    return(
      <section>
        <div>
          <label style={appStyles.inputLabel}>{props.label}</label>
          <input 
            type='text' 
            style={appStyles.input} 
            placeholder={props.placeholder}
            disabled={props.disabled}
            onFocus={this._onFocus}
            value={this.state.selectedLabels}
            />
        </div>
        <ToggleDisplay show={this.state.openOptions}>
          <div style={styles.optionsContainer} >
            <CheckboxGroup value={this.props.selectedOptions} onChange={this._selectedChanged} >
              {this.props.allOptions.map(option => 
                <div style={styles.itemContainer}>
                  <div style={styles.item}>{option.label}</div>
                  <Checkbox style={styles.checkBox} value={option.value}/>
                </div>
              )}
            </CheckboxGroup>
            <div style={styles.button} onClick={this._onSave}>Save</div>
          </div>
        </ToggleDisplay>
      </section>
    )
  }
}

export default MultiSelect

styles = {
  optionsContainer: {
    minWidth: '350px',
    backgroundColor: colors.white,
    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    borderStyle: 'border',
    borderWidth: '2px',
    borderColor: colors.blue,
    borderRadius: '3px',
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
    zIndex: 100,
  },
  
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginTop: 14,
  },
  item: {
    color: colors.black,
    fontFamily: 'Lato',
    fontSize: 18,
    flex: 5,
  },
  checkBox: {
    flex: 1,
    width: 18,
    height: 18,
    backgroundColor: '#5E9FDF',
  },
  button: {
		padding: '5px 12px 5px 12px',
		backgroundColor: colors.blue,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 15,
    marginBottom: 10,
    cursor: 'pointer',
		lineHeight: '27px',
  },
}