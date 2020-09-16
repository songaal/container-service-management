

export default {
    parse(body) {
        if (!body) return {};
        return typeof body === 'string' ? JSON.parse(body) : body;
    }
}