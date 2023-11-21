// Each row in the test suite has 6 values:
// 1. a number or string representation of a number
// 2. a desired precision
// 3. what the number should round to at that precision
// 4. what it should conservatively round to erring low
// 5. what it should conservatively round to erring high
// 6. what the inferred precision should be
const suite = [
['0', 1, 0, 0, 0, 1],
[1, .1, 1, 1, 1, 1],
[.5, 1, 1, 0, 1, .1],
[.55, .5, .5, .5, 1, .01],
[.55, .1, .6, .5, .6, .01],
['.1', 1, 0, 0, 1, .1],
['.12', .1, .1, .1, .2, .01],
['.123', .01, .12, .12, .13, .001],
['3.0001', 1, 3, 3, 4, .0001],
['-0', .01, 0, 0, 0, 1],
['+0', .01, 0, 0, 0, 1],
['+1', 0, 1, 1, 1, 1],
['-1.1', 1, -1, -2, -1, .1],
['1000000.000001', 1, 1000000, 1000000, 1000001, .000001],
[123, .5, 123, 123, 123, 1],
[67.34, .1, 67.3, 67.3, 67.4, .01],
[67.89, .1, 67.9, 67.8, 67.9, .01],
[67.89, 1, 68, 67, 68, .01],
[123.0001, .001, 123, 123, 123.001, .0001],
[999.999, .1, 1000, 999.9, 1000, .001],
[.9, .1, .9, .9, .9, .1],
[.99, .01, .99, .99, .99, .01],
[.999, .001, .999, .999, .999, .001],
[.9999, .0001, .9999, .9999, .9999, .0001],
[.99999, .00001, .99999, .99999, .99999, .00001],
[.9, 1, 1, 0, 1, .1],
[.99, .1, 1, .9, 1, .01],
[.999, .01, 1, .99, 1, .001],
[.9999, .001, 1, .999, 1, .0001],
[.99999, .0001, 1, .9999, 1, .00001],
[.1, .1, .1, .1, .1, .1],
[.12, .01, .12, .12, .12, .01],
[.123, .01, .12, .12, .13, .001],
['0.0', .1, 0, 0, 0, .1],
[.01, .01, .01, .01, .01, .01],
[.012, .01, .01, .01, .02, .001],
['0.00', .01, 0, 0, 0, .01],
[.001, .001, .001, .001, .001, .001],
[.0012, .001, .001, .001, .002, .0001],
['1.', .1, 1, 1, 1, 1],
[1.1, .1, 1.1, 1.1, 1.1, .1],
[1.12, .01, 1.12, 1.12, 1.12, .01],
[1.123, .01, 1.12, 1.12, 1.13, .001],
['1.0', .1, 1, 1, 1, .1],
[1.01, .01, 1.01, 1.01, 1.01, .01],
[1.012, .01, 1.01, 1.01, 1.02, .001],
['1.00', .01, 1, 1, 1, .01],
[1.001, .01, 1.00, 1.00, 1.01, .001],
[1.0012, .01, 1.00, 1.00, 1.01, .0001],
[12, 1, 12, 12, 12, 1],
[12.1, .1, 12.1, 12.1, 12.1, .1],
[12.12, .1, 12.1, 12.1, 12.2, .01],
[12.0, .1, 12.0, 12.0, 12.0, 1],
[12.01, .1, 12.0, 12.0, 12.1, .01],
[12.012, .1, 12.0, 12.0, 12.1, .001],
['12.00', 1, 12, 12, 12, .01],
[12.001, .1, 12, 12, 12.1, .001],
[123, 1, 123, 123, 123, 1],
[123.1, 1, 123, 123, 124, .1],
[123.12, 1, 123, 123, 124, .01],
[123.01, 1, 123, 123, 124, .01],
[1234, 1, 1234, 1234, 1234, 1],
[1234.1, 1, 1234, 1234, 1235, .1],
[1234.01, 1, 1234, 1234, 1235, .01],
[.0089, .001, .009, .008, .009, .0001],
[1.09, .1, 1.1, 1.0, 1.1, .01],
[12.9, 1, 13, 12, 13, .1],
[10.5, 1, 11, 10, 11, .1],
[12.34, 1, 12, 12, 13, .01],
[-.01, .01, -.01, -.01, -.01, .01],
[-.129, .01, -.13, -.13, -.12, .001],
[-.029, .01, -.03, -.03, -.02, .001],
['007', 1, 7, 7, 7, 1],
[12.34, .099999999999999999, 12.3, 12.3, 12.4, .01],
[45.50, .10000000000000001, 45.5, 45.5, 45.5, .1],
[7.37, .25, 7.25, 7.25, 7.5, .01],
[0.000321, .001, 0, 0, .001, .000001],
]

// mathyval and shownum? 

/******************************************************************************
 *                         QUANTIZE AND CONSERVAROUND                         *
 ******************************************************************************/

const round = Math.round

// Normalize number: Return the canonical string representation. Is idempotent.
// If we were true nerds we'd do it like wikipedia.org/wiki/Normalized_number
// but instead we're canonicalizing via un-scientific-notation-ing. The other
// point of this is to not lose trailing zeros after the decimal point.
function normberlize(x) {
  x = typeof x == 'string' ? x.trim() : x.toString()  // stringify the input
  const car = x.charAt(0), cdr = x.substr(1)          // 1st char, rest of chars
  if (car === '+') x = cdr                            // drop the leading '+'
  if (car === '-') return '-'+normberlize(cdr)        // set aside leading '-'
  x = x.replace(/^0+([^eE])/, '$1')                   // ditch leading zeros
  const rnum = /^(?:\d+\.?\d*|\.\d+)$/                // eg 2 or 3. or 6.7 or .9
  if (rnum.test(x)) return x                          // already normal! done!
  const rsci = /^(\d+\.?\d*|\.\d+)e([+-]?\d+)$/i      // scientific notation
  const marr = x.match(rsci)                          // match array
  if (!marr || marr.length !== 3) return 'NaN'        // hammer cain't parse dis
  let [, m, e] = marr                                 // mantissa & exponent
  let dp = m.indexOf('.')                             // decimal point position
  if (dp===-1) dp = m.length                          // (implied decimal point)
  dp += +e                                            // scooch scooch
  m = m.replace(/\./, '')                             // mantissa w/o decimal pt
  if (dp < 0) return '.' + '0'.repeat(-dp) + m        // eg 1e-3 -> .001
  if (dp > m.length) m += '0'.repeat(dp - m.length)   // eg 1e3 -> 1000
  else m = m.substring(0, dp) + '.' + m.substring(dp) // eg 12.34e1 -> 123.4
  return m.replace(/\.$/, '').replace(/^0+(.)/, '$1') // eg 0023. -> 23
}

// Infer precision, eg, .123 -> .001 or "12.0" -> .1 or "100" -> 1.
// It seems silly to do this with regexes on strings instead of with floors and
// logs and powers and such but (a) the string the user typed is the ground
// truth and (b) using the numeric representation we wouldn't be able to tell
// the difference between, say, "3" (precision 1) and "3.00" (precision .01).
function quantize(x) {
  let s = normberlize(x)               // put the input in canonical string form
  if (/^-?\d+\.?$/.test(s)) return 1   // no decimal pt (or only a trailing one)
  s = s.replace(/^-?\d*\./, '.')       // eg, -123.456 -> .456
  s = s.replace(/\d/g, '0')            // eg,             .456 -> .000
  s = s.replace(/0$/, '1')             // eg,                     .000 -> .001
  return +s                            // return the thing as an actual number
}

// Round x to the nearest r. We expect r to either be an integer, like rounding
// to the nearest 10 or 1000, or a negative power of 10 like rounding to the 
// nearest .01. Note that r is not a number of decimal places. E.g., if x is an 
// amount of money then you'd want tidyround(x, .01) not tidyround(x, 2) which 
// rounds to the nearest even number. This is similar to just doing round(x/r)*r
// but it fixes floating point hideousness like if you try to round .34 to the
// nearest tenth you get round(.34/.1)*.1 = 0.30000000000000004 instead of 0.3.
// Limitation: We're only guaranteed to avoid such hideousness if r is an
// integer or a negative power of 10.
function tidyround(x, r=1) {
  if (r < 0) return NaN   // this makes no sense and probably wants a loud error
  if (r===0) return +x    // full machine precision!
  const y = round(x/r)    // naively we'd just be returning round(x/r)*r but...
  const marr = r.toExponential().match(/^1e-(\d+)$/) // match array for r ~1e-XX
  if (!marr) return y*r           // do the naive round(x/r)*r thing if no match
  const dp = +marr[1]         // we're just rounding to this many decimal places
  return round(x*10**dp)/10**dp
  //return +`${y}e${-marr[1]}`   // put it back together and parse it as a float
  // PS: If we know that r is a negative power of ten then it works to just do
  // round(x*10**dp)/10**dp where dp is the number of decimal places. Eg, to
  // round to 3 decimal places we can just do round(x*1000)/1000. If we try to 
  // do round(x/.001)*.001 that can generate floating point hideousness but
  // round(x*1000)/1000 is fine.
  // PPS: It may also work to do this:
  // Round x to dp decimal places. So dp=0 means normal integer rounding.
  // function roundp(x, dp=0) { return Number.parseFloat(x.toFixed(dp)) }
}

// Round x to the nearest r ... that's >= x if e is +1
//                          ... that's <= x if e is -1
function conservaround(x, r=1, e=0) {
  let y = tidyround(x, r)
  if (e===0) return y  // calling this with e=0 is the same as calling tidyround
  if (e < 0 && y > x) y -= r    // oops, too high and we need to err low
  if (e > 0 && y < x) y += r    // oops, too low and we need to err high
  return tidyround(y, r) // already rounded but the +r can fu-loatingpoint it up
}

/******************************************************************************
 *                                  WEBSITE                                   *
 ******************************************************************************/

// Take a number x and precision p and return the list of html strings for 
// inserting into the table
function gussy(x, p) {
  return [
    `<pre>${x}</pre>`,
    `<font color=#999999><pre>&plusmn;${p}</pre></font>`,
    `<pre>${conservaround(x, p,  0)}</pre>`,
    `<pre>${conservaround(x, p, -1)}</pre>`,
    `<pre>${conservaround(x, p, +1)}</pre>`,
    `<font color=#999999><pre>&plusmn;${quantize(x)}</pre></font>`,
  ]
}

// Take a list and insert it as a row in the html table at position r
function insertrow(row, r=0) { // default args are an es6 thing
  const htmlrow = document.getElementById("ntable").insertRow(r)
  row.forEach((c,i) => htmlrow.insertCell(i).innerHTML = c)
}

let ncur = ''      // current number as typed so far
let nfin           // final number the user submitted
let lastpress = -1 // last keypress

suite.forEach(row => insertrow(gussy(row[0], row[1]), -1))

$('#nform').submit(event => {
  event.preventDefault()
  const quan = +$('#quantum').val()
  nfin = $('#nfield').val()
  if (nfin !== '') {
    insertrow(gussy(nfin, quan))
    $('#nfield').val('')
    $('#nfield').focus()
  }
})

$('#nfield').keydown(event => {
  if (event.which === 38 && lastpress !== 38) { // up-arrow: show last number
    lastpress = 38
    ncur = $('#nfield').val()
    $('#nfield').val(nfin) // at this point nfin is the previously submitted val
    return false // this makes the cursor go to the end for whatever reason
  } else if (event.which === 40) { // dn-arrow: back to what users was typing
    lastpress = 40
    $('#nfield').val(ncur)
    return false
  } else { 
    lastpress = event.which
  }
})

/******************************************************************************
 *                                 TEST SUITE                                 *
 ******************************************************************************/

let ntest = 0 // count how many tests we do
let npass = 0 // count how many pass

const CLOG = console.log

// Takes a boolean assertion and a message string, prints a warning to the 
// browser console if the assertion is false. Also increment the test counter.
// (But mainly I wanted to just type "assert" instead of "console.assert")
function assert(test, msg) {
  ntest += 1
  npass += test
  console.assert(test, msg)
}

function testsuite() {
  ntest = npass = 0
  let x, p, n, a, b, i // x rounded to nearest p = n in [a,b] w/ inferred prec i
  let n2, a2, b2, i2   // above is expected, this is what's actually calculated
  suite.forEach(row => {
    [x, p, n, a, b, i] = row
    n2 = conservaround(x, p,  0)
    a2 = conservaround(x, p, -1)
    b2 = conservaround(x, p, +1)
    i2 = quantize(x)
    // i'd like to make these test failures more readable, with little
    // checkmarks for outputs that match and maybe "old != new" for those that
    // don't...
    // PS: no, wait, pumpkintime.glitch.me has a better version of all this,
    // showing the test failures on the actual page, not just in the console.
    assert(n2 === n && a2 === a && b2 === b && i2 === i, 
      `ERROR: ${x} +/- ${p}: `
      + (n===n2 ? `≈${n}✓` : `${n}→${n2}`)
      + `, [${a}, ${b}] -> [${a2}, ${b2}], ${i} -> ${i2}`)
  })
  return npass + "/" + ntest + " tests passed"
}
CLOG(testsuite()) // uncomment when testing and look in the browser console!


/******************************************************************************
 *                      STUFF WE'RE NOT CURRENTLY USING                       *
 ******************************************************************************/

// Polyfills for pre-ES2015 (do we still care about pre-ES2015 in 2022?)
/*
Math.log10 = Math.log10 || function(x) { return Math.log(x) * Math.LOG10E }
Math.sign = Math.sign || function(x) {
  x = +x // convert to a number
  if (x === 0 || isNaN(x)) { return +x }
  return x > 0 ? 1 : -1
}
*/

/*
// Round x to nearest r like Mathematica, breaking ties in favor of even numbers
// Another way to round without Math.round: let y = +x+r/2, return y-(y%r)
function mround(x, r=1) { 
  if (r < 0) return NaN                 
  if (r === 0) return +x
  const u = Math.abs(x)                    // unsigned version of x
  const q = Math.floor(u/r)                // quotient: how many r's to get to u
  if (u === q*r) return +x                 // u is already a multiple of r
  const m = u % r                          // modulus: q*r + m = u
  const a = Math.sign(x) * q     * r       // x rounded down to a multiple of r
  const b = Math.sign(x) * (q+1) * r       // x rounded up to a multiple of r
  console.log(`DEBUG: [a,b]=[${a},${b}]`)
  if (2*m < r) return a                    // m < r/2 (modulus is closer to a)
  if (2*m > r) return b                    // m > r/2 (modulus is closer to b)
  const lastdig = +a.toString().substr(-1)
  console.log(`DEBUG: lastdig=${lastdig}`)
  // quibble: if you round 14 to the nearest 4 you get either 12 or 16 and this 
  // breaks the tie by rounding down since both 12 and 16 are even.
  if (lastdig % 2 === 0) return a
  return b
}

const illionhash = {
//  3: 'K',
    6: 'M',
    9: 'B',
   12: ' trillion',          // or "million million"
   15: ' quadrillion',       // or "million billion"
   18: ' quintillion',       // or "billion billion"
   21: ' sextillion',        // or "billion trillion"
   24: ' septillion',        // or "trillion trillion"
   27: ' octillion',         // or "million billion trillion"
   30: ' nonillion',         // or "million trillion trillion"
   33: ' decillion',         // or "billion trillion trillion"
   36: ' undecillion',       // or "trillion trillion trillion"
   39: ' duodecillion',
   42: ' tredecillion',
   45: ' quattuordecillion',
   48: ' quindecillion',
   51: ' sexdecillion' ,
   54: ' septendecillion',
   57: ' octodecillion',
   60: ' novemdecillion',
   63: ' vigintillion',
  100: ' googol',
}

// Take the exponent p in scientific notation and return a human readable string
function illion(p) {
  //if (p ===   3) return 'K'
  return ` * 10^${p}`
}

const log = Math.floor(Math.log10(Math.abs(x)))
if (log >= 6) {
  pow = Math.pow(10, log)
  return +(x/pow).toFixed(1) + illion(log)
}

*/

// Parse a number into an array [S, L, R] where:
//   S is the sign, -1 or +1
//   L is the string of digits before the decimal point
//   R is the string of digits after the decimal point
// For example:
//   -30.04 parses to [-1, "30", "04"]
//   1e-6 parses to [+1, "", "000001"]
//function parsenum(x) { ... }

// $('#nfield').attr('placeholder', 'e.g. 123.456')

// ---------------------------------- 80chars --------------------------------->
