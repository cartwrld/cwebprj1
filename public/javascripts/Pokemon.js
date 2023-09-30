class Pokemon {
  constructor(name, id, sprite, stats, type1) {
    this.name = name;
    this.id = id;
    this.sprite = sprite;
    this.setPokeStats(stats);
    this.setPokeGen(id);
    this.type1 = type1;
    // type 2 is set in the api call
  }

  /**
   * Sets the stats property as an object containing the following properties:
   *
   * hp, attack, defense, specAtk, specDef, speed
   *
   * @param {[{}]} statsObj - array from json response
   */
  setPokeStats(statsObj) {
    this.stats = {
      hp: statsObj[0].base_stat,
      attack: statsObj[1].base_stat,
      defense: statsObj[2].base_stat,
      specAtk: statsObj[3].base_stat,
      specDef: statsObj[4].base_stat,
      speed: statsObj[5].base_stat,
    };
  }

  /**
   * Function that will return an array with the types.
   * @return {*[]} - [type1] or [type1,type2]
   */
  getPokeTypes() {
    const typeArr = [];
    if (this.type2 !== undefined) {
      typeArr.push(this.type1);
      typeArr.push(this.type2);
    } else {
      typeArr.push(this.type1);
    }
    return typeArr;
  }

  /**
   * Function for setting setting the Generation of the Pokemon based on the ID
   */
  setPokeGen() {
    const pokeNum = this.id;
    switch (true) {
      case pokeNum <= 151:
        this.gen = 1; break;
      case pokeNum >= 152 && pokeNum < 252:
        this.gen = 2; break;
      case pokeNum >= 252 && pokeNum < 387:
        this.gen = 3; break;
      case pokeNum >= 387 && pokeNum < 495:
        this.gen = 4; break;
      case pokeNum >= 495 && pokeNum < 650:
        this.gen = 5; break;
      case pokeNum >= 650 && pokeNum < 810:
        this.gen = 6; break;
      case pokeNum >= 810 && pokeNum < 906:
        this.gen = 7; break;
      case pokeNum >= 906 && pokeNum < 1022:
        this.gen = 8; break;
      case pokeNum >= 1022:
        this.gen = 9; break;
    }
  }
}

module.exports = Pokemon;
