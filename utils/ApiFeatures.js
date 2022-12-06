class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const filQueries = { ...this.queryString };
    const excludeItems = ["limit", "page", "sort", "fields"];
    excludeItems.forEach((el) => delete filQueries[el]);
    let strQueries = JSON.stringify(filQueries);
    strQueries = strQueries.replace(
      /\b(gte|lte|lt|gt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(strQueries));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort);
    }
    return this;
  }
  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeature;
