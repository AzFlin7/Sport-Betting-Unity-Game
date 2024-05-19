import React, { PureComponent } from 'react';
import Select from '@material-ui/core/Select';

import MenuItem from '@material-ui/core/MenuItem';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';

import localizations from '../Localizations';

let styles;

export default class Paginate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rowsPerPage: 5,
      currentPage: 0,
    };
  }
  render() {
    const { data, dataKey, children, paginateStyle, displayContent } = this.props;
    const { rowsPerPage, currentPage } = this.state;
    const rowsPerPageValues = [5, 10, 15, 20, 25];
    const sliceFrom = rowsPerPage * currentPage;
    const sliceLength = currentPage * rowsPerPage + rowsPerPage;
    const slice = data.slice(sliceFrom, sliceLength);
    return (
      <div>
        {React.cloneElement(children, { [dataKey]: slice })}
        {displayContent && data && data.length > rowsPerPageValues[0] && (
          <div style={{ ...styles.row, ...paginateStyle }}>
            <div style={{ marginRight: 20 }}>
              <p style={{ fontSize: 22, fontFamily: 'Lato' }}>
                {localizations.paginate_rows_displayed}:
              </p>
            </div>
            <div style={{ marginRight: 20 }}>
              <Select
                disableUnderline
                style={{ display: 'inlineBlock', fontFamily: 'Lato' }}
                value={rowsPerPage}
                onChange={e =>
                  this.setState({
                    rowsPerPage: e.target.value,
                    currentPage: 0,
                  })
                }
                inputProps={{
                  name: 'rowsPerPage',
                  id: 'rowsPerPage-input',
                }}
              >
                {rowsPerPageValues.map(i => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div style={{ marginRight: 20 }}>
              <p style={{ fontSize: 15, fontFamily: 'Lato' }}>
                {`${sliceFrom + 1} - ${sliceFrom + slice.length} ${localizations.paginate_of} ${data.length}`}
              </p>
            </div>
            <div>
              <KeyboardArrowLeftIcon
                color={currentPage > 0 ? 'primary' : 'disabled'}
                onClick={() => {
                  this.state.currentPage > 0
                    ? this.setState({ currentPage: currentPage - 1 })
                    : null;
                }}
              />
            </div>
            <div>
              <KeyboardArrowRightIcon
                color={
                  data.length > currentPage * rowsPerPage + rowsPerPage
                    ? 'primary'
                    : 'disabled'
                }
                onClick={() => {
                  data.length > currentPage * rowsPerPage + rowsPerPage
                    ? this.setState({ currentPage: currentPage + 1 })
                    : null;
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

styles = {
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
};
