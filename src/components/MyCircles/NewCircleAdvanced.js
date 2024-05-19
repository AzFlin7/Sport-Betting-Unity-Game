import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Switch from '../common/Switch';
import InputSelect from '../common/Inputs/InputSelect'
import { colors, fonts } from '../../theme'
import localizations from '../Localizations'
import SportSelect from "./SportSelect";
import Geosuggest from 'react-geosuggest'

let styles
class NewCircleAdvanced extends React.Component {
  constructor(props) {
    super(props)
    this.state =  {
      allSportsLoaded: false
    }
  }

  componentDidMount() {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables, 
      queryLanguage: localizations.getLanguage().toUpperCase()
    }))
  }

  _updateSportFilter = (name) => {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      filter: {
        name: name,
        language: localizations.getLanguage().toUpperCase()
      },
    }))
  };

  _handleLoadAllSports = () => {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables, 
      filter: {
        name: '' ,
        language: localizations.getLanguage().toUpperCase()
      },
      first: 100
    }));
    this.setState({
      allSportsLoaded: true,
    })
  };

  _translatedName = (name) => {
    let translatedName = name.EN;
    switch(localizations.getLanguage().toLowerCase()) {
      case 'en':
        translatedName = name.EN;
        break;
      case 'fr':
        translatedName = name.FR || name.EN;
        break;
      case 'it':
        translatedName = name.IT || name.EN;
        break;
      case 'de':
        translatedName = name.DE || name.EN;
        break;
      default:
        translatedName = name.EN;
        break
    }
    return translatedName
  };

  render() {
    const {viewer} = this.props ;

    let sportsList =
      this.props.viewer.newCircleSports.edges.map(({node}) => ({...node, name: this._translatedName(node.name), value: node.id}));

    return(
        <section>
            <div style={styles.checkboxSection}>
              <div style={styles.checkboxRow}>
                <div style={styles.checkboxLabel}>
                  <div><span style={styles.checkboxTitle}>{localizations.find_sport + ': '}</span></div>
                </div>
                <SportSelect
                  label={localizations.find_sport}
                  onChange={this.props.onChangeNewCircleSport}
                  onSearching={this._updateSportFilter}
                  list={sportsList}
                  placeholder={localizations.find_sportHolder}
                  onLoadAllClick={this._handleLoadAllSports}
                  allSportLoaded={this.state.allSportsLoaded}
// TODO props.relay.* APIs do not exist on compat containers
                  loadingAllSports={this.props.relay.pendingVariables}
                  value={this.props.newCircleSport ? this.props.newCircleSport.name : ''}
                  //isError={isSportError}
                />
              </div>

              <div style={styles.checkboxRow}>
                <div style={styles.checkboxLabel}>
                  <div><span style={styles.checkboxTitle}>{localizations.find_city + ': '}</span></div>
                </div>
                <Geosuggest
                  style={inputStyles}
                  placeholder={localizations.circle_address}
                  initialValue={this.props.newCircleAddress ? this.props.newCircleAddress.city + ', ' + this.props.newCircleAddress.country : ""}
                  onSuggestSelect={this.props.onChangeNewCircleAddress}
                  location={this.props.userLocation}
                  radius={50000}
                />
              </div>

                <div style={styles.checkboxRow}>
                    <div style={styles.checkboxLabel}>
                        {this.props.newCirclePublic 
                        ? <div><span style={styles.checkboxTitle}>{localizations.circle_public + ': '}</span>{localizations.circle_public_explaination}</div>
                        : <div><span style={styles.checkboxTitle}>{localizations.circle_publicFalse + ': '}</span>{localizations.circle_publicFalse_explaination}</div>
                        }
                    </div>
                    <Switch
                        checked={this.props.newCirclePublic}
                        onChange={this.props.onChangeNewCirclePrivacy}
                    />
                </div>

                <div style={styles.checkboxRow}>
                    <div style={this.props.newCirclePublic ? styles.checkboxLabelDisabled : styles.checkboxLabel}>
                        {this.props.newCircleInvitationWithLink 
                        ? <div><span style={styles.checkboxTitle}>{localizations.circle_accessibleFromUrl + ': '}</span>{localizations.circle_accessibleFromUrlExplanation}</div>
                        : <div><span style={styles.checkboxTitle}>{localizations.circle_accessibleFromUrlFalse + ': '}</span>{localizations.circle_accessibleFromUrlFalseExplanation}</div>
                        }
                    </div>
                    <Switch
                        checked={this.props.newCircleInvitationWithLink}
                        onChange={this.props.onChangeNewCircleInvitationWithLink}
                        disabled={this.props.newCirclePublic}
                    />
                </div>

                <div style={styles.checkboxRow}>
                    <div style={styles.checkboxLabel}>
                        {this.props.newCircleShared 
                        ? <div><span style={styles.checkboxTitle}>{localizations.circle_usable_by_members + ': '}</span>{localizations.circle_usable_by_membersExplanation}</div>
                        : <div><span style={styles.checkboxTitle}>{localizations.circle_usable_by_membersFalse + ': '}</span>{localizations.circle_usable_by_membersFalseExplanation}</div>
                        }
                    </div>
                    <Switch
                        checked={this.props.newCircleShared}
                        onChange={this.props.onChangeNewCircleShared}
                    />
                </div>          
            </div>
        </section>
    )
  }
}

styles = {
  label: {
    fontFamily: 'Lato',
    color: colors.blue,
    fontSize: 14,
    marginTop: 15,
    cursor: 'pointer',
  },
  checkboxSection: {
    marginTop: 40,
    marginRight: 15,
    //padding: '25px 20px'
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
  checkboxLabelDisabled: {
    fontFamily: 'Lato',
    fontSize: 14, 
    color: colors.gray,
    flex: 5,
    marginRight: 10
  },
  checkboxTitle: {
    fontWeight: 'bold'
  },
  checkBox: {
    width: 18,
    height: 18,
    border: '2px solid #5E9FDF',
    display: 'block',
    cursor: 'pointer',
    marginLeft: 15,
    flex: 1
  },
};

let  inputStyles = {
  'input': {
    width: 240,
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
    //marginLeft: 20,
    marginRight: 10,
    paddingRight: 20,
  },
  'suggests': {
    // width: '100%',
    width: 300,
    position: 'absolute',
    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: 20,
    zIndex: 100,
  },
  'suggests--hidden': {
    width: '0',
    display: 'none',
  },
  'suggestItem': {
    paddingTop: 10,
    paddingBottom: 10,
    color: '#515151',
    fontSize: 18,
    fontWeight: 500,
    fontFamily: 'Helvetica Neue',
  },

};

const dispatchToProps = (dispatch) => ({
})
  
const stateToProps = (state) => ({
    userLocation: state.globalReducer.userLocation,
})

let ReduxContainer = connect(
    stateToProps,
    dispatchToProps
)(Radium(NewCircleAdvanced));

export default createRefetchContainer(ReduxContainer, {
//OK
  viewer: graphql`
    fragment NewCircleAdvanced_viewer on Viewer @argumentDefinitions(
      first: { type: "Int", defaultValue: 10 }
      filter: { type: "SportFilter"}
      queryLanguage: { type: "SupportedLanguage", defaultValue: "EN" }
    ){
      newCircleSports: sports(first:$first, filter:$filter, language: $queryLanguage) {
        edges {
          node {
            id
            name {
              id
              EN
              FR
            }
            logo
            status
            levels {
              id
              EN {
                name
                skillLevel
                description
              }
              FR {
                name
                skillLevel
                description
              }
              DE {
                name
                skillLevel
                description
              }
            }
          }
        }
      }
    }
  `,
},
graphql`
query NewCircleAdvancedRefetchQuery(
  $first: Int
  $filter: SportFilter
  $queryLanguage: SupportedLanguage
) {
viewer {
    ...NewCircleAdvanced_viewer
    @arguments(
      first: $first
      filter: $filter
      queryLanguage: $queryLanguage
    )
}
}
`,
)
