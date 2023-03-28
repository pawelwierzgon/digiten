// Importing json file
import data from './data.json' assert {type: 'json'};

// Function returning a single blog post div
const blogPost = (title, date, content) => {
  const blogEntry = document.createElement('div');
  blogEntry.className = 'blog-entry box';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'blog-entry-title';
  
  const dateDiv = document.createElement('div');
  dateDiv.className = 'blog-entry-date';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'blog-entry-content';

  // Apply default values if data is missing
  titleDiv.innerText = title || 'Blog post';
  dateDiv.innerText = date || parseDate(new Date(Date.now()));
  contentDiv.innerText = content || '...';

  blogEntry.appendChild(titleDiv);
  blogEntry.appendChild(dateDiv);
  blogEntry.appendChild(contentDiv);

  return blogEntry;
}

// Sorting function
let sortingOrder = 'desc';
const sort = (data, order) => {
  if (order === 'asc') {
    data = data.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  } else {
    data = data.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  }
  return data;
}

// Function to append blog posts
const populateBlogEntries = data => {
  const blogEntries = document.querySelector('#blog-entries');
  blogEntries.innerHTML = '';
  if (data.length > 0) {
    data.map(entry => {
      blogEntries.appendChild(blogPost(entry.title, entry.date, entry.content));
    });
  } else {
    // If there is no data, show 'no data' info
    const noData = document.createElement('div');
    noData.classList.add('box');
    noData.innerText = 'No data to show! :(';
    blogEntries.appendChild(noData);
  }
};

// Get unique categories from the JSON and create filter checkboxes
// Create 'other' category if the field is empty
let categories = data.map(entry => entry.category);
categories = [...new Set(categories)];
categories.map(category => {
  const categoryInput = document.createElement('input');
  categoryInput.setAttribute('type', 'checkbox');
  categoryInput.setAttribute('value', category || 'other');
  categoryInput.id = `category-${category || 'other'}`;
  categoryInput.checked = true;

  const categoryLabel = document.createElement('label');
  categoryLabel.setAttribute('for', `category-${category || 'other'}`);
  categoryLabel.innerText = category || 'other';

  document.querySelector('#filter-category-form').appendChild(categoryInput);
  document.querySelector('#filter-category-form').appendChild(categoryLabel);
})

// Function to filter the posts with categories
const filterCategories = data => {
  let selectedCategories = [];
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(e => selectedCategories.push(e.value));

  let filteredData = data.filter(entry => selectedCategories.some(category => {
    if (category === 'other') {
      return entry.category === '';
    } else {
      return category === entry.category
    }
  }));
  return filteredData;
}

// Function to filter the posts with date range
const rangeFilter = (data, startValue, finishValue) => {
  return data.filter(entry => {
    const entryDate = new Date(entry.date).getTime();
    return entryDate >= new Date(startValue).getTime() && entryDate <= new Date(finishValue).getTime();
  })
}

// Function to apply all filters and populate the blog with the entries
const filterAndShowResults = data => {
  const sortedData = sort(data, sortingOrder);
  const filteredByCategoriesData = filterCategories(sortedData);
  const filteredByRangeData = rangeFilter(filteredByCategoriesData, currentStartValue, currentFinishValue);
  populateBlogEntries(filteredByRangeData);
}

// Apply default values on range filter (parsing Date to YYYY-MM-DD format)
const currentDate = new Date(Date.now());
const parseDate = date => {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  const day = date.getDate();
  return `${year}-${month}-${day}`;
}

// Set the min and max date values
const minValue = '2022-03-15';
const maxValue = parseDate(currentDate);

const minRangeFilter = document.querySelector('#filter-range-start');
minRangeFilter.value = minValue;
minRangeFilter.setAttribute('min', minValue);
minRangeFilter.setAttribute('max', maxValue);

const maxRangeFilter = document.querySelector('#filter-range-finish');
maxRangeFilter.value = maxValue;
maxRangeFilter.setAttribute('min', minValue);
maxRangeFilter.setAttribute('max', maxValue);

// Change the date range
let currentStartValue = minRangeFilter.value;
let currentFinishValue = maxRangeFilter.value
document.querySelector('#filter-range-form').addEventListener('change', e => {
  const startValue = new Date(minRangeFilter.value).getTime();
  const finishValue = new Date(maxRangeFilter.value).getTime();

  // Check if range is valid
  if (startValue > finishValue) {
    if (e.target.id === 'filter-range-start') {
      e.target.value = currentStartValue;
    } else {
      e.target.value = currentFinishValue;
    }
    window.alert('Invalid date range!');
  } else {
    currentStartValue = minRangeFilter.value;
    currentFinishValue = maxRangeFilter.value;
    filterAndShowResults(data);
  }
})

// Apply changes on categories change
document.querySelector('#filter-category-form').addEventListener('change', () => {
  filterAndShowResults(data);
})

// Categories button (toggling the visibility of categories filter)
document.querySelector('#filter-category-btn').addEventListener('click', () => {
  document.querySelector('#filter-category-list').classList.toggle('hidden');
})

// Range button (toggling the visibility of range filter)
document.querySelector('#filter-range-btn').addEventListener('click', () => {
  document.querySelector('#filter-range-list').classList.toggle('hidden');
})

// Sort button
document.querySelector('#filter-sort-btn').addEventListener('click', () => {
  sortingOrder = sortingOrder === 'desc' ? 'asc' : 'desc';
  document.querySelector('#filter-sort-btn').innerText = `Sort (${sortingOrder})`
  filterAndShowResults(data);
})

// Populate the blog with the entries
filterAndShowResults(data);