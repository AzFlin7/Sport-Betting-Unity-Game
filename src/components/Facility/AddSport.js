import React from 'react'
import SportAutoSuggest from './SportAutoSuggest'
import { appStyles, colors } from '../../theme'
import MultiSelect from './MultiSelect'

let styles 

class AddSport extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isSportSelected: false,
      selectedSportId: '',
      allPositions: [],
      allLevels: [],
      allCertificates: [],
      selectedSport: {},
      selectedPositions: [],
      selectedLevels: [],
      selectedCertificates: [],
    }
  }

  componentDidMount = () => {
    //this.props.onChangeFilter('t')
  }

  _getAllLevels = (id) => {
    let list = []
      this.props.allSports.edges
        .filter(edge => edge.node.id === id)
        .map(edge => edge.node.levels
        .map(function(position) { list.push(
          { 
            label:position.EN.name, 
            value:position.id, 
          }) 
        }))
    return list
  }

  _getAllPositions = (id) => {
    let list = []
      this.props.allSports.edges
        .filter(edge => edge.node.id === id)
        .map(edge => edge.node.positions
        .map(function(position) { list.push(
          { 
            label:position.EN, 
            value:position.id, 
          }) 
        }))
    return list
  }

  _getAllCertificates = (id) => {
    let list = []
      this.props.allSports.edges
        .filter(edge => edge.node.id === id)
        .map(edge => edge.node.certificates
        .map(function(position) { list.push(
          { 
            label:position.name.EN, 
            value:position.id, 
          }) 
        }))
    return list
  }

  _selectLevels = (values) => {
    this.setState({ selectedLevels: values })
  }

  _selectPositions = (values) => {
    this.setState({ selectedPositions: values })
  }

  _selectCertifications = (values) => {
    this.setState({ selectedCertificates: values })
  }

  _getSelectedSport = (id) => {
    let list = this.props.allSports.edges
        .filter(edge => edge.node.id === id)
    return list
  }

  _addSport = () => {
    let sport = this.state.selectedSport
    sport.selectedPositions = this.state.selectedPositions
    sport.selectedLevels = this.state.selectedLevels
    sport.selectedCertificates = this.state.selectedCertificates
    this.props.onAddSport(sport[0])
    this.props.onClose()
  }

  _close = () => {
    this.props.onClose()
  }

  _selectSport = (id) => {
    if (id != this.state.selectedSportId) {
      if (id) {
        this.setState({ 
          isSportSelected: true, 
          selectedSportId: id,
          selectedSport: this._getSelectedSport(id),
          allLevels: this._getAllLevels(id),
          allPositions: this._getAllPositions(id),
          allCertificates: this._getAllCertificates(id),
        })
      } else {
        this.setState({ 
          isSportSelected: false, 
          selectedSportId: '',
          selectedSport: {},
          allLevels: [],
          allPositions: [],
          allCertificates: [],
        })
      }
      this.setState({
        selectedPositions: [],
        selectedLevels: [],
        selectedCertificates: [],
      })
    }
  }

  render() {
    const { allSports } = this.props
    return (
      <section style={styles.container}>
        <div style={styles.headerContainer}>
          <label style={styles.header}>Add Sport</label>
          <i className="fa fa-times" onClick={this._close} style={styles.close}/> 
        </div>
        <label style={appStyles.inputLabel}>Sport</label>
        <SportAutoSuggest sports={allSports.edges} 
            onChangeFilter={this.props.onChangeFilter}
            onSelected={this._selectSport}/> 
        
        <MultiSelect
            placeholder={!this.state.isSportSelected ? 'Select sport first' : 'Select Level'} 
            disabled={!this.state.isSportSelected}
            label='Level(s)'
            allOptions={this.state.allLevels}
            selectedOptions={this.state.selectedLevels}
            onChange={this._selectLevels}
            />
        
        <MultiSelect
            placeholder={!this.state.isSportSelected ? 'Select sport first' : 'Select Position'} 
            disabled={!this.state.isSportSelected}
            label='Position (optional)'
            allOptions={this.state.allPositions}
            selectedOptions={this.state.selectedPositions}
            onChange={this._selectPositions}
            />

        <MultiSelect
            placeholder={!this.state.isSportSelected ? 'Select sport first' : 'Select Certificate'} 
            disabled={!this.state.isSportSelected}
            label='Certificate (optional)'
            allOptions={this.state.allCertificates}
            selectedOptions={this.state.selectedCertificates}
            onChange={this._selectCertifications}
            />

        <div style={styles.button} onClick={this._addSport}>Save</div>
      </section>
    )
  }
}

export default AddSport 

styles = {
  container: {
    width: '400px',
    diplay: 'flex',
    flexDirection: 'column',
  },
   button: {
		padding: '5px 12px 5px 12px',
		backgroundColor: colors.green,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 15,
    marginBottom: 10,
    cursor: 'pointer',
		lineHeight: '27px',
    width:'100%',
  },
  headerContainer: {
    display: 'flex',
    width: 400,
    marginBottom: 20,
  },
  header: {
    display: 'flex',
    fontSize: 30,
    fontFamily: 'Lato',
    color: colors.blue,
    flex: 8,
  },
  close: {
    display: 'flex',
    flex: 1,
    marginRight: 0,
    color: colors.gray,
    fontSize: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
    cursor: 'pointer',
  },
}
