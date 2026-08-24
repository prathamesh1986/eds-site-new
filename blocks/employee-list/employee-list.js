import { toCamelCase } from '../../scripts/aem.js';

const PAGE_SIZE = 10;
const COLUMNS = ['Name', 'Department', 'Experience', 'City'];

/**
 * Fetches a published sheet as JSON.
 * @param {string} path Sheet path without extension (e.g. `/employees`)
 * @returns {Promise<object[]>} the sheet's data rows
 */
async function fetchData(path) {
  try {
    const resp = await fetch(`${path}.json`);
    if (!resp.ok) return [];
    const json = await resp.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Fetches the placeholders sheet and returns it as a camelCased key/value map.
 * @returns {Promise<Record<string, string>>}
 */
async function fetchPlaceholders() {
  try {
    const resp = await fetch('/placeholders.json');
    if (!resp.ok) return {};
    const json = await resp.json();
    return (json.data || []).reduce((map, row) => {
      if (row.Key) map[toCamelCase(row.Key)] = row.Value;
      return map;
    }, {});
  } catch {
    return {};
  }
}

/**
 * loads and decorates the employee list
 * @param {Element} block The employee-list block element
 */
export default async function decorate(block) {
  // data source: a link or plain-text path in the block, e.g. "/employees"
  const link = block.querySelector('a');
  const path = (link ? link.getAttribute('href') : block.textContent).trim();
  block.textContent = '';

  const [employees, placeholders] = await Promise.all([
    fetchData(path),
    fetchPlaceholders(),
  ]);

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  COLUMNS.forEach((col) => {
    const th = document.createElement('th');
    th.textContent = col;
    headRow.append(th);
  });
  thead.append(headRow);
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);
  block.append(table);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'employee-list-more button';
  button.textContent = placeholders.loadMore || 'Load more';

  let shown = 0;
  const renderNext = () => {
    employees.slice(shown, shown + PAGE_SIZE).forEach((emp) => {
      const tr = document.createElement('tr');
      COLUMNS.forEach((col) => {
        const td = document.createElement('td');
        td.textContent = emp[col] || '';
        tr.append(td);
      });
      tbody.append(tr);
    });
    shown += PAGE_SIZE;
    if (shown >= employees.length) button.hidden = true;
  };

  renderNext();

  if (employees.length > PAGE_SIZE) {
    button.addEventListener('click', renderNext);
    block.append(button);
  }
}
