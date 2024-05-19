import React from  'react'
import Radium from 'radium'
import localizations from "../Localizations";
import colors from "../../theme/colors";
import RSlider from  'react-slick'
import RefItems from './common/RefItem'

class Ref extends React.Component {
  constructor(props){
    super(props)
  }

  render() {
    let settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      pauseOnFocus: true,
      pauseOnHover: true,
      pauseOnDotsHover: true,
    };

    let items = [
      {
        image: 'images/page_principale/montagne.jpg',
        citation: localizations.home_ref_ref1,
        source: localizations.home_ref_source1
      },
      {
        image: 'images/page_principale/surf.jpg',
        citation: localizations.home_ref_ref2,
        source: localizations.home_ref_source2
      },
      {
        image: 'images/page_principale/street_hockey.jpg',
        citation: localizations.home_ref_ref3,
        source: localizations.home_ref_source3
      },
      {
        image: 'images/page_principale/inline_hockey_100x100.png',
        citation: localizations.home_ref_ref4,
        source: localizations.home_ref_source4
      },
    ];
    
    return (
      <div style={{paddingBottom: 50, maxWidth: '100%', overflow: 'hidden'}}>
        <RSlider {...settings} style={styles.container}>
          { items.map( (item, index) =>
            <RefItems
              key={index}
              item={item}
              styles={styles}
            />
          )}
        </RSlider>
      </div>
    )
  }
}

let styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2% 10%',
    marginTop: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  citation: {
    fontFamily: 'lato',
    fontSize: 28,
    margin: '2%',
    fontWeight: 'bold',
    color: colors.blue,
    '@media (max-width: 767px)': {
      fontSize: 24
    }
  },
  source: {
    fontFamily: 'lato',
    fontSize: 20,
    margin: '2%',
    color: colors.blue,
    '@media (max-width: 767px)': {
      fontSize: 18
    }
  },
  separator: {
    height: 1,
    width: '10%',
    marginTop: 10,
    backgroundColor: colors.blue
  },
};

export default Radium(Ref)