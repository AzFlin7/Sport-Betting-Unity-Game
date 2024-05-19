import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Geosuggest from 'react-geosuggest'

import localizations from '../Localizations'

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
});

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
      error={props.selectProps.error}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const DropdownIndicator = (props) => {
  return <ArrowDropDownIcon color="action" {...props} />
}

const components = {
  Control,
  Menu,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
  DropdownIndicator
};

class IntegrationReactSelect extends React.Component {
  state = {
    single: null,
    multi: null,
    inputContent: '',
    locationSuggestions: [],
  };

  onInputChange = text => {
      if (text && text.length > 0) {
        this.setState({inputContent: text})
        this._geoSuggest.onInputChange(text)
      }
  }

  changeSuggestions = (suggestions) => {
    this.setState({
        locationSuggestions: suggestions.map(item => ({value: item.label, label: item.label}))
    })
  }

  handleKeyDown = e => {
    const { value } = this.props
    
    if (e.which === 8 && value && value.length >= 1) {
      this.setState({inputContent: value.substring(0, value.length - 1)})
      this.props.onChange(value.substring(0, value.length - 1));
      e.preventDefault() ; 
      e.stopPropagation(); 
    }
  }

  selectValue = value => {
    this.props.onChange(value);
    this.setState({inputContent: value.value})
  }

  render() {
    const { classes, theme } = this.props;

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    return (
      <div className={classes.root}>
        <NoSsr>
            <div style={{display: 'none'}}>
                <Geosuggest
                    ref={el=>this._geoSuggest=el}
                    placeholder={localizations.find_cityHolder}
                    initialValue={this.state.inputContent}
                    onUpdateSuggests={(e, t) => this.changeSuggestions(e)}
                />
            </div>
            <Select
                classes={classes}
                styles={selectStyles}
                options={this.state.locationSuggestions}
                components={components}
                inputProps={this.props.inputProps}
                value={this.props.value ? {label: this.props.value, value: this.props.value} : null}
                onInputChange={this.onInputChange}
                onChange={this.selectValue}
                placeholder={localizations.find_cityHolder}
                error={this.props.error}
                isSearchable={true}
                onKeyDown={this.handleKeyDown}
            />
        </NoSsr>
      </div>
    );
  }
}

IntegrationReactSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(IntegrationReactSelect);
