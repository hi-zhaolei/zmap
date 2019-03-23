function stringify(query) {
  if (!query) return ''
  let queryArr = []
  for (const key in query) {
    let value = query[key];
    if (!value) continue
    if (value instanceof Array) {
      value = value.join()
    }
    queryArr.push(`${key}=${value}`)
  }
  return queryArr.join('&')
}

/**
 * 加载脚本
 * 
 * @param {string} url 
 * @param {object} query 
 */
export function loadScript (url, query, backupUrl) {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = `${location.protocol}${url}?${stringify(query)}`
  script.onerror = function () {
    if (backupUrl) {
      alert('[Soda Map Notice] Use backup address instand. Waiting...')
      loadScript(backupUrl, query)
    } else {
      alert('[Soda Map ERROR] Map service load failed....')
    }
  }
  document.body.appendChild(script)
  return script
}

/**
 * pick keys from data
 * 
 * @param {object} data 
 * @param {array} keys 
 */
export function pick(data, keys) {
  const result = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key in data) {
      result[key] = data[key]
    }
  }
  return result
}

/**
 * uppper first letter
 * 
 * @param {String} word 
 */
export function upperFirstLetter(word) {
  if (!word) return ''
  let temp = word.split('')
  temp[0] = temp[0].toUpperCase()
  return temp.join('')
}
/**
 * Determine if the parameter is a chinese coordinate
 * 
 * @param {Object} param0 
 */
export function isCoordInChina ({ lng, lat }) {
  return lng >= 73.66 && lng <= 135.05 && lat >= 3.86 && lat <= 53.55
}
