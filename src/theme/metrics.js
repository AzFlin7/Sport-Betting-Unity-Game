// These are only examples, this can be updated...

const newzIndex = () => Object.assign(newzIndex, {
  index: newzIndex.index + newzIndex.chunckSize
}).index
newzIndex.chunckSize = 10
newzIndex.index = 0

export const zindex = (base) => Object.assign(zindex.Store, {
  [base]: zindex.Store[base] || newzIndex()
})[base]
zindex.Store = {}

const metrics = {

  margin: {
    tiny: 5,
    small: 10,
    medium: 15,
    large: 20,
    xl: 30,
    xxl: 40,
    xxxl: 50,
  },
  padding: {
    tiny: 5,
    small: 10,
    medium: 15,
    large: 20,
    xl: 30,
  },
  radius: {
    tiny: 5,
    small: 10,
    medium: 15,
    large: 20,
    xl: 30,
    xxl: 50,
  },
  border: {
    tiny: 1,
    small: 2,
    medium: 3,
    large: 4,
    xl: 5,
    xxl: 7,
    xxxl: 10,
  },
  icons: {
    tiny: 15,
    small: 20,
    medium: 30,
    large: 45,
    xl: 60,
  },

};

export default metrics;
