class APIFeatures {
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    find(){
        const body = {...this.queryStr};
        

        const excluded = ['page','sort','limit','fields'];
        excluded.forEach(el => delete body[el]);

        let queryStr = JSON.stringify(body);
        queryStr = queryStr.replace(/\b(eq|gt|gte|lt|lte|ne)\b/g,match => `$${match}`);

        this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort(){
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        else{
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    filter(){
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        else{
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pagination(count){
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query.skip(skip).limit(limit);

        if (this.queryStr.page) {
            if (count < skip) {
                throw 'this page dose not exist';
            }
        }
        return this;
    }
}
module.exports = APIFeatures;