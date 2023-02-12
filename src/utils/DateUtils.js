import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { $t } from '../boot/i18n'

// TODO i18n
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const [lng = 'en'] = (navigator?.language || '').split('-')

export default class DateUtils {
  static now() {
    return Math.floor(Date.now() / 1000)
  }

  static formatDate(timestamp) {
    const date = new Date(timestamp * 1000)
    const month = $t(MONTHS[date.getMonth()]) // TODO i18n

    const sameYear = date.getFullYear() === new Date().getFullYear()
    const year = !sameYear ? ' ' + date.getFullYear() : ''

    return `${date.getDate()} ${month}${year}`
  }

  static formatTime(timestamp) {
    const date = new Date(timestamp * 1000)
    const hours = `0${date.getHours()}`.slice(-2)
    const minutes = `0${date.getMinutes()}`.slice(-2)
    return `${hours}:${minutes}`
  }

  static formatDateTime(timestamp) {
    return `${DateUtils.formatDate(timestamp)}, ${DateUtils.formatTime(
      timestamp
    )}`
  }

  static formatFromNow(timestamp, format = 'long') {
    return format === 'short'
      ? DateUtils.formatFromNowShort(timestamp)
      : DateUtils.formatFromNowLong(timestamp)
  }

  static formatFromNowLong(timestamp) {
    return formatDistanceToNow(timestamp * 1000, {
      locale: lng === 'es' ? es : enUS,
    })
  }

  static formatFromNowShort(timestamp) {
    const diff = Math.max(DateUtils.now() - timestamp, 0)
    const formatDiff = (unit, factor, offset) =>
      Math.max(Math.floor((diff + unit * offset) / (unit * factor)), 1)

    if (diff < 45) return `${formatDiff(1, 1, 0)}s`
    if (diff < 60 * 45) return `${formatDiff(1, 60, 15)}m`
    if (diff < 60 * 60 * 22) return `${formatDiff(60, 60, 15)}h`
    if (diff < 60 * 60 * 24 * 26) return `${formatDiff(60 * 60, 24, 2)}d`
    if (diff < 60 * 60 * 24 * 30 * 320)
      return `${formatDiff(60 * 60 * 24, 30, 4)}mo`
    return `${formatDiff(60 * 60 * 24, 30 * 365, 45)}y`
  }
}
