const axios = require('axios');

const BASE_URL = 'https://www.googleapis.com/books/v1';

// Flatten a Google Books "volume" into the shape the app uses
function normalizeVolume(volume) {
    const info = volume.volumeInfo ?? {};
    const year = parseInt(info.publishedDate, 10); // "1966" or "1966-05-01" -> 1966

    return {
        bookId: volume.id,
        title: info.title ?? 'Untitled',
        authors: info.authors ?? [],
        publishYear: Number.isNaN(year) ? null : year,
        // The detail endpoint returns HTML descriptions, so strip the tags
        description: info.description ? info.description.replace(/<[^>]*>/g, '') : null,
        categories: info.categories ?? [],
        thumbnail: info.imageLinks?.thumbnail?.replace(/^http:/, 'https:') ?? null,
        pageCount: info.pageCount ?? null,
        link: volume.accessInfo?.webReaderLink ?? info.previewLink ?? info.infoLink,
    };
}

async function searchBooks(query, startIndex = 0) {
    const response = await axios.get(`${BASE_URL}/volumes`, {
        params: { q: query, startIndex, maxResults: 20, printType: 'books', key: process.env.API_KEY },
        timeout: 5000,
    });
    return {
        totalItems: response.data.totalItems ?? 0,
        books: (response.data.items ?? []).map(normalizeVolume),
    };
}

async function getBookById(bookId) {
    try {
        const response = await axios.get(`${BASE_URL}/volumes/${encodeURIComponent(bookId)}`, {
            params: {key: process.env.API_KEY},
            timeout: 5000, 
        });
        return normalizeVolume(response.data);
    } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 400)
            return null;
        throw error;
    }
}

module.exports = { searchBooks, getBookById };