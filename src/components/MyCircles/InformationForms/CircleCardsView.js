import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import localizations from '../../Localizations'
import { colors } from '../../../theme';
import { Card, CardContent } from '@material-ui/core';

let styles;

class CircleCardsView extends React.Component {
  render() {
    const { form, circleSelected } = this.props;
    return (
      <div style={{ width: '100%' }}>
        {form && form.circles && form.circles.edges.length > 0 &&
          form.circles.edges.map(circleEdge => (
            <Card 
              style={circleSelected && circleEdge.node.id === circleSelected.id ? styles.selectedCard : styles.card}
              key={circleEdge.node.id+'-card'}
            >
              <CardContent
                style={styles.cardContent}
                onClick={() => this.props.onSelectCircle(circleEdge.node)}
              >
                <div style={styles.cardHeaderText}>
                  {circleEdge.node.name}
                  
                  {form.circles.edges.length > 1 && typeof this.props.onWithdrawGroup !== 'undefined' && 
                    <button
                      key={circleEdge.node.id + '-menu'}
                      style={styles.grayButton}
                      onClick={() =>this.setState({ [circleEdge.node.id + '-menuVisible']: !this.state[circleEdge.node.id + '-menuVisible'] })}
                    >
                      <i className="fa fa-ellipsis-v" style={{ color: colors.black }}/>
                    </button>
                  }
                  
                  {this.state[circleEdge.node.id+'-menuVisible'] && (
                    <div style={styles.plusMenuContainer}>
                      <button
                        key={circleEdge.node.id+'-groupWithdraw'}
                        onClick={() => {
                          this.setState({ [circleEdge.node.id+'-menuVisible']: false });
                          this.props.onWithdrawGroup(circleEdge.node);
                        }}
                        style={styles.plusMenuItem}
                      >
                        {localizations.circles_information_form_withdraw_group}
                      </button>
                    </div>
                  )}
                </div>

                <div style={styles.membersList}>
                  {circleEdge.node.members && circleEdge.node.members.length > 0
                    ? circleEdge.node.members.map((member, index) => (
                      index === 10
                      ? '...'
                      : index > 10
                        ? ''
                        : index === circleEdge.node.members.length - 1
                          ? member.pseudo
                          : member.pseudo + ', '
                    ))
                    : <div style={styles.noFormText}>{localizations.circles_information_form_no_members}</div>
                  }
                </div>

              </CardContent>
            </Card>
          )
        )
        }
      </div>
    );
  }
}

styles = {
  card: {
      display: 'flex',
      flexDirection: 'column',
      width: '80%',
      background: colors.white,
      margin: 10,
      cursor: 'pointer',
      overflow: 'visible'
  },
  selectedCard: {
      display: 'flex',
      flexDirection: 'column',
      width: '80%',
      background: colors.lightGray,
      margin: 10,
      cursor: 'pointer',
      overflow: 'visible'
  },
  cardHeaderText : {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 20,
      color: colors.blue,
      marginBottom: 10,
      position: 'relative'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 10
  },
  membersList : {
      fontSize: 15,

  },
  noFormText: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: 'Lato',
    marginTop: 10,
    textAlign: 'justify'
  },
  grayButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    fontSize: 20,
    padding: '7px',
    cursor: 'pointer',
    height: 20,
    width: 20,
    border: 0,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    '@media (max-width: 900px)': {
      width: '100%',
    },
    ':hover': {},
    ':active': {
      outline: 'none',
    }
  },
  plusMenuContainer: {
    position: 'absolute',
    zIndex: 200,
    color: colors.darkGray,
    width: 140,
    left: 25,
    top: 20,
    '@media (max-width: 900px)': {
      right: 20,
      top: 30,
    },
  },
  plusMenuItem: {
    width: '100%',
    backgroundColor: '#fbfbfb',
    color: colors.darkGray,
    border: 'none',
    fontSize: 16,
    fontFamily: 'Lato',
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
      filter: 'brightness(0.9)',
    },
    ':active': {
      outline: 'none',
    },
  },
};

export default Radium(CircleCardsView);
