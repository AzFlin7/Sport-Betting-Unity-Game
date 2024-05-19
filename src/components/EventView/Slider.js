import React from 'react'
import Radium from  'radium'
import RSlider from 'react-slick'

let ContainerImage = ({children}) => <div style={styles.headerImage}>{children}</div>;

class Slider extends React.Component {
  constructor(props) {
    super(props)
  }

  waitAndRetry = () => {
    console.log("waitAndRetry");
  }

  render() {
    const {images} = this.props;

    let settings = {
      dots: true,
      arrow: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      dotsClass: 'slick-dots custom-dots'
    };

    return (
      <div>
        <RSlider {...settings}>
          { images.map((image, index) =>
            <ContainerImage key={index}>
              <img src={image} style={{width: '100%'}} onError={this.waitAndRetry}/>
            </ContainerImage>
          )}
        </RSlider>
      </div>
    )
  }
}

let styles ={
  headerImage: {
    width: '100%'
  },
};

export default Radium(Slider)