// https://github.com/kenny-hibino/react-places-autocomplete/blob/master/demo/helpers.js

const isObject = val => {
  return typeof val === 'object' && val !== null
}

export const classnames = (...args) => {
  const classes = []
  args.forEach(arg => {
    if (typeof arg === 'string') {
      classes.push(arg)
    } else if (isObject(arg)) {
      Object.keys(arg).forEach(key => {
        if (arg[key]) {
          classes.push(key)
        }
      })
    } else {
      throw new Error(
        '`classnames` only accepts string or object as arguments'
      )
    }
  })

  return classes.join(' ')
}

export const tryParseDateString = (str) => {
  // This prevents tryping letters in the date string, it also replaced any errorous delimiters entered
  // very crude quick fix to make input just a bit nicer, this could use more work
  try {
  let str1 = str.replace(/^\s+|\s+$/gm,'')
  str1 = str1.replace(/[a-zA-ZåäöÅÄÖ]/g, '')
  str1 = str1.replace(/^(\d\d)\D*(\d\d)\D*(\d\d)\D*(\d\d)\D*(\d\d)$/, "20$1-$2-$3 $4:$5")
  str1 = str1.replace(/^(\d\d\d\d)\D*(\d\d)\D*(\d\d)\D*(\d\d)\D*(\d\d)$/, "$1-$2-$3 $4:$5")

  return str1
  } catch (e) {
    return str
  }

}