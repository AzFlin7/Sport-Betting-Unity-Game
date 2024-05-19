import React, { PureComponent } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import SelectAsync from 'react-select/lib/Async';
import _ from 'lodash';
import { withRouter } from 'found';
import localizations from '../../Localizations';
import { connect } from 'react-redux';
import { TextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

const ENTER_KEY = 13;

class SearchComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      isListOpen: false
    };
    this.loadOptions = this.loadOptions.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.Input = this.Input.bind(this);
    this.NoOptionsMessage = this.NoOptionsMessage.bind(this)
    this.LoadingMessage = this.LoadingMessage.bind(this);
  }

  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);

    if (this.props.match && this.props.match.location && this.props.match.location.query && this.props.match.location.query.q) {
      this.setState({value: this.props.match.location.query.q})
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }

  _handleClickOutside = (event) => {
    if (this._containerNode && !this._containerNode.contains(event.target)) {
      this.setState({ 
        isListOpen: false,
      });
    }
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.match.location.pathname === "/search" && nextProps.match.location.pathname !== "/search") {
      this.setState({value: ''})
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.search !== this.state.search) {
      const refetchVariables = fragmentVariables => ({
        ...fragmentVariables,
        sportunitiesFilter: { searchByName: this.state.search },
      });
      this.props.relay.refetch(refetchVariables);
    }
  }

  loadOptions(_, callback) {
    if (this.props.match.location.pathname === "/search") {
      callback();
      return ;
    }
    const { value } = this.state;
    this.props.relay.refetch(
      {
        sportunitiesFilter: { searchByName: value },
        circlesFilter: { nameCompletion: value, code: value, circleType: ["MY_CIRCLES", "CIRCLES_I_AM_IN", "CHILDREN_CIRCLES", "PUBLIC_CIRCLES", "OTHER_TEAMS_CIRCLES"] },
        usersFilter: value,
      },
      null,
      () => {
        let options = [];
        if (
          this.props.viewer &&
          this.props.viewer.sportunities &&
          this.props.viewer.sportunities.edges &&
          this.props.viewer.sportunities.edges.length
        ) {
          options = [
            ...options,
            ...this.props.viewer.sportunities.edges.map(i => ({
              label: i.node.title,
              value: `/event-view/${i.node.id}`,
            })),
          ];
        }
        if (
          this.props.viewer &&
          this.props.viewer.circles &&
          this.props.viewer.circles.edges &&
          this.props.viewer.circles.edges.length
        ) {
          options = [
            ...options,
            ...this.props.viewer.circles.edges.map(i => ({
              label: i.node.name,
              value: `/circle/${i.node.id}`,
            })),
          ];
        }
        if (
          this.props.viewer &&
          this.props.viewer.users &&
          this.props.viewer.users.edges &&
          this.props.viewer.users.edges.length
        ) {
          options = [
            ...options,
            ...this.props.viewer.users.edges.map(i => ({
              label: i.node.pseudo,
              value: `/profile-view/${i.node.id}`,
            })),
          ];
        }
        if (options.length) {
          options.push({
            label: localizations.search_see_all_results,
            value: `/search`,
            query: { q: value },
          });
        }
        callback(options);
      },
      { force: true },
    );
  }

  getValue = () => this.state.value

  Input(props) {
    return (
      <TextField
        fullWidth
        InputProps={{
          ...props,
          value: this.state.value,
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />
    );
  }

  IndicatorSeparator() {
    return null;
  }
  IndicatorsContainer() {
    return null;
  }
  NoOptionsMessage = () => {
    if (this.props.match.location.pathname === "/search") {
      return null;
    }
    else if (!this.state.value) {
      return null;
    }
    return <div style={{padding: '5px 10px'}}>{localizations.search_no_results}</div>;
  };
  LoadingMessage() {
    if (this.props.match.location.pathname === "/search") 
      return null; 
    else
      return <div style={{padding: '5px 10px'}}>{localizations.search_loading}</div>;
  }

  handleKeyDown(e) {
    const { value } = this.state;
    const { router } = this.props;
    
    if (e.which === ENTER_KEY && value) {
      router.push({ pathname: `/search`, query: { q: value } });
    }
    else if (e.which === 8 && value && value.length >= 1) {
      this.setState({value: value.substring(0, value.length - 1)})
      e.preventDefault() ; 
      e.stopPropagation(); 
    }
  }

  render() {
    const { router } = this.props;
    
    return (
      <div ref={node => { this._containerNode = node; }}>
        <SelectAsync
          value=""
          loadOptions={_.debounce(this.loadOptions, 500)}
          onInputChange={value => {
            if (this.state.value && this.state.value.length > 1 && value.length === 0)
              return 

            this.setState({ value });
          }}
          onChange={opt => {
            if (opt && opt.value) {
              this.setState({ isListOpen: false });
              router.push({
                pathname: `${opt.value}`,
                query: {
                  ...opt.query,
                },
              });
            }
          }}
          onKeyDown={this.handleKeyDown}
          menuIsOpen={this.state.isListOpen && this.state.value && this.props.match.location.pathname !== "/search"}
          components={{
            Input: this.Input,
            IndicatorsContainer: this.IndicatorsContainer,
            IndicatorSeparator: this.IndicatorSeparator,
            NoOptionsMessage: this.NoOptionsMessage,
            LoadingMessage: this.LoadingMessage,
          }}
          placeholder=""
          onFocus={() => this.setState({isListOpen: true})}
        />
      </div>
    );
  }
}

const stateToProps = state => ({
  language: state.globalReducer.language,
});
const dispatchToProps = () => ({});
const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(withRouter(SearchComponent));

export const Search = createRefetchContainer(
  ReduxContainer,
  {
    viewer: graphql`
      fragment Search_viewer on Viewer
        @argumentDefinitions(
          sportunitiesFilter: { type: Filter }
          circlesFilter: { type: CirclesFilter }
          usersFilter: { type: String }
        ) {
        sportunities(first: 3, filter: $sportunitiesFilter) {
          edges {
            node {
              id
              title
            }
          }
        }
        circles(first: 3, filter: $circlesFilter) {
          edges {
            node {
              id
              name
            }
          }
        }
        users(first: 3, pseudo: $usersFilter) {
          edges {
            node {
              id
              pseudo
            }
          }
        }
      }
    `,
  },
  graphql`
    query SearchRefetchQuery(
      $sportunitiesFilter: Filter
      $circlesFilter: CirclesFilter
      $usersFilter: String
    ) {
      viewer {
        ...Search_viewer
          @arguments(
            sportunitiesFilter: $sportunitiesFilter
            circlesFilter: $circlesFilter
            usersFilter: $usersFilter
          )
      }
    }
  `,
);
