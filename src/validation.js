var Validator = require('jsonschema').Validator
var validateSchema = new Validator()

const schema_account = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'user name'
    },
    onBudget: {
      type: 'boolean'
    },
    name: {
      type: 'string'
    },
    sort: {
      type: 'integer'
    },
    closed: {
      type: 'boolean'
    },
    type: {
      type: 'string'
    },
    _deleted: {
      type: 'boolean'
    },
    _rev: {
      type: 'string'
    }
  },
  required: ['_id', 'onBudget', 'name', 'sort', 'closed', 'type']
}

const schema_transaction = {
  type: 'object',
  properties: {
    value: {
      type: 'integer'
    },
    date: {
      type: 'string'
    },
    category: {
      type: ['string', 'null']
    },
    account: {
      type: 'string'
    },
    memo: {
      type: ['string', 'null']
    },
    cleared: {
      type: 'boolean'
    },
    reconciled: {
      type: 'boolean'
    },
    flag: {
      type: 'string'
    },
    payee: {
      type: ['string', 'null']
    },
    transfer: {
      type: ['string', 'null'],
      minLength: 36,
      maxLength: 36
    },
    splits: {
      type: ['null', 'array', 'object']
    },
    _id: {
      type: 'string',
      minLength: 87,
      maxLength: 87
    },
    _deleted: {
      type: 'boolean'
    },
    _rev: {
      type: 'string'
    }
  },
  required: [
    'value',
    'date',
    'category',
    'account',
    'memo',
    'cleared',
    'reconciled',
    'flag',
    'payee',
    'transfer',
    'splits',
    '_id'
  ]
}

const schema_category = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: 84,
      maxLength: 84
    },
    sort: {
      type: ['null', 'integer', 'number']
    },
    masterCategory: {
      type: 'string',
      minLength: 36,
      maxLength: 36
    },
    name: {
      type: 'string'
    },
    _deleted: {
      type: 'boolean'
    },
    _rev: {
      type: 'string'
    }
  },
  required: ['_id', 'sort', 'masterCategory', 'name']
}

const schema_m_category = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: 97,
      maxLength: 97
    },
    budget: {
      type: ['null', 'integer']
    },
    overspending: {
      type: ['boolean', 'null']
    },
    hidden: {
      type: ['boolean', 'null']
    },
    _deleted: {
      type: 'boolean'
    },
    _rev: {
      type: 'string'
    }
  },
  required: ['_id', 'budget', 'overspending']
}

const schema_masterCategory = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: 91,
      maxLength: 91
    },
    name: {
      type: 'string'
    },
    sort: {
      type: ['integer', 'number']
    },
    collapsed: {
      type: ['boolean', 'null']
    },
    hidden: {
      type: ['boolean', 'null']
    },
    _deleted: {
      type: 'boolean'
    },
    _rev: {
      type: 'string'
    }
  },
  required: ['_id', 'name', 'sort', 'collapsed']
}

const schema_payee = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: 81,
      maxLength: 81
    },
    name: {
      type: 'string'
    },
    _deleted: {
      type: 'boolean'
    },
    _rev: {
      type: 'string'
    }
  },
  required: ['_id', 'name']
}

const schema_budget = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: 43,
      maxLength: 43
    },
    name: {
      type: 'string'
    },
    created: {
      type: 'string'
    },
    currency: {
      type: 'string'
    },
    checkNumber: {
      type: 'boolean'
    },
    _deleted: {
      type: 'boolean'
    },
    _rev: {
      type: 'string'
    }
  },
  required: ['_id', 'name', 'created', 'currency', 'checkNumber']
}

const schema_budget_opened = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: 50,
      maxLength: 50
    },
    opened: {
      type: 'string'
    },
    _deleted: {
      type: 'boolean'
    },
    _rev: {
      type: 'string'
    }
  },
  required: ['_id', 'opened']
}

export {
  schema_budget,
  schema_budget_opened,
  schema_account,
  schema_transaction,
  schema_category,
  schema_m_category,
  schema_masterCategory,
  schema_payee,
  validateSchema
}
