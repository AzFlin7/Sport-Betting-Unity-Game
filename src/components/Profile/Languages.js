import React, { Component } from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import cloneDeep from 'lodash/cloneDeep';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Select from 'react-select'

import * as types from '../../actions/actionTypes.js'
import localizations from '../Localizations'
import { fonts, metrics, colors, appStyles } from '../../theme';

let styles;

const isolanguages = require('@cospired/i18n-iso-languages')
isolanguages.registerLocale(require("@cospired/i18n-iso-languages/langs/en.json"))
isolanguages.registerLocale(require("@cospired/i18n-iso-languages/langs/fr.json"))
isolanguages.registerLocale(require("@cospired/i18n-iso-languages/langs/de.json"))

class Languages extends PureComponent {

  constructor() {
    super();
    this.state = {
      sport: {},
      languages: [],
    }
  }

  componentDidMount() {
    const languageIds = this.props.meLanguages.map(language =>
      ({
        code: language.code,
        id: language.id,
        label: isolanguages.getName(language.code, localizations.getLanguage()), //language.name,
        name: language.name,
        value: language.name,
      }))
    this.setState({
      languages: languageIds,
    });
    this._updateLanguages(languageIds)
  }

  _updateLanguages = (newLanguages) => {
    const { onChange } = this.props;
    const languageIds = [];
    for (let language of newLanguages){
      languageIds.push(language.id);
    }
    this.props._updateLanguagesAction(languageIds);

    this.setState({
      languages: newLanguages,
    }, () => {
      if (typeof onChange === 'function') {
        onChange(newLanguages);
      }
    });
  }

  render() {
    const options = cloneDeep(this.props.languages);

    for (let option of options) {
      option.value = option.name;
      option.label = isolanguages.getName(option.code, localizations.getLanguage());
    }

    if (this.props.hideTitle) {
      return (
        <Select
          styles={this.props.styles}
          placeholder=''
          value={this.state.languages}
          options={options}
          onChange={this._updateLanguages}
          isMulti
        />
      )
    }

    return (
      <div style={styles.container}>
        <h2 style={styles.h2}>{localizations.profile_language}</h2>

        <label style={appStyles.textareaLabel}>
          <div style={styles.selectContainer}>
            <Select
              style={styles.select}
              placeholder=''
              value={this.state.languages}
              options={options}
              onChange={this._updateLanguages}
              isMulti
            />
          </div>
        </label>
        {/*<button style={styles.addButton}>Add language</button>*/}

      </div>
    );
  }
}

// export default Languages

const _updateLanguagesAction = (languageIds) => ({
  type: types.UPDATE_PROFILE_LANGUAGES,
  languageIds,
});

const stateToProps = (state) => ({
  languageIds: state.profileReducer.languageIds,
  submittedLanguages: state.profileReducer.submittedLanguages,
})

const dispatchToProps = (dispatch) => ({
  _updateLanguagesAction: bindActionCreators(_updateLanguagesAction, dispatch),
})

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(Languages)


// This is fragment of data that we need
// viewer will be updated and data will be sent from Profile.js after the query

export default createFragmentContainer(ReduxContainer, {
  languages: graphql`
    fragment Languages_languages on Language @relay(plural: true) {
      id,
      code,
      name,
    }
  `,
});

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
    marginBottom: metrics.margin.xxl,
  },
  h2: {
    fontSize: fonts.size.xl,
    color: colors.blue,
    fontWeight: fonts.size.xl,
    marginTop: metrics.margin.medium,
    marginBottom: metrics.margin.medium,
  },
  selectContainer: {
    borderBottomWidth: metrics.border.small,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.blue,
  },
  select: {
    border: 0,
    fontSize: fonts.size.medium,
    // color: 'rgba(255,255,255,0.65)',
  },
  addButton: {
    backgroundColor: colors.blue,
    color: colors.white,
    fontSize: fonts.size.small,
    padding: metrics.padding.tiny,
    borderRadius: metrics.radius.tiny,
    marginTop: metrics.margin.medium,
    alignSelf: 'flex-start',
    outline: 'none',
  },


}
