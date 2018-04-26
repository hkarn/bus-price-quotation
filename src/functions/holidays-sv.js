import moment from 'moment'
import 'moment/locale/sv'

export default function checkIsHoliday (date) {
  moment.locale('sv')
  const easter = Easter20ops(new Date(date._d).getFullYear())
  const midsummer = FindNextSaturday(moment({Y: date.get('year'), month: 5, day: 20}))
  const _holidays = {
    'M': {// Month, Day
      '01/01': ['Nyårsdagen', 2],
      '01/06': ['Trettondagen', 1],
      [easter.clone().subtract(2, 'days').format('MM/DD')]: ['Långfredagen', 2],
      [easter.clone().subtract(1, 'days').format('MM/DD')]: ['Påskafton', 2],
      [easter.format('MM/DD')]: ['Påskdagen', 2],
      [easter.clone().add(1, 'days').format('MM/DD')]: ['Annandag påsk', 2],
      '05/01': ['Första maj', 1],
      [easter.clone().add(5, 'weeks').add(4, 'days').format('MM/DD')]: ['Kristi himmelsfärdsdag', 1],
      [easter.clone().add(7, 'weeks').subtract(1, 'days').format('MM/DD')]: ['Pingstafton', 2],
      [easter.clone().add(7, 'weeks').format('MM/DD')]: ['Pingstdagen', 2],
      '06/06': ['Sveriges nationaldag', 1],
      [midsummer.clone().subtract(1, 'days').format('MM/DD')]: ['Midsommarafton', 2],
      [midsummer.format('MM/DD')]: ['Midsommardagen', 2],
      '12/24': ['Julafton', 2],
      '12/25': ['Juldagen', 2],
      '12/26': ['Annandag jul', 2],
      '12/31': ['Nyårsafton', 2]
    },
    'W': {// Month, Week of Month, Day of Week
      // '4/3/1': 'Martin Luther King Jr. Day'
    }
  }
  const diff = 1 + (0 | (new Date(date._d).getDate() - 1) / 7)
  const memorial = new Date(date._d).getDay() === 1 && (new Date(date._d).getDate() + 7) > 30 ? '5' : null

  const result = _holidays['M'][moment(date._d).format('MM/DD')] || _holidays['W'][moment(date._d).format('M/' + (memorial || diff) + '/d')]
  if (typeof result === 'undefined') {
    return false
  } else {
    return result
  }
}

function Easter20ops (year) {
  // https://github.com/zaygraveyard/moment-easter/blob/master/moment.easter.js
  const a = (year / 100 | 0) * 1483 - (year / 400 | 0) * 2225 + 2613
  const b = ((year % 19 * 3510 + (a / 25 | 0) * 319) / 330 | 0) % 29
  const c = 148 - b - ((year * 5 / 4 | 0) + a - b) % 7
  return moment({year: year, month: (c / 31 | 0) - 1, day: c % 31 + 1})
};

function FindNextSaturday (start) {
  const testdate = start.clone()
  if (testdate.weekday() === 5) {
    return testdate
  } else {
    let i = 0
    do {
      i++
      testdate.add(1, 'days')
      if (testdate.weekday() === 5) {
        return testdate
      }
    } while (true && i < 1000)
  }
};
