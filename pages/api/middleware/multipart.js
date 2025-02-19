import formidable from 'formidable';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function parseMultipartForm(req, res) {
    return new Promise((resolve, reject) => {
        const form = formidable({ multiples: true });
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            req.body = fields;
            req.files = files;
            resolve();
        });
    });
}