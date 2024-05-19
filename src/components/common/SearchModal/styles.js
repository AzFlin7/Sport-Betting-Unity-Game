import { colors, fonts } from '../../../theme';

export const styles = {
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%'
  },
  modalStyles: {
    overlay: {
      zIndex: 10,
    },
    content: {
      padding: '0px !important',
      boxShadow: '0 0 6px 0 rgba(0,0,0,0.5)',
      border: 'none',
      borderRadius: 10
    }
  },
  closeIcon: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 10,
    cursor: 'pointer'
  },

  searchBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid',
    borderColor: '#ccc',
    padding: '6px 0',
  },
  searchIconWrapper: {
    width: 80,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    width: 26,
    height: 26,
  },
  searchField: {
    flex: 1,
    fontSize: 16,
  },
  listItemWrapper: {
    width: '100%',
    borderBottom: '1px solid #ccc',
    cursor: 'pointer'
  },
  inviteWrapper: {
    width: '100%',
    borderBottom: '1px solid #ccc',
    cursor: 'pointer',
    justifyContent: 'space-between',
    padding: '6px 20px 6px 0px'
  },
  eraseButton: {
    fontSize: 16,
    color: '#848484',
    textTransform: 'none'
  },
  nested: {
    paddingLeft: 40,
  },
  icon: {
    width: 30,
    height: 30,
  },
  valideWrapper: {
    textAlign: 'center',
    position: 'fixed',
    bottom: 50,
    left: 'calc(50% - 70px)'
  },
  inviteButton: {
    backgroundColor: colors.blue,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '12px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    padding: '8px 40px',
    minHeight: 0,
    width: 140
  },
  avatorIcon: {
    height: 40,
    width: 40,
    borderRadius: '50%'
  },
  titleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
    flex: 1,
  },
  titleName: {
    fontSize: 14,
    color: colors.blue,
    fontWeight: '500',
  },
  titleCaption: {
    fontSize: '12px',
    paddingTop: 5
  },
  selectAllWrapper: {
    fontSize: 16,
    fontFamily: 'Lato',
    color: colors.darkGray,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  desWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
    flex: 1,
  },
  desName: {
    fontSize: '12px',
    paddingBottom: 5
  },
  desCaption: {
    fontSize: '12px',
  },
  chipPanel: {
    // display: 'flex',
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
    // alignItems: 'center',
    padding: 5
  },
  chipWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.blue,
    width: 110,
    height: 20,
    color: 'white',
    borderRadius: 10,
    float: 'left',
    margin: 4
  },
  chipCloseIcon: {
    height: 15,
    width: 15,
    padding: 0,
    margin: 0,
    color: 'white',
    minWidth: 20,
    minHeight: 18,
    fontSize: 12,
  },
  chipTitle: {
    fontSize: '12px',
  },
  checkbox: {
    backgroundColor: colors.blue,
  },
  buttonIcon: {
    color: colors.blue,
    width: 40,
    height: 40,
    backgroundImage: "url('/images/Group.svg')",
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  numberContainer: {
    marginTop: 7
  },
  number: {
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: 'bold'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 50
  },
  smallLoadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  noResult: {
    fontSize: 18,
    fontFamily: "Lato",
    marginLeft: 50,
    marginTop: 20,
    marginBottom: 20,
    color: colors.blue,
    lineHeight: '40px'
  },
  loadMoreButton: {
    fontSize: 16,
    fontFamily: "Lato",
    marginLeft: 50,
    marginTop: 20,
    marginBottom: 10,
    color: colors.blue,
    cursor: 'pointer'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    margin: '30px 0px'
  },
  rowcolum: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    margin: '30px 0px'
  },
  col50: {
    width: '200px',
    display: 'flex',
    width: '50%',

    flexDirection: 'column',
    padding: '0 50px 0 0',

  },
  colcontent: {
    maxHeight: '250px',
    overflow: 'auto',
  },
  colheading: {
    fontSize: '18px',
    color: '#666',
    textAlign: 'center',
    background: '#fff',
    padding: '15px 0'
  },
  cirlcelistdiv: {
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.4)',
    margin: '5px'
  },

  listcheckbox: {
    padding: 0,
  },
  paddingZero: {
    padding: 0
  },
  searchbarwraper: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '2px'
  },
  searchbarwraperbyperson: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '2px'
  },
  searchBarcustom: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0',
    boxShadow: 'rgba(0, 0, 0, 0.4) 0px 0px 4px 0px'


  },
  createcircle: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
};