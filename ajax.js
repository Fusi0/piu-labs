class Ajax {
    constructor(options = {}) {
        const defaults = {
            baseURL: '',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 5000, // ms
        };

        this.options = {
            ...defaults,
            ...options,
            headers: {
                ...(defaults.headers || {}),
                ...((options && options.headers) || {}),
            },
        };
    }

    _buildUrl(url, params) {
        const base = this.options.baseURL
            ? this.options.baseURL.replace(/\/$/, '')
            : '';
        const path = url ? String(url) : '';
        let full = base + path;
        if (params && typeof params === 'object') {
            const esc = encodeURIComponent;
            const qs = Object.entries(params)
                .filter(([, v]) => v !== undefined && v !== null)
                .map(([k, v]) => {
                    if (Array.isArray(v))
                        return v.map((x) => `${esc(k)}=${esc(x)}`).join('&');
                    return `${esc(k)}=${esc(String(v))}`;
                })
                .join('&');
            if (qs) full += (full.includes('?') ? '&' : '?') + qs;
        }
        return full;
    }

    _mergeHeaders(localHeaders) {
        return {
            ...((this.options && this.options.headers) || {}),
            ...(localHeaders || {}),
        };
    }

    async _safeParse(res) {
        const text = await res.text();
        try {
            return JSON.parse(text === '' ? 'null' : text);
        } catch (err) {
            return text;
        }
    }

    async _request(method, url, { params, data, headers, timeout } = {}) {
        const fullUrl = this._buildUrl(url, params);
        const mergedHeaders = this._mergeHeaders(headers);

        const controller = new AbortController();
        const t = timeout != null ? timeout : this.options.timeout;
        const timer = setTimeout(() => controller.abort(), t);

        const init = {
            method: method.toUpperCase(),
            headers: mergedHeaders,
            signal: controller.signal,
        };

        if (data !== undefined) {
            if (typeof data === 'object' && !(data instanceof FormData)) {
                init.body = JSON.stringify(data);
                if (
                    !Object.keys(init.headers).some(
                        (h) => h.toLowerCase() === 'content-type'
                    )
                ) {
                    init.headers['Content-Type'] = 'application/json';
                }
            } else {
                init.body = data;
            }
        }

        let res;
        try {
            res = await fetch(fullUrl, init);
        } catch (err) {
            clearTimeout(timer);
            if (err.name === 'AbortError') {
                throw new Error(`Request timed out after ${t} ms`);
            }
            throw new Error(`Network error: ${err.message}`);
        }

        clearTimeout(timer);

        const parsed = await this._safeParse(res);

        if (!res.ok) {
            const bodyPreview =
                typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
            const msg =
                `HTTP ${res.status} ${res.statusText}` +
                (bodyPreview ? `: ${bodyPreview}` : '');
            const err = new Error(msg);
            err.status = res.status;
            err.statusText = res.statusText;
            err.body = parsed;
            throw err;
        }

        return parsed;
    }

    async get(url, options = {}) {
        return this._request('GET', url, options);
    }

    async post(url, data, options = {}) {
        return this._request('POST', url, { ...options, data });
    }

    async put(url, data, options = {}) {
        return this._request('PUT', url, { ...options, data });
    }

    async delete(url, options = {}) {
        return this._request('DELETE', url, options);
    }
}

try {
    if (typeof module !== 'undefined' && module.exports) module.exports = Ajax;
} catch (e) {}
try {
    if (typeof window !== 'undefined') window.Ajax = Ajax;
} catch (e) {}

export default Ajax;
