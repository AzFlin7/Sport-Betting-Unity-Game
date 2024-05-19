import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import styles from './Styles'
import { withAlert } from 'react-alert'
import localizations from '../Localizations'

class CreditCard extends React.Component {
  constructor(props) {
    super(props)
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
    this.state = {
      editMode: false,
    }
  }

  _setCreditCardEditMode = () => {
    this.setState({
      editMode: true,
    })
  } 

  render() {
    const { editMode } = this.state
    const { user } = this.props
    return(
      <section>	
				<div style={styles.rowHeader}>
					<div style={styles.pageHeader}>{localizations.payment_creditCard}</div>
					{ (!editMode) 
						&& <div style={styles.editButton} onClick={this._setCreditCardEditMode}>{localizations.payment_add}</div> }
				</div>
        {user.paymentMethods.length || editMode 
        ? <section>
          </section>
        : <div style={styles.noDataError}>
            No credit card data
          </div>
        }
      </section>
    )

  }
}


export default createFragmentContainer(withAlert(CreditCard), {
  user: graphql`
    fragment CreditCard_user on User {
      paymentMethods {
        id
        cardType
        cardMask
        expirationDate
        currency
      }
    }
  `,
  viewer: graphql`
    fragment CreditCard_viewer on Viewer {
      me {
        id
      }	
    }
  `,
})