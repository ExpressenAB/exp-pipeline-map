"use strict";

const clone = (object) => JSON.parse(JSON.stringify(object));

module.exports = class ExpPipelineMap extends Promise {

  static transform(input) {
    return this.resolve(clone(input));
  }

  /**
   *
   */
  select(properties, ...tailProperties) {
    if (!Array.isArray(properties)) {
      properties = [properties];
    }

    properties = properties.concat(tailProperties);

    return this.then((object) => {
      const targetObject = {};

      properties.sort().filter((property) => object.hasOwnProperty(property))
        .forEach((property) => {
          targetObject[property] = object[property];
        });

      return this.constructor.resolve(targetObject);
    });
  }


  /**
   *
   */
  delete(properties, ...tailProperties) {
    if (!Array.isArray(properties)) {
      properties = [properties];
    }

    properties = properties.concat(tailProperties);

    return this.then((object) => {
      const currentProperties = Object.keys(object);

      const remainingProperties = currentProperties.reduce((current, next) => {
        if (!properties.includes(next)) current.push(next);
        return current;
      }, []);

      return this.select(remainingProperties);
    });
  }


  /**
   *
   */
  add(key, value) {

    return this.then((object) => {
      if (value instanceof Function ) {
        value = value(object);
      }

      if (value instanceof Promise) {
        return value.then((result) => {
          object[key] = result;
          return object;
        });
      }

      object[key] = value;
      return object;
    });
  }

  /**
   *
   */
  rename(property, newKeyName) {
    return this.then((object) => {
      object[newKeyName] = object[property];
      delete object[property];
      return object;
    });
  }

  /**
   *
   */
  transform(property, transformer) {
    if (property.indexOf(".") > -1) {
      return this._deepTransform(property, transformer);
    }

    return this.then((object) => {
      if (!object.hasOwnProperty(property)) {
        return this.constructor.resolve(object);
      }

      return this.constructor.resolve()
        .then(() => transformer(object[property], object))
        .then((result) => {
          object[property] = result;
          return object;
        });
    });
  }

  /**
   *
   */
  _deepTransform(property, transformer) {
    return this.then((object) => {
      let path;
      [property, ...path] = property.split(".");
      path = path.join(".");

      if (!object.hasOwnProperty(property)) {
        return this.constructor.resolve(object);
      }

      return this.constructor.transform(object[property])
        .transform(path, transformer)
        .then((result) => {
          object[property] = result;
          return object;
        });
    });
  }

  /**
   * Maps a collection of properties with a defined method
   */
  mapOn(key, fn) {
    return this._handleCollection("map", key, fn);
  }

  /**
   * Filter a collection
   */
  filterOn(key, fn) {
    return this._handleCollection("filter", key, fn);
  }


  /**
   *
   */
  breakout(fn) {
    return this.then((value) => {
      fn(value);
      return value;
    });
  }

  /**
   *
   */
  _handleCollection(type, key, fn) {
    return this.then((object) => {
      if (!object.hasOwnProperty(key)) {
        return this.constructor.resolve(object);
      }

      const newCollection = object[key][type](fn);

      return this.constructor.all(newCollection)
        .then((result) => {
          object[key] = result;
          return object;
        });
    });
  }
};
