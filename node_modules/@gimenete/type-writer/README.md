# 📇 Typewriter

Generate type definitions for TypeScript, Flow, PropTypes, etc. by using examples of the data

## Installing

```
npm install @gimenete/type-writer
# or
yarn add @gimenete/type-writer
```

## Example

```javascript
const TypeWriter = require('@gimenete/type-writer')
const tw = new TypeWriter()
const examples = []
examples.push({ user: { name: 'Julia' }, foo: 'bar' })
examples.push({ user: { name: 'Julia' }, foo: 1 })
examples.push({ user: { name: 'Julia' }, foo: [1, 2, 3] })
tw.add(examples, { rootTypeName: 'ProjectName' })
console.log('# TypeScript')
console.log(tw.generate('typescript'))
console.log()
console.log('# Inlined TypeScript')
console.log(tw.generate('typescript', { inlined: true }))
console.log()
console.log('# Inlined PropTypes')
console.log(tw.generate('propTypes', { inlined: true }))
console.log()
console.log('# PropTypes')
console.log(tw.generate('propTypes'))
console.log()
```

Output:

```
# TypeScript
type ProjectNameUser = { name: string }
type ProjectName = {
  user: ProjectNameUser,
  foo: string | number | Array<number>
}


# Inlined TypeScript
{
  user: { name: string },
  foo: string | number | Array<number>
}

# Inlined PropTypes
PropTypes.shape({
  user: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  foo: PropTypes.oneOfType(
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ).isRequired
})

# PropTypes
const ProjectNameUser = PropTypes.shape({ name: PropTypes.string.isRequired })
const ProjectName = PropTypes.shape({
  user: ProjectNameUser.isRequired,
  foo: PropTypes.oneOfType(
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ).isRequired
})
```
