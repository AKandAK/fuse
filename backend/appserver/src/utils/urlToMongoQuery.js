function buildMongoQueryFromUrlParams(query, allowedFields = [], allowedOperators = []) {
  const mongoQuery = {};

  for (const [rawKey, value] of Object.entries(query)) {
    // Match pattern: field[operator] => e.g., founded[gte]
    const match = rawKey.match(/^(.+?)\[(.+)\]$/);

    if (match) {
      const [, field, operator] = match;

      if (allowedFields.includes(field) && allowedOperators.includes(operator)) {
        if (!mongoQuery[field]) mongoQuery[field] = {};

        if (['in', 'nin'].includes(operator)) {
          mongoQuery[field][`$${operator}`] = value.split(',');
        } else {
          mongoQuery[field][`$${operator}`] = isNaN(value) ? value : Number(value);
        }
      }
    } else if (allowedFields.includes(rawKey)) {
      // '=' operator (default equality when no operator brackets are present)
      mongoQuery[rawKey] = isNaN(value) ? value : Number(value);
    }
  }

  return mongoQuery;
}

module.exports = {
  buildMongoQueryFromUrlParams,
};
