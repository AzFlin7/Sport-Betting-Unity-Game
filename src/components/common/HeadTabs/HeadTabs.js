import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { colors } from 'sportunity/src/theme';
import { Styles } from './styles';

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tabsIndicator: {
    backgroundColor: colors.blue,
  },
});

const HeadTabs = ({ classes, onChange, activeTab, shownTabs }) => (
  <div className={classes.root}>
    <Tabs 
      style={Styles.headTabs} 
      value={activeTab} 
      onChange={onChange} 
      indicatorColor="primary"
      classes={{ indicator: classes.tabsIndicator }}
    >
      {shownTabs.map((tab, index) => (
        <Tab key={index} value={tab.value} label={tab.label} style={Styles.tabStyle}/>
    ))}
    </Tabs>
  </div>
);

HeadTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  activeTab: PropTypes.any.isRequired,
};

export default withStyles(styles)(HeadTabs);
