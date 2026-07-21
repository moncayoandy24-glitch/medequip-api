class BaseEntity {
  constructor(data = {}, fields = []) {
    for (const field of fields) this[field] = data[field] ?? null;
  }

  toJSON() {
    return Object.fromEntries(Object.entries(this));
  }

  static fromRow(row) {
    return row ? new this(row) : null;
  }

  static fromRows(rows = []) {
    return rows.map((row) => this.fromRow(row));
  }
}

module.exports = { BaseEntity };
