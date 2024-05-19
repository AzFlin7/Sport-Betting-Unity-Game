import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import { colors, metrics, fonts } from '../../../theme';

let styles

class FilterSidebar extends PureComponent {
    constructor(props) {
        super(props)
    }

    componentDidMount = () => {
  
    }

    render() {
        const { title } = this.props

        return(
            <div style={styles.container}>
                <div style={styles.blockTitle}>
                    {title}
                </div>
                <div style={styles.content}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

styles = {
    container: {
        //border: '1px solid ' + colors.blue, removing the border totaly so we can have left shadow
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        fontFamily: 'Lato',
        width: '100%',
        //borderRadius: 5,
        marginBottom: 30
    },
	blockTitle: {
        fontSize: fonts.size.small, // VB: Changing from medium to small
        width: '100%',
        // fontWeight: 'bold', too much of boldness in title
        padding: 10,
        color: colors.white,
        backgroundColor: colors.blue
    },    
    content: {
        //padding: 4, VB: removing the padding so we can leave no margin around
        width: '100%'
    },
};

export default FilterSidebar;
