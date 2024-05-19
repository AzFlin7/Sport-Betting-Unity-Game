import React from 'react'
import Radium from 'radium'

class RefItem extends React.Component {
  constructor(props){
    super(props)
  }

  render() {
    const {item, styles} = this.props;

    return (
    <div style={styles.container}>
      <img src={item.image} style={styles.image}/>
      <div style={styles.citation}>
        {item.citation}
      </div>
      <i style={styles.separator}/>
      <div style={styles.source}>
        {item.source}
      </div>
    </div>
    )
  }
}

export default Radium(RefItem);