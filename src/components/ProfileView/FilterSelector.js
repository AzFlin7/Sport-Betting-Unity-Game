import React from 'react';
import { colors } from '../../theme';

const NewFilterButton = ({ onClick }) => (
  <button onClick={onClick} style={styles.newFilterButton}>
    New Filter
  </button>
);

const FiltersTabItem = ({ name, onClick, isActive, showDeleteButton, onDeleteClick }) => (
  <button
    style={isActive ? styles.filterTabItemActive : styles.filterTabItem}
    onClick={onClick}
  >
    {name}
    {showDeleteButton &&
      <i
        className="material-icons"
        onClick={(e) => {
          onDeleteClick();
          e.stopPropagation();
        }}
        style={styles.closeIcon}
      >
        clear
      </i>
    }
  </button>
);

const FilterSelector = ({ handleNewFilterClick, filterList, handleFilterClick, activeFilter, allowChange, handleDelete }) => (
  <div>
    <div style={styles.filtersTab}>
      {allowChange && <NewFilterButton onClick={handleNewFilterClick} />}
      {filterList.map(filter =>
        <FiltersTabItem
          key={filter.id}
          isActive={activeFilter && activeFilter.id === filter.id}
          onClick={() => handleFilterClick(filter)}
          name={filter.name}
          showDeleteButton={allowChange}
          onDeleteClick={() => handleDelete(filter)}
        />
      )}
    </div>
  </div>
);

const buttonStyles = {
  backgroundColor: colors.blueLight,
  color: colors.white,
  padding: 7,
  marginRight: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  fontSize: 18,
  minWidth: 100,
  height: 40,
  fontFamily: 'Lato',
  cursor: 'pointer',
  border: 0,
  borderTopLeftRadius: 5,
  borderTopRightRadius: 5,
};

const styles = {
  newFilterButton: {
    ...buttonStyles,
    color: colors.black,
    backgroundColor: colors.white,
    borderTop: '1px solid ' + colors.black,
    borderLeft: '1px solid ' + colors.black,
    borderRight: '1px solid ' + colors.black,
  },
  filtersTab: {
    width: '100%',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    display: 'flex',
  },
  filterTabItem: {
    ...buttonStyles,
  },
  filterTabItemActive: {
    ...buttonStyles,
    backgroundColor: colors.blue,
  },
  closeIcon: {
    color: colors.white,
    fontSize: 18
  }
};

export default FilterSelector;
