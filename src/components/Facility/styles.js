import { colors, fonts } from '../../theme';

const styles = {
	pageHeader: {
		height: 41,
		fontFamily: 'Lato',
		fontSize: 34,
		fontWeight: fonts.weight.large,
		color: colors.blue,
		display: 'flex',
    '@media (max-width: 730px)': {
      flexDirection: 'column',
    },
  },
	triangle: {
		position: 'absolute',
		right: 0,
		width: 0,
		height: 0,

		transition: 'border 100ms',
		transitionOrigin: 'left',

		color: colors.blue,

		cursor: 'pointer',

		borderLeft: '8px solid transparent',
		borderRight: '8px solid transparent',
		borderTop: `8px solid ${colors.blue}`,
	},

	triangleOpen: {
		position: 'absolute',
		right: 0,
		width: 0,
		height: 0,

		transition: 'border 100ms',
		transitionOrigin: 'left',

		color: colors.blue,

		cursor: 'pointer',

		borderLeft: '8px solid transparent',
		borderRight: '8px solid transparent',
		borderBottom: `8px solid ${colors.blue}`,
	},

	closeCross: {
		position: 'absolute',
		right: 0,
		width: 0,
		height: 0,
		color: colors.gray,
		marginRight: '15px',
		cursor: 'pointer',
		fontSize: '16px',
	},

	cancelIcon: {
		marginRight: 15,
	},

	navLink: {
		color: colors.blue,
		textDecoration: 'none',
		marginRight: '10px',
	},
  pageSubHeader: {
		height: 41,
		fontFamily: 'Lato',
		fontSize: 20,
		fontWeight: fonts.weight.small,
		color: colors.gray,
		display: 'flex',
    marginBottom: 0,
    marginLeft: 30,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    backgroundImage: 'url(/images/background-signup.jpg',
  },
	bodyContainer: {
    display: 'flex',
    maxWidth: 1400,
    flexDirection: 'column',
		marginTop: 30,
		paddingLeft: 70,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 30,
    '@media (max-width: 930px)': {
      paddingLeft: 10
    },
  },
  headerContainer: {
    display: 'flex',
    maxWidth: 1400,
    flexDirection: 'row',
		marginTop: 30,
		marginBottom: 30,
		paddingLeft: 70,
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		'@media (max-width: 730px)': {
			paddingLeft: 40
		},
  },
	buttonNew: {
		color: colors.blue,
	},
	buttonItem: {
		color: colors.black,
	},
	button: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-center',
		alignItems: 'flex-center',
		width: 500,
		height: 70,
		backgroundColor: colors.white,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
		border: '1px solid #E7E7E7',
		borderRadius: 4,
		fontFamily: 'Lato',
		fontSize: 28,
		lineHeight: '42px',
		cursor: 'pointer',
		paddingLeft: 20,
		paddingRight:20,
		paddingTop: 14,
		marginTop: '20px',
		//lineHeight: 34,
		'@media (max-width: 730px)': {
			width: '300px',
			fontSize: '20px',
		},
	},
	buttonText: {
		flex: '2 0 0',
		textDecoration: 'none',
	},
	buttonIcon: {
		color: colors.blue,
	},
	buttonLink: {
		color: colors.black,
		textDecoration: 'none',
	},
	flowRight: {
		flow: 'right',
	},
  modalBody: {
    display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
  },
  firstColumn: {
    display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
    paddingRight: 10,
    flex: '1 0 0',
  },
  lastColumn: {
    display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
    paddingLeft: 10,
    flex: '1 0 0',
  },
	modalContent: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-center',
		justifyContent: 'flex-center',
    marginBottom: 15,
	},
	modalTitle: {
		fontFamily: 'Lato',
		fontSize:30,
		fontWeight: fonts.weight.large,
		color: colors.blue,

		flex: '2 0 0',
	},
	modalClose: {
		justifyContent: 'center',
    verticalAlign: 'middle',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
    fontSize: 20,
		alignItems: 'center',
	},
	inputHeader: {
    fontFamily: 'Lato',
		fontSize:24,
		fontWeight: fonts.weight.medium,
		color: colors.blue,
		marginBottom: 10,
		marginTop: 20,
  },
	greenButton: {
		width: '800px',
		height: '50px',
		backgroundColor: colors.green,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    lineHeight: '55px',
    color: colors.white,
    borderWidth: 0,
    marginTop: 10,
    marginBottom: 10,
    cursor: 'pointer',
  },
	redButton: {
		width: '800px',
		height: '50px',
		backgroundColor: colors.redGoogle,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    lineHeight: '55px',
    color: colors.white,
    borderWidth: 0,
    marginTop: 10,
    marginBottom: 10,
    cursor: 'pointer',
  },
  itemHeader: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-left',
		alignItems: 'flex-left',

		width: 500,
		height: 50,
		fontFamily: 'Lato',
		fontSize: 28,
		lineHeight: '42px',
		cursor: 'pointer',
		paddingTop: 14,
		marginTop: 15,
    color: colors.blue,
    fontWeight: fonts.weight.large,
		'@media (max-width: 730px)': {
      width: '300px',
      fontSize: '20px',
    },
	},
  blueButton: {
    display: 'flex',
    marginRight: 'auto',
    backgroundColor: colors.blue,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
    cursor: 'pointer',
    marginBottom: 'auto',
  },
  pictureWrapper: {
    display: 'flex',
    flexDirection: 'row',
		justifyContent: 'flex-start',
  },
  picture: {
    backgroundColor: '#D8D8D8',
    borderRadius: '4px',
    display: 'flex',
    width: 100,
    height: 100,
    marginRight: 15,

  },
	close: {
    position: 'relative',
    top: '10',
    right: '-370',

    transform: 'translateY(50%)',

    width: '20',
    height: '20',

    cursor: 'pointer',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: '50%',

    backgroundColor: '#5E9FDF',
    boxShadow: '0 0 2px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24)',
  },

  icon: {
    color: colors.white,
    fontSize: 12,
  },
  itemManager: {
    display: 'flex',
    fontFamily: 'lato',
    fontSize: 18,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    border: '2px solid #0002'
  },
  rule: {
    display: 'flex',
    flexDirection: 'row',
    margin: 10,
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  ruleSelect: {
    padding: 10
  },
  circleSelectContainer: {
    fontFamily: 'lato',
    fontSize: 18,
    minWidth: 200,
    borderBottom: '2px solid #5E9FDF',
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
    borderRadius: 0,
    marginBottom: 10
  },
  circleSelectMenu: {
    fontFamily: 'lato',
    fontSize: 18,
  },
  autocompletion_dropdown: {
    position: 'absolute',
    left: 0,

    width: '90%',
    marginLeft: '5%',
    maxHeight: 220,

    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: 20,

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: 100,
  },
  avatar: {
    width: 39,
    height: 39,
    marginRight: 10,
    color: colors.blue,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: '50%',
  },
  label: {
    display: 'block',
    color: colors.blueLight,
    fontSize: 16,
    lineHeight: 1,
    marginBottom: 8,
    flex: 1,
    fontFamily: 'lato'
  },
  listItem: {
    paddingBottom: 10,
    color: '#515151',
    fontSize: 20,
    fontWeight: 500,
    fontFamily: 'Lato',
    borderBottomWidth: 1,
    borderColor: colors.blue,
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5
  },

  listItemClickable: {
    paddingBottom: 10,
    color: '#515151',
    fontSize: 20,
    fontWeight: 500,
    fontFamily: 'Lato',
    borderBottomWidth: 1,
    borderColor: colors.blue,
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 5,
    cursor: 'pointer'
  },
  error: {
    display: 'flex',
    justifyContent: 'flex-center',
    alignItems: 'flex-center',
    color: colors.error,
    lineHeight: '30px',
    fontFamily: 'Lato',
    fontSize: 18,
  },
}

export default styles;
