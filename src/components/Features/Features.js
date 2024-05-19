import React, { Component } from 'react';
import localizations from '../Localizations';
import {styles} from './Styles';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

let colors = ['#676767', '#2c82c5', '#504596', '#e95934', '#4eac68', "#ce3a83"]

class Features extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: false
    };
  }

  render() {
    var headings = localizations.features_list.th
    var list = localizations.features_list.td
    return (
      <div style={styles.container}>
        {localizations.features_list &&
          <div style={styles.flexWrapper}> 
            <table>
              <thead>
                <tr>
                  <th style={{background: colors[0], ...styles.tableHead, ...styles.tableFlexHead}}>  <br/> {headings.features} </th>
                  <th style={{background: colors[1], ...styles.tableHead}}> <img src="/images/individual.png"/> <br/> {headings.individual} </th>
                  <th style={{background: colors[2], ...styles.tableHead}}> <img src="/images/club.png"/> <br/> {headings.clubs_associations} </th>
                  <th style={{background: colors[3], ...styles.tableHead}}> <img src="/images/buisness.png"/> <br/> {headings.companies} </th>
                  <th style={{background: colors[4], ...styles.tableHead}}> <img src="/images/venue.png"/> <br/> {headings.venues} </th>
                  <th style={{background: colors[5], ...styles.tableHead}}> <img src="/images/city.png"/> <br/> {headings.city} </th>
                </tr>
              </thead>
              <tbody>
                {
                  list.map((feature, featureIndex) => 
                    this.renderFeature(feature, featureIndex)
                  )
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    );
  }

  handleToggle(index){
    this.setState({activeIndex: index})
  }

  renderFeature(feature, featureIndex){
    var tableData = feature.category === "main" ? styles.tableDataMain : styles.tableData
    return(
      <tr>
        <td style={tableData}>
          <div style={styles.tableExpandFlex}>
            <div style={styles.feature}>{feature.features} </div>
            {
              feature.category !== "main" &&
              <span>
                {
                  this.state.activeIndex===featureIndex ?
                  <ExpandLess onClick={this.handleToggle.bind(this, false)}/>
                  :
                  <ExpandMore onClick={this.handleToggle.bind(this, featureIndex)}/>
                }
              </span>
            }
          </div>

          <div style={styles.description}>
            {
              this.state.activeIndex===featureIndex &&
              <p>
                {feature.explanation}
              </p>
            }
          </div>
        </td>
        <td style={tableData}>{feature.individual}</td>
        <td style={tableData}>{feature.clubs_associations}</td>
        <td style={tableData}>{feature.companies}</td>
        <td style={tableData}>{feature.venues}</td>
        <td style={tableData}>{feature.venues}</td>
      </tr>
    )
  }
}

export default Features;