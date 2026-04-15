import '@testing-library/jest-dom';

// jsdom does not implement layout APIs
window.HTMLElement.prototype.scrollIntoView = () => {};
