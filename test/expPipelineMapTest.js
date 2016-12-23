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
      expect(Mapper.start(sourceObject).select([])).to.be.an.instanceof(Mapper);
    });

    it("Selects properties", () => {
      const result = {one: 1, three: 3};
      return Mapper.start(sourceObject)
        .select("one", "three")
        .then((response) => expect(response).to.eql(result));
    });

    it("Does not select non-existing properties", () => {
      const result = {one: 1};
      return Mapper.start(sourceObject)
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
      expect(Mapper.start(sourceObject).delete([])).to.be.an.instanceof(Promise);
    });

    it("Selects properties", () => {
      const result = {two: 2};
      return Mapper.start(sourceObject)
        .delete("one", "three")
        .then((response) => expect(response).to.eql(result));
    });

    it("Does not select non-existing properties", () => {
      const result = {two: 2, three: 3};
      return Mapper.start(sourceObject)
        .delete("one", "four")
        .then((response) => expect(response).to.eql(result));
    });
  });

  context("#add", () => {
    const sourceObject = { one: 1 };

    it("returns a mapper", () => {
      expect(Mapper.start(sourceObject).add("two", 2)).to.be.an.instanceof(Mapper);
    });

    it("creates a property by value", () => {
      const result = { one: 1, two: 2 };
      return Mapper.start(sourceObject)
        .add("two", 2)
        .then((object) => expect(object).to.eql(result));
    });

    it("creates a property by function", () => {
      const result = { one: 1, two: 2 };
      return Mapper.start(sourceObject)
        .add("two", () => 2)
        .then((object) => expect(object).to.eql(result));
    });

    it("handles creation of property by async promise", () => {
      const result = { one: 1, two: 2 };
      return Mapper.start(sourceObject)
        .add("two", new Promise((r) => {
          setTimeout(() => r(2), 4);
        }))
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
      expect(Mapper.start(sourceObject).transform("one", multiplyByTwo)).to.be.an.instanceof(Mapper);
    });

    it("transforms a property", () => {
      const result = {one: 2, two: 2};
      return Mapper.start(sourceObject)
        .transform("one", multiplyByTwo)
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
      return Mapper.start(sourceObject)
        .transform("two", asyncMultiply)
        .then((response) => expect(response).to.eql(result));
    });

    it("Does not transform non-existing properties", () => {
      const result = {one: 1, two: 2};
      return Mapper.start(sourceObject)
        .transform("four", multiplyByTwo)
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
      expect(Mapper.start(sourceObject).mapOn("numbers", multiplyValueByTwo)).to.be.an.instanceof(Mapper);
    });

    it("maps the keys properties", () => {
      const result = { numbers: [{ value: 2 }, { value: 4 }, { value: 6 }] };
      return Mapper.start(sourceObject)
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
      return Mapper.start(sourceObject)
        .mapOn("numbers", asyncMultiply)
        .then((response) => expect(response).to.eql(result));
    });

    it("Does not transform non-existing properties", () => {
      return Mapper.start(sourceObject)
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
      expect(Mapper.start(sourceObject).filterOn("numbers", filterMethod)).to.be.an.instanceof(Mapper);
    });

    it("maps the keys properties", () => {
      const result = { numbers: [{ value: 3 }] };
      return Mapper.start(sourceObject)
        .filterOn("numbers", filterMethod)
        .then((response) => expect(response).to.eql(result));
    });

    it("Does not transform non-existing properties", () => {
      return Mapper.start(sourceObject)
        .filterOn("four", filterMethod)
        .then((response) => expect(response).to.eql(sourceObject));
    });
  });

  context("#breakout", () => {
    const sourceObject = { one: 1 };
    const empty = function(){};

    it("returns a mapper", () => {
      expect(Mapper.start(sourceObject).breakout(empty)).to.be.an.instanceof(Mapper);
    });

    it("pipes through the value", () => {
      return Mapper.start(sourceObject)
        .breakout(empty)
        .then((result) => {
          expect(result).to.eql(sourceObject);
        });
    })
  })
});
