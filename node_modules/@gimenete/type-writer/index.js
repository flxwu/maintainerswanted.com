const prettier = require('prettier')
const camelcase = require('camelcase')
const assert = require('assert')

const defaultPrettierOptions = {
  parser: 'babylon',
  semi: false
}

const deepEqual = (a, b) => {
  try {
    assert.deepEqual(a, b)
    return true
  } catch (err) {
    return false
  }
}

const replacer = (key, value) => (key === 'keypath' ? undefined : value)

// Simple way of copying the objects ignoring the "keypath" key
const simpleCopy = definition => JSON.parse(JSON.stringify(definition, replacer))

class GeneratorContext {
  constructor(keypaths, typeNames) {
    this.keypaths = keypaths
    this.typeNames = typeNames
  }

  inlinedCode(code, prettierOptions, prefix = 'const foo =') {
    let formatted = prettier.format(prefix + code, prettierOptions)
    formatted = formatted.substring(prefix.length).trim()
    if (formatted.endsWith(';')) return formatted.substring(0, formatted.length - 1)
    return formatted
  }
}

const generators = {
  typescript: (ctx, options = {}) => {
    const { inlined } = options
    const prettierOptions = { ...options.prettier, ...defaultPrettierOptions }
    const codeOrTypeName = keypath => {
      return ctx.typeNames.indexOf(keypath) >= 0 ? keypath : codeForKeyPath(keypath)
    }
    const codeForKeyPath = keypath => {
      const keypathValue = ctx.keypaths[keypath]
      if (!keypathValue) return 'any'
      return Object.entries(keypathValue)
        .map(([type, value]) => codeForValue(type, value))
        .join('|')
    }
    const codeForValue = (type, value) => {
      if (type === 'array') {
        return `Array<${codeOrTypeName(value['[]'].keypath)}>`
      }
      if (type === 'object') {
        return `{${Object.entries(value)
          .map(([fieldName, fieldValue]) => {
            const required = fieldValue.required ? '' : '?'
            const value = inlined
              ? codeForKeyPath(fieldValue.keypath)
              : codeOrTypeName(fieldValue.keypath)
            return `"${fieldName}"${required}: ${value}`
          })
          .join(',\n')}}`
      }
      if (type === 'function') {
        return '{ (): any }'
      }
      return type
    }
    if (inlined) {
      return ctx.inlinedCode(codeForKeyPath(inlined), prettierOptions, 'type Foo =')
    } else {
      let code = ctx.typeNames.map(name => `type ${name} = ${codeForKeyPath(name)}`).join('\n')
      return prettier.format(code, prettierOptions)
    }
  },
  propTypes: (ctx, options = {}) => {
    const { inlined } = options
    const prettierOptions = { ...options.prettier, ...defaultPrettierOptions }
    const codeOrTypeName = keypath => {
      return ctx.typeNames.indexOf(keypath) >= 0 ? keypath : codeForKeyPath(keypath)
    }
    const codeForKeyPath = keypath => {
      const keypathValue = ctx.keypaths[keypath]
      if (!keypathValue) return 'any'
      const types = Object.entries(keypathValue)
        .map(([type, value]) => codeForValue(type, value))
        .filter(code => code !== 'null' && code !== 'undefined')
      return types.length > 1 ? `PropTypes.oneOfType(${types.join(',')})` : types[0]
    }
    const codeForValue = (type, value) => {
      if (type === 'array') {
        const arrayType = codeOrTypeName(value['[]'].keypath)
        if (arrayType === 'any') return 'PropTypes.array'
        return `PropTypes.arrayOf(${arrayType})`
      }
      if (['string', 'number', 'symbol'].includes(type)) {
        return `PropTypes.${type}`
      }
      if (type === 'boolean') {
        return 'PropTypes.bool'
      }
      if (type === 'object') {
        return `PropTypes.shape({${Object.entries(value)
          .map(([fieldName, fieldValue]) => {
            const required = fieldValue.required ? '.isRequired' : ''
            const value = inlined
              ? codeForKeyPath(fieldValue.keypath)
              : codeOrTypeName(fieldValue.keypath)
            return `"${fieldName}": ${value}${required}`
          })
          .join(',\n')}})`
      }
      if (type === 'function') {
        return 'PropTypes.func'
      }
      return type
    }
    if (inlined) {
      return ctx.inlinedCode(codeForKeyPath(inlined), prettierOptions, 'const Foo =')
    } else {
      let code = ctx.typeNames.map(name => `const ${name} = ${codeForKeyPath(name)}`).join('\n')
      return prettier.format(code, prettierOptions)
    }
  }
}

class TypeWriter {
  constructor(options = {}) {
    this.typeWriterOptions = options
    this.keypaths = {}
    this.typeNames = []
    this.typeNamesSource = {}
    this.allNamedKeyPaths = new Set()
    this.usedNamedKeyPaths = new Set()
  }

  add(examples, options = {}) {
    options = this._cleanUpOptions(options)
    for (let namedKeyPath of Object.keys(options.namedKeyPaths)) {
      this.allNamedKeyPaths.add(namedKeyPath)
    }
    const rootType = this._calculateTypeName('', options)
    this.lastRootType = rootType
    for (const example of examples) {
      this._traverseExample(rootType, example, options)
    }
    // If the root is an array we don't want to miss the root type
    if (this.typeNames.indexOf(rootType) === -1) this.typeNames.push(rootType)
    return rootType
  }

  _traverseExample(keypath, data, options) {
    const { strict } = this.typeWriterOptions
    keypath = this._calculateTypeName(keypath, options)
    let type = typeof data
    let paths = {}
    let isRedefinition = false
    if (type === 'object') {
      if (data === null) {
        type = 'null'
      } else if (Array.isArray(data)) {
        type = 'array'
        paths = {
          '[]': { keypath: this._calculateTypeName(keypath + '[]', options), required: true }
        }
        data.map(value => this._traverseExample(keypath + '[]', value, options))
      } else {
        if (this.typeNames.indexOf(keypath) === -1) {
          this.typeNamesSource[keypath] = this.lastRootType
          this.typeNames.unshift(keypath)
        } else if (this.typeNamesSource[keypath] !== this.lastRootType) {
          isRedefinition = true
        }
        Object.keys(data).forEach(
          key =>
            (paths[key] = {
              keypath: this._traverseExample(
                keypath ? keypath + '.' + key : key,
                data[key],
                options
              ),
              required: true
            })
        )
      }
    }

    const throwIfInvalidRedefinition = key => {
      if (!isRedefinition) return
      if (!strict) return
      const source = this.typeNamesSource[keypath]
      throw new Error(
        `The type "${keypath}" was defined at "${source}" and it's being modified at "${
          this.lastRootType
        }". Attribute "${key}" is no longer required`
      )
    }

    const current = this.keypaths[keypath] || {}
    const currentKeypath = current[type]
    if (currentKeypath) {
      Object.keys(currentKeypath).forEach(key => {
        if (!paths[key]) {
          throwIfInvalidRedefinition(key)
          currentKeypath[key].required = false
        }
      })
      Object.keys(paths).forEach(key => {
        if (!currentKeypath[key]) {
          throwIfInvalidRedefinition(key)
          currentKeypath[key] = { ...paths[key], required: false }
        }
      })
    } else {
      current[type] = paths
    }
    this.keypaths[keypath] = current
    return keypath
  }

  _cleanUpOptions(options) {
    const {
      namedKeyPaths = {},
      typeNameGenerator = TypeWriter.defaultTypeNameGenerator,
      rootTypeName
    } = options
    return {
      namedKeyPaths,
      typeNameGenerator,
      rootTypeName
    }
  }

  _calculateTypeName(keypath, options) {
    const { namedKeyPaths, typeNameGenerator, rootTypeName } = options
    let name = namedKeyPaths[keypath]
    if (name) {
      this.usedNamedKeyPaths.add(keypath)
    } else {
      name = typeNameGenerator(keypath)
    }
    return keypath === '' ? name || rootTypeName || 'Root' : name
  }

  generate(generatorName, options = {}) {
    const ctx = new GeneratorContext(this.keypaths, this.typeNames)
    if (options.inlined === true) {
      options = { ...options, inlined: this.lastRootType }
    }
    return generators[generatorName](ctx, options)
  }

  _findSimilarTypes(typeName, arr) {
    const list = []
    const definition = this.keypaths[typeName]
    if (!definition) return list
    if (Object.keys(definition).length === 1 && definition['array']) return list
    const definitionA = simpleCopy(definition)
    if (deepEqual(definitionA, { object: {} })) return list
    for (const otherTypeName of arr) {
      if (!this.keypaths[otherTypeName]) continue
      const definitionB = simpleCopy(this.keypaths[otherTypeName])
      if (deepEqual(definitionA, definitionB)) {
        list.push([typeName, otherTypeName])
      }
    }
    return list
  }

  findSimilarTypes(typeName) {
    if (typeName) {
      return this._findSimilarTypes(typeName, this.typeNames.filter(name => name !== typeName))
    }
    return this.typeNames.reduce((list, typeName, i) => {
      return list.concat(this._findSimilarTypes(typeName, this.typeNames.slice(i + 1)))
    }, [])
  }

  unusedNamedKeyPaths() {
    return [...this.allNamedKeyPaths].filter(x => !this.usedNamedKeyPaths.has(x))
  }
}

TypeWriter.defaultTypeNameGenerator = keypath => {
  const name = camelcase(keypath.replace(/\[\]/g, 'Item'))
  return name.substring(0, 1).toUpperCase() + name.substring(1)
}

module.exports = TypeWriter
