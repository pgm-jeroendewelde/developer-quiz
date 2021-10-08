/**
 * Creates a div container
 * @param { Object } param0 
 */
export const createContainer = ({id = null, content = null,  classList = []}) => {
  const div = document.createElement('div');

  id !== null ? div.id = id : '';
  content !== null ? div.textContent = content : '';
  if(classList && classList.length > 0) {
    div.classList.add(...classList);
  }
  return div;
}

/**
 * Create a form element
 * @param { Object } param0 
 * @returns 
 */
export const createForm = ({id = '', action = '#', classList = []}) => {
  const form = document.createElement('form');

  form.setAttribute('action', action);
  id !== '' ? form.setAttribute('id', id) : '';
  if(classList && classList.length > 0) {
    form.classList.add(...classList);
  }
  return form;
}

/**
 * Create an Input element, type & name must be defined
 * @param { Object } param0 
 * @returns 
 */
export const createInput = ({type, name, value = null, id = null, min = null, max = null, placeholder = null, classList = []}) => {
  const input = document.createElement('input');
  
  input.type = type;
  name !== null ? input.name = name : '';
  placeholder !== null? input.placeholder = placeholder : '';
  
  if(id !== null ) input.id = id
  else input.id = `${name}-${value}`
  
  value !== null ? input.setAttribute('value', value) : '';
  min !== null ? input.min = min : '';
  max !== null ? input.max = max : '';

  if(classList && classList.length > 0) {
    input.classList.add(...classList);
  }
  return input;
}

/**
 * Create a label with content
 * @param { Object } param0 
 * @returns 
 */
export const createLabel = ({content, name, classList = []}) => {
  const label = document.createElement('label');
  label.setAttribute('for', name);
  label.textContent = content;
  if(classList && classList.length > 0) {
    label.classList.add(...classList);
  }
  return label;
}

/**
 * Create a heading-tag, type defines <h1> - <h6>
 * @param { Object } param0 
 * @returns 
 */
export const createHeading = ({type = 1, id = null, content = 'title', classList = []}) => {
  let heading = '';
  if(type >= 1 || type <= 6) {
    
    heading = document.createElement(`h${type}`);
  } else {
    heading = document.createElement('h1');
  }
  id !== null ? heading.id = id : '';
  heading.innerText = content;
  if(classList && classList.length > 0) {
    heading.classList.add(...classList);
  }
  return heading;
}


/**
 * Creates a paragraph
 * @param { Object } param0 
 */
 export const createParagraph = ({id = null,  classList = []}) => {
  const p = document.createElement('p');
  id !== null ? p.id = id : '';
  if(classList && classList.length > 0) {
    p.classList.add(...classList);
  }
  return p;
}

/**
 * Creates an Unordered list
 * @param { Object } param0 
 */
 export const createUnorderedList = ({id = null,  classList = []}) => {
  const ul = document.createElement('ul');
  id !== null ? ul.id = id : '';
  if(classList && classList.length > 0) {
    ul.classList.add(...classList);
  }
  return ul;
}

/**
 * Creates a List item
 * @param { Object } param0 
 */
 export const createListItem = ({id = null,  classList = []}) => {
  const li = document.createElement('li');
  id !== null ? li.id = id : '';
  if(classList && classList.length > 0) {
    li.classList.add(...classList);
  }
  return li;
}

/**
 * Creates a span
 * @param { Object } param0 
 */
 export const createSpan = ({id = null,  classList = []}) => {
  const span = document.createElement('span');
  id !== null ? span.id = id : '';
  if(classList && classList.length > 0) {
    span.classList.add(...classList);
  }
  return span;
}
