import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { fonts, colors } from '../../theme'
import { connect } from 'react-redux'
import SportItem from './SportItem'
import SportAutoSuggest from './SportAutoSuggest'
import localizations from '../Localizations'
import Radium from 'radium'

let styles

class SportList extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      modalIsOpen: false,
    }
  }

  _openModal = () => {
    this.setState({ modalIsOpen: true });
  }
 
  _afterOpenModal = () => {
    // references are now sync'd and can be accessed. 
    //this.refs.subtitle.style.color = '#f00';
  }
 
  _closeModal = () => {
    this.setState({ modalIsOpen: false });
  }

	_getSelectedSport = (id) => {
    let list = this.props.allSports.edges
        .filter(edge => edge.node.id === id)
    return list
  }

  _addSport = () => {
    if (this.state.isSportSelected) {
      let sport = this.state.selectedSport
      this.props.onAddSport(sport[0]);
      this.setState({ 
        isSportSelected: false, 
        selectedSportId: '',
        selectedSport: {},
      })
    }
  }

	_selectSport = (id) => {
    if (id != this.state.selectedSportId) {
      if (id) {
        this.setState({ 
          isSportSelected: true, 
          selectedSportId: id,
          selectedSport: this._getSelectedSport(id),
        }, () => this._addSport());
      } else {
        this.setState({ 
          isSportSelected: false, 
          selectedSportId: '',
          selectedSport: {},
        })
      }
    }
  }

  render() {
    const { sports } = this.props
		const { allSports } = this.props
    console.log('sport', this.props.sports);
    console.log('allSport', this.props.allSports);
    return(
      <section style={styles.container}>
        <h1 style={styles.h1}>{localizations.manageVenue_facility_sports}</h1>
        {
          sports &&
            <div style={{maxHeight: 200, overflow: 'auto'}}>
              {sports.map(sport =>
                <SportItem key={sport.node.id} id={sport.node.id} sport={sport.node} {...this.props}></SportItem>
              )}
            </div>
        }
				<div>
					<SportAutoSuggest 
            sports={allSports.edges} 
            onChangeFilter={this.props.onChangeFilter}
            onSelected={this._selectSport}/> 
				</div>
				<div style={styles.button} onClick={this._addSport}>{localizations.manageVenue_facility_addSport}</div>
      </section>
    )
  }
}

styles = {
  h1: {
    fontSize: fonts.size.large,
    color: colors.blue,
    fontFamily: 'Lato',
    marginTop: 30,
  },
  button: {
		padding: '5px 12px 5px 12px',
		backgroundColor: colors.blue,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 0,
    marginBottom: 10,
    cursor: 'pointer',
		lineHeight: '27px',
  },
  container: {
    //backgroundColor: '#FF9999',
  },
}

const stateToProps = (state) => ({
  venueId: state.facilityReducer.venueId,
  facilities: state.facilityReducer.facilities,
  facilityName: state.facilityReducer.facilityName,
  sports: state.facilityReducer.sports,
});

const ReduxContainer = connect(
  stateToProps,
)(Radium(SportList));

export default createFragmentContainer(Radium(ReduxContainer), {
  allSports: graphql`
    fragment SportList_allSports on SportConnection {
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
        }
      }
    }
  `,
  sports: graphql`
    fragment SportList_sports on Sport @relay(plural: true) {
      id
              logo
      name {
        EN
        FR
      }
      levels {
        id
        EN {
          name
          description
          skillLevel
        }
        FR {
          name
          description
          skillLevel
        }
      }
      positions {
        EN
        FR
      }
      certificates {
        id
        name {
          EN
          FR
        }
      }
      logo
      status
    }
  `,
})

