/**
 * Write data to local storage with key-value pair
 * @param { String } key 
 * @param { String } data 
 * @returns 
 */
const writeToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

/**
 * Gets data from local storage by Key
 * @param { String } key 
 * @returns 
 */
const readFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || null;

export { writeToStorage, readFromStorage };