export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

export function toMonthInput(month, year) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function fromMonthInput(value) {
  const [year, month] = value.split('-').map(Number);
  return { month, year };
}

export function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
