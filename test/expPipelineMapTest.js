"use strict";

require("blanket")();
const expect = require("chai").expect;
const Mapper = require("../");


describe("mapperHelper", () => {

  context("#select", () => {
    const sourceObject = {
      one: 1,
      two: 2,
      three: 3
    };

    it("returns a mapper", () => {
      expect(Mapper.pipe(sourceObject).select([])).to.be.an.instanceof(Mapper);
    });

    it("sorts the properties alphabetically", () => {
      return Mapper.pipe(sourceObject)
        .select("one", "two", "three")
        .then((response) => {
          expect(Object.keys(response)).to.eql(["one", "three", "two"]);
        });
    });

    it("Selects properties", () => {
      const result = {one: 1, three: 3};
      return Mapper.pipe(sourceObject)
        .select("one", "three")
        .then((response) => expect(response).to.eql(result));
    });

    it("Does not select non-existing properties", () => {
      const result = {one: 1};
      return Mapper.pipe(sourceObject)
        .select("one", "four")
        .then((response) => expect(response).to.eql(result));
    });
  });

  context("#delete", () => {
    const sourceObject = {
      one: 1,
      two: 2,
      three: 3
    };

    it("returns a mapper", () => {
      expect(Mapper.pipe(sourceObject).delete([])).to.be.an.instanceof(Promise);
    });

    it("Selects properties", () => {
      const result = {two: 2};
      return Mapper.pipe(sourceObject)
        .delete("one", "three")
        .then((response) => expect(response).to.eql(result));
    });

    it("Does not select non-existing properties", () => {
      const result = {two: 2, three: 3};
      return Mapper.pipe(sourceObject)
        .delete("one", "four")
        .then((response) => expect(response).to.eql(result));
    });
  });

  context("#add", () => {
    const sourceObject = { one: 1 };

    it("returns a mapper", () => {
      expect(Mapper.pipe(sourceObject).add("two", 2)).to.be.an.instanceof(Mapper);
    });

    it("creates a property by value", () => {
      const result = { one: 1, two: 2 };
      return Mapper.pipe(sourceObject)
        .add("two", 2)
        .then((object) => expect(object).to.eql(result));
    });

    it("creates a property by function", () => {
      const result = { one: 1, two: 2 };
      return Mapper.pipe(sourceObject)
        .add("two", () => 2)
        .then((object) => expect(object).to.eql(result));
    });

    it("handles creation of property by async promise", () => {
      const result = { one: 1, two: 2 };
      return Mapper.pipe(sourceObject)
        .add("two", new Promise((r) => {
          setTimeout(() => r(2), 0);
        }))
        .then((object) => expect(object).to.eql(result));
    });

    it("handles creation of property by function that returns a promise", () => {
      const result = { one: 1, two: 2 };
      return Mapper.pipe(sourceObject)
        .add("two", () => {
          return new Promise((r) => {
            setTimeout(() => r(2), 0);
          });
        })
        .then((object) => expect(object).to.eql(result));
    });
  });

  context("#transform", () => {
    const sourceObject = {
      one: 1,
      two: 2
    };
    const multiplyByTwo = (value) => value * 2;

    it("returns a mapper", () => {
      expect(Mapper.pipe(sourceObject).modify("one", multiplyByTwo)).to.be.an.instanceof(Mapper);
    });

    it("transforms a property", () => {
      const result = {one: 2, two: 2};
      return Mapper.pipe(sourceObject)
        .modify("one", multiplyByTwo)
        .then((response) => expect(response).to.eql(result));
    });

    it("can perform a deep transform", () => {
      const deepSourceObject = {one: 1, two: {insideTwo: {deepInside: 2}}};
      const result = {one: 1, two: {insideTwo: {deepInside: 4}}};
      return Mapper.pipe(deepSourceObject)
        .modify("two.insideTwo.deepInside", multiplyByTwo)
        .then((response) => expect(response).to.eql(result));
    });

    it("can handle an async transformation", () => {
      const result = { one: 1, two: 4 };
      const asyncMultiply = (value) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(value * 2);
          }, 1);
        });
      };
      return Mapper.pipe(sourceObject)
        .modify("two", asyncMultiply)
        .then((response) => expect(response).to.eql(result));
    });

    it("Does not transform non-existing properties", () => {
      const result = {one: 1, two: 2};
      return Mapper.pipe(sourceObject)
        .modify("four", multiplyByTwo)
        .then((response) => expect(response).to.eql(result));
    });
  });

  context("#rename", () => {
    const sourceObject = { key: "value" };

    it("renames a key", () => {
      const result = { newKey: "value" };
      return Mapper.pipe(sourceObject)
        .rename("key", "newKey")
        .then((response) => expect(response).to.eql(result));
    });
  });

  context("#mapOn", () => {
    const sourceObject = {
      numbers: [
        { value: 1 },
        { value: 2 },
        { value: 3 }
      ]
    };

    const multiplyValueByTwo = (obj) => {
      obj.value = obj.value * 2;
      return obj;
    };

    it("returns a mapper", () => {
      expect(Mapper.pipe(sourceObject).mapOn("numbers", multiplyValueByTwo)).to.be.an.instanceof(Mapper);
    });

    it("maps the keys properties", () => {
      const result = { numbers: [{ value: 2 }, { value: 4 }, { value: 6 }] };
      return Mapper.pipe(sourceObject)
        .mapOn("numbers", multiplyValueByTwo)
        .then((response) => expect(response).to.eql(result));
    });

    it("can handle async mapper function", () => {
      const result = { numbers: [{ value: 2 }, { value: 4 }, { value: 6 }] };
      const asyncMultiply = (obj) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            obj.value = obj.value * 2;
            resolve(obj);
          }, 1);
        });
      };
      return Mapper.pipe(sourceObject)
        .mapOn("numbers", asyncMultiply)
        .then((response) => expect(response).to.eql(result));
    });

    it("Does not transform non-existing properties", () => {
      return Mapper.pipe(sourceObject)
        .mapOn("four", multiplyValueByTwo)
        .then((response) => expect(response).to.eql(sourceObject));
    });
  });

  context("#filterOn", () => {
    const sourceObject = {
      numbers: [
        { value: 1 },
        { value: 2 },
        { value: 3 }
      ]
    };

    const filterMethod = (obj) => obj.value > 2;

    it("returns a mapper", () => {
      expect(Mapper.pipe(sourceObject).filterOn("numbers", filterMethod)).to.be.an.instanceof(Mapper);
    });

    it("maps the keys properties", () => {
      const result = { numbers: [{ value: 3 }] };
      return Mapper.pipe(sourceObject)
        .filterOn("numbers", filterMethod)
        .then((response) => expect(response).to.eql(result));
    });

    it("Does not transform non-existing properties", () => {
      return Mapper.pipe(sourceObject)
        .filterOn("four", filterMethod)
        .then((response) => expect(response).to.eql(sourceObject));
    });
  });

  context("#tap", () => {
    const sourceObject = { one: 1 };
    const empty = function () { };

    it("returns a mapper", () => {
      expect(Mapper.pipe(sourceObject).tap(empty)).to.be.an.instanceof(Mapper);
    });

    it("pipes through the value", () => {
      return Mapper.pipe(sourceObject)
        .tap(empty)
        .then((result) => {
          expect(result).to.eql(sourceObject);
        });
    });
  });
});
