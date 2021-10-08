/**
 * Quiz API
*/

/**
 * Create the random questions url
 * @param { Object } options 
 */
const createRandomQuestionsUrl = (options = {}) => {
  const QUIZ_API_URL = 'https://quizapi.io/api/v1/questions';
  const QUIZ_API_KEY = 'ZaFqCymaHFMo2jmROIwnsPsJLtsAAvimin7IR7P4';

  const randomQuestionUrl = new URL(QUIZ_API_URL);
  randomQuestionUrl.searchParams.append('apiKey', QUIZ_API_KEY);

  for(const key in options) {
    randomQuestionUrl.searchParams.append(key, options[key]);
  }
  return randomQuestionUrl;
}

/**
 * Gets the URL, fetches data and returns json
 * @param { Object } options 
 * @returns 
 */
export const fetchQuestions = async (options = {}) => {
  const data = await fetch(createRandomQuestionsUrl(options));
  const json = await data.json();
  return json;
}

