const Pokemon = require('./Pokemon.js');


let currentOffset = 20;
const pokeCount = 20;
const API_ROOT = 'https://pokeapi.co/api/v2';
const pokeCollection = [];


class PowerPoke {
  // async genPokeObjCollection() {
  //   if (pokeCollection.length === 0) {
  //     const res = await fetch(`${API_ROOT}pokemon?limit=1015&offset=0`);
  //     if (res.ok) {
  //       const collectionData = await res.json();
  //       for (let i = 0; i < 1015; i++) {
  //         const pokeRes = await fetch(collectionData.results[i].url);
  //         if (pokeRes.ok) {
  //           const pokeData = await pokeRes.json();
  //           pokeCollection.push(this.buildPokeObj(pokeData));
  //         }
  //       }
  //       console.log('pokecollection created');
  //       return await collectionData;
  //     } else {
  //       console.log('not ok');
  //     }
  //   }
  // }


  /**
     * Initial fetch to get the length of the resultset in order to generate 8 random Pokemon within the boundaries
     * @return {Promise<any|undefined>} - JSON Object
     */
  async getPokemonByGeneration(gen) {
    try {
      const getPokeCountData = async () => {
        const randGen = gen === null ? Math.floor((Math.random() * 9) + 1) : gen;
        const res = await fetch(`${API_ROOT}/generation/${randGen}`);
        if (res.ok) {
          const genPokeData = await res.json();
          return genPokeData;
        }
      };
      return await getPokeCountData();
    } catch (error) {
      console.error(error);
    }
  }

  /**
     * Method used to generate 10 random Pokemon when the homepage is initially loaded.
     * Fetches 10 random Pokemon (may include duplicates) based on the length of the initial resulset.
     * @param initResp - Response from the initial call to get the length of the results
     * @return {Promise<*[]>} - Array of 10 random Pokemon objs
     */
  async get8RandomPokeURLFromInitialFetch(initResp) {
    const rndmPokes = [];
    try {
      // 10 times to generate 10 Pokemon
      const randomNumbers =
            Array.from({length: 8}, () => Math.floor(Math.random() * initResp.pokemon_species.length) + 1);

      const rand8Data = randomNumbers.map((i) => {
        return fetch(`${API_ROOT}/pokemon/${i}`)
            .then((rand8Res) => {
              if (rand8Res.ok) {
                return rand8Res.json();
              }
            })
            .then((rand8Data) => this.buildPokeObj(rand8Data));
      });

      // Promise.all() collects all of the promises into one, result in an array of Pokemon objs
      const rand8Pokes = await Promise.all(rand8Data);
      return rand8Pokes; // Returning an array of 20 Pokemon
    } catch (error) {
      console.error(error);
    }
    return rndmPokes;
  }

  /**
     * This method is responsible for retrieving the first 20 Pokemon to browse as team options.
     * To deal with long loading times when the page was accessed, this method uses a stream for
     * retrieving the first 20 items from the API. By using Promise.all() for the entire array
     * rather than doing one promise at a time, it greatly reduces loading times.
     * @return {Promise<Awaited<Pokemon>[]|*[]>} First 20 Pokemon
     */
  async getFirst20PokeURLFromGenFetch() {
    try {
      const first20Poke = Array.from({length: 20}, (_, i) => {
        return fetch(`${API_ROOT}/pokemon/${i + 1}`)
            .then((first20Res) => {
              if (first20Res.ok) {
                return first20Res.json();
              }
            })
            .then((res20Data) => this.buildPokeObj(res20Data));
      });
      return await Promise.all(first20Poke);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getNext20Pokes() {
    const poke20List = [];
    try {
      // sequence generator from mdn
      const offsetCalc = (start, stop, step) =>
        Array.from({length: (stop - start) / step + 1}, (_, i) => start + i * step);

      const offsetList = offsetCalc(currentOffset + 1, currentOffset + 20, 1);
      console.log(offsetList);
      const next20Poke = offsetList.map((i) => {
        return fetch(`${API_ROOT}/pokemon/${i}`)
            .then((next20Res) => {
              if (next20Res.ok) {
                return next20Res.json();
              }
              throw new Error(`Error fetching Pokemon with ID ${i}`);
            })
            .then((next20Data) => this.buildPokeObj(next20Data));
      });
      currentOffset += 20;
      const x = await Promise.all(next20Poke);
      console.log(x);
    } catch (error) {
      console.error(error);
    }
    return poke20List;
  }
  /**
     * Method that can be used for constructing a Pokemon object from the JSON data
     * @param pokeData - JSON Object corresponding to the current random Pokemon
     * @return {Pokemon} - Pokemon to add to the rndmPokes array
     */
  buildPokeObj(pokeData) {
    // console.log(pokeData);
    const p = new Pokemon(
        pokeData.name,
        pokeData.id,
        pokeData.sprites?.front_default,
        pokeData.stats,
        pokeData.types[0].type.name,
    );

    if (pokeData.types.length > 1) {
      p.type2 = pokeData.types[1].type.name;
    }

    return p;
  }

  /**
     * Main method that will format the Pokemon names with a capitalized first letter;
     * @param name - The Pokemon name
     * @return {string} - The formatted Pokemon name
     */
  formatPokeName(name) {
    if (!name.includes(' ') && !name.includes('.') && !name.includes('-')) {
      return this.capitalizeFirstLetterOfType(name);
    }
    let formattedName = this.handleOddCharsInName(name, ' ');
    formattedName = this.handleOddCharsInName(formattedName, '-');

    return formattedName.trim();
  }

  /**
     * Helper method for the formatPokeName method.
     * Takes in the original name, and the char that you want to split the string at.
     * Returns the formatted version of the name
     *
     * @param nameVal - The name you are dealing with
     * @param char - The char that you would like to split the string at
     * @return {*|string} - The formatted name value
     */
  handleOddCharsInName(nameVal, char) {
    let fixedName = '';
    if (nameVal.includes(char)) {
      const nameArr = nameVal.split(char);
      for (const str of nameArr) {
        fixedName += this.capitalizeFirstLetterOfType(str) + char;
      }
      return fixedName;
    } else return nameVal;
  }

  /**
     * Helper method for capitalizing the first letter of a word.
     * Designed for formatting Pokemon names and Types.
     * @param value - String you would like to capitalize the first letter of
     * @return {string} - The formatted name
     */
  capitalizeFirstLetterOfType(value) {
    if (value === null || value === undefined) {
      return;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  async handleFiltersApply(nameID, type1, type2, gen) {
    if (!nameID, !type1, !type2, !gen) {

    }

    let filteredPokes;
    nameID = nameID.toLowerCase();
    type1 = type1.toLowerCase();
    type2 = type2.toLowerCase();
    gen = gen.toLowerCase();

    const filterHandler = async () => {
      filteredPokes = [];
      // Conditions where only one criterion is provided
      if (nameID && !gen && !type1 && !type2) {
        const poke = await this.fetchByNameOrID(nameID);
        filteredPokes.push(poke);
        return filteredPokes;
      }
      // if gen is present in search, search by gen first
      if (gen) {
        const genList = await this.fetchByGeneration(gen);
        if (!type1 && !type2) {
          filteredPokes = genList.filter((poke) => poke.gen === gen);
          return filteredPokes;
        }
        if (type1 && type2) {
          filteredPokes = genList.filter((poke) => poke.type1 === type1);
          filteredPokes = genList.filter((poke) => poke.type2 === type2);
          return filteredPokes;
        }
        if (type1 && !type2) {
          filteredPokes = genList.filter((poke) => poke.type1 === type1);
          return filteredPokes;
        }
        if (!type1 && type2) {
          filteredPokes = genList.filter((poke) => poke.type2 === type2);
          return filteredPokes;
        }
      } else {
        let typeList;

        if (type1 && type2) {
          typeList = await this.fetchByType(type1, 1);
          filteredPokes = typeList.filter((poke) => poke.type2 === type2);
          return filteredPokes;
        }
        if (type1 && !type2) {
          filteredPokes = await this.fetchByType(type1, 1);
          return filteredPokes;
        }
        if (!type1 && type2) {
          filteredPokes = await this.fetchByType(type2, 2);
          return filteredPokes;
        }
      }
    };

    await filterHandler();

    return filteredPokes;
  };


  async fetchByNameOrID(searchNameID) {
    try {
      const nameRes = await fetch(`${API_ROOT}/pokemon/${searchNameID}/`);
      if (nameRes.ok) {
        const pokeData = await nameRes.json();

        return this.buildPokeObj(pokeData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async fetchByGeneration(searchGen) {
    try {
      const getGenOnlySearchResults = async () => {
        const genRes = await fetch(`${API_ROOT}/generation/${searchGen}/`);
        if (genRes.ok) {
          const genData = await genRes.json();
          const filteredGenPokes = [];

          for (const poke of genData.pokemon_species) {
            const pokeURL = poke.url.replace('-species', '');
            const pokeGenRes = await fetch(pokeURL); // fetch with specific URL corresponding to the randomly chosen pokemon

            if (pokeGenRes.ok) {
              const genPokeData = await pokeGenRes.json();
              filteredGenPokes.push(this.buildPokeObj(genPokeData));
            }
          }
          return filteredGenPokes;
        }
      };
      return await getGenOnlySearchResults();
    } catch (error) {
      console.error(error);
    }
  }

  async fetchByType(searchType, typeNum) {
    try {
      const getTypeOnlySearchResults = async () => {
        const typeRes = await fetch(`${API_ROOT}/type/${searchType}/`);
        if (typeRes.ok) {
          const typeData = await typeRes.json();
          const filteredTypePokes = [];

          for (const poke of typeData.pokemon) {
            if (poke.slot === typeNum) {
              const pokeTypeRes = await fetch(poke.pokemon.url); // fetch with specific URL corresponding to the randomly chosen pokemon
              if (pokeTypeRes.ok) {
                const typePokeData = await pokeTypeRes.json();
                filteredTypePokes.push(this.buildPokeObj(typePokeData));
              }
            }
          }
          return filteredTypePokes;
        }
      };
      return await getTypeOnlySearchResults();
    } catch (error) {
      console.error(error);
    }
  }
}


module.exports = PowerPoke;
