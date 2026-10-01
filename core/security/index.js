export function normalizeJid(value=""){return String(value).replace(/:\d+(?=@)/g,"").toLowerCase()}
export function normalizePhone(value=""){let n=String(value).replace(/\D/g,"");if(n.startsWith("0"))n="62"+n.slice(1);return n}
export function isSafePath(value=""){return !String(value).includes("..")&&!String(value).includes("\0")}
export function redact(value){return String(value).replace(/(api[_-]?key|token|password|secret|authorization)(\s*[=:]\s*)[^\s,}]+/gi,"$1$2[REDACTED]")}
export function validateText(value,max=200){return typeof value==="string"&&value.length<=max}
export function createRateLimiter({max=10,windowMs=10000}={}){const map=new Map();return {check(key){const now=Date.now();const arr=(map.get(key)||[]).filter(t=>now-t<windowMs);if(arr.length>=max){map.set(key,arr);return false}arr.push(now);map.set(key,arr);return true},clear(){map.clear()}}}