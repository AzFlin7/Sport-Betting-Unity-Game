import React from 'react';
import Radium from 'radium';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { colors } from '../../theme';
import localizations from '../Localizations'

let styles;

const Title = ({ children }) => <h2 style={styles.mainTitle}>{children}</h2>;

class Price extends React.Component {
  constructor(props) {
    super(props)
  }
  
  getPriceString = (cents, currency) => 
    cents === 0
      ? localizations.event_free
      : `${cents} ${currency}`;

  getUserSpecificPrice = (user, sportunity) => {
    if (sportunity.paymentStatus) {
      let index = sportunity.paymentStatus.findIndex(paymentStatus => {
        return paymentStatus.status !== 'Canceled' && user && paymentStatus && paymentStatus.user && user.id === paymentStatus.user.id;
      });
      if (index >= 0)
        return sportunity.paymentStatus[index].price
      else
        return sportunity.price ;
    }
    else return sportunity.price ;
  }

  getCirclePrices = (sportunity, isAdmin) => {
    if (isAdmin && sportunity.price_for_circle && sportunity.price_for_circle.length > 0 && sportunity.invited_circles && sportunity.invited_circles.edges && sportunity.invited_circles.edges.length > 0) {
      let result = [];
      sportunity.price_for_circle.forEach(priceForCircle => {
        sportunity.invited_circles.edges.forEach(invitedCircle => {
          if (invitedCircle.node.id === priceForCircle.circle.id) {
            result.push({price: priceForCircle.price, circle: invitedCircle.node})
          }
        })
      })
      result.sort((a,b) => {
        return (b.price.cents - a.price.cents)
      })
      return result; 
    }
    else
      return [];
  }

  render () {
    const {sportunity, viewer:{me}, isAdmin, header=false } = this.props ;
    
    let price = this.getUserSpecificPrice(me, sportunity);
    let circlePrices = this.getCirclePrices(sportunity, isAdmin);

    return (
      <div style={styles.container}>
        {isAdmin && sportunity.invited_circles && sportunity.invited_circles.edges && sportunity.invited_circles.edges.length > 0 && circlePrices.length === 0 &&
          <div>
            <Title>{localizations.event_invitedCircles}</Title>
            {sportunity.invited_circles.edges.map((edge, index) => (
              <div style={styles.priceRow} key={index}>
                {edge.node.name}
              </div>
            ))}
          </div>
        }
        {!header && (sportunity.kind === 'PUBLIC' || (circlePrices && circlePrices.length > 0)) && 
          <Title >{localizations.event_price}</Title>
        }
        {sportunity.kind === 'PUBLIC' &&
          <div style={styles.priceRow}>
            {!header && (circlePrices.length > 0 ? localizations.event_public_price + ': ' : localizations.event_participant + ': ')}
            <span style={header ? {...styles.value, fontWeight: 'bold', fontSize: 22} : styles.value}>
              {this.getPriceString((price.cents / 100), price.currency)}
            </span>
          </div>
        }
        
        {!header && circlePrices.length > 0 && 
          circlePrices.map((circlePrice, index) => (
            <div style={styles.priceRow} key={index}>
              {circlePrice.circle.name}:&nbsp;&nbsp;
              <span style={styles.value}>
              {this.getPriceString((circlePrice.price.cents / 100), circlePrice.price.currency)}
              </span>
            </div>
          ))        
        }
      </div>
    )
  };
}

styles = {
  container: {
    fontFamily: 'Lato',
    fontSize: 18,
    lineHeight: 1.2,
    color: 'rgba(0,0,0,0.65)',
    marginBottom: 45,
  },

  mainTitle: {
    paddingLeft: '20px',
    height: '50px',
    lineHeight: '50px',
    fontSize: '25px',
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.65)',
    borderBottom: '1px solid ' + colors.lightGray,
    borderTop: '1px solid ' + colors.lightGray,
  },

  title: {
    fontSize: 32,
    fontWeight: 500,
    marginBottom: 30,
  },

  priceRow: {
    marginTop: '10px',
    // marginLeft: '20px'
  },

  bold: {
    fontWeight: 'bold',
  },

  value: {
    color: colors.green,
  },
};


export default createFragmentContainer(Radium(Price), {
  viewer: graphql`
    fragment Price_viewer on Viewer {
      me {
        id
      }
    }
  `,
  sportunity: graphql`
    fragment Price_sportunity on Sportunity {
      kind
      paymentStatus {
        status
        user {
          id
        }
        price {
          currency,
          cents
        }
      }
      price {
        currency,
        cents,
        description {
          EN,
        }
      }
      invited_circles (last: 10) {
        edges {
          node {
            id, 
            name
          }
        }
      }
      price_for_circle {
        circle {
          id
        }
        price {
          cents, 
          currency
        }
      },
    }
  `,
  });
