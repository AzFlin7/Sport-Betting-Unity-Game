import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation RegisterEmailMutation($input: newUserInput!) {
		newUser(input: $input) {
			clientMutationId,
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        superUserToken: input.superUserTokenVar,
        user: {
          avatar: input.avatarVar,
          pseudo: input.pseudoVar,
          email: input.emailVar,
          password: input.passwordVar,
          phoneNumber: input.phoneVar,
          description: input.descriptionVar,
          birthday: input.birthdayVar,
          sex: input.sexVar,
          profileType: input.profileTypeVar,
          appLanguage: input.appLanguageVar,
          appCurrency: input.appCurrencyVar,
          appCountry: input.appCountryVar,
          subAccountsPseudoList: input.subAccountsPseudoListVar
        },
      }
    }, 
    onCompleted: (response, errors) => {
      if (errors) 
        onError(errors)
      else 
        onCompleted()
    },
		updater: (store, errors) => { 
		}, 
	}) 
} 

export default {commit}



/*;

export default class RegisterEmailMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      newUser
    }`;
  }

  getVariables() {
    return {
      superUserToken: this.props.superUserTokenVar,
      user: {
        avatar: this.props.avatarVar,
        pseudo: this.props.pseudoVar,
        email: this.props.emailVar,
        password: this.props.passwordVar,
        phoneNumber: this.props.phoneVar,
        description: this.props.descriptionVar,
        birthday: this.props.birthdayVar,
        sex: this.props.sexVar,
        profileType: this.props.profileTypeVar,
        appLanguage: this.props.appLanguageVar,
        appCurrency: this.props.appCurrencyVar,
        appCountry: this.props.appCountryVar,
	      subAccountsPseudoList: this.props.subAccountsPseudoListVar
      },
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on newUserPayload {
        clientMutationId,
        user,
        viewer
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [
        Relay.QL`
          fragment on newUserPayload {
            clientMutationId,
            viewer,
            user
          }
        `,
      ],
    }];
  }
}
*/