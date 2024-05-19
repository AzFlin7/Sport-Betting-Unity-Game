import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Loading from 'react-loading';
import { withAlert } from 'react-alert'
//import ToggleDisplay from 'react-toggle-display'
import AddChildMutation from './AddChildMutation'
import { colors } from '../../theme'
import localizations from '../Localizations'


let styles

class Submit extends Component {

  constructor() {
    super();
    this.state = {
        isLoading: false,
    }
    this.alertOptions = {
      offset: 14,
      position: 'top right',
      theme: 'light',
      timeout: 100,
      transition: 'fade',
    };
  }

  isValidEmailAddress(address) {
    let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
    return re.test(address)
  }

  _submitUpdate = () => {
    this.props.onErrorChange(false)

    if (!this.props.user || this.props.user === '') {
        this.props.onErrorChange(true)
        return ;
    }

    if (!this.props.parent1 || this.props.parent1 === '' || (this.props.parent1.pseudo && !this.props.parent1.id) || (this.props.parent1.email && !this.isValidEmailAddress(this.props.parent1.email))) {
        this.props.onErrorChange(true)
        return ;
    }

    if (this.props.parent2 && this.props.parent2 !== '' && ((this.props.parent2.pseudo && !this.props.parent2.id) || (this.props.parent2.email && !this.isValidEmailAddress(this.props.parent2.email)))) {
        this.props.onErrorChange(true)
        return ;
    }

    const viewer = this.props.viewer
    const idVar = this.props.circleId
    this.setState({isLoading: true})

    AddChildMutation.commit({
        viewer,
        idVar,
        parent1IdVar: this.props.parent1.id ? this.props.parent1.id : null,
        parent1EmailVar: this.props.parent1.id ? null : this.props.parent1.email,
        parent2IdVar: this.props.parent2 && this.props.parent2.id ? this.props.parent2.id : null,
        parent2EmailVar: this.props.parent2 && this.props.parent2 !== '' && !this.props.parent2.id ? this.props.parent2.email : null,
        childPseudoVar: this.props.user,
        circle: this.props.circle
    },
    {
        onFailure: error => {
            this.props.alert.show(error.getError().source.errors[0].message, {
                timeout: 2000,
                type: 'error',
            });
            this.setState({isLoading: false})
        },
        onSuccess: (response) => {
            console.log(response);
            this.props.alert.show(localizations.circle_addMemberChildSuccess, {
                timeout: 2000,
                type: 'success',
            });
            setTimeout(() => {
                this.setState({isLoading: false})
                this.props.onClose();
            }, 1500);
        },
    })
  }

  render() {
    return(
      <section>
        <div style={styles.container}>
          {this.state.isLoading === true 
          ? <Loading type='cylon' color={colors.blue}/>
          : <button onClick={this._submitUpdate} style={styles.submitButton}>{this.props.buttonLabel}</button>
          }
        </div>
      </section>
    )
  }
}

Submit.propTypes = ({
})

export default createFragmentContainer(withAlert(Submit), {
    viewer: graphql`
        fragment SubmitAddChild_viewer on Viewer {
            id
        }
    `,
})

styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 'auto'
  },
  submitButton: {
    width: '400px',
    height: '50px',
    backgroundColor: colors.green,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 10,
    marginBottom: 10,
    cursor: 'pointer',
    lineHeight: '27px',
  },
}
