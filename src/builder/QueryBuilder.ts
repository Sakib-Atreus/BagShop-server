import { FilterQuery, Query } from "mongoose";
import { excludedFields } from "../constent";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  // Search method to handle multiple fields and partial matching
  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;

    if (typeof searchTerm === "string" && searchTerm.trim()) {
      const terms = searchTerm.split(",").map((term) => term.trim());

      this.modelQuery = this.modelQuery.find({
        $or: terms.flatMap((term) =>
          searchableFields.map((field) => ({
            [field]: { $regex: term, $options: "i" },
          }))
        ),
      });
    }

    return this;
  }

  // Filter method to handle general filters based on query
  filter() {
    const queryObject = { ...this.query };
    const exclude = excludedFields;

    exclude.forEach((ele) => delete queryObject[ele]);

    // Handle special cases for filtering
    if (queryObject.price) {
      const maxPrice = Number(queryObject.price);
      if (!isNaN(maxPrice) && maxPrice > 0) {
        queryObject.currentPrice = { $lte: maxPrice }; // Apply price filter
      }
      delete queryObject.price; // Remove price from the query object
    }

    if (queryObject.inStock !== undefined) {
      queryObject.totalQuantity = queryObject.inStock ? { $gt: 0 } : { $eq: 0 };
    }

    this.modelQuery = this.modelQuery.find(queryObject as FilterQuery<T>);

    return this;
  }

  // Popular products filtering based on the number requested
  mostPopularProducts() {
    const popularItem = this.query.popularItem;

    if (popularItem) {
      const item = Number(popularItem);
      if (!isNaN(item)) {
        this.modelQuery = this.modelQuery
          .sort({ sellsQuantity: -1 })
          .limit(item);
      }
    }

    return this;
  }

  // Sorting logic based on query
  sort() {
    const sort =
      (this?.query?.sort as string)?.split(",")?.join(" ") || "createdAt";
    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  // Pagination logic to skip and limit the number of documents
  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  // Field selection logic
  fields() {
    const fields =
      (this?.query?.fields as string)?.split(",")?.join(" ") || "-__v";

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  // Price range filter
  productWithPriceRange() {
    const maxPrice = this.query.price;
    if (maxPrice) {
      const price = Number(maxPrice);
      if (!isNaN(price) && price > 0) {
        this.modelQuery = this.modelQuery.find({
          currentPrice: { $gte: 0, $lte: price },
        });
      }
    }

    return this;
  }

  // Stock filter (either in stock or out of stock)
  checkInStock() {
    // Ensure the inStock value is either true or false
    const stock = this.query.inStock === "true" || this.query.inStock === true;

    if (stock) {
      this.modelQuery = this.modelQuery.find({
        totalQuantity: { $gt: 0 },
      });
    } else if (this.query.inStock === "false" || this.query.inStock === false) {
      this.modelQuery = this.modelQuery.find({
        totalQuantity: { $eq: 0 },
      });
    }

    return this;
  }

  // Total count logic (commented out, but can be used if needed)
  // async countTotal() {
  //   const totalQueries = this.modelQuery.getQuery();
  //   const total = await this.modelQuery.model.countDocuments(totalQueries);
  //   const page = Number(this?.query?.page) || 1;
  //   const limit = Number(this?.query?.limit) || 10;
  //   const totalPage = Math.ceil(total / limit);

  //   return {
  //     page,
  //     limit,
  //     totalPage,
  //   };
  // }
}

export default QueryBuilder;
