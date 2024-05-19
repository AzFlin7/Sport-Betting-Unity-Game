import React, { PureComponent } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import AsyncCreatableSelect from 'react-select/lib/AsyncCreatable';

const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

class OpponentEditorComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.loadOptions = this.loadOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
  }
  loadOptions(input, cb) {
    let requestUsersByEmail = false;
    let requestUsersAutocompletion = false;
    let pseudo = '';
    let sportId = '';
    let email = '';
    if (isEmail.test(input)) {
      requestUsersByEmail = true;
      email = input;
    } else {
      pseudo = input;
      requestUsersAutocompletion = true;
      sportId: this.props.sportId ? this.props.sportId : null;
    }
    this.props.relay.refetch(
      {
        requestUsersByEmail,
        requestUsersAutocompletion,
        pseudo,
        sportId,
        email,
      },
      null,
      () => {
        //  cb here
        let users = [];
        if (
          this.props.viewer.opponents &&
          this.props.viewer.opponents.edges &&
          this.props.viewer.opponents.edges.length
        ) {
          users = [...users, ...this.props.viewer.opponents.edges];
        }
        if (
          this.props.viewer.users &&
          this.props.viewer.users.edges &&
          this.props.viewer.users.edges.length
        ) {
          users = [...users, ...this.props.viewer.users.edges];
        }
        if (
          this.props.viewer.usersByPseudo &&
          this.props.viewer.usersByPseudo.edges &&
          this.props.viewer.usersByPseudo.edges.length
        ) {
          users = [...users, ...this.props.viewer.usersByPseudo.edges];
        }
        cb(users.map(i => ({ label: i.node.pseudo, value: i.node })));
      },
      { force: true },
    );
  }

  handleChange(opt) {
    const { onCommit, onRevert } = this.props;
    if (!opt) {
      return onRevert();
    }
    const { e } = this.state;
    onCommit(opt.value, e);
  }

  handleCreate(inputValue) {
    const { onCommit } = this.props;
    const { e } = this.state;
    if (inputValue) {
      onCommit({ pseudo: inputValue }, e);
    }
  }

  render() {
    return (
      <AsyncCreatableSelect
        autoFocus
        openOnFocus
        defaultMenuIsOpen
        isClearable
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        onCreateOption={this.handleCreate}
        isValidNewOption={(inputValue, selectValue, selectOptions) => {
          const isNotDuplicated = !selectOptions
            .map(option => option.label)
            .includes(inputValue);
          const isNotEmpty = inputValue !== '';
          return isNotEmpty && isNotDuplicated;
        }}
      />
    );
  }
}

export const OpponentEditor = createRefetchContainer(
  OpponentEditorComponent,
  {
    viewer: graphql`
      fragment OpponentEditor_viewer on Viewer
        @argumentDefinitions(
          pseudo: { type: "String" }
          requestUsersAutocompletion: { type: "Boolean!", defaultValue: false }
          sportId: { type: "String" }
          email: { type: "String" }
          requestUsersByEmail: { type: "Boolean!", defaultValue: false }
        ) {
        me {
          id
        }
        opponents(sportId: $sportId, pseudo: $pseudo, first: 8)
          @include(if: $requestUsersAutocompletion) {
          edges {
            node {
              id
              avatar
              pseudo
            }
          }
        }
        users(email: $email, first: 10) @include(if: $requestUsersByEmail) {
          edges {
            node {
              id
              avatar
              pseudo
            }
          }
        }
        usersByPseudo: users(pseudo: $pseudo, first: 10)
          @include(if: $requestUsersAutocompletion) {
          edges {
            node {
              id
              avatar
              pseudo
            }
          }
        }
      }
    `,
  },
  graphql`
    query OpponentEditorRefetchQuery(
      $pseudo: String
      $requestUsersAutocompletion: Boolean!
      $sportId: String
      $email: String
      $requestUsersByEmail: Boolean!
    ) {
      viewer {
        ...OpponentEditor_viewer
          @arguments(
            pseudo: $pseudo
            requestUsersAutocompletion: $requestUsersAutocompletion
            sportId: $sportId
            email: $email
            requestUsersByEmail: $requestUsersByEmail
          )
      }
    }
  `,
);
