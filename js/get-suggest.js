function Suggest() {}

Suggest.getAreas = (text, callback, err_callback) => {
    let url = `https://api.hh.ru/suggests/areas?text=${text}`;

    window.fetch(url)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            if (typeof callback === 'function')
                callback(json.items);
        })
        .catch((err) => {
            if (typeof err_callback === 'function')
                err_callback(err);
        });
};

export {Suggest}