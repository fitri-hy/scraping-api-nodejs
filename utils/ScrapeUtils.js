const { get } = require('http');
const { get: getHttps } = require('https');
const { JSDOM } = require('jsdom');

/**
 * Fetches HTML content from a given URL.
 * @param {string} url - The URL to fetch HTML from.
 * @returns {Promise<string>} - A promise that resolves to the HTML content.
 */
const fetchHTML = (url) => {
    const lib = url.startsWith('https') ? getHttps : get;
    return new Promise((resolve, reject) => {
        lib(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
};

/**
 * Extracts data from HTML content based on given selectors.
 * @param {string} html - The HTML content to extract data from.
 * @param {string} parentSelector - The selector for parent elements.
 * @param {Array<Object>} childSelectors - Array of child selectors.
 * @returns {Array<Object>} - Array of extracted data objects.
 */
const extractData = (html, parentSelector, childSelectors) => {
    const { document } = new JSDOM(html).window;
    const parentElements = document.querySelectorAll(parentSelector);

    const dataArray = Array.from(parentElements).map(parentElement => {
        const data = {};
        childSelectors.forEach(({ key, selectors, attribute, textTransform, trim, default: defaultValue, single, multiple, delimiter }) => {
            let value = '';
            
            for (const selector of selectors) {
                const childElement = parentElement.querySelector(selector);
                if (childElement) {
                    value = attribute 
                        ? childElement.getAttribute(attribute) 
                        : childElement.textContent;

                    if (textTransform) {
                        value = value[textTransform]();
                    }

                    if (trim) {
                        value = value.trim();
                    }

                    break;
                }
            }
            
            if (value === '' && defaultValue !== undefined) {
                value = defaultValue;
            }

            if (multiple) {
                const elements = parentElement.querySelectorAll(selectors[0]);
                value = Array.from(elements).map(el => 
                    attribute ? el.getAttribute(attribute) : el.textContent.trim()
                ).join(delimiter || ', ');
            }

            if (single) {
                const firstElement = parentElement.querySelector(selectors[0]);
                if (firstElement) {
                    value = attribute ? firstElement.getAttribute(attribute) : firstElement.textContent.trim();
                }
            }

            data[key] = value;
        });

        const hasNonEmptyValues = Object.values(data).some(val => val.trim() !== '');
        return hasNonEmptyValues ? data : null;
    }).filter(item => item !== null);

    return dataArray;
};

module.exports = { fetchHTML, extractData };
