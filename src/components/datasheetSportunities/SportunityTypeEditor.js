import React, { PureComponent } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import ReactSelect from 'react-select';
import environment from 'sportunity/src/createRelayEnvironment';
import localizations from '../Localizations';

const TAB_KEY = 9;
const ENTER_KEY = 13;

export class SportunityTypeEditor extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.noOptionsMessage = this.noOptionsMessage.bind(this);
    this.state = {};
  }

  handleChange(opt) {
    const { onCommit, onRevert } = this.props;
    if (!opt) {
      return onRevert();
    }
    const { e } = this.state;
    onCommit(opt.value, e);
  }

  handleKeyDown(e) {
    // record last key pressed so we can handle enter
    if (e.which === ENTER_KEY || e.which === TAB_KEY) {
      e.persist();
      this.setState({ e });
    } else {
      this.setState({ e: null });
    }
  }

  noOptionsMessage() {
    if (
      this.props.cell &&
      this.props.cell.sport &&
      this.props.cell.sport.sport
    ) {
      return 'No type for this sport';
    } else {
      return 'Select sport first';
    }
  }

  render() {
    const LANG = localizations.getLanguage().toUpperCase();
    let sportType = 'OTHER';
    if (
      this.props.cell &&
      this.props.cell.sport &&
      this.props.cell.sport.sport &&
      this.props.cell.sport.sport.type
    ) {
      sportType = this.props.cell.sport.sport.type;
    }
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query SportunityTypeEditorDatasheet_Query(
            $sportType: SportTypeEnum!
          ) {
            viewer {
              sportunityTypes(sportType: $sportType) {
                id
                name {
                  EN
                  FR
                }
              }
            }
          }
        `}
        variables={{ sportType }}
        render={({ error, props }) => {
          if (!props || error) {
            return null;
          }
          let options = [];
          if (props && props.viewer && props.viewer.sportunityTypes) {
            options = props.viewer.sportunityTypes.map(i => ({
              value: i,
              label: i.name[LANG] || i.name.EN,
            }));
          }
          return (
            <ReactSelect
              autoFocus
              openOnFocus
              defaultMenuIsOpen
              options={options}
              onInputKeyDown={this.handleKeyDown}
              onChange={this.handleChange}
              noOptionsMessage={this.noOptionsMessage}
              components={{ Control: () => null }}
            />
          );
        }}
      />
    );
  }
}
