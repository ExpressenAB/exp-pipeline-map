# Expressen Pipeline Map

An interface to make transformations of javascript object structures more streamlined and
easier to read. The main goal is to provide a better experience and let developers develop faster.

## How to

Simply start the pipeline by requiring the lib and "pressing start" followed by your actions:

```js
const Mapper = require("exp-pipeline-map");

const input = {
  name: "José",
  lastName: "Armstrong",
  gender: null,
  age: 32,
  interests: ["Coding", "Drinking", "Slacking"]  
};

Mapper.pipeline(input)
  .select("name", "lastName", "interests")
  .mapOn("interests", (interest) => interest.toLowerCase())
  .filterOn("interests", (interest) => interest !== "slacking")
  .add("initials", (object) => `${object.name[0]}${object.lastName[0]}`)
  .then((output) => {
    console.log(output)
    /**
      {
        name: "José",
        lastName: "Armstrong",
        initials: "JA",
        interests: ["coding", "drinking"]
      }
    */
  })
```
## Available methods

### `pipe(value)`
Used for starting the mapping chain. It is an alias of `resolve`.

### `select(key[, ...keys])`
Filters the current objects properties in a selective manner

### `delete(key[, ...keys])`
Filter the current objects properties in an excluding manner

### `mapOn(key, fn)`
Maps a collection with given method

### `filterOn(key, fn)`
Filters a collection with given method. Note that this method is supposed to return a boolean
where true means keep and false means do not keep.

### `transform(key, fn|value)`
Transforms a key with a method taking the value as first argument or a direct value

### `add(key, fn|value)`
Adds a property to the object. It will either be a direct value or the result of the provided method.
Will handle returned promises.

## `tap(fn)`
Executes the provided method but discards it's returned value and instead pipes through the object as is.
Very useful for logging or out of band operations.


## Whats going on
Basically this is just an extension of the regular `Promise` with some sugarcoating that provides clear methods
to prevent having to type `.then` all the time.
