export function Counter(array) {
    array.forEach(val => this[val] = (this[val] || 0) + 1);
}
