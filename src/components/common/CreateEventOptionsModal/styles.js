import { colors, fonts } from '../../../theme';

const styles = {
  modalStyle: {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(55, 55, 55, 0.75)',
      zIndex: 201,
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      border: '1px solid #ccc',
      background: colors.lightGray,
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      borderRadius: '4px',
      outline: 'none',
      padding: '20px 40px',
      border: '1px solid '+ colors.blue,
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    },
  },
  container: {
    fontFamily: 'Lato',
    maxWidth: 800,
  },
  heading: {
    color: colors.blue,
    fontSize: 28,
    fontWeight: fonts.weight.medium,
    color: colors.blue,
  },
  buttonsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 40,
  },
  buttonBox: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.white,
    height: 180,
    width: 180,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    cursor: 'pointer',
    marginTop: 15,
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    ':hover': {
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.25)',
    },
  },
  buttonIcon: {
    color: colors.blue,
    fontSize: 110,
  },
  buttonText: {
    fontSize: 20,
    color: colors.blue,
    lineHeight: 1.2,
    textAlign: 'center',
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    borderWidth: 0,
    background: 'none',
    cursor: 'pointer',
    color: colors.redGoogle,
  },
  bottomHeading: {
    fontSize: 18,
    marginTop: 40,
    color: '#414141'
  },
  bottomText: {
    fontSize: 16,
    marginTop: 10,
    color: colors.darkGray,
  },
};

export default styles;
